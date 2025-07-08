import { Card, Button, Input } from 'components/ui';
import { useState } from 'react';
import { SignaturePanel } from './SignaturePanel';

export function ValidationStep({ onSubmit, control, totals }) {
  const [signature, setSignature] = useState(null);

  const handleSubmit = () => {
    if (!signature) {
      alert('Veuillez signer pour valider');
      return;
    }
    
    onSubmit({
      validation: {
        signature,
        date_validation: new Date().toISOString()
      },
      totals: {
        recettes: totals.recettes,
        charges: totals.charges,
        salaire: totals.salaire
      }
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-medium">Fin du Shift</h3>
      
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
      
      <div className="space-y-2">
        <h4 className="font-medium">Récapitulatif</h4>
        <div className="flex justify-between">
          <span>Total Recettes:</span>
          <span>{totals.recettes.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span>Total Charges:</span>
          <span>{totals.charges.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-primary-600 dark:text-primary-400 font-bold">
          <span>Salaire estimé:</span>
          <span>{totals.salaire.toFixed(2)} €</span>
        </div>
      </div>
      
      <div className="signature-section">
        <label className="block mb-2">Signature</label>
        <SignaturePanel 
          onSave={setSignature}
          penColor="#000"
          backgroundColor="#f9fafb"
          height={150}
        />
      </div>
      
      <Button 
        onClick={handleSubmit}
        color="primary"
        className="w-full"
      >
        Valider le Shift
      </Button>
    </Card>
  );
}