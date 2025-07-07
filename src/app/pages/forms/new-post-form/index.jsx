import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema } from './schema';
import { DriverMode } from './components/DriverMode';
import { FullForm } from './components/FullForm';

// Données simulées
const currentUser = {
  id: 'USR001',
  nom: 'Tehou',
  prenom: 'Hasler',
  type_utilisateur: 'Indépendant'
};

const currentDriver = {
  id: 'CH001',
  utilisateur_id: 'USR001',
  nom: 'Tehou',
  prenom: 'Hasler',
  numero_badge: 'TX-2023-001',
  type_contrat: 'Indépendant',
  compte_bancaire: 'BE123456789012',
  taux_commission: 40,
  salaire_base: 0,
  currentLocation: 'Bruxelles, Belgique'
};

const vehicules = [
  {
    id: 'VH001',
    plaque_immatriculation: 'TX-AA-171',
    numero_identification: '10',
    marque: 'Mercedes',
    modele: 'Classe E',
    type_vehicule: 'Berline'
  },
  {
    id: 'VH002',
    plaque_immatriculation: 'TX-AB-751',
    numero_identification: '4',
    marque: 'Volkswagen',
    modele: 'Touran',
    type_vehicule: 'Van'
  }
];

export default function FeuilleRouteApp() {
  const [mode, setMode] = useState('driver'); // 'driver' ou 'full'
  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      header: {
        date: new Date(),
        chauffeur: currentDriver,
        vehicule: vehicules[0]
      },
      shift: {
        start: '',
        end: '',
        interruptions: 0
      },
      kilometers: {
        start: 0,
        end: null
      },
      courses: [],
      charges: [],
      totals: {
        recettes: 0,
        charges: 0,
        salaire: 0
      },
      validation: {
        signature: null,
        date_validation: null
      }
    }
  });

  const handleDriverSubmit = (data) => {
    console.log('Feuille de route validée:', data);
    alert('Feuille de route enregistrée avec succès');
    reset();
  };

  if (mode === 'driver') {
    return (
      <DriverMode 
        chauffeur={currentDriver}
        vehicules={vehicules}
        control={control}
        onSubmit={handleSubmit(handleDriverSubmit)}
        onSwitchMode={() => setMode('full')}
      />
    );
  }

  return (
    <FullForm 
      currentUser={currentUser}
      chauffeurs={[currentDriver]}
      vehicules={vehicules}
      control={control}
      onSwitchMode={() => setMode('driver')}
      onSubmit={handleSubmit(handleDriverSubmit)}
    />
  );
}