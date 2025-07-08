import { useState } from 'react';
import { Card, Button, Input, Select } from 'components/ui';

export function ExpensesSection({ onAddExpense, charges, onRemoveCharge }) {
  const [form, setForm] = useState({
    type: 'carburant',
    montant: '',
    mode_paiement: 'cash',
    description: ''
  });

  const expenseTypes = [
    { value: 'carburant', label: 'Carburant' },
    { value: 'peage', label: 'Péage' },
    { value: 'entretien', label: 'Entretien' },
    { value: 'carwash', label: 'Carwash' },
    { value: 'divers', label: 'Divers' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.montant) return;
    
    onAddExpense({
      type: form.type,
      montant: parseFloat(form.montant),
      mode_paiement: form.mode_paiement,
      description: form.description,
      date: new Date().toISOString()
    });
    
    setForm({
      type: 'carburant',
      montant: '',
      mode_paiement: 'cash',
      description: ''
    });
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium">Dépenses</h3>
      
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            options={expenseTypes}
            value={form.type}
            onChange={(value) => setForm({...form, type: value})}
          />
          
          <Input
            label="Montant (€)"
            type="number"
            step="0.01"
            value={form.montant}
            onChange={(e) => setForm({...form, montant: e.target.value})}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Paiement"
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'bancontact', label: 'Bancontact' }
            ]}
            value={form.mode_paiement}
            onChange={(value) => setForm({...form, mode_paiement: value})}
          />
          
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
          />
        </div>
        
        <Button type="submit" className="w-full">
          Ajouter Dépense
        </Button>
      </form>
      
      {charges.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium">Dépenses enregistrées</h4>
          <ul className="mt-2 space-y-2">
            {charges.map((charge, index) => (
              <li key={index} className="flex justify-between items-center p-2 border rounded-lg">
                <div>
                  <span className="font-medium">{charge.type}</span>
                  <span className="ml-2">{charge.montant} €</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">{charge.mode_paiement}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onRemoveCharge(index)}
                  >
                    Supprimer
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}