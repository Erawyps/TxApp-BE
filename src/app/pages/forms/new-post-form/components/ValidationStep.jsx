import { useState } from 'react';
import { Card, Button, Input } from 'components/ui';
import { Controller } from 'react-hook-form';
import { ExpenseModal } from './ExpenseModal';
import { ExpenseList } from './ExpenseList';
import { SummaryCard } from './SummaryCard';

export function ValidationStep({ onSubmit, control, totals, expenses, onRemoveExpense, onAddExpense }) {
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
    <div className="space-y-6">
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
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
            Dépenses
          </h3>
          <Button 
            size="sm"
            variant="outlined"
            onClick={() => setIsExpenseModalOpen(true)}
          >
            Ajouter dépense
          </Button>
        </div>

        {expenses.length > 0 ? (
          <ExpenseList 
            expenses={expenses}
            onRemoveExpense={onRemoveExpense}
          />
        ) : (
          <p className="text-gray-500 dark:text-dark-400 text-center py-4">
            Aucune dépense enregistrée
          </p>
        )}
      </Card>

      <SummaryCard 
        recettes={totals.recettes}
        charges={totals.charges}
        salaire={totals.salaire}
      />

      <Card className="p-5">
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
      </Card>

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={onAddExpense}
      />
    </div>
  );
}