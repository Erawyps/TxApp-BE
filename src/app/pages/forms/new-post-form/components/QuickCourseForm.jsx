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
    
    toast.success('Course ajoutée');
    
    setForm(prev => ({
      ...prev,
      arrivee: '',
      prix: '',
      client: ''
    }));
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium flex items-center">
        <span className="mr-2">🚖 Nouvelle Course</span>
      </h3>
      
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <Input
          label="Départ"
          value={form.depart}
          onChange={(e) => setForm({...form, depart: e.target.value})}
          required
          icon="location"
          className="[&>input]:bg-white dark:[&>input]:bg-dark-800"
        />
        
        <Input
          label="Arrivée"
          value={form.arrivee}
          onChange={(e) => setForm({...form, arrivee: e.target.value})}
          required
          icon="flag"
          className="[&>input]:bg-white dark:[&>input]:bg-dark-800"
        />
        
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Prix (€)"
            type="number"
            step="0.01"
            value={form.prix}
            onChange={(e) => setForm({...form, prix: e.target.value})}
            required
            icon="euro"
            className="[&>input]:bg-white dark:[&>input]:bg-dark-800"
          />
          
          <Select
            label="Paiement"
            options={[
              { value: 'cash', label: 'Cash', icon: 'money' },
              { value: 'bancontact', label: 'Bancontact', icon: 'card' },
              { value: 'facture', label: 'Facture', icon: 'file' }
            ]}
            value={form.mode_paiement}
            onChange={(value) => setForm({...form, mode_paiement: value})}
            className="[&>button]:bg-white dark:[&>button]:bg-dark-800"
          />
        </div>
        
        {form.mode_paiement === 'facture' && (
          <Input
            label="Client (facture)"
            value={form.client}
            onChange={(e) => setForm({...form, client: e.target.value})}
            icon="user"
            required
            className="[&>input]:bg-white dark:[&>input]:bg-dark-800"
          />
        )}
        
        <Button 
          type="submit" 
          className="w-full mt-2"
          icon="plus"
          color="primary"
        >
          Ajouter Course
        </Button>
      </form>
    </Card>
  );
}