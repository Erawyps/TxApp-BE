// components/SummaryCard.jsx
import { Card } from 'components/ui';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, BanknotesIcon } from '@heroicons/react/24/outline';

export function SummaryCard({ recettes, charges, salaire }) {
  return (
    <Card className="bg-white dark:bg-dark-700 shadow-sm">
      <div className="p-4">
        <h3 className="flex items-center text-lg font-medium text-gray-800 dark:text-dark-100">
          <BanknotesIcon className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
          Récapitulatif du shift
        </h3>
        
        <div className="mt-4 space-y-3">
          <SummaryItem 
            label="Total Recettes" 
            value={recettes} 
            icon={<ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />}
            color="green"
          />
          
          <SummaryItem 
            label="Total Charges" 
            value={charges} 
            icon={<ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />}
            color="red"
          />
          
          <div className="pt-2 border-t border-gray-200 dark:border-dark-600">
            <SummaryItem 
              label="Salaire estimé" 
              value={salaire} 
              icon={<BanknotesIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />}
              color="primary"
              highlight
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

function SummaryItem({ label, value, icon, color, highlight = false }) {
  const colorClasses = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    primary: 'text-primary-600 dark:text-primary-400'
  };

  return (
    <div className={`flex items-center justify-between p-2 rounded-lg ${highlight ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}>
      <div className="flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        <span className={`font-medium ${highlight ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-dark-200'}`}>
          {label}
        </span>
      </div>
      <span className={`font-mono ${highlight ? 'font-bold' : 'font-semibold'} ${colorClasses[color]}`}>
        {value.toFixed(2)} €
      </span>
    </div>
  );
}