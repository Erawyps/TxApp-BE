import { useState } from 'react';
import { Card } from 'components/ui';
import { Button } from 'components/ui';

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
    <Card className="expenses-section">
      <h3>Dépenses</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({...form, type: e.target.value})}
              className="input-field"
            >
              {expenseTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Montant (€)</label>
            <input
              type="number"
              step="0.01"
              value={form.montant}
              onChange={(e) => setForm({...form, montant: e.target.value})}
              required
              className="input-field"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Paiement</label>
            <select
              value={form.mode_paiement}
              onChange={(e) => setForm({...form, mode_paiement: e.target.value})}
              className="input-field"
            >
              <option value="cash">Cash</option>
              <option value="bancontact">Bancontact</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="input-field"
            />
          </div>
        </div>
        
        <Button type="submit" className="submit-button">
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
                  <span className="expense-type">{charge.type}</span>
                  <span className="expense-amount">{charge.montant} €</span>
                </div>
                <div>
                  <span className="expense-payment">{charge.mode_paiement}</span>
                  <button 
                    type="button" 
                    onClick={() => onRemoveCharge(index)}
                    className="remove-button"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <style>{`
        .expenses-section {
          margin-bottom: 15px;
        }
        .form-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }
        .form-group {
          flex: 1;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .input-field {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .submit-button {
          width: 100%;
          padding: 12px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 15px;
        }
        .submit-button:hover {
          background: #2980b9;
        }
        .expenses-list {
          margin-top: 15px;
        }
        .expenses-list h4 {
          margin-bottom: 10px;
        }
        .expense-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        .expense-type {
          font-weight: 500;
        }
        .expense-amount {
          margin-left: 10px;
          color: #e74c3c;
        }
        .expense-payment {
          color: #7f8c8d;
        }
        .remove-button {
          margin-left: 10px;
          color: #e74c3c;
          background: none;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </Card>
  );
}