import { useFieldArray, useWatch } from 'react-hook-form';
import { useState } from 'react';
import { VehicleInfo } from './VehicleInfo';
import { ShiftInfo } from './ShiftInfo';
import { Card, Button } from 'components/ui';
import { ExpensesSection } from './ExpensesSection';
import { QuickCourseForm } from './QuickCourseForm';
import { ValidationStep } from './ValidationStep';

export function DriverMode({ chauffeur, vehicules, control, onSubmit, onSwitchMode }) {
  const { fields: courseFields, append: appendCourse } = useFieldArray({
    control,
    name: "courses"
  });

  const { fields: chargeFields, append: appendCharge, remove: removeCharge } = useFieldArray({
    control,
    name: "charges"
  });

  const [activeTab, setActiveTab] = useState('shift');
  const watch = useWatch({ control });

  const totalRecettes = courseFields.reduce((sum, _, index) => {
    return sum + (parseFloat(watch(`courses.${index}.prix`)) || 0);
  }, 0);

  const totalCharges = chargeFields.reduce((sum, _, index) => {
    return sum + (parseFloat(watch(`charges.${index}.montant`)) || 0);
  }, 0);

  // Calcul du salaire selon la règle mixte 40/30
  const base = Math.min(totalRecettes, 180);
  const surplus = Math.max(totalRecettes - 180, 0);
  const salaire = (base * 0.4) + (surplus * 0.3);

  return (
    <div className="driver-mode space-y-4">
      <Card className="driver-header p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Feuille de Route - {chauffeur.prenom} {chauffeur.nom}</h2>
          <Button variant="outline" onClick={onSwitchMode}>
            Mode complet
          </Button>
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-dark-200">
          <span>Badge: {chauffeur.numero_badge}</span>
          <span className="mx-2">•</span>
          <span>Contrat: {chauffeur.type_contrat}</span>
        </div>
      </Card>

      <div className="flex space-x-2">
        <Button 
          variant={activeTab === 'shift' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('shift')}
          className="flex-1"
        >
          Début Shift
        </Button>
        <Button 
          variant={activeTab === 'courses' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('courses')}
          disabled={!watch('shift.start')}
          className="flex-1"
        >
          Courses ({courseFields.length})
        </Button>
        <Button 
          variant={activeTab === 'validation' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('validation')}
          disabled={!watch('shift.start')}
          className="flex-1"
        >
          Fin Shift
        </Button>
      </div>

      <div className="driver-content">
        {activeTab === 'shift' && (
          <div className="space-y-4">
            <VehicleInfo 
              vehicules={vehicules} 
              control={control}
              currentVehicle={watch('header.vehicule')}
            />
            <ShiftInfo 
              control={control}
              onStartShift={() => setActiveTab('courses')}
            />
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-4">
            <QuickCourseForm 
              onAddCourse={(course) => {
                const newCourse = {
                  ...course,
                  id: `CRS-${Date.now()}`,
                  order: courseFields.length + 1
                };
                appendCourse(newCourse);
              }}
              currentLocation={chauffeur.currentLocation}
            />
            
            <ExpensesSection 
              onAddExpense={(expense) => {
                appendCharge({
                  ...expense,
                  id: `CHG-${Date.now()}`
                });
              }}
              charges={chargeFields}
              onRemoveCharge={removeCharge}
            />
            
            <Card className="p-4">
              <h3 className="text-lg font-medium">Récapitulatif</h3>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between">
                  <span>Total Recettes:</span>
                  <span className="font-medium">{totalRecettes.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Charges:</span>
                  <span className="font-medium">{totalCharges.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-primary-600 dark:text-primary-400">
                  <span>Salaire estimé:</span>
                  <span className="font-bold">{salaire.toFixed(2)} €</span>
                </div>
              </div>
            </Card>
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