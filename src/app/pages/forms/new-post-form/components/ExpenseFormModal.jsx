import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Input, Select, Button } from 'components/ui';
import { XMarkIcon } from '@heroicons/react/24/outline';

const expenseTypes = ['carburant', 'peage', 'entretien', 'carwash', 'divers'];

export function ExpenseFormModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    type: 'carburant',
    montant: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      montant: parseFloat(form.montant),
      id: `EXP-${Date.now()}`
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
          <Dialog.Title className="text-lg font-bold mb-4 flex justify-between">
            <span>Nouvelle dépense</span>
            <button onClick={onClose}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Type de dépense"
              options={expenseTypes.map(type => ({
                value: type,
                label: type.charAt(0).toUpperCase() + type.slice(1)
              }))}
              value={form.type}
              onChange={(value) => setForm({...form, type: value})}
            />

            <Input
              label="Montant (€)"
              type="number"
              step="0.01"
              min="0"
              value={form.montant}
              onChange={(e) => setForm({...form, montant: e.target.value})}
              required
            />

            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({...form, date: e.target.value})}
            />

            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
            />

            <Button type="submit" className="w-full">
              Enregistrer la dépense
            </Button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}