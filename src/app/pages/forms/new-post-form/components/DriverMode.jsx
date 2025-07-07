import { useFieldArray, useWatch } from 'react-hook-form';
import { useState } from 'react';
import { VehicleInfo } from './VehicleInfo';
import { ShiftInfo } from './ShiftInfo';
import { Card } from 'components/ui';
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

  // Règle de calcul du salaire (40% jusqu'à 180€, 30% au-delà)
  const base = Math.min(totalRecettes, 180);
  const surplus = Math.max(totalRecettes - 180, 0);
  const salaire = (base * 0.4) + (surplus * 0.3);

  return (
    <div className="driver-mode">
      {/* Header avec infos chauffeur (lecture seule) */}
      <Card className="driver-header">
        <h2>Feuille de Route - {chauffeur.prenom} {chauffeur.nom}</h2>
        <div className="driver-info">
          <div>
            <span>Badge: {chauffeur.numero_badge}</span>
            <span>Contrat: {chauffeur.type_contrat}</span>
            {chauffeur.taux_commission && (
              <span>Commission: {chauffeur.taux_commission}%</span>
            )}
          </div>
          <button onClick={onSwitchMode} className="switch-mode">
            Mode complet
          </button>
        </div>
      </Card>

      {/* Navigation par onglets */}
      <div className="driver-tabs">
        <button 
          className={activeTab === 'shift' ? 'active' : ''}
          onClick={() => setActiveTab('shift')}
        >
          Début Shift
        </button>
        <button 
          className={activeTab === 'courses' ? 'active' : ''}
          onClick={() => setActiveTab('courses')}
          disabled={!watch('shift.start')}
        >
          Courses ({courseFields.length})
        </button>
        <button 
          className={activeTab === 'validation' ? 'active' : ''}
          onClick={() => setActiveTab('validation')}
          disabled={!watch('shift.start')}
        >
          Fin Shift
        </button>
      </div>

      {/* Contenu des onglets */}
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
              currentLocation={chauffeur.currentLocation || 'Unknown'}
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

      {/* Styles */}
      <style>{`
        .driver-mode {
          max-width: 100%;
          padding: 10px;
        }
        .driver-header {
          background: #2c3e50;
          color: white;
          padding: 15px;
          margin-bottom: 15px;
        }
        .driver-header h2 {
          margin: 0;
          font-size: 1.2rem;
        }
        .driver-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          font-size: 0.9rem;
        }
        .driver-info div {
          display: flex;
          gap: 15px;
        }
        .switch-mode {
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        .driver-tabs {
          display: flex;
          margin-bottom: 15px;
          border-bottom: 1px solid #ddd;
        }
        .driver-tabs button {
          flex: 1;
          padding: 10px;
          border: none;
          background: none;
          cursor: pointer;
          font-weight: 500;
          border-bottom: 3px solid transparent;
        }
        .driver-tabs button.active {
          border-bottom: 3px solid #3498db;
          color: #3498db;
        }
        .driver-tabs button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .driver-content {
          margin-bottom: 20px;
        }
        .totals-card {
          margin-top: 15px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .total-row.highlight {
          font-weight: bold;
          color: #2c3e50;
        }
        
        @media (max-width: 768px) {
          .driver-info div {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
}