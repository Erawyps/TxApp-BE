import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema, defaultData } from './schema';
import { DriverMode } from './components/DriverMode';
import { FullForm } from './components/FullForm';
import { toast } from 'sonner';
import { Page } from 'components/shared/Page';
import ErrorBoundary from './components/ErrorBoundary';

export default function FeuilleRouteApp() {
  const [mode, setMode] = useState('driver');
  
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultData
  });
  const { reset } = methods;


  // Données simulées
  const currentDriver = {
    id: 'CH001',
    nom: 'Tehou',
    prenom: 'Hasler',
    numero_badge: 'TX-2023-001',
    type_contrat: 'Indépendant',
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

  const handleSubmitForm = (data) => {
    try {
      console.log('Feuille de route validée:', data);
      toast.success('Feuille de route enregistrée avec succès');
      reset(defaultData);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    }
  };

  // Gestionnaire d'erreur pour éviter les crashes
  const handleError = (errors) => {
    console.error('Erreurs de validation:', errors);
    toast.error('Veuillez corriger les erreurs dans le formulaire');
  };

  // Affichage des erreurs en mode développement
  if (import.meta.env.MODE === 'development' && Object.keys(methods.formState.errors).length > 0) {
    console.log('Erreurs de validation:', methods.formState.errors);
  }

  return (
    <ErrorBoundary>
      <Page title="Feuille de Route">
        <FormProvider {...methods}>
          <div className="px-4 pb-6">
            {mode === 'driver' ? (
              <DriverMode 
                chauffeur={currentDriver}
                vehicules={vehicules}
                onSubmit={methods.handleSubmit(handleSubmitForm, handleError)}
                onSwitchMode={() => setMode('full')}
              />
            ) : (
              <FullForm 
                chauffeurs={[currentDriver]}
                vehicules={vehicules}
                onSwitchMode={() => setMode('driver')}
                onSubmit={methods.handleSubmit(handleSubmitForm, handleError)}
              />
            )}
          </div>
        </FormProvider>
      </Page>
    </ErrorBoundary>
  );
}
