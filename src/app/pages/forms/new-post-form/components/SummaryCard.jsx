import { Card } from 'components/ui';

export function SummaryCard({ recettes = 0, charges = 0, salaire = 0 }) {
  // Fonction de formatage sécurisée
  const formatCurrency = (value) => {
    return parseFloat(value || 0).toFixed(2) + ' €';
  };

  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-4">
        Récapitulatif Financier
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-dark-300">Total Recettes:</span>
          <span className="font-medium text-gray-800 dark:text-dark-100">
            {formatCurrency(recettes)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-dark-300">Total Dépenses:</span>
          <span className="font-medium text-gray-800 dark:text-dark-100">
            {formatCurrency(charges)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-dark-300">Salaire estimé:</span>
          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(salaire)}
          </span>
        </div>
      </div>
    </Card>
  );
}