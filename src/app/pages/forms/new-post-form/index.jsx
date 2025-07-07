import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema } from './schema';
import { defaultData } from './data';

// Composants
import { HeaderSection } from './components/HeaderSection';
import { ShiftTimer } from './components/ShiftTimer';
import { QuickCourseForm } from './components/QuickCourseForm';
import { ExpensesSection } from './components/ExpensesSection';
import { ValidationStep } from './components/ValidationStep';
import { PDFGenerator } from './components/PDFGenerator';
import { MobileNavigation } from './components/MobileNavigation';
import { CourseList } from './components/CourseList';
import { PDFConfirmation } from './components/PDFConfirmation';

export default function FeuilleRouteTaxi() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [generatedPDF, setGeneratedPDF] = useState(null);

  const { control, watch, setValue, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultData
  });

  // Watch form values
  const values = watch();

  // Gestion du shift
  const startShift = () => {
    setValue('shift.start', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setIsShiftActive(true);
  };

  const endShift = () => {
    setValue('shift.end', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setIsShiftActive(false);
    setCurrentStep(2); // Passer à l'étape des courses
  };

  // Ajout rapide de course
  const addQuickCourse = (course) => {
    const newCourse = {
      id: `CRS-${Date.now()}`,
      order: values.courses.length + 1,
      ...course,
      prix: parseFloat(course.prix)
    };
    setValue('courses', [...values.courses, newCourse]);
  };

  // Génération du PDF
  const generatePDF = async () => {
    try {
      const pdfData = await PDFGenerator.generate(values);
      setGeneratedPDF(pdfData);
      setCurrentStep(5); // Étape de confirmation
    } catch (error) {
      console.error("Erreur génération PDF:", error);
    }
  };

  // Étapes de l'application
  const steps = [
    {
      id: 1,
      title: "Début du shift",
      component: (
        <ShiftTimer 
          isActive={isShiftActive}
          onStart={startShift}
          onStop={endShift}
          startTime={values.shift.start}
          endTime={values.shift.end}
        />
      )
    },
    {
      id: 2,
      title: "Courses",
      component: (
        <div className="space-y-4">
          <QuickCourseForm 
            onAddCourse={addQuickCourse} 
            currentLocation={values.currentLocation}
          />
          <CourseList 
            courses={values.courses}
            onRemove={(id) => {
              setValue('courses', values.courses.filter(c => c.id !== id));
            }}
          />
        </div>
      )
    },
    {
      id: 3,
      title: "Charges",
      component: (
        <ExpensesSection 
          control={control}
          setValue={setValue}
          values={values}
        />
      )
    },
    {
      id: 4,
      title: "Validation",
      component: (
        <ValidationStep 
          values={values}
          control={control}
          onGeneratePDF={generatePDF}
        />
      )
    },
    {
      id: 5,
      title: "Terminé",
      component: (
        <PDFConfirmation 
          pdfData={generatedPDF}
          onReset={() => {
            reset(defaultData);
            setCurrentStep(1);
          }}
        />
      )
    }
  ];

  return (
    <div className="max-w-md mx-auto pb-20 bg-gray-50 min-h-screen">
      {/* En-tête toujours visible */}
      <HeaderSection values={values} />
      
      {/* Contenu de l'étape actuelle */}
      <div className="p-4">
        {steps.find(step => step.id === currentStep)?.component}
      </div>
      
      {/* Navigation mobile */}
      <MobileNavigation 
        currentStep={currentStep}
        steps={steps}
        onStepChange={setCurrentStep}
        isShiftActive={isShiftActive}
      />
    </div>
  );
}