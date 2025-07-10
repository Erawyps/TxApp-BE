import { useFieldArray, useWatch } from 'react-hook-form';
import { useState } from 'react';
import { VehicleInfo } from './VehicleInfo';
import { ShiftInfo } from './ShiftInfo';
import { Card, Button, Badge } from 'components/ui';
import { ExpensesSection } from './ExpensesSection';
import { QuickCourseForm } from './QuickCourseForm';
import { ValidationStep } from './ValidationStep';
import { CourseList } from './CourseList';
import { ExpenseList } from './ExpenseList';
import { SummaryCard } from './SummaryCard';
import clsx from 'clsx';
import { 
  CheckCircleIcon,
  CurrencyEuroIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
export function DriverMode({ chauffeur, vehicules, control, onSubmit, onSwitchMode }) {
  const { fields: courseFields, append: appendCourse, remove: removeCourse } = useFieldArray({
    control,
    name: "courses"
  });

  const { fields: chargeFields, append: appendCharge, remove: removeCharge } = useFieldArray({
    control,
    name: "charges"
  });

  const [activeTab, setActiveTab] = useState('shift');
  
  const watchedValues = useWatch({ 
    control, 
    defaultValue: {
      courses: [],
      charges: [],
      shift: { start: '' },
      header: { vehicule: null }
    }
  });

  // Fonction helper sécurisée pour récupérer les valeurs
  const safeGetValue = (path, defaultValue = 0) => {
    try {
      const keys = path.split('.');
      let value = watchedValues;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return defaultValue;
        }
      }
      
      return value !== undefined && value !== null ? value : defaultValue;
    } catch (error) {
      console.warn(`Erreur lors de la récupération de ${path}:`, error);
      return defaultValue;
    }
  };

  // Calculs des totaux
  const totalRecettes = courseFields.reduce((sum, _, index) => {
    const prix = safeGetValue(`courses.${index}.prix`, 0);
    return sum + (typeof prix === 'number' ? prix : parseFloat(prix) || 0);
  }, 0);

  const totalCharges = chargeFields.reduce((sum, _, index) => {
    const montant = safeGetValue(`charges.${index}.montant`, 0);
    return sum + (typeof montant === 'number' ? montant : parseFloat(montant) || 0);
  }, 0);

  const base = Math.min(totalRecettes, 180);
  const surplus = Math.max(totalRecettes - 180, 0);
  const salaire = (base * 0.4) + (surplus * 0.3);

  // Gestion des erreurs de données manquantes
  if (!chauffeur || !vehicules || vehicules.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="text-red-500 dark:text-red-400">
          <p className="text-lg font-medium">Données manquantes</p>
          <p className="mt-2">Veuillez sélectionner un chauffeur et un véhicule</p>
        </div>
      </Card>
    );
  }

  // Handlers
  const handleAddCourse = (course) => {
    try {
      appendCourse({
        ...course,
        id: `CRS-${Date.now()}`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la course:', error);
    }
  };

  const handleAddExpense = (expense) => {
    try {
      appendCharge({
        ...expense,
        id: `CHG-${Date.now()}`
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la charge:', error);
    }
  };

  const tabs = [
    { 
      id: 'shift', 
      label: "Début Shift",
      icon: <ClockIcon className="h-5 w-5 flex-shrink-0" />
    },
    { 
      id: 'courses', 
      label: "Courses",
      icon: <CurrencyEuroIcon className="h-5 w-5 flex-shrink-0" />,
      disabled: !safeGetValue('shift.start')
    },
    { 
      id: 'validation', 
      label: "Fin Shift",
      icon: <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />,
      disabled: !safeGetValue('shift.start')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              Feuille de Route - {chauffeur.prenom} {chauffeur.nom}
            </h2>
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600 dark:text-dark-300">
              <span>Badge: {chauffeur.numero_badge}</span>
              <span>•</span>
              <span>Contrat: {chauffeur.type_contrat}</span>
            </div>
          </div>
          <Button 
            variant="outlined" 
            onClick={onSwitchMode}
            className="border-gray-300 dark:border-dark-500"
          >
            Mode complet
          </Button>
        </div>
      </Card>

      {/* Navigation par onglets améliorée */}
            <Card className="p-0 overflow-hidden">
        <div className="border-b-2 border-gray-200 dark:border-dark-500">
          <div className="flex justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={clsx(
                  "relative flex items-center gap-2 px-4 py-3 font-medium transition-colors",
                  "focus:outline-none min-w-[120px] justify-center",
                  activeTab === tab.id
                    ? "text-primary-600 border-b-2 border-primary-600 dark:border-primary-400 dark:text-primary-400"
                    : "text-gray-600 hover:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100",
                  tab.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <Badge 
                    className={clsx(
                      "ml-2",
                      activeTab === tab.id 
                        ? "bg-primary-500 text-white" 
                        : "bg-gray-200 dark:bg-dark-600 text-gray-800 dark:text-dark-100"
                    )}
                  >
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>


      {/* Contenu des onglets */}
      <div className="space-y-6">
        {activeTab === 'shift' && (
          <div className="grid gap-6 md:grid-cols-2">
            <VehicleInfo 
              vehicules={vehicules} 
              control={control}
              currentVehicle={safeGetValue('header.vehicule')}
            />
            <ShiftInfo 
              control={control}
              onStartShift={() => setActiveTab('courses')}
            />
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <QuickCourseForm 
                onAddCourse={handleAddCourse}
                currentLocation={chauffeur.currentLocation}
              />
              
              <ExpensesSection 
                onAddExpense={handleAddExpense}
              />
            </div>
            
            <div className="space-y-6 lg:col-span-1">
              {courseFields.length > 0 && (
                <CourseList 
                  courses={watchedValues.courses || []} 
                  onRemoveCourse={removeCourse}
                />
              )}
              
              {chargeFields.length > 0 && (
                <ExpenseList 
                  expenses={watchedValues.charges || []} 
                  onRemoveExpense={removeCharge}
                />
              )}
              
              <SummaryCard
                recettes={totalRecettes}
                charges={totalCharges}
                salaire={salaire}
              />
            </div>
          </div>
        )}

        {activeTab === 'validation' && (
          <ValidationStep 
            onSubmit={onSubmit}
            control={control}
            totals={{
              recettes: totalRecettes,
              charges: totalCharges,
              salaire: salaire
            }}
          />
        )}
      </div>
    </div>
  );
}

// The unused TabButton component has been removed.