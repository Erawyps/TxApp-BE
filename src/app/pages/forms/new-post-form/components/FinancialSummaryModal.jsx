import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function FinancialSummaryModal({ isOpen, onClose, courses, expenses }) {
  const totalRecettes = courses.reduce((sum, c) => sum + c.somme_percue, 0);
  const totalDepenses = expenses.reduce((sum, e) => sum + e.montant, 0);
  const base = Math.min(totalRecettes, 180);
  const surplus = Math.max(totalRecettes - 180, 0);
  const salaire = (base * 0.4) + (surplus * 0.3);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
          <Dialog.Title className="text-lg font-bold mb-4 flex justify-between">
            <span>Résumé financier</span>
            <button onClick={onClose}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </Dialog.Title>

          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded">
              <div className="flex justify-between font-bold">
                <span>Total recettes:</span>
                <span>{totalRecettes.toFixed(2)}€</span>
              </div>
              <div className="mt-2 text-sm">
                {courses.length} course{courses.length > 1 ? 's' : ''}
              </div>
            </div>

            <div className="p-3 bg-red-50 rounded">
              <div className="flex justify-between font-bold">
                <span>Total dépenses:</span>
                <span>-{totalDepenses.toFixed(2)}€</span>
              </div>
              <div className="mt-2 text-sm">
                {expenses.length} dépense{expenses.length > 1 ? 's' : ''}
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded">
              <div className="flex justify-between font-bold text-blue-700">
                <span>Salaire calculé:</span>
                <span>{salaire.toFixed(2)}€</span>
              </div>
              <div className="mt-2 text-sm">
                <div>Base (≤180€): {base.toFixed(2)}€ × 40% = {(base * 0.4).toFixed(2)}€</div>
                {surplus > 0 && (
                  <div>Surplus: {surplus.toFixed(2)}€ × 30% = {(surplus * 0.3).toFixed(2)}€</div>
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}