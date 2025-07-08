import { useState } from 'react';
import { Card, Button, Input } from 'components/ui';

export function ExpensesSection({ onAddExpense, charges, onRemoveCharge }) {
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
      <h3 className="text-lg font-medium">Dépenses</h3>
      
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded"
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
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Paiement</label>
            <select
              value={modePaiement}
              onChange={(e) => setModePaiement(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="cash">Cash</option>
              <option value="bancontact">Bancontact</option>
            </select>
          </div>
          
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
              <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium capitalize">{charge.type}</span>
                  <span className="ml-2">{charge.montant} €</span>
                </div>
                <div>
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