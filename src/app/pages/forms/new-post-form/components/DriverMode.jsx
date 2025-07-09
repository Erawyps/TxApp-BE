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
  
  // Utilisation sécurisée de useWatch avec des valeurs par défaut
  const watchedValues = useWatch({ 
    control, 
    defaultValue: {
      courses: [],
      charges: [],
      shift: { start: '' },
      header: { vehicule: null }
    }
  });

  // Fonction helper pour obtenir une valeur sécurisée
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

  // Calculs sécurisés
  const totalRecettes = courseFields.reduce((sum, _, index) => {
    const prix = safeGetValue(`courses.${index}.prix`, 0);
    const numericPrix = typeof prix === 'number' ? prix : parseFloat(prix) || 0;
    return sum + numericPrix;
  }, 0);

  const totalCharges = chargeFields.reduce((sum, _, index) => {
    const montant = safeGetValue(`charges.${index}.montant`, 0);
    const numericMontant = typeof montant === 'number' ? montant : parseFloat(montant) || 0;
    return sum + numericMontant;
  }, 0);

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

  const handleRemoveCharge = (index) => {
    try {
      removeCharge(index);
    } catch (error) {
      console.error('Erreur lors de la suppression de la charge:', error);
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
          disabled={!safeGetValue('shift.start')}
          className="flex-1"
        >
          Courses ({courseFields.length})
        </Button>
        <Button 
          variant={activeTab === 'validation' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('validation')}
          disabled={!safeGetValue('shift.start')}
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
              currentVehicle={safeGetValue('header.vehicule')}
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
              onRemoveCharge={handleRemoveCharge}
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