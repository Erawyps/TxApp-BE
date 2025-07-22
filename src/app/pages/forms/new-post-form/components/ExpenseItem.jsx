import { Button } from 'components/ui';
import { TrashIcon } from '@heroicons/react/24/outline';

export function ExpenseItem({ expense, onRemove }) {
  return (
    <div className="border rounded-lg p-3 mb-2 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium capitalize">
            {expense.type_charge}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {expense.date} • {expense.mode_paiement_id}
          </div>
          <div className="text-sm font-semibold text-primary-600 mt-1">
            {expense.montant} €
          </div>
          {expense.description && (
            <div className="text-sm text-gray-500 mt-1">{expense.description}</div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:bg-red-50"
          icon={<TrashIcon className="h-4 w-4" />}
          onClick={onRemove}
        />
      </div>
    </div>
  );
}