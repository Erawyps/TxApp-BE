import { Modal } from 'components/ui';
import { Button, Input, Select } from 'components/ui';
import { useForm } from 'react-hook-form';

export function CourseFormModal({ isOpen, onClose, onSubmit, defaultValues }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      order: '',
      departure_index: '',
      departure_place: '',
      departure_time: '',
      arrival_index: '',
      arrival_place: '',
      arrival_time: '',
      price: '',
      amount_received: '',
      payment_method: 'CASH',
      client: '',
      notes: '',
      ...defaultValues
    }
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle Course" size="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="N° Ordre"
            {...register('order')}
            disabled
            className="bg-gray-100"
          />
          
          <Input
            label="Index départ (facultatif)"
            {...register('departure_index')}
            type="number"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Embarquement</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Index"
              {...register('departure_index')}
              type="number"
              required
            />
            <Input
              label="Lieu"
              {...register('departure_place')}
              required
            />
            <Input
              label="Heure"
              type="time"
              {...register('departure_time')}
              required
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Débarquement</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Index"
              {...register('arrival_index')}
              type="number"
              required
            />
            <Input
              label="Lieu"
              {...register('arrival_place')}
              required
            />
            <Input
              label="Heure"
              type="time"
              {...register('arrival_time')}
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Tarification</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prix taximètre (€)"
              type="number"
              step="0.01"
              {...register('price')}
              required
            />
            <Input
              label="Somme perçue (€)"
              type="number"
              step="0.01"
              {...register('amount_received')}
              required
            />
            <Select
              label="Mode paiement"
              options={[
                { value: 'CASH', label: 'Espèces' },
                { value: 'BC', label: 'Bancontact' },
                { value: 'F-TX', label: 'Facture Taxi' }
              ]}
              {...register('payment_method')}
            />
            <Input
              label="Client (si facture)"
              {...register('client')}
              className="md:col-span-2"
            />
          </div>
        </div>

        <Input
          label="Notes"
          {...register('notes')}
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