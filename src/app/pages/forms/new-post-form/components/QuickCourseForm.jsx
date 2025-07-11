import { useState } from 'react';
import { Card, Button, Input, Select } from 'components/ui';
import { toast } from 'sonner';

export function QuickCourseForm({ onAddCourse, currentLocation }) {
  const [form, setForm] = useState({
    lieu_embarquement: currentLocation || '',
    lieu_debarquement: '',
    heure_debarquement: '', // Nouveau champ
    prix_taximetre: '',
    somme_percue: '',
    mode_paiement_id: 'CASH',
    client_id: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.lieu_embarquement || !form.lieu_debarquement) {
      toast.error('Veuillez remplir les lieux de départ et d\'arrivée');
      return;
    }
    
    if (!form.prix_taximetre || isNaN(parseFloat(form.prix_taximetre))) {
      toast.error('Veuillez entrer un prix valide');
      return;
    }

    const now = new Date().toISOString().split('T')[1].substring(0, 5);
    
    onAddCourse({
      lieu_embarquement: form.lieu_embarquement,
      lieu_debarquement: form.lieu_debarquement,
      heure_embarquement: now,
      heure_debarquement: form.heure_debarquement || null, // Enregistre l'heure si fournie
      prix_taximetre: parseFloat(form.prix_taximetre),
      somme_percue: parseFloat(form.somme_percue || form.prix_taximetre),
      mode_paiement_id: form.mode_paiement_id,
      client_id: form.mode_paiement_id.startsWith('F-') ? form.client_id : null,
      est_facture: form.mode_paiement_id.startsWith('F-'),
      notes: form.notes,
      index_depart: 0,
      index_arrivee: 0
    });
    
    toast.success('Course ajoutée avec succès');
    
    setForm({
      lieu_embarquement: currentLocation || '',
      lieu_debarquement: '',
      heure_debarquement: '', // Réinitialisation
      prix_taximetre: '',
      somme_percue: '',
      mode_paiement_id: 'CASH',
      client_id: '',
      notes: ''
    });
  };

  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold mb-4">Nouvelle Course</h3>
      
        <form onSubmit={handleSubmit} className="space-y-4 pr-2">
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