import { useState } from 'react';
import { Card, Button, Input, Select } from 'components/ui';
import { toast } from 'sonner';

export function QuickCourseForm({ onAddCourse, currentLocation }) {
  const [form, setForm] = useState({
    lieu_embarquement: currentLocation || '',
    lieu_debarquement: '',
    heure_embarquement: '',
    heure_debarquement: '',
    prix_taximetre: '',
    somme_percue: '',
    index_depart: '',
    index_arrivee: '',
    mode_paiement_id: 'CASH',
    client_id: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    const requiredFields = [
      'lieu_embarquement', 'lieu_debarquement', 'prix_taximetre',
      'heure_embarquement', 'heure_debarquement', 'index_depart', 'index_arrivee'
    ];
    
    const missingFields = requiredFields.filter(field => !form[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Veuillez remplir tous les champs obligatoires`);
      return;
    }
    
    if (isNaN(parseFloat(form.prix_taximetre))) {
      toast.error('Veuillez entrer un prix valide');
      return;
    }

    if (parseFloat(form.index_arrivee) <= parseFloat(form.index_depart)) {
      toast.error("L'index d'arrivée doit être supérieur à l'index de départ");
      return;
    }
    
    onAddCourse({
      lieu_embarquement: form.lieu_embarquement,
      lieu_debarquement: form.lieu_debarquement,
      heure_embarquement: form.heure_embarquement,
      heure_debarquement: form.heure_debarquement,
      prix_taximetre: parseFloat(form.prix_taximetre),
      somme_percue: parseFloat(form.somme_percue || form.prix_taximetre),
      index_depart: parseFloat(form.index_depart),
      index_arrivee: parseFloat(form.index_arrivee),
      mode_paiement_id: form.mode_paiement_id,
      client_id: form.mode_paiement_id.startsWith('F-') ? form.client_id : null,
      est_facture: form.mode_paiement_id.startsWith('F-'),
      notes: form.notes
    });
    
    toast.success('Course ajoutée avec succès');
    
    // Réinitialisation du formulaire
    setForm({
      lieu_embarquement: currentLocation || '',
      lieu_debarquement: '',
      heure_embarquement: '',
      heure_debarquement: '',
      prix_taximetre: '',
      somme_percue: '',
      index_depart: '',
      index_arrivee: '',
      mode_paiement_id: 'CASH',
      client_id: '',
      notes: ''
    });
  };

  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold mb-4">Nouvelle Course</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Lieu de départ"
            value={form.lieu_embarquement}
            onChange={(e) => setForm({...form, lieu_embarquement: e.target.value})}
            required
          />
          
          <Input
            label="Lieu d'arrivée"
            value={form.lieu_debarquement}
            onChange={(e) => setForm({...form, lieu_debarquement: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Heure embarquement"
            type="time"
            value={form.heure_embarquement}
            onChange={(e) => setForm({...form, heure_embarquement: e.target.value})}
            required
          />
          
          <Input
            label="Heure débarquement"
            type="time"
            value={form.heure_debarquement}
            onChange={(e) => setForm({...form, heure_debarquement: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Index départ (km)"
            type="number"
            min="0"
            step="1"
            value={form.index_depart}
            onChange={(e) => setForm({...form, index_depart: e.target.value})}
            required
          />
          
          <Input
            label="Index arrivée (km)"
            type="number"
            min="0"
            step="1"
            value={form.index_arrivee}
            onChange={(e) => setForm({...form, index_arrivee: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prix taximètre (€)"
            type="number"
            step="0.01"
            min="0"
            value={form.prix_taximetre}
            onChange={(e) => setForm({...form, prix_taximetre: e.target.value})}
            required
          />
          
          <Input
            label="Somme perçue (€)"
            type="number"
            step="0.01"
            min="0"
            value={form.somme_percue}
            onChange={(e) => setForm({...form, somme_percue: e.target.value})}
            required
          />
        </div>
        
        <Select
          label="Mode de paiement"
          options={[
            { value: 'CASH', label: 'Espèces' },
            { value: 'BC', label: 'Bancontact' },
            { value: 'F-TX', label: 'Facture Taxi' }
          ]}
          value={form.mode_paiement_id}
          onChange={(value) => setForm({...form, mode_paiement_id: value})}
        />
        
        {form.mode_paiement_id.startsWith('F-') && (
          <Input
            label="Client (pour facture)"
            value={form.client_id}
            onChange={(e) => setForm({...form, client_id: e.target.value})}
            required
          />
        )}
        
        <Input
          label="Notes (optionnel)"
          value={form.notes}
          onChange={(e) => setForm({...form, notes: e.target.value})}
        />
        
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