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
  const { reset, control, handleSubmit } = methods;

  // Données simulées
  const currentDriver = {
    id: 'CH001',
    nom: 'Tehou',
    prenom: 'Hasler',
    numero_badge: 'TX-2023-001',
    type_contrat: 'Indépendant',
    currentLocation: 'Bruxelles, Belgique'
  };

  const vehicles = [
    {
      id: 'VH001',
      plaque_immatriculation: 'TX-AA-171',
      numero_identification: '10',
      marque: 'Mercedes',
      modele: 'Classe E',
      type_vehicule: 'Berline',
      etat: 'En service',
      carburant: 'diesel'
    },
    {
      id: 'VH002',
      plaque_immatriculation: 'TX-AB-751',
      numero_identification: '4',
      marque: 'Volkswagen',
      modele: 'Touran',
      type_vehicule: 'Van',
      etat: 'En service',
      carburant: 'essence'
    }
  ];

  const [activeTab, setActiveTab] = useState('shift');
  const [courses, setCourses] = useState([]);

  const handleAddCourse = (courseData) => {
    const newCourse = {
      ...courseData,
      id: `course_${Date.now()}`,
      order: courses.length + 1
    };
    setCourses([...courses, newCourse]);
  };

  const handleRemoveCourse = (index) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    try {
      // Add courses to form data
      const finalData = {
        ...data,
        courses: courses
      };
      
      console.log('Feuille de route validée:', finalData);
      toast.success('Feuille de route enregistrée avec succès');
      reset(defaultData);
      setCourses([]);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    }
  };

  return (
    <ErrorBoundary>
      <Page title="Feuille de Route">
        <FormProvider {...methods}>
          <div className="px-4 pb-20 md:pb-6">
            {/* En-tête chauffeur */}
            <div className="bg-gray-800 text-white p-4 rounded-lg mb-4">
              <h1 className="text-xl font-bold">
                {currentDriver.prenom} {currentDriver.nom}
              </h1>
              <p className="text-sm opacity-80">
                Badge: {currentDriver.numero_badge} • {currentDriver.type_contrat}
              </p>
            </div>

            {/* Navigation par onglets */}
            <div className="flex border-b mb-4 overflow-x-auto">
              {['shift', 'courses', 'end'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium whitespace-nowrap ${
                    activeTab === tab 
                      ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {{
                    shift: 'Début Shift',
                    courses: 'Courses',
                    end: 'Fin Shift'
                  }[tab]}
                </button>
              ))}
            </div>

            {/* Contenu des onglets */}
            <div className="space-y-4">
              {activeTab === 'shift' && (
                <ShiftForm 
                  vehicles={vehicles}
                  onStartShift={() => setActiveTab('courses')}
                  control={control}
                />
              )}

              {activeTab === 'courses' && (
                <CourseList 
                  courses={courses}
                  onAddCourse={handleAddCourse}
                  onRemoveCourse={handleRemoveCourse}
                />
              )}

              {activeTab === 'end' && (
                <EndShiftSection 
                  control={control}
                />
              )}
            </div>

            {/* Submit button - always visible */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t md:relative md:bg-transparent md:border-t-0 md:mt-6">
              <button
                onClick={handleSubmit(onSubmit)}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Enregistrer la feuille de route
              </button>
            </div>
          </div>
        </FormProvider>
      </Page>
    </ErrorBoundary>
  );
}