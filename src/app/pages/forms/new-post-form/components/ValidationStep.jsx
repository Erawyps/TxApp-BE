import { Card, Button, Input } from 'components/ui';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

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
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-medium">Fin du Shift</h3>
      
      <Controller
        name="kilometers.end"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Input
            {...field}
            label="Kilométrage final"
            type="number"
            error={error?.message}
          />
        )}
      />
      
      <Controller
        name="shift.end"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Input
            {...field}
            label="Heure de fin"
            type="time"
            error={error?.message}
          />
        )}
      />
      
      <Controller
        name="shift.interruptions"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Input
            {...field}
            label="Interruptions (minutes)"
            type="number"
            error={error?.message}
          />
        )}
      />
      
      <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium">Récapitulatif</h4>
        <div className="flex justify-between">
          <span>Total Recettes:</span>
          <span>{totals.recettes.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span>Total Charges:</span>
          <span>{totals.charges.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between font-bold text-primary-600">
          <span>Salaire estimé:</span>
          <span>{totals.salaire.toFixed(2)} €</span>
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block mb-2">Signature</label>
        <div className="border rounded-lg h-40 bg-gray-50 flex items-center justify-center">
          <button 
            type="button" 
            className="text-gray-500"
            onClick={() => setSignature('signature-data')}
          >
            Cliquez pour signer
          </button>
        </div>
      </div>
      
      <Button 
        onClick={handleSubmit}
        color="primary"
        className="w-full mt-4"
      >
        Valider le Shift
      </Button>
    </Card>
  );
}