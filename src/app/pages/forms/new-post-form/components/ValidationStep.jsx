import { useState } from 'react';
import { Card, Button, Input } from 'components/ui';
import { Controller } from 'react-hook-form';
import { ExpenseModal } from './ExpenseModal';

export function ValidationStep({ onSubmit, control, totals }) {
  const [signature, setSignature] = useState(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const handleSubmit = () => {
    if (!signature) {
      alert('Veuillez signer pour valider');
      return;
    }

    const data = control.getValues();
    
    onSubmit({
      ...data,
      validation: {
        signature,
        date_validation: new Date().toISOString(),
      },
      kilometers: {
        ...data.kilometers,
        prise_en_charge_fin: data.kilometers.prise_en_charge_fin || 0,
        chutes_fin: data.kilometers.chutes_fin || 0
      }
    });
  };

  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-4">
        Validation du Shift
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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
                required
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
                required
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="kilometers.prise_en_charge_fin"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Prise en charge fin (€)"
                type="number"
                step="0.01"
                min="0"
                error={error?.message}
                required
              />
            )}
          />
          
          <Controller
            name="kilometers.chutes_fin"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Chutes fin (€)"
                type="number"
                step="0.01"
                min="0"
                error={error?.message}
                required
              />
            )}
          />
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800 dark:text-dark-100">
              Récapitulatif financier
            </h4>
            <Button 
              size="sm"
              variant="outlined"
              onClick={() => setIsExpenseModalOpen(true)}
            >
              Ajouter dépense
            </Button>
          </div>
          
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

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={(expense) => {
          // Ajouter la dépense via appendCharge (à implémenter)
          console.log('Nouvelle dépense:', expense);
        }}
      />
    </Card>
  );
}