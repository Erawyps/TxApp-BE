import { Badge, Button } from 'components/ui';
import { Card } from 'components/ui';
import { TrashIcon } from '@heroicons/react/24/outline';

export function ExpenseList({ expenses, onRemoveExpense }) {
  if (expenses.length === 0) return null;

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonction pour obtenir le libellé du mode de paiement
  const getPaymentLabel = (modePaiementId) => {
    switch(modePaiementId) {
      case 'CASH': return 'Espèces';
      case 'BC': return 'Bancontact';
      case 'VIR': return 'Virement';
      default: return modePaiementId;
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
          Liste des Dépenses
        </h3>
        <Badge variant="primary">{expenses.length}</Badge>
      </div>
      
      <div className="space-y-3">
        {expenses.map((expense, index) => (
          <div 
            key={expense.id} 
            className="p-4 border rounded-lg bg-white dark:bg-dark-700 border-gray-200 dark:border-dark-500"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-gray-800 dark:text-dark-100">
                  {expense.type_charge || expense.type}
                </div>
                <div className="mt-1 text-sm text-gray-600 dark:text-dark-300">
                  <span className="font-medium">{expense.montant?.toFixed(2)} €</span>
                  <span className="mx-2">•</span>
                  <span>{getPaymentLabel(expense.mode_paiement_id || expense.mode_paiement)}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(expense.date)}</span>
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
    </Card>
  );
}