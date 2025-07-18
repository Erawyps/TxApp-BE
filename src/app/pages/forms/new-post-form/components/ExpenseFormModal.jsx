import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button, Input, Select } from 'components/ui';

const CHARGE_TYPES = ['Carburant', 'Péage', 'Entretien', 'Carwash', 'Divers'];
const PAYMENT_METHODS = ['CASH', 'BC'];

export function ExpenseFormModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    type: CHARGE_TYPES[0],
    amount: '',
    paymentMethod: PAYMENT_METHODS[0],
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(parseFloat(form.amount))) return;
    
    onSave({
      ...form,
      amount: parseFloat(form.amount),
      id: `exp-${Date.now()}`
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded bg-white dark:bg-dark-700 p-6">
          <Dialog.Title className="text-lg font-bold mb-4">Nouvelle Dépense</Dialog.Title>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Type de dépense"
              options={CHARGE_TYPES.map(type => ({ value: type, label: type }))}
              value={form.type}
              onChange={(value) => setForm({...form, type: value})}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Montant (€)"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({...form, amount: e.target.value})}
                required
              />
              
              <Select
                label="Mode de paiement"
                options={PAYMENT_METHODS.map(method => ({ 
                  value: method, 
                  label: method === 'CASH' ? 'Espèces' : 'Bancontact' 
                }))}
                value={form.paymentMethod}
                onChange={(value) => setForm({...form, paymentMethod: value})}
              />
            </div>
            
            <Input
              label="Description (optionnelle)"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
            />
            
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({...form, date: e.target.value})}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                Enregistrer
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}