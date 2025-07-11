import { Badge, Button } from 'components/ui';
import { Card, ScrollShadow } from 'components/ui';
import { TrashIcon } from '@heroicons/react/24/outline';

export function ExpenseList({ expenses, onRemoveExpense }) {
  if (expenses.length === 0) return null;

  // Fonction pour formater la date
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

  // Fonction pour obtenir le libellé du mode de paiement
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
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
          Liste des Dépenses
        </h3>
        <Badge variant="primary">{expenses.length}</Badge>
      </div>
      
      <ScrollShadow className="h-[300px] hide-scrollbar" visibility="both">
        <div className="space-y-3 pr-2"> {/* Ajout de padding pour éviter que le scrollbar ne cache le contenu */}
          {expenses.map((expense, index) => {
            const paymentLabel = getPaymentLabel(expense.mode_paiement_id || expense.mode_paiement);
            const chargeType = expense.type_charge || expense.type;
            const formattedAmount = expense.montant?.toFixed(2) || '0.00';
            const formattedDate = formatDate(expense.date);

            return (
              <div 
                key={expense.id} 
                className="p-4 border rounded-lg bg-white dark:bg-dark-700 border-gray-200 dark:border-dark-500"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 dark:text-dark-100 truncate">
                      {chargeType}
                    </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-dark-300 space-x-2">
                      <span className="font-medium">{formattedAmount} €</span>
                      <span>•</span>
                      <span>{paymentLabel}</span>
                      {formattedDate && (
                        <>
                          <span>•</span>
                          <span>{formattedDate}</span>
                        </>
                      )}
                    </div>
                    {expense.description && (
                      <div className="mt-1 text-sm text-gray-500 dark:text-dark-400 truncate">
                        {expense.description}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onRemoveExpense(index)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 ml-2"
                    icon={<TrashIcon className="h-4 w-4" />}
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