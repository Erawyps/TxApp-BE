// Import Dependencies
import PropTypes from "prop-types";

// Local Imports
import { Modal, Button, Badge } from "components/ui";
import { CalendarIcon, CogIcon, MapPinIcon } from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

export function VehicleModal({ isOpen, onClose, vehicle }) {
  if (!vehicle) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Informations du véhicule"
    >
      <div className="space-y-6">
        {/* Informations générales */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Immatriculation
            </label>
            <p className="mt-1 text-lg font-mono font-semibold text-gray-900 dark:text-white">
              {vehicle.immatriculation}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Statut
            </label>
            <div className="mt-1">
              <Badge className={vehicle.est_actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {vehicle.est_actif ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Détails du véhicule */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Marque
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {vehicle.marque || 'Non spécifiée'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Modèle
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {vehicle.modele || 'Non spécifié'}
            </p>
          </div>
        </div>

        {/* Informations techniques */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Année
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {vehicle.annee || 'Non spécifiée'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Couleur
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {vehicle.couleur || 'Non spécifiée'}
            </p>
          </div>
        </div>

        {/* Kilométrage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <MapPinIcon className="w-4 h-4" />
            Kilométrage actuel
          </label>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
            {vehicle.kilometrage_actuel ? `${vehicle.kilometrage_actuel.toLocaleString()} km` : 'Non spécifié'}
          </p>
        </div>

        {/* Dates importantes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Date d&apos;achat
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {vehicle.date_achat ? new Date(vehicle.date_achat).toLocaleDateString('fr-BE') : 'Non spécifiée'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <CogIcon className="w-4 h-4" />
              Dernière révision
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {vehicle.derniere_revision ? new Date(vehicle.derniere_revision).toLocaleDateString('fr-BE') : 'Non spécifiée'}
            </p>
          </div>
        </div>

        {/* Notes */}
        {vehicle.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              {vehicle.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}

VehicleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  vehicle: PropTypes.object
};