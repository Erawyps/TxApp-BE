import { Modal } from 'components/ui';
import { Button, Input } from 'components/ui';
import { useForm } from 'react-hook-form';

const CHARGE_TYPES = ['Carburant', 'Péage', 'Entretien', 'Carwash', 'Divers'];

export function ExpenseFormModal({ isOpen, onClose, onSubmit, defaultValues }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      type_charge: CHARGE_TYPES[0],
      montant: '',
      mode_paiement_id: 'CASH',
      description: '',
      ...defaultValues
    }
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle Dépense">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type de dépense</label>
            <select
              {...register('type_charge')}
              className="w-full p-2 border rounded-lg"
            >
              {CHARGE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <Input
            label="Montant (€)"
            type="number"
            step="0.01"
            {...register('montant')}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mode paiement</label>
            <select
              {...register('mode_paiement_id')}
              className="w-full p-2 border rounded-lg"
            >
              <option value="CASH">Espèces</option>
              <option value="BC">Bancontact</option>
            </select>
          </div>
          
          <Input
            label="Date"
            type="date"
            {...register('date')}
          />
        </div>

        <Input
          label="Description (optionnel)"
          {...register('description')}
          as="textarea"
          rows={2}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outlined" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary">
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
}