import { Badge, Button } from 'components/ui';
import { Card } from 'components/ui';
import { TrashIcon } from '@heroicons/react/24/outline';

export function ExpenseList({ expenses, onRemoveExpense }) {
  if (expenses.length === 0) return null;

  const getTypeLabel = (type) => {
    const types = {
      'carburant': 'Carburant',
      'peage': 'Péage',
      'entretien': 'Entretien',
      'carwash': 'Nettoyage',
      'divers': 'Divers'
    };
    return types[type] || type;
  };

  const getPaymentLabel = (method) => {
    const methods = {
      'CASH': 'Espèces',
      'BC': 'Bancontact'
    };
    return methods[method] || method;
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Dépenses ({expenses.length})</h3>
        <Badge variant="primary">{expenses.length}</Badge>
      </div>
      
      <div className="space-y-3">
        {expenses.map((expense) => (
          <div key={expense.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium capitalize">
                  {getTypeLabel(expense.type_charge)}
                </div>
                <div className="mt-1 text-sm">
                  <span className="font-medium">{expense.montant.toFixed(2)} €</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{getPaymentLabel(expense.mode_paiement_id)}</span>
                </div>
                {expense.description && (
                  <div className="mt-1 text-sm text-gray-500">
                    {expense.description}
                  </div>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onRemoveExpense(expense.id)}
                className="text-red-500 hover:bg-red-50"
                icon={<TrashIcon className="h-4 w-4" />}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}