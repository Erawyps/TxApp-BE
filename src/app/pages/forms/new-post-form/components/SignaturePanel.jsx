import { useState } from 'react';
import { Button } from 'components/ui';

export function SignaturePanel({ onSave }) {
  const [isSigned, setIsSigned] = useState(false);

  const handleSign = () => {
    setIsSigned(true);
    onSave('signature-data');
  };

  const clearSignature = () => {
    setIsSigned(false);
    onSave(null);
  };

  return (
    <div className="space-y-2">
      <div 
        className="border-2 border-dashed rounded-lg h-40 flex items-center justify-center cursor-pointer bg-gray-50"
        onClick={handleSign}
      >
        {isSigned ? (
          <div className="text-center p-4">
            <div className="text-green-500 font-medium">Signature enregistrée</div>
            <div className="text-sm text-gray-500 mt-1">Cliquez pour changer</div>
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="text-gray-500">Cliquez pour signer</div>
            <div className="text-sm text-gray-400 mt-1">Zone de signature</div>
          </div>
        )}
      </div>
      
      <Button 
        variant="outline"
        onClick={clearSignature}
        className="w-full"
      >
        Effacer
      </Button>
    </div>
  );
}