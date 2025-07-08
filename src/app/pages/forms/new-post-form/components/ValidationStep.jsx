import { Card, Button} from 'components/ui';
import { Input } from 'components/ui';
import { useState } from 'react';
import { SignaturePad } from 'components/form/SignaturePad';

export function ValidationStep({ onSubmit, control, totals }) {
  const [signature, setSignature] = useState(null);

  const handleSubmit = () => {
    if (!signature) {
      alert('Veuillez signer pour valider');
      return;
    }
    
    onSubmit({
      signature,
      date_validation: new Date().toISOString(),
      totals: {
        recettes: totals.recettes,
        charges: totals.charges,
        salaire: totals.salaire
      }
    });
  };

  return (
    <Card>
      <h3>Fin du Shift</h3>
      
      <Input
        label="Kilométrage final"
        type="number"
        {...control.register('kilometers.end', { valueAsNumber: true })}
      />
      
      <Input
        label="Heure de fin"
        type="time"
        {...control.register('shift.end')}
      />
      
      <Input
        label="Interruptions (minutes)"
        type="number"
        {...control.register('shift.interruptions', { valueAsNumber: true })}
      />
      
      <div className="totals-summary">
        <h4>Récapitulatif</h4>
        <div className="total-row">
          <span>Total Recettes:</span>
          <span>{totals.recettes.toFixed(2)} €</span>
        </div>
        <div className="total-row">
          <span>Total Charges:</span>
          <span>{totals.charges.toFixed(2)} €</span>
        </div>
        <div className="total-row highlight">
          <span>Salaire estimé:</span>
          <span>{totals.salaire.toFixed(2)} €</span>
        </div>
      </div>
      
      <div className="signature-section">
        <label>Signature</label>
        <SignaturePad
          onSave={setSignature}
          penColor="#000"
          backgroundColor="#f9fafb"
          height={150}
        />
      </div>
      
      <Button 
        onClick={handleSubmit}
        color="primary"
      >
        Valider le Shift
      </Button>
    </Card>
  );
}