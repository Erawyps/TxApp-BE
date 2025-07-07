import { Card } from 'components/ui';
import { useState } from 'react';
import { SignaturePad } from 'components/form/SignaturePad';
import { Button } from 'components/ui';

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
    <Card className="validation-step">
      <h3>Fin du Shift</h3>
      
      <div className="form-group">
        <label>Kilométrage final</label>
        <input
          type="number"
          {...control.register('kilometers.end', { valueAsNumber: true })}
          className="input-field"
        />
      </div>
      
      <div className="form-group">
        <label>Heure de fin</label>
        <input
          type="time"
          {...control.register('shift.end')}
          className="input-field"
        />
      </div>
      
      <div className="form-group">
        <label>Interruptions (minutes)</label>
        <input
          type="number"
          {...control.register('shift.interruptions', { valueAsNumber: true })}
          className="input-field"
        />
      </div>
      
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
        className="validate-button"
      >
        Valider le Shift
      </Button>
      
      <style>{`
        .validation-step {
          margin-bottom: 15px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .input-field {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .totals-summary {
          margin: 20px 0;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 4px;
        }
        .totals-summary h4 {
          margin-top: 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .total-row.highlight {
          font-weight: bold;
          color: #2c3e50;
        }
        .signature-section {
          margin: 20px 0;
        }
        .validate-button {
          width: 100%;
          padding: 12px;
          background: #2ecc71;
          color : white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .validate-button:hover {
          background: #27ae60;
        }
      `}</style>
    </Card>
  );
}     