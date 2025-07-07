import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema } from './schema';
import { useAuth } from 'context/AuthContext';
import { DriverMode } from './components/DriverMode';
import { FullForm } from './components/FullForm';
import { getChauffeurByUserId, getVehicules } from 'api/taxi';

export function FeuilleRouteForm() {
  const { user } = useAuth();
  const [mode, setMode] = useState('driver'); // 'driver' ou 'full'
  const [chauffeur, setChauffeur] = useState(null);
  const [vehicules, setVehicules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      header: {
        date: new Date(),
        chauffeur: null,
        vehicule: null
      },
      shift: {
        start: '',
        end: '',
        duree_interruptions: 0,
        nombre_interruptions: 0
      },
      kilometers: {
        start: 0,
        end: null
      },
      courses: [],
      charges: [],
      totals: {
        recettes_total: 0,
        charges_total: 0,
        salaire_total: 0
      }
    }
  });

  // Chargement des données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Charger les infos du chauffeur
        if (user) {
          const chauffeurData = await getChauffeurByUserId(user.id);
          setChauffeur(chauffeurData);
          
          // Pré-remplir les infos chauffeur dans le formulaire
          setValue('header.chauffeur', {
            id: chauffeurData.id,
            utilisateur_id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            numero_badge: chauffeurData.numero_badge,
            type_contrat: chauffeurData.type_contrat,
            compte_bancaire: chauffeurData.compte_bancaire
          });
        }

        // 2. Charger la liste des véhicules disponibles
        const vehiculesData = await getVehicules();
        setVehicules(vehiculesData);
        
      } catch (error) {
        console.error("Erreur chargement données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, setValue]);

  const onSubmit = async (data) => {
    try {
      // Calcul des totaux
      const recettes = data.courses.reduce((sum, c) => sum + (c.somme_percue || 0), 0);
      const charges = data.charges.reduce((sum, c) => sum + (c.montant || 0), 0);
      
      // Calcul du salaire selon les règles métier
      const salaire = calculateSalaire(data.header.chauffeur.id, recettes);
      
      // Mettre à jour les totaux
      setValue('totals', {
        recettes_total: recettes,
        charges_total: charges,
        salaire_total: salaire
      });

      // Enregistrement ou génération PDF
      console.log("Données validées:", data);
      
    } catch (error) {
      console.error("Erreur soumission:", error);
    }
  };

  if (isLoading) {
    return <div>Chargement en cours...</div>;
  }

  if (!chauffeur) {
    return (
      <div className="alert alert-warning">
        <p>Vous n&apos;êtes pas enregistré comme chauffeur.</p>
        <p>Veuillez contacter l&apos;administrateur pour compléter votre profil.</p>
        <button onClick={() => setMode('full')}>
          Accéder au mode administrateur
        </button>
      </div>
    );
  }

  return (
    <div className="feuille-route-container">
      {mode === 'driver' ? (
        <DriverMode
          chauffeur={chauffeur}
          vehicules={vehicules}
          control={control}
          onSubmit={handleSubmit(onSubmit)}
          onSwitchMode={() => setMode('full')}
        />
      ) : (
        <FullForm
          chauffeur={chauffeur}
          vehicules={vehicules}
          control={control}
          onSubmit={handleSubmit(onSubmit)}
          onSwitchMode={() => setMode('driver')}
        />
      )}
    </div>
  );
}

// Helper function pour calculer le salaire
function calculateSalaire(chauffeurId, recettes) {
  // Implémentez la logique de calcul basée sur les règles métier
  // Par exemple : 40% jusqu'à 180€, 30% au-delà
  const base = Math.min(recettes, 180);
  const surplus = Math.max(recettes - 180, 0);
  return (base * 0.4) + (surplus * 0.3);
}