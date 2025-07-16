import { SignaturePanel } from './SignaturePanel';
import { useFormContext } from 'react-hook-form';
import { calculateSalary } from '../utils/calculateSalary';

export function ValidationStep({ control, onSubmit }) {
  const { handleSubmit, formState } = useFormContext();

  const handleValidation = (data) => {
    // Calculs garantis synchrones
    const totals = {
      recettes: data.courses.reduce((sum, c) => sum + (c.somme_percue || 0), 0),
      charges: data.charges.reduce((sum, c) => sum + (c.montant || 0), 0),
      salaire: calculateSalary(data.courses, data.charges)
    };

    onSubmit({ ...data, totals });
  };

  return (
    <form onSubmit={handleSubmit(handleValidation)}>
      <SignaturePanel name="validation.signature" control={control} />
      
      {formState.errors.validation?.signature && (
        <p className="error">{formState.errors.validation.signature.message}</p>
      )}

      <button type="submit" disabled={!formState.isValid}>
        Valider
      </button>
    </form>
  );
}