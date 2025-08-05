// Import Dependencies
import { Fragment } from "react";
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

// Local Imports
import { Button } from "components/ui";

// ----------------------------------------------------------------------

export function VehicleModal({ isOpen, onClose, vehicle }) {
  if (!vehicle) return null;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-dark-700 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-800 dark:text-dark-100"
                  >
                    Informations du véhicule
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Plaque
                      </p>
                      <p className="font-medium text-gray-800 dark:text-dark-100">
                        {vehicle.plaque_immatriculation}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        N° Identification
                      </p>
                      <p className="font-medium text-gray-800 dark:text-dark-100">
                        {vehicle.numero_identification}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Marque/Modèle
                      </p>
                      <p className="font-medium text-gray-800 dark:text-dark-100">
                        {vehicle.marque} {vehicle.modele}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Type
                      </p>
                      <p className="font-medium text-gray-800 dark:text-dark-100">
                        {vehicle.type_vehicule}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="outlined" onClick={onClose}>
                    Fermer
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

VehicleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  vehicle: PropTypes.shape({
    plaque_immatriculation: PropTypes.string.isRequired,
    numero_identification: PropTypes.string.isRequired,
    marque: PropTypes.string.isRequired,
    modele: PropTypes.string.isRequired,
    type_vehicule: PropTypes.string.isRequired
  })
};