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
import { Page } from 'components/shared/Page';
import clsx from 'clsx';
import { 
  ClockIcon,
  CurrencyEuroIcon,
  FlagIcon,
  DevicePhoneMobileIcon
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
  // Removed unused isMobile variable
  
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
    const course = watchedValues.courses?.[index] || {};
    const prix = course.somme_percue || course.prix || 0;
    return sum + (typeof prix === 'number' ? prix : parseFloat(prix) || 0);
  }, 0);

  const totalCharges = chargeFields.reduce((sum, _, index) => {
  const charge = watchedValues.charges?.[index] || {};
  const montant = charge.montant || 0;
  return sum + (typeof montant === 'number' ? montant : parseFloat(montant) || 0);
}, 0);

  // Règle de calcul du salaire
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

  return (
    <Page title="Feuille de Route - Chauffeur">
     <div className="space-y-4 p-4 pb-20 md:pb-4">
      {/* En-tête aligné avec FullForm mais contenu original */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Partie gauche - Contenu original */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 truncate">
              Feuille de Route - {chauffeur.prenom} {chauffeur.nom}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 text-sm text-gray-600 dark:text-dark-300">
              <span>N° d&apos;immatriculation: {chauffeur.badge}</span>
              <span>Contrat: {chauffeur.type_contrat}</span>
            </div>
          </div>

          {/* Partie droite - Bouton identique à FullForm */}
          <div className="flex-shrink-0">
            <Button 
              variant="outlined" 
              onClick={onSwitchMode}
              className="border-gray-300 dark:border-dark-500 w-full sm:w-auto"
              icon={<DevicePhoneMobileIcon className="h-5 w-5" />}
              size="md"
            >
              Mode complet
            </Button>
          </div>
        </div>
      </Card>

      {/* Navigation par onglets simplifiée et fonctionnelle */}
      <div className="border-b-2 border-gray-200 dark:border-dark-500">
        <div className="flex justify-center space-x-1">
          <button
            onClick={() => setActiveTab('shift')}
            disabled={false}
            className={clsx(
              "relative flex flex-col items-center justify-center px-4 py-3 font-medium transition-colors w-full",
              "focus:outline-none",
              activeTab === 'shift'
                ? "text-primary-600 border-b-2 border-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "text-gray-600 hover:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100",
            )}
          >
            <FlagIcon className={clsx(
              "h-5 w-5 mb-1",
              activeTab === 'shift' 
                ? "text-primary-600 dark:text-primary-400" 
                : "text-gray-500 dark:text-dark-400"
            )} />
            <span className="text-sm">Début Shift</span>
          </button>

          <button
            onClick={() => !safeGetValue('shift.start') || setActiveTab('courses')}
            disabled={!safeGetValue('shift.start')}
            className={clsx(
              "relative flex flex-col items-center justify-center px-4 py-3 font-medium transition-colors w-full",
              "focus:outline-none",
              activeTab === 'courses'
                ? "text-primary-600 border-b-2 border-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "text-gray-600 hover:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100",
              !safeGetValue('shift.start') && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="relative">
              <CurrencyEuroIcon className={clsx(
                "h-5 w-5 mb-1",
                activeTab === 'courses' 
                  ? "text-primary-600 dark:text-primary-400" 
                  : "text-gray-500 dark:text-dark-400"
              )} />
              {courseFields.length > 0 && (
                <Badge 
                  className={clsx(
                    "absolute -top-2 -right-2",
                    activeTab === 'courses' 
                      ? "bg-primary-500 text-white" 
                      : "bg-gray-200 dark:bg-dark-600 text-gray-800 dark:text-dark-100"
                  )}
                >
                  {courseFields.length}
                </Badge>
              )}
            </div>
            <span className="text-sm">Courses</span>
          </button>

          <button
            onClick={() => !safeGetValue('shift.start') || setActiveTab('validation')}
            disabled={!safeGetValue('shift.start')}
            className={clsx(
              "relative flex flex-col items-center justify-center px-4 py-3 font-medium transition-colors w-full",
              "focus:outline-none",
              activeTab === 'validation'
                ? "text-primary-600 border-b-2 border-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "text-gray-600 hover:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100",
              !safeGetValue('shift.start') && "opacity-50 cursor-not-allowed"
            )}
          >
            <ClockIcon className={clsx(
              "h-5 w-5 mb-1",
              activeTab === 'validation' 
                ? "text-primary-600 dark:text-primary-400" 
                : "text-gray-500 dark:text-dark-400"
            )} />
            <span className="text-sm">Fin Shift</span>
          </button>
        </div>
      </div>

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
    </Page>
  );
}