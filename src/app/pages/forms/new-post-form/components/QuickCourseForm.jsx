import { useState } from 'react';
import { Card, Button, Input, Select } from 'components/ui';
import { toast } from 'sonner';

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
    
    if (!form.depart || !form.arrivee) {
      toast.error('Veuillez remplir les lieux de départ et d\'arrivée');
      return;
    }
    
    if (!form.prix || isNaN(parseFloat(form.prix))) {
      toast.error('Veuillez entrer un prix valide');
      return;
    }
    
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
    
    toast.success('Course ajoutée avec succès');
    
    setForm(prev => ({
      ...prev,
      arrivee: '',
      prix: '',
      client: ''
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