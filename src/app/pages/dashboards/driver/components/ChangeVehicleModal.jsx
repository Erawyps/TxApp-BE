import { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, TruckIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { supabase } from 'utils/supabase';

export function ChangeVehicleModal({ isOpen, onClose, currentShift, onVehicleChanged }) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [raisonChangement, setRaisonChangement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchAvailableVehicles();
      setSelectedVehicleId('');
      setRaisonChangement('');
      setErrors({});
    }
  }, [isOpen, currentShift, fetchAvailableVehicles]);

  const fetchAvailableVehicles = useCallback(async () => {
    try {
      // Récupérer tous les véhicules actifs
      const { data: allVehicles, error: vehiclesError } = await supabase
        .from('vehicule')
        .select('vehicule_id, plaque_immatriculation, marque, modele')
        .eq('est_actif', true)
        .order('plaque_immatriculation');

      if (vehiclesError) throw vehiclesError;

      // Récupérer les véhicules déjà utilisés par d'autres shifts actifs
      const { data: usedVehicles, error: usedError } = await supabase
        .from('feuille_route')
        .select('vehicule_id')
        .eq('statut', 'En cours')
        .neq('feuille_id', currentShift?.feuille_id);

      if (usedError) throw usedError;

      const usedVehicleIds = usedVehicles?.map(uv => uv.vehicule_id) || [];

      // Filtrer les véhicules disponibles (actifs et non utilisés)
      const availableVehicles = allVehicles?.filter(vehicle =>
        !usedVehicleIds.includes(vehicle.vehicule_id)
      ) || [];

      setVehicles(availableVehicles);
    } catch (err) {
      console.error('Error fetching available vehicles:', err);
    }
  }, [currentShift]);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedVehicleId) {
      newErrors.selectedVehicleId = 'Veuillez sélectionner un véhicule';
    }

    if (selectedVehicleId === currentShift?.vehicule_id?.toString()) {
      newErrors.selectedVehicleId = 'Veuillez sélectionner un véhicule différent';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onVehicleChanged(currentShift.feuille_id, selectedVehicleId, raisonChangement);
      onClose();
    } catch (err) {
      console.error('Error changing vehicle:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPlateDisplay = (plate) => {
    return plate.replace(/([A-Z]{2})([A-Z]{3})(\d{3})/, '$1-$2-$3');
  };

  const selectedVehicle = vehicles.find(v => v.vehicule_id.toString() === selectedVehicleId);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-lg shadow-xl">
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
            {/* Current Vehicle Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Véhicule actuel</h4>
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

            {/* Vehicle Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau véhicule *
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.selectedVehicleId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un véhicule</option>
                {vehicles.map((vehicle) => (
                  <option
                    key={vehicle.vehicule_id}
                    value={vehicle.vehicule_id}
                    disabled={vehicle.vehicule_id === currentShift?.vehicule_id}
                  >
                    {formatPlateDisplay(vehicle.plaque_immatriculation)} - {vehicle.marque} {vehicle.modele}
                  </option>
                ))}
              </select>
              {errors.selectedVehicleId && (
                <p className="text-red-500 text-sm mt-1">{errors.selectedVehicleId}</p>
              )}
            </div>

            {/* Selected Vehicle Preview */}
            {selectedVehicle && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                  <ArrowRightIcon className="h-4 w-4 mr-1" />
                  Nouveau véhicule sélectionné
                </h4>
                <div className="flex items-center">
                  <TruckIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="font-medium">
                    {formatPlateDisplay(selectedVehicle.plaque_immatriculation)}
                  </span>
                  <span className="text-blue-600 ml-2">
                    - {selectedVehicle.marque} {selectedVehicle.modele}
                  </span>
                </div>
              </div>
            )}

            {/* Reason for change */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison du changement (optionnel)
              </label>
              <textarea
                value={raisonChangement}
                onChange={(e) => setRaisonChangement(e.target.value)}
                rows="3"
                placeholder="Ex: Panne mécanique, maintenance, préférence personnelle..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedVehicleId}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Changement en cours...
                  </>
                ) : (
                  <>
                    <TruckIcon className="h-4 w-4 mr-2" />
                    Changer de véhicule
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}