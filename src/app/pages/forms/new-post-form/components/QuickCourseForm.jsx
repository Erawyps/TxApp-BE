import { useState } from 'react';
import { Card, Button, Input, Select } from 'components/ui';

export function QuickCourseForm({ onAddCourse, currentLocation }) {
  const [form, setForm] = useState({
    lieu_embarquement: currentLocation || '',
    lieu_debarquement: '',
    prix_taximetre: '',
    somme_percue: '',
    mode_paiement_id: 'CASH', // Utiliser les codes de la DB
    client_id: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const now = new Date().toISOString().split('T')[1].substring(0, 5);
    
    onAddCourse({
      lieu_embarquement: form.lieu_embarquement,
      lieu_debarquement: form.lieu_debarquement,
      heure_embarquement: now,
      prix_taximetre: parseFloat(form.prix_taximetre),
      somme_percue: parseFloat(form.somme_percue),
      mode_paiement_id: form.mode_paiement_id,
      client_id: form.mode_paiement_id.startsWith('F-') ? form.client_id : null,
      est_facture: form.mode_paiement_id.startsWith('F-'),
      notes: form.notes,
      index_depart: 0, // À calculer
      index_arrivee: 0  // À calculer
    });
    
    setForm(prev => ({
      ...prev,
      lieu_debarquement: '',
      prix_taximetre: '',
      somme_percue: '',
      client_id: '',
      notes: ''
    }));
  };


  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-4">
        Nouvelle Course
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Lieu de départ"
          value={form.depart}
          onChange={(e) => setForm({...form, depart: e.target.value})}
          required
          placeholder="Adresse de départ"
        />
        
        <Input
          label="Lieu d'arrivée"
          value={form.arrivee}
          onChange={(e) => setForm({...form, arrivee: e.target.value})}
          required
          placeholder="Adresse de destination"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prix (€)"
            type="number"
            step="0.01"
            min="0"
            value={form.prix}
            onChange={(e) => setForm({...form, prix: e.target.value})}
            required
            placeholder="0,00"
          />
          
          <Select
            label="Mode de paiement"
            options={[
              { value: 'cash', label: 'Espèces' },
              { value: 'bancontact', label: 'Bancontact' },
              { value: 'facture', label: 'Facture' }
            ]}
            value={form.mode_paiement}
            onChange={(value) => setForm({...form, mode_paiement: value})}
          />
        </div>
        
        {form.mode_paiement === 'facture' && (
          <Input
            label="Nom du client"
            value={form.client}
            onChange={(e) => setForm({...form, client: e.target.value})}
            required
            placeholder="Nom du client pour facturation"
          />
        )}
        
        <Button 
          type="submit" 
          className="w-full mt-2"
          variant="primary"
        >
          Ajouter la course
        </Button>
      </form>
    </Card>
  );
}