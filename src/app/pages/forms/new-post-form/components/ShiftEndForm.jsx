import { useForm } from 'react-hook-form';
import { Input, Button, Card } from 'components/ui';
import { SignaturePanel } from './SignaturePanel';

export function ShiftEndForm({ shift, courses, expenses, onSubmit }) {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      km_end: shift.km_start,
      prise_charge_fin: shift.prise_charge
    }
  });

  const totalRecettes = courses.reduce((sum, c) => sum + c.somme_percue, 0);
  const totalDepenses = expenses.reduce((sum, e) => sum + e.montant, 0);
  const salaire = (Math.min(totalRecettes, 180) * 0.4 + Math.max(totalRecettes - 180, 0) * 0.3);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Heure de fin"
          type="time"
          {...register('end')}
          required
        />
        <Input
          label="Km fin"
          type="number"
          min={shift.km_start}
          {...register('km_end')}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Prise en charge fin (€)"
          type="number"
          step="0.01"
          {...register('prise_charge_fin')}
        />
        <Input
          label="Chutes fin (€)"
          type="number"
          step="0.01"
          {...register('chutes_fin')}
        />
      </div>

      <Card className="p-4">
        <div className="flex justify-between">
          <span>Recettes:</span>
          <span className="font-bold">{totalRecettes.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between">
          <span>Dépenses:</span>
          <span className="text-red-500 font-bold">-{totalDepenses.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between border-t mt-2 pt-2">
          <span>Salaire:</span>
          <span className="text-primary-600 font-bold">{salaire.toFixed(2)}€</span>
        </div>
      </Card>

      <SignaturePanel 
        onSave={(signature) => setValue('signature', signature)}
      />

      <Button type="submit" className="w-full mt-4">
        Valider la feuille de route
      </Button>
    </form>
  );
}