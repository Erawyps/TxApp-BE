import { Card, Button, Input } from 'components/ui';

// Define or import calculatePriseEnCharge function
function calculatePriseEnCharge() {
  // Add logic for calculating 'prise_en_charge_fin'
  return 0; // Replace with actual calculation
}

// Define or import calculateChutes function
function calculateChutes() {
  // Add logic for calculating 'chutes_fin'
  return 0; // Replace with actual calculation
}
import { useState } from 'react';
import { Controller } from 'react-hook-form';

export function ValidationStep({ onSubmit, control, totals }) {
  const [signature, setSignature] = useState(null);

  const handleSubmit = () => {
    if (!signature) {
      alert('Veuillez signer pour valider');
      return;
    }

    const data = {}; // Define or fetch the data object here

    onSubmit({
      ...data,
      validation: {
        prise_en_charge_fin: calculatePriseEnCharge(), // Ensure calculatePriseEnCharge is defined or imported
        date_validation: new Date().toISOString(),
        // valide_par: currentUserId  À obtenir du contexte d'authentification
      },
      kilometers: {
        ...data.kilometers,
        prise_en_charge_fin: calculatePriseEnCharge(),
        chutes_fin: calculateChutes()
      }
    });
  };

  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-4">
        Validation du Shift
      </h3>
      
      <div className="space-y-4">
        <Controller
          name="kilometers.end"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Kilométrage final (km)"
              type="number"
              min="0"
              step="1"
              error={error?.message}
            />
          )}
        />
        
        <Controller
          name="shift.end"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Heure de fin"
              type="time"
              error={error?.message}
            />
          )}
        />
        
        <Controller
          name="shift.interruptions"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Interruptions (minutes)"
              type="number"
              min="0"
              error={error?.message}
            />
          )}
        />
        
        <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
          <h4 className="font-medium text-gray-800 dark:text-dark-100 mb-3">
            Récapitulatif financier
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-dark-300">Total Recettes:</span>
              <span className="font-medium text-gray-800 dark:text-dark-100">
                {totals.recettes.toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-dark-300">Total Charges:</span>
              <span className="font-medium text-gray-800 dark:text-dark-100">
                {totals.charges.toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between text-primary-600 dark:text-primary-400">
              <span className="font-medium">Salaire estimé:</span>
              <span className="font-bold">{totals.salaire.toFixed(2)} €</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
            Signature
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-dark-500 rounded-lg h-40 bg-white dark:bg-dark-800 flex items-center justify-center">
            <button 
              type="button" 
              className="text-gray-500 dark:text-dark-400"
              onClick={() => setSignature('signature-data')}
            >
              Cliquez pour signer
            </button>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit}
          variant="primary"
          className="w-full mt-4"
        >
          Valider le Shift
        </Button>
      </div>
    </Card>
  );
}