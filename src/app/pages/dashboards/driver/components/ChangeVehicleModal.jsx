import { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, TruckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export function ChangeVehicleModal({ isOpen, onClose, currentShift, onVehicleChanged }) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAvailableVehicles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token d\'authentification manquant');
        return;
      }

      const response = await axios.get('http://localhost:3001/api/vehicules', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Filtrer les véhicules actifs et exclure le véhicule actuel
      const availableVehicles = response.data.filter(vehicle =>
        vehicle.est_actif && vehicle.vehicule_id !== currentShift?.vehicule_id
      );

      setVehicles(availableVehicles);
    } catch (err) {
      console.error('Erreur lors de la récupération des véhicules:', err);
      setError('Erreur lors de la récupération des véhicules disponibles');
    } finally {
      setIsLoading(false);
    }
  }, [currentShift?.vehicule_id]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableVehicles();
      setSelectedVehicleId('');
      setError('');
    }
  }, [isOpen, fetchAvailableVehicles]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedVehicleId) {
      setError('Veuillez sélectionner un véhicule');
      return;
    }

    if (selectedVehicleId === currentShift?.vehicule_id) {
      setError('Le véhicule sélectionné est déjà le véhicule actuel');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token d\'authentification manquant');
        return;
      }

      const response = await axios.patch(
        `http://localhost:3001/api/feuilles-route/${currentShift.feuille_id}/change-vehicle`,
        {
          newVehiculeId: selectedVehicleId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Notifier le parent du changement
        onVehicleChanged(response.data.data);

        // Fermer le modal
        onClose();

        // Afficher une notification de succès
        alert('Véhicule changé avec succès. L\'administrateur a été notifié du changement.');
      }
    } catch (err) {
      console.error('Erreur lors du changement de véhicule:', err);
      setError(err.response?.data?.error || 'Erreur lors du changement de véhicule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPlateDisplay = (plate) => {
    // Formater l'affichage de la plaque
    return plate.replace(/([A-Z]{2})([A-Z]{3})(\d{3})/, '$1-$2-$3');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <TruckIcon className="h-6 w-6 text-blue-500 mr-2" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Changer de véhicule
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informations du véhicule actuel */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Véhicule actuel</h3>
              <div className="flex items-center">
                <TruckIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="font-medium">
                  {currentShift?.vehicule?.plaque_immatriculation ?
                    formatPlateDisplay(currentShift.vehicule.plaque_immatriculation) :
                    'N/A'
                  }
                </span>
                {currentShift?.vehicule?.marque && (
                  <span className="text-gray-600 ml-2">
                    - {currentShift.vehicule.marque} {currentShift.vehicule.modele}
                  </span>
                )}
              </div>
            </div>

            {/* Sélection du nouveau véhicule */}
            <div>
              <label htmlFor="vehicle-select" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau véhicule
              </label>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">Chargement des véhicules...</span>
                </div>
              ) : (
                <select
                  id="vehicle-select"
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionner un véhicule...</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.vehicule_id} value={vehicle.vehicule_id}>
                      {formatPlateDisplay(vehicle.plaque_immatriculation)}
                      {vehicle.marque && ` - ${vehicle.marque} ${vehicle.modele || ''}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Message d'avertissement */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">Attention</p>
                  <p>Le changement de véhicule sera signalé à l&apos;administrateur pour suivi.</p>
                </div>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                  <div className="text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedVehicleId}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Changement en cours...' : 'Changer de véhicule'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}