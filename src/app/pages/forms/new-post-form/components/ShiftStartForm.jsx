import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Select, Button } from 'components/ui';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { VehicleInfoModal } from './VehicleInfoModal';

export function ShiftStartForm({ vehicles, onSubmit }) {
  const { register, handleSubmit, watch } = useForm();
  const [showVehicleInfo, setShowVehicleInfo] = useState(false);
  const selectedVehicleId = watch('vehicleId');
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <Input 
        type="date"
        label="Date"
        {...register('date')}
        defaultValue={new Date().toISOString().split('T')[0]}
        readOnly
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Heure de début"
          type="time"
          {...register('start')}
          required
        />
        <Input
          label="Heure fin estimée"
          type="time"
          {...register('estimated_end')}
          required
        />
      </div>

      <div className="flex items-end gap-2">
        <Select
          label="Véhicule"
          options={vehicles.map(v => ({
            value: v.id,
            label: `${v.plaque} - ${v.marque}`
          }))}
          {...register('vehicleId')}
          className="flex-1"
          required
        />
        <Button
          type="button"
          variant="ghost"
          icon={<ExclamationCircleIcon className="h-5 w-5" />}
          onClick={() => setShowVehicleInfo(true)}
          disabled={!selectedVehicle}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Km début"
          type="number"
          {...register('km_start')}
          required
        />
        <Input
          label="Prise en charge (€)"
          type="number"
          step="0.01"
          {...register('prise_charge')}
          required
        />
      </div>

      <Button type="submit" className="w-full mt-4">
        Démarrer le shift
      </Button>

      <VehicleInfoModal 
        isOpen={showVehicleInfo}
        onClose={() => setShowVehicleInfo(false)}
        vehicle={selectedVehicle}
      />
    </form>
  );
}