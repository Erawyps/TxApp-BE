import { Controller } from 'react-hook-form';
import { Button, Modal } from 'components/ui';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export function VehicleSelect({ control, vehicles }) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">Véhicule</label>
        <Button 
          variant="ghost" 
          size="xs" 
          onClick={() => setShowInfoModal(true)}
          icon={<InformationCircleIcon className="h-4 w-4" />}
        >
          Info
        </Button>
      </div>
      
      <Controller
        name="vehicle.id"
        control={control}
        render={({ field }) => (
          <select
            {...field}
            onChange={(e) => {
              const vehicle = vehicles.find(v => v.id === e.target.value);
              setSelectedVehicle(vehicle);
              field.onChange(e.target.value);
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">Sélectionnez un véhicule</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate} - {vehicle.model}
              </option>
            ))}
          </select>
        )}
      />
      
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Informations Véhicule"
      >
        {selectedVehicle ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Plaque:</span>
              <span>{selectedVehicle.plate}</span>
            </div>
            <div className="flex justify-between">
              <span>Modèle:</span>
              <span>{selectedVehicle.model}</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span>{selectedVehicle.type}</span>
            </div>
            <div className="flex justify-between">
              <span>Dernier contrôle:</span>
              <span>{selectedVehicle.lastControl}</span>
            </div>
          </div>
        ) : (
          <p>Aucun véhicule sélectionné</p>
        )}
      </Modal>
    </div>
  );
}