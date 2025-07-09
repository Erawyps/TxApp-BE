import { useState } from 'react';
import { Card, Button, Input } from 'components/ui';

export function ExpensesSection({ onAddExpense }) {
  const [type, setType] = useState('carburant');
  const [montant, setMontant] = useState('');
  const [modePaiement, setModePaiement] = useState('cash');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!montant) return;
    
    onAddExpense({
      type,
      montant: parseFloat(montant),
      mode_paiement: modePaiement,
      description,
      date: new Date().toISOString()
    });
    
    setMontant('');
    setDescription('');
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium">Nouvelle Dépense</h3>
      
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-300">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-dark-800 text-gray-800 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="carburant">Carburant</option>
              <option value="peage">Péage</option>
              <option value="entretien">Entretien</option>
              <option value="carwash">Carwash</option>
              <option value="divers">Divers</option>
            </select>
          </div>
          
          <Input
            label="Montant (€)"
            type="number"
            step="0.01"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            required
            className="[&>input]:bg-white dark:[&>input]:bg-dark-800"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-300">Paiement</label>
            <select
              value={modePaiement}
              onChange={(e) => setModePaiement(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-dark-800 text-gray-800 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="cash">Cash</option>
              <option value="bancontact">Bancontact</option>
            </select>
          </div>
          
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="[&>input]:bg-white dark:[&>input]:bg-dark-800"
          />
        </div>
        
        <Button type="submit" className="w-full" color="primary">
          Ajouter Dépense
        </Button>
      </form>
    </Card>
  );
}