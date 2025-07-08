import { useState } from 'react';
import { Card } from 'components/ui';
import { Button } from 'components/ui';

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
    if (!form.depart || !form.arrivee || !form.prix) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const prix = parseFloat(form.prix);
    if (isNaN(prix)) {
      alert('Veuillez entrer un prix valide');
      return;
    }

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
      prix: prix,
      mode_paiement: form.mode_paiement,
      client: form.mode_paiement === 'facture' ? form.client : null
    });
    
    // Réinitialiser seulement l'arrivée et le prix
    setForm({
      ...form,
      arrivee: '',
      prix: ''
    });
  };

  return (
    <Card className="quick-course-form">
      <h3>Nouvelle Course</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Départ *</label>
          <input
            value={form.depart}
            onChange={(e) => setForm({...form, depart: e.target.value})}
            required
            className="input-field"
          />
        </div>
        
        <div className="form-group">
          <label>Arrivée *</label>
          <input
            value={form.arrivee}
            onChange={(e) => setForm({...form, arrivee: e.target.value})}
            required
            className="input-field"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Prix (€) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.prix}
              onChange={(e) => setForm({...form, prix: e.target.value})}
              required
              className="input-field"
            />
          </div>
          
          <div className="form-group">
            <label>Paiement *</label>
            <select
              value={form.mode_paiement}
              onChange={(e) => setForm({...form, mode_paiement: e.target.value})}
              className="input-field"
              required
            >
              <option value="cash">Cash</option>
              <option value="bancontact">Bancontact</option>
              <option value="facture">Facture</option>
            </select>
          </div>
        </div>
        
        {form.mode_paiement === 'facture' && (
          <div className="form-group">
            <label>Client (facture) *</label>
            <input
              value={form.client}
              onChange={(e) => setForm({...form, client: e.target.value})}
              required={form.mode_paiement === 'facture'}
              className="input-field"
            />
          </div>
        )}
        
        <Button type="submit" className="submit-button">
          Ajouter Course
        </Button>
      </form>
      
      <style>{`
        .quick-course-form {
          margin-bottom: 15px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-row {
          display: flex;
          gap: 10px;
        }
        .form-row .form-group {
          flex: 1;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        label:after {
          content: ' *';
          color: red;
          opacity: 0;
        }
        label[required]:after {
          opacity: 1;
        }
        .input-field {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .submit-button {
          width: 100%;
          padding: 12px;
          background: #2ecc71;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .submit-button:hover {
          background: #27ae60;
        }
      `}</style>
    </Card>
  );
}