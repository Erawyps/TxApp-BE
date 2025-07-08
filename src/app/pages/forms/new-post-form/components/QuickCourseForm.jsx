import { useState } from 'react';
import { Card, Button, Input, Select } from 'components/ui';

export function QuickCourseForm({ onAddCourse, currentLocation }) {
  const [form, setForm] = useState({
    depart: currentLocation || '',
    arrivee: '',
    prix: '',
    mode_paiement: 'cash',
    client: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.depart || !form.arrivee || !form.prix) return;
    
    const heureActuelle = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    onAddCourse({
      depart: {
        lieu: form.depart,
        heure: heureActuelle
      },
      arrivee: {
        lieu: form.arrivee
      },
      prix: parseFloat(form.prix),
      mode_paiement: form.mode_paiement,
      client: form.mode_paiement === 'facture' ? form.client : null
    });
    
    setForm(prev => ({
      ...prev,
      arrivee: '',
      prix: ''
    }));
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium">Nouvelle Course</h3>
      
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Input
          label="Départ"
          value={form.depart}
          onChange={(e) => setForm({...form, depart: e.target.value})}
          required
        />
        
        <Input
          label="Arrivée"
          value={form.arrivee}
          onChange={(e) => setForm({...form, arrivee: e.target.value})}
          required
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prix (€)"
            type="number"
            step="0.01"
            value={form.prix}
            onChange={(e) => setForm({...form, prix: e.target.value})}
            required
          />
          
          <Select
            label="Paiement"
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'bancontact', label: 'Bancontact' },
              { value: 'facture', label: 'Facture' }
            ]}
            value={form.mode_paiement}
            onChange={(value) => setForm({...form, mode_paiement: value})}
          />
        </div>
        
        {form.mode_paiement === 'facture' && (
          <Input
            label="Client (facture)"
            value={form.client}
            onChange={(e) => setForm({...form, client: e.target.value})}
          />
        )}
        
        <Button type="submit" className="w-full" color="primary">
          Ajouter Course
        </Button>
      </form>
    </Card>
  );
}