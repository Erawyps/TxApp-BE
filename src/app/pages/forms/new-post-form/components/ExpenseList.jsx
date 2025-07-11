import { Badge, Button, Card, ScrollShadow } from 'components/ui';
import { TrashIcon } from '@heroicons/react/24/outline';

export function ExpenseList({ expenses, onRemoveExpense }) {
  if (expenses.length === 0) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
          Liste des Dépenses
        </h3>
        <Badge variant="primary">{expenses.length}</Badge>
      </div>
      
      <ScrollShadow className="max-h-80 hide-scrollbar"> {/* Hauteur maximale de 320px */}
        <div className="space-y-3 pr-2">
          {expenses.map((expense, index) => (
            <div 
              key={expense.id} 
              className="p-4 border rounded-lg bg-white dark:bg-dark-700 border-gray-200 dark:border-dark-500"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-800 dark:text-dark-100 capitalize">
                    {expense.type}
                  </div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-dark-300">
                    <span className="font-medium">{expense.montant.toFixed(2)} €</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{expense.mode_paiement}</span>
                  </div>
                  {expense.description && (
                    <div className="mt-1 text-sm text-gray-500 dark:text-dark-400">
                      {expense.description}
                    </div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onRemoveExpense(index)}
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  icon={<TrashIcon className="h-4 w-4" />}
                />
              </div>
            </div>
          ))}
        </div>
      </ScrollShadow>
    </Card>
  );
}