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
  const watchedValues = useWatch({ control });

  // Vérification sécurisée des valeurs avec gestion d'erreurs
  const getTotalRecettes = () => {
    try {
      return courseFields.reduce((sum, _, index) => {
        const cours = watchedValues?.courses?.[index];
        const prix = cours?.prix;
        return sum + (prix && !isNaN(parseFloat(prix)) ? parseFloat(prix) : 0);
      }, 0);
    } catch (error) {
      console.error('Erreur calcul recettes:', error);
      return 0;
    }
  };

  const getTotalCharges = () => {
    try {
      return chargeFields.reduce((sum, _, index) => {
        const charge = watchedValues?.charges?.[index];
        const montant = charge?.montant;
        return sum + (montant && !isNaN(parseFloat(montant)) ? parseFloat(montant) : 0);
      }, 0);
    } catch (error) {
      console.error('Erreur calcul charges:', error);
      return 0;
    }
  };

  const totalRecettes = getTotalRecettes();
  const totalCharges = getTotalCharges();
  const base = Math.min(totalRecettes, 180);
  const surplus = Math.max(totalRecettes - 180, 0);
  const salaire = (base * 0.4) + (surplus * 0.3);

  // Vérification que les données nécessaires sont présentes
  if (!chauffeur || !vehicules || vehicules.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center text-red-500">
          Erreur: Données manquantes (chauffeur ou véhicules)
        </div>
      </Card>
    );
  }

  const handleAddCourse = (course) => {
    try {
      appendCourse({
        ...course,
        id: `CRS-${Date.now()}`,
      });
    } catch (error) {
      console.error('Erreur ajout course:', error);
    }
  };

  const handleAddExpense = (expense) => {
    try {
      appendCharge({
        ...expense,
        id: `CHG-${Date.now()}`
      });
    } catch (error) {
      console.error('Erreur ajout dépense:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">
            Feuille de Route - {chauffeur.prenom} {chauffeur.nom}
          </h2>
          <Button variant="outline" onClick={onSwitchMode}>
            Mode complet
          </Button>
        </div>
        <div className="mt-2 text-sm text-gray-600">
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
          disabled={!watchedValues?.shift?.start}
          className="flex-1"
        >
          Courses ({courseFields.length})
        </Button>
        <Button 
          variant={activeTab === 'validation' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('validation')}
          disabled={!watchedValues?.shift?.start}
          className="flex-1"
        >
          Fin Shift
        </Button>
      </div>

      <div className="space-y-4">
        {activeTab === 'shift' && (
          <>
            <VehicleInfo 
              vehicules={vehicules} 
              control={control}
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
              onAddCourse={handleAddCourse}
              currentLocation={chauffeur.currentLocation}
            />
            
            <ExpensesSection 
              onAddExpense={handleAddExpense}
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
                <div className="flex justify-between text-primary-600">
                  <span>Salaire estimé:</span>
                  <span className="font-bold">{salaire.toFixed(2)} €</span>
                </div>
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