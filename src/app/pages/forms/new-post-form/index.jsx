import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema, defaultData } from './schema';
import { ShiftForm } from './components/ShiftForm';
import { CourseList } from './components/CourseList';
import { EndShiftSection } from './components/EndShiftSection';
import { toast } from 'sonner';
import { Page } from 'components/shared/Page';
import ErrorBoundary from './components/ErrorBoundary';

export default function FeuilleRouteApp() {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultData
  });
  const { reset, control } = methods;

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

  const [activeTab, setActiveTab] = useState('shift');

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

  return (
    <ErrorBoundary>
      <Page title="Feuille de Route">
        <FormProvider {...methods}>
          <div className="px-4 pb-6">
            {/* Navigation simplifiée */}
            <div className="flex border-b mb-4">
              <button
                onClick={() => setActiveTab('shift')}
                className={`px-4 py-2 font-medium ${activeTab === 'shift' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'}`}
              >
                Début Shift
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-4 py-2 font-medium ${activeTab === 'courses' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'}`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('end')}
                className={`px-4 py-2 font-medium ${activeTab === 'end' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'}`}
              >
                Fin Shift
              </button>
            </div>

            {activeTab === 'shift' && (
              <ShiftForm 
                vehicules={vehicules}
                onStartShift={() => setActiveTab('courses')}
                control={control}
              />
            )}

            {activeTab === 'courses' && (
              <CourseList 
                control={control}
                chauffeur={currentDriver}
              />
            )}

            {activeTab === 'end' && (
              <EndShiftSection 
                onSubmit={methods.handleSubmit(handleSubmitForm)}
                control={control}
              />
            )}
          </div>
        </FormProvider>
      </Page>
    </ErrorBoundary>
  );
}