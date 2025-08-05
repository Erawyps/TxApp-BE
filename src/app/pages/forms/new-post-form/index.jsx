// index.jsx
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema, defaultData } from './schema';
import { ShiftForm } from './components/ShiftForm';
import { CourseList } from './components/CourseList';
import { EndShiftSection } from './components/EndShiftSection';
import { toast } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import { ClockIcon, TruckIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function FeuilleRouteApp() {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultData
  });
  const { reset, control, handleSubmit } = methods;

  const [activeTab, setActiveTab] = useState('shift');
  const [courses, setCourses] = useState([]);

  const handleAddCourse = (courseData) => {
    const newCourse = {
      ...courseData,
      id: `course_${Date.now()}`,
      order: courses.length + 1,
      status: 'completed'
    };
    setCourses([...courses, newCourse]);
  };

  const handleRemoveCourse = (index) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const handleEditCourse = (updatedCourse) => {
    setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const onSubmit = (data) => {
    try {
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

  // Données simulées pour le véhicule
  const vehicles = [
    {
      id: "VH001",
      plaque_immatriculation: "TX-AA-171",
      numero_identification: "10",
      marque: "Mercedes",
      modele: "Classe E",
      type_vehicule: "Berline"
    }
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">TxApp-BE</h1>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex justify-center">
                <div className="flex space-x-8 md:space-x-16">
                  {[
                    { key: 'shift', label: 'Début Shift', icon: ClockIcon },
                    { key: 'courses', label: 'Courses', icon: TruckIcon },
                    { key: 'end', label: 'Fin Shift', icon: CheckIcon }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          </div>

          <FormProvider {...methods}>
            {activeTab === 'shift' && (
              <ShiftForm 
                onStartShift={() => setActiveTab('courses')}
                control={control}
                vehicles={vehicles}
              />
            )}

            {activeTab === 'courses' && (
              <CourseList 
                courses={courses}
                onAddCourse={handleAddCourse}
                onRemoveCourse={handleRemoveCourse}
                onEditCourse={handleEditCourse}
              />
            )}

            {activeTab === 'end' && (
              <EndShiftSection 
                control={control}
              />
            )}
          </FormProvider>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:relative md:bg-transparent md:border-t-0 md:mt-6">
            <button
              onClick={handleSubmit(onSubmit)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Enregistrer la feuille de route
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}