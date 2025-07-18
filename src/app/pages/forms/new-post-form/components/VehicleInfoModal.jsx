import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function VehicleInfoModal({ isOpen, onClose, vehicle }) {
  if (!vehicle) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
          <Dialog.Title className="text-lg font-bold mb-4 flex justify-between">
            <span>Info véhicule</span>
            <button onClick={onClose}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </Dialog.Title>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Plaque</p>
              <p className="font-medium">{vehicle.plaque}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Marque</p>
              <p className="font-medium">{vehicle.marque}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Modèle</p>
              <p className="font-medium">{vehicle.modele}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{vehicle.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Kilométrage</p>
              <p className="font-medium">{vehicle.km} km</p>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}