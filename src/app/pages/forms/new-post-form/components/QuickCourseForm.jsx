import { useState } from 'react';
import { Input, Select, Button } from 'components/ui';

export function QuickCourseForm({ onAddCourse, currentLocation }) {
  const [form, setForm] = useState({
    depart: currentLocation?.address || '',
    arrivee: '',
    prix: '',
    mode_paiement: 'cash',
    client: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.depart || !form.arrivee || !form.prix) return;
    
    onAddCourse({
      depart: {
        lieu: form.depart,
        index: 0, // Serait calculé ou saisi séparément
        heure: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        position: currentLocation
      },
      arrivee: {
        lieu: form.arrivee,
        index: 0 // Serait calculé plus tard
      },
      prix: parseFloat(form.prix),
      mode_paiement: form.mode_paiement,
      client: form.mode_paiement === 'facture' ? form.client : null
    });
    
    // Réinitialiser le formulaire
    setForm({
      ...form,
      arrivee: '',
      prix: '',
      client: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded-lg shadow">
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
      
      <div className="grid grid-cols-2 gap-3">
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
          onChange={(val) => setForm({...form, mode_paiement: val})}
        />
      </div>
      
      {form.mode_paiement === 'facture' && (
        <Input
          label="Client (pour facture)"
          value={form.client}
          onChange={(e) => setForm({...form, client: e.target.value})}
          required
        />
      )}
      
      <Button type="submit" className="w-full">
        Ajouter la course
      </Button>
    </form>
  );
}