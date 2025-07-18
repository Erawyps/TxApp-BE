import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Input } from 'components/ui';

const CHARGE_TYPES = ['Carburant', 'Péage', 'Entretien', 'Carwash', 'Divers'];
const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Espèces' },
  { value: 'BC', label: 'Bancontact' }
];

export function ExpenseModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    type_charge: CHARGE_TYPES[0],
    montant: '',
    mode_paiement_id: PAYMENT_METHODS[0].value,
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.montant || isNaN(parseFloat(form.montant))) return;
    
    onSave({
      type_charge: form.type_charge,
      montant: parseFloat(form.montant),
      mode_paiement_id: form.mode_paiement_id,
      description: form.description,
      date: new Date().toISOString()
    });
    
    setForm({
      type_charge: CHARGE_TYPES[0],
      montant: '',
      mode_paiement_id: PAYMENT_METHODS[0].value,
      description: ''
    });
    
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-dark-700 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-dark-100"
                  >
                    Nouvelle Dépense
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 dark:text-dark-300 dark:hover:text-dark-100"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                        Type de dépense
                      </label>
                      <select
                        value={form.type_charge}
                        onChange={(e) => setForm({...form, type_charge: e.target.value})}
                        className="w-full p-2 border rounded-lg bg-white dark:bg-dark-800 text-gray-800 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {CHARGE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <Input
                      label="Montant (€)"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.montant}
                      onChange={(e) => setForm({...form, montant: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                        Mode de paiement
                      </label>
                      <select
                        value={form.mode_paiement_id}
                        onChange={(e) => setForm({...form, mode_paiement_id: e.target.value})}
                        className="w-full p-2 border rounded-lg bg-white dark:bg-dark-800 text-gray-800 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <Input
                      label="Description (optionnel)"
                      value={form.description}
                      onChange={(e) => setForm({...form, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={onClose}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                    >
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}