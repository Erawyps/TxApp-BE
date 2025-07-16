import { useFieldArray, useWatch } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { VehicleInfo } from './VehicleInfo';
import { ShiftInfo } from './ShiftInfo';
import { Card, Button, Badge, ScrollShadow } from 'components/ui';
import { ValidationStep } from './ValidationStep';
import { CourseList } from './CourseList';
import { SummaryCard } from './SummaryCard';
import { Page } from 'components/shared/Page';
import clsx from 'clsx';
import { 
  ClockIcon,
  CurrencyEuroIcon,
  FlagIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { FormScrollContainer } from './FormScrollContainer';

export function DriverMode({ chauffeur, vehicules, control, onSubmit, onSwitchMode }) {
  // Gestion des tableaux de courses et dépenses
  const { fields: courseFields, append: appendCourse, remove: removeCourse } = useFieldArray({
    control,
    name: "courses"
  });

  const { fields: chargeFields, append: appendCharge, remove: removeCharge } = useFieldArray({
    control,
    name: "charges"
  });

  const [activeTab, setActiveTab] = useState('shift');
  
  // Sauvegarde automatique
  useEffect(() => {
    const saveData = () => {
      const data = control.getValues();
      localStorage.setItem('driverShiftData', JSON.stringify(data));
    };

    const interval = setInterval(saveData, 5000);
    window.addEventListener('beforeunload', saveData);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', saveData);
    };
  }, [control]);

  // Restauration des données sauvegardées
  useEffect(() => {
    const savedData = localStorage.getItem('driverShiftData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        control.reset(parsedData);
        
        // Positionnement de l'onglet actif selon l'état sauvegardé
        if (parsedData.shift?.start && !parsedData.shift?.end) {
          setActiveTab('courses');
        } else if (parsedData.shift?.start && parsedData.shift?.end) {
          setActiveTab('validation');
        }
      } catch (error) {
        console.error('Erreur lors du parsing des données sauvegardées:', error);
        localStorage.removeItem('driverShiftData');
      }
    }
  }, [control]);

  // Surveillance des valeurs du formulaire
  const watchedValues = useWatch({ 
    control, 
    defaultValue: {
      courses: [],
      charges: [],
      shift: { start: '' },
      header: { vehicule: null }
    }
  });

  // Calcul des totaux
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
  // Calcul du salaire sans prendre en compte les charges
  // Utilisation de Math.max pour éviter les salaires négatifs
  // Le salaire est calculé comme suit :
  // - Si le total des recettes est inférieur à 180, le salaire est 40% des recettes
  // - Si le total des recettes est supérieur à 180, le salaire is 40% des 180 premiers euros plus 30% du surplus
  // - Le salaire final est le maximum entre 0 et le total des recettes moins les charges 
  const salaire = Math.max(
    totalRecettes <= 180
      ? totalRecettes * 0.4
      : (180 * 0.4) + ((totalRecettes - 180) * 0.3),
    0
  ) - totalCharges;


  /**const calculateSalary = (recettes, charges) => {
    const base = Math.min(recettes, 180);
    const surplus = Math.max(recettes - 180, 0);
    const salaireBrut = (base * 0.4) + (surplus * 0.3);
    return Math.max(salaireBrut - charges, 0);
  };

  const salaire = calculateSalary(totalRecettes, totalCharges);**/

  // Gestion des courses
  const handleAddCourse = (course) => {
    appendCourse({
      ...course,
      id: `CRS-${Date.now()}`,
    });
  };

  // Gestion des dépenses (utilisée dans ValidationStep)
  const handleAddExpense = (expense) => {
    appendCharge({
      ...expense,
      id: `CHG-${Date.now()}`
    });
  };

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

  return (
    <Page title="Feuille de Route - Chauffeur">
      <div className="space-y-4 p-4 pb-20 md:pb-4">
        {/* En-tête */}
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 truncate">
                Feuille de Route - {chauffeur.prenom} {chauffeur.nom}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 text-sm text-gray-600 dark:text-dark-300">
                <span>Badge: {chauffeur.numero_badge}</span>
                <span>Contrat: {chauffeur.type_contrat}</span>
              </div>
            </div>

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
        </Card>

        {/* Navigation par onglets */}
        <div className="border-b-2 border-gray-200 dark:border-dark-500">
          <div className="flex justify-center space-x-1">
            <button
              onClick={() => setActiveTab('shift')}
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
              onClick={() => !watchedValues.shift?.start || setActiveTab('courses')}
              disabled={!watchedValues.shift?.start}
              className={clsx(
                "relative flex flex-col items-center justify-center px-4 py-3 font-medium transition-colors w-full",
                "focus:outline-none",
                activeTab === 'courses'
                  ? "text-primary-600 border-b-2 border-primary-600 dark:border-primary-400 dark:text-primary-400"
                  : "text-gray-600 hover:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100",
                !watchedValues.shift?.start && "opacity-50 cursor-not-allowed"
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
              onClick={() => !watchedValues.shift?.start || setActiveTab('validation')}
              disabled={!watchedValues.shift?.start}
              className={clsx(
                "relative flex flex-col items-center justify-center px-4 py-3 font-medium transition-colors w-full",
                "focus:outline-none",
                activeTab === 'validation'
                  ? "text-primary-600 border-b-2 border-primary-600 dark:border-primary-400 dark:text-primary-400"
                  : "text-gray-600 hover:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100",
                !watchedValues.shift?.start && "opacity-50 cursor-not-allowed"
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
              />
              <ShiftInfo 
                control={control}
                onStartShift={() => setActiveTab('courses')}
              />
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <FormScrollContainer
                  onAddCourse={handleAddCourse}
                  currentLocation={chauffeur.currentLocation}
                />
              </div>
              
              <div className="lg:col-span-1">
                <ScrollShadow className="h-[400px] hide-scrollbar">
                  <div className="space-y-3 pr-2">
                    <SummaryCard
                      recettes={totalRecettes}
                      charges={totalCharges}
                      salaire={salaire}
                    />
                    {courseFields.length > 0 && (
                      <CourseList 
                        courses={watchedValues.courses || []} 
                        onRemoveCourse={removeCourse}
                        compact
                      />
                    )}
                  </div>
                </ScrollShadow>
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
              expenses={watchedValues.charges || []}
              onRemoveExpense={removeCharge}
              onAddExpense={handleAddExpense}
            />
          )}
        </div>
      </div>
    </Page>
  );
}