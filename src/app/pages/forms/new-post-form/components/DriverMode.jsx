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

  // Calcul des totaux
  const totalRecettes = courseFields.reduce((sum, _, index) => {
    return sum + (parseFloat(watch(`courses.${index}.prix`)) || 0);
  }, 0);

  const totalCharges = chargeFields.reduce((sum, _, index) => {
    return sum + (parseFloat(watch(`charges.${index}.montant`)) || 0);
  }, 0);

  // Règle de calcul du salaire
  const base = Math.min(totalRecettes, 180);
  const surplus = Math.max(totalRecettes - 180, 0);
  const salaire = (base * 0.4) + (surplus * 0.3);

  return (
    <div className="driver-mode">
      <Card className="driver-header">
        <h2>Feuille de Route - {chauffeur.prenom} {chauffeur.nom}</h2>
        <div className="driver-info">
          <div>
            <span>Badge: {chauffeur.numero_badge}</span>
            <span>Contrat: {chauffeur.type_contrat}</span>
          </div>
          <Button variant="outline" onClick={onSwitchMode}>
            Mode complet
          </Button>
        </div>
      </Card>

      <div className="driver-tabs">
        <Button 
          variant={activeTab === 'shift' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('shift')}
        >
          Début Shift
        </Button>
        <Button 
          variant={activeTab === 'courses' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('courses')}
          disabled={!watch('shift.start')}
        >
          Courses ({courseFields.length})
        </Button>
        <Button 
          variant={activeTab === 'validation' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('validation')}
          disabled={!watch('shift.start')}
        >
          Fin Shift
        </Button>
      </div>

      <div className="driver-content">
        {activeTab === 'shift' && (
          <>
            <VehicleInfo 
              vehicules={vehicules} 
              control={control}
              currentVehicle={watch('header.vehicule')}
            />
            <ShiftInfo 
              control={control}
              onStartShift={() => setActiveTab('courses')}
            />
          </>
        )}

        {activeTab === 'courses' && (
          <>
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
            
            <Card className="totals-card">
              <h3>Récapitulatif</h3>
              <div className="total-row">
                <span>Total Recettes:</span>
                <span>{totalRecettes.toFixed(2)} €</span>
              </div>
              <div className="total-row">
                <span>Total Charges:</span>
                <span>{totalCharges.toFixed(2)} €</span>
              </div>
              <div className="total-row highlight">
                <span>Salaire estimé:</span>
                <span>{salaire.toFixed(2)} €</span>
              </div>
            </Card>
          </>
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