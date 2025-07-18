import { Controller } from 'react-hook-form';
import { Button } from 'components/ui';
import { Dialog } from '@headlessui/react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export function VehicleSelect({ control, vehicles = [] }) { // Valeur par défaut
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
      
      <Dialog 
        open={showInfoModal} 
        onClose={() => setShowInfoModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded bg-white dark:bg-dark-700 p-6">
            <Dialog.Title className="text-lg font-bold mb-4">
              Informations Véhicule
            </Dialog.Title>
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
              </div>
            ) : (
              <p>Aucun véhicule sélectionné</p>
            )}
            <Button 
              onClick={() => setShowInfoModal(false)}
              className="mt-4"
            >
              Fermer
            </Button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}