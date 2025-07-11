import { useState } from 'react';
import { Card, Button, Input, ScrollShadow } from 'components/ui';

export function ExpensesSection({ onAddExpense }) {
  // Modifications nécessaires:
const [form, setForm] = useState({
  type_charge: 'Carburant',
  montant: '',
  mode_paiement_id: 'CASH',
  description: ''
});

// Options mises à jour:
// Removed unused variable expenseTypes


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
    
    setForm({
      type: 'carburant',
      montant: '',
      mode_paiement: 'cash',
      description: ''
    });
  };

  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-4">
        Nouvelle Dépense
      </h3>
      
      <ScrollShadow className="max-h-96 hide-scrollbar"> {/* Hauteur maximale de 384px */}
        <form onSubmit={handleSubmit} className="space-y-4 pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                Type de dépense
              </label>
              <select
                value={form.type_charge}
                onChange={(e) => setForm({...form, type_charge: e.target.value})}
                className="w-full p-2 border rounded-lg"
              >
                <option value="Carburant">Carburant</option>
                <option value="Péage">Péage</option>
                <option value="Entretien">Entretien</option>
                <option value="Carwash">Nettoyage</option>
                <option value="Divers">Divers</option>
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
                className="w-full p-2 border rounded-lg"
              >
                <option value="CASH">Espèces</option>
                <option value="BC">Bancontact</option>
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
      </ScrollShadow>
    </Card>
  );
}