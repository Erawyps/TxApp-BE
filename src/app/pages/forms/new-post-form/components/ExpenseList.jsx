import { Badge, Button } from 'components/ui';
import { Card, ScrollShadow } from 'components/ui';
import { TrashIcon } from '@heroicons/react/24/outline';

export function ExpenseList({ expenses, onRemoveExpense }) {
  if (expenses.length === 0) return null;

  // Fonctions utilitaires
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const getPaymentLabel = (modePaiementId) => {
    const modes = {
      'CASH': 'Espèces',
      'BC': 'Bancontact',
      'VIR': 'Virement',
      'F-SNCB': 'Facture SNCB',
      'F-TX': 'Facture Taxi'
    };
    return modes[modePaiementId] || modePaiementId;
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-semibold text-gray-800 dark:text-dark-100">
          Dépenses
        </h3>
        <Badge variant="primary">{expenses.length}</Badge>
      </div>
      
      <ScrollShadow className="h-[200px] hide-scrollbar" visibility="both">
        <div className="space-y-2 pr-2">
          {expenses.map((expense, index) => {
            const paymentLabel = getPaymentLabel(expense.mode_paiement_id || expense.mode_paiement);
            const chargeType = expense.type_charge || expense.type;
            const formattedAmount = expense.montant?.toFixed(2) || '0.00';
            const formattedDate = formatDate(expense.date);

            return (
              <div 
                key={expense.id} 
                className="p-3 border rounded-md bg-white dark:bg-dark-700 border-gray-200 dark:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 dark:text-dark-100 truncate">
                        {chargeType}
                      </span>
                      <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                        {formattedAmount} €
                      </span>
                    </div>
                    
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-dark-400">
                      <span>{paymentLabel}</span>
                      {formattedDate && (
                        <span className="flex items-center">
                          <span className="mx-1">•</span>
                          {formattedDate}
                        </span>
                      )}
                    </div>

                    {expense.description && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-dark-400 line-clamp-1">
                        {expense.description}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="xs"
                    onClick={() => onRemoveExpense(index)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                    icon={<TrashIcon className="h-3.5 w-3.5" />}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </ScrollShadow>
    </Card>
  );
}