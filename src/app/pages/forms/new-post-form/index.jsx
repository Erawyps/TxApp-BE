import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema, defaultData } from './schema';
import { DriverMode } from './components/DriverMode';
import { FullForm } from './components/FullForm';
import { toast } from 'sonner';

export default function FeuilleRouteApp() {
  const [mode, setMode] = useState('driver');
  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultData
  });

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

  if (mode === 'driver') {
    return (
      <DriverMode 
        chauffeur={currentDriver}
        vehicules={vehicules}
        control={control}
        onSubmit={handleSubmit(handleSubmitForm)}
        onSwitchMode={() => setMode('full')}
      />
    );
  }

  return (
    <FullForm 
      chauffeurs={[currentDriver]}
      vehicules={vehicules}
      control={control}
      onSwitchMode={() => setMode('driver')}
      onSubmit={handleSubmit(handleSubmitForm)}
    />
  );
}