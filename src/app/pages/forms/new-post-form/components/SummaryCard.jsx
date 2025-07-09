import { Card } from 'components/ui';

export function SummaryCard({ recettes, charges, salaire }) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-4">
        Récapitulatif Financier
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-dark-300">Total Recettes:</span>
          <span className="font-medium text-gray-800 dark:text-dark-100">
            {recettes.toFixed(2)} €
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-dark-300">Total Dépenses:</span>
          <span className="font-medium text-gray-800 dark:text-dark-100">
            {charges.toFixed(2)} €
          </span>
        </div>
        
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-dark-300">Salaire estimé:</span>
          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {salaire.toFixed(2)} €
          </span>
        </div>
      </div>
    </Card>
  );
}