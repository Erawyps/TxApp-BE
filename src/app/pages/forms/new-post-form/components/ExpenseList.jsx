import { Badge, Button } from 'components/ui';
import { Card } from 'components/ui';

export function ExpenseList({ expenses, onRemoveExpense }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center">
          <span className="mr-2">Dépenses enregistrées</span>
        </h3>
        <Badge>{expenses.length}</Badge>
      </div>
      
      <div className="mt-4 space-y-3">
        {expenses.map((expense, index) => (
          <div key={expense.id} className="p-3 border rounded-lg bg-gray-50 dark:bg-dark-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium capitalize">{expense.type}</p>
                <p className="text-sm text-gray-500 dark:text-dark-300">
                  {expense.montant} € • {expense.mode_paiement}
                </p>
                {expense.description && (
                  <p className="text-xs mt-1 text-gray-400 dark:text-dark-400">
                    {expense.description}
                  </p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onRemoveExpense(index)}
                className="text-red-500 dark:text-red-400"
              >
                Supprimer
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}