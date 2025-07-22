import { Card } from 'components/ui';
import { Input } from 'components/ui';
import { useController } from 'react-hook-form';

export function SignatureSection({ control }) {
  const { field } = useController({
    name: 'validation.signature',
    control,
    rules: { required: 'Signature requise' }
  });

  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold mb-4">Validation</h3>
      
      <div className="space-y-4">
        <Input
          label="Nom et prénom"
          {...field}
          required
          placeholder="Signer avec votre nom complet"
        />
        
        <div className="border-2 border-dashed rounded-lg h-32 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Zone de signature (à implémenter)</p>
        </div>
      </div>
    </Card>
  );
}