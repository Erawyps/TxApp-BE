import { useEffect } from 'react';
import { Modal } from 'components/ui';
import { Button, Input, Select } from 'components/ui';
import { useForm } from 'react-hook-form';

export function CourseFormModal({ isOpen, onClose, onSubmit, defaultValues }) {
  const { register, handleSubmit, reset, watch } = useForm({
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

  useEffect(() => {
    if (isOpen) {
      reset({
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
      });
    }
  }, [isOpen, defaultValues, reset]);

  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      departure_index: data.departure_index ? parseInt(data.departure_index) : 0,
      arrival_index: data.arrival_index ? parseInt(data.arrival_index) : 0,
      price: data.price ? parseFloat(data.price) : 0,
      amount_received: data.amount_received ? parseFloat(data.amount_received) : 0,
    };
    
    onSubmit(formattedData);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const paymentMethod = watch('payment_method');

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={defaultValues ? "Modifier Course" : "Nouvelle Course"} size="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="N° Ordre"
            {...register('order')}
            disabled
            className="bg-gray-100"
            placeholder="Auto-généré"
          />
          
          <div></div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-blue-800">Embarquement</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Index"
              {...register('departure_index', { required: 'Index départ requis' })}
              type="number"
              min="0"
              step="1"
              required
            />
            <Input
              label="Lieu"
              {...register('departure_place', { required: 'Lieu départ requis' })}
              required
              placeholder="ex: Place Eugène Flagey"
            />
            <Input
              label="Heure"
              type="time"
              {...register('departure_time', { required: 'Heure départ requise' })}
              required
            />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-green-800">Débarquement</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Index"
              {...register('arrival_index', { required: 'Index arrivée requis' })}
              type="number"
              min="0"
              step="1"
              required
            />
            <Input
              label="Lieu"
              {...register('arrival_place', { required: 'Lieu arrivée requis' })}
              required
              placeholder="ex: Gare Centrale"
            />
            <Input
              label="Heure"
              type="time"
              {...register('arrival_time')}
            />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-yellow-800">Tarification</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prix taximètre (€)"
              type="number"
              min="0"
              step="0.01"
              {...register('price', { required: 'Prix taximètre requis' })}
              required
            />
            <Input
              label="Somme perçue (€)"
              type="number"
              min="0"
              step="0.01"
              {...register('amount_received', { required: 'Somme perçue requise' })}
              required
            />
            <Select
              label="Mode paiement"
              {...register('payment_method')}
              options={[
                { value: 'CASH', label: 'Espèces' },
                { value: 'BC', label: 'Bancontact' },
                { value: 'F-TX', label: 'Facture Taxi' },
                { value: 'F-SNCB', label: 'Facture SNCB' },
                { value: 'F-WL', label: 'Facture Wallonie' }
              ]}
            />
            {(paymentMethod?.startsWith('F-') || paymentMethod === 'F-TX') && (
              <Input
                label="Client (requis pour facture)"
                {...register('client', { 
                  required: paymentMethod?.startsWith('F-') ? 'Client requis pour les factures' : false 
                })}
                placeholder="Nom du client à facturer"
                required={paymentMethod?.startsWith('F-')}
              />
            )}
          </div>
        </div>

        <Input
          label="Notes"
          {...register('notes')}
          as="textarea"
          rows={2}
          placeholder="Notes optionnelles sur la course..."
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outlined" type="button" onClick={handleClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary">
            {defaultValues ? 'Modifier' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}