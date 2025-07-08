import { Card, Button } from 'components/ui';
import { Input } from 'components/ui';
import { useState } from 'react';

export function ValidationStep({ onSubmit, control, totals }) {
  const [signature, setSignature] = useState(null);

  const handleSubmit = () => {
    try {
      if (!signature) {
        throw new Error('Veuillez signer pour valider');
      }
      
      onSubmit({
        signature,
        date_validation: new Date().toISOString(),
        totals: {
          recettes: totals.recettes || 0,
          charges: totals.charges || 0,
          salaire: totals.salaire || 0
        }
      });
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium">Fin du Shift</h3>
      
      <div className="space-y-4 mt-4">
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
        
        <div className="totals-summary space-y-2">
          <h4 className="font-medium">Récapitulatif</h4>
          <div className="flex justify-between">
            <span>Total Recettes:</span>
            <span>{(totals.recettes || 0).toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
            <span>Total Charges:</span>
            <span>{(totals.charges || 0).toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-primary-600 font-medium">
            <span>Salaire estimé:</span>
            <span>{(totals.salaire || 0).toFixed(2)} €</span>
          </div>
        </div>
        
        <div className="signature-section">
          <label className="block mb-2">Signature</label>
          <div className="border rounded p-4 h-40 bg-gray-50">
            {/* Remplacez par votre composant SignaturePad */}
            <div 
              className="w-full h-full border-2 border-dashed flex items-center justify-center cursor-pointer"
              onClick={() => setSignature('signature-data')}
            >
              {signature ? 'Signature enregistrée' : 'Cliquez pour signer'}
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit}
          color="primary"
          className="mt-4"
        >
          Valider le Shift
        </Button>
      </div>
    </Card>
  );
}