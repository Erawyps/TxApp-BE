// ExpensesSection.jsx
import { useState } from 'react';
import { Card, Button, Input } from 'components/ui';

// Définir les constantes dans le composant ou les importer
const CHARGE_TYPES = ['Carburant', 'Péage', 'Entretien', 'Carwash', 'Divers'];
const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Espèces' },
  { value: 'BC', label: 'Bancontact' }
];

export function ExpensesSection({ onAddExpense }) {
  const [form, setForm] = useState({
    type_charge: CHARGE_TYPES[0], // 'Carburant' par défaut
    montant: '',
    mode_paiement_id: PAYMENT_METHODS[0].value, // 'CASH' par défaut
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.montant || isNaN(parseFloat(form.montant))) return;
    
    onAddExpense({
      type_charge: form.type_charge,
      montant: parseFloat(form.montant),
      mode_paiement_id: form.mode_paiement_id,
      description: form.description,
      date: new Date().toISOString()
    });
    
    // Réinitialisation avec les bons noms de champs
    setForm({
      type_charge: CHARGE_TYPES[0],
      montant: '',
      mode_paiement_id: PAYMENT_METHODS[0].value,
      description: ''
    });
  };

  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-4">
        Nouvelle Dépense
      </h3>
      
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
        
        <Button 
          type="submit" 
          className="w-full mt-2"
          variant="primary"
        >
          Enregistrer la dépense
        </Button>
      </form>
    </Card>
  );
}