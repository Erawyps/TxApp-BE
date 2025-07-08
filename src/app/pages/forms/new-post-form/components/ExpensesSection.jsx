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
    <Card>
      <h3>Dépenses</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
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
        
        <div className="form-row">
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
        
        <Button type="submit">
          Ajouter Dépense
        </Button>
      </form>
      
      {charges.length > 0 && (
        <div className="expenses-list">
          <h4>Dépenses enregistrées</h4>
          <ul>
            {charges.map((charge, index) => (
              <li key={index} className="expense-item">
                <div>
                  <span>{charge.type}</span>
                  <span>{charge.montant} €</span>
                </div>
                <div>
                  <span>{charge.mode_paiement}</span>
                  <Button 
                    variant="ghost" 
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