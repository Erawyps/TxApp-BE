import { Card } from 'components/ui';
import { 
  CurrencyEuroIcon, 
  MinusIcon, 
  PlusIcon,
  CalculatorIcon 
} from '@heroicons/react/24/outline';

export function SummaryCard({ recettes, charges, salaire, showDetails = false }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const calculateSalaryBreakdown = () => {
    const base = Math.min(recettes, 180);
    const surplus = Math.max(recettes - 180, 0);
    const salaireBrut = (base * 0.4) + (surplus * 0.3);
    const salaireNet = Math.max(salaireBrut - charges, 0);
    
    return {
      base,
      surplus,
      salaireBrut,
      salaireNet,
      tauxBase: 0.4,
      tauxSurplus: 0.3
    };
  };

  const breakdown = calculateSalaryBreakdown();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <CalculatorIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
          Résumé financier
        </h3>
      </div>

      <div className="space-y-4">
        {/* Recettes */}
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-800 dark:text-green-200">
              Total Recettes
            </span>
          </div>
          <span className="text-lg font-bold text-green-900 dark:text-green-100">
            {formatCurrency(recettes)}
          </span>
        </div>

        {/* Charges */}
        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <MinusIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="font-medium text-red-800 dark:text-red-200">
              Total Charges
            </span>
          </div>
          <span className="text-lg font-bold text-red-900 dark:text-red-100">
            {formatCurrency(charges)}
          </span>
        </div>

        {/* Détails du calcul (si demandé) */}
        {showDetails && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Détail du calcul du salaire :
            </h4>
            <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <div className="flex justify-between">
                <span>Base (≤ 180€) : {formatCurrency(breakdown.base)} × {breakdown.tauxBase * 100}%</span>
                <span>{formatCurrency(breakdown.base * breakdown.tauxBase)}</span>
              </div>
              {breakdown.surplus > 0 && (
                <div className="flex justify-between">
                  <span>Surplus ({">"} 180€) : {formatCurrency(breakdown.surplus)} × {breakdown.tauxSurplus * 100}%</span>
                  <span>{formatCurrency(breakdown.surplus * breakdown.tauxSurplus)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-blue-200 dark:border-blue-700 pt-1">
                <span>Salaire brut</span>
                <span>{formatCurrency(breakdown.salaireBrut)}</span>
              </div>
              <div className="flex justify-between">
                <span>Charges</span>
                <span>- {formatCurrency(charges)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Salaire final */}
        <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-2 border-primary-200 dark:border-primary-800">
          <div className="flex items-center gap-2">
            <CurrencyEuroIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <span className="text-lg font-semibold text-primary-800 dark:text-primary-200">
              Salaire Net
            </span>
          </div>
          <span className="text-2xl font-bold text-primary-900 dark:text-primary-100">
            {formatCurrency(salaire)}
          </span>
        </div>
      </div>
    </Card>
  );
}