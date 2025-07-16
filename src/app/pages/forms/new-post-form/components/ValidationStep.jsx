import { useFormContext } from 'react-hook-form';
import { SignaturePanel } from './SignaturePanel';
import { Card } from 'components/ui';
import { Input } from 'components/ui';
import { Controller } from 'react-hook-form';
import { Button } from 'components/ui';
import { ExpenseModal } from './ExpenseModal';

export function ValidationStep({ onSubmit, totals }) {
  const { control, getValues } = useFormContext(); // Utilisez useFormContext pour accéder à control
  
  const handleSubmit = () => {
    const values = getValues();
    
    if (!values.validation?.signature) {
      alert('Veuillez signer pour valider');
      return;
    }

    onSubmit({
      ...values,
      totals,
      validation: {
        signature: values.validation.signature,
        date_validation: new Date().toISOString(),
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
              onClick={() => {
                // Ouvrir le modal pour ajouter une dépense
                ExpenseModal.open({
                  onSubmit: (expense) => {
                    // Logique pour ajouter la dépense
                    console.log('Dépense ajoutée:', expense);
                  }
                });
              }}
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
        <label className="block text-sm font-medium mb-2">
          Signature
        </label>
        <SignaturePanel 
          control={control} // Passez correctement control
          name="validation.signature"
        />
      </div>
      </div>
      
      <Button onClick={handleSubmit} className="w-full mt-4">
        Valider le Shift
      </Button>
    </Card>
  );
}