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
        index: 0,
        heure: heureActuelle,
        position: null
      },
      arrivee: {
        lieu: form.arrivee,
        index: 0
      },
      prix: parseFloat(form.prix),
      mode_paiement: form.mode_paiement,
      client: form.mode_paiement === 'facture' ? form.client : null
    });
    
    setForm({
      ...form,
      arrivee: '',
      prix: ''
    });
  };

  return (
    <Card>
      <h3>Nouvelle Course</h3>
      
      <form onSubmit={handleSubmit}>
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
        
        <div className="form-row">
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
            required
          />
        )}
        
        <Button type="submit">
          Ajouter Course
        </Button>
      </form>
    </Card>
  );
}