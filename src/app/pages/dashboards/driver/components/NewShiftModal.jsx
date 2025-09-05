import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, TruckIcon } from '@heroicons/react/24/outline';
import { supabase } from 'utils/supabase';

export function NewShiftModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    vehicule_id: '',
    date: new Date().toISOString().split('T')[0],
    heure_debut: '',
    heure_fin_prevue: '',
    interruptions: '00:00:00',
    km_debut: '',
    type_remuneration: '',
    notes: ''
  });

  const [vehicles, setVehicles] = useState([]);
  const [remunerationTypes, setRemunerationTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
      fetchRemunerationTypes();
    }
  }, [isOpen]);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicule')
        .select('id, plaque_immatriculation, marque, modele')
        .eq('actif', true)
        .order('plaque_immatriculation');

      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const fetchRemunerationTypes = async () => {
    // Mock data for remuneration types - this would come from admin configuration
    setRemunerationTypes([
      { id: 'fixe_horaire', label: 'Fixe horaire' },
      { id: 'commission_30', label: 'Commission 30%' },
      { id: 'commission_40', label: 'Commission 40%' },
      { id: 'independant', label: 'Indépendant' }
    ]);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicule_id) {
      newErrors.vehicule_id = 'Veuillez sélectionner un véhicule';
    }

    if (!formData.heure_debut) {
      newErrors.heure_debut = 'Heure de début requise';
    }

    if (!formData.heure_fin_prevue) {
      newErrors.heure_fin_prevue = 'Heure de fin prévue requise';
    }

    if (!formData.km_debut || formData.km_debut < 0) {
      newErrors.km_debut = 'Kilométrage de début requis et valide';
    }

    if (!formData.type_remuneration) {
      newErrors.type_remuneration = 'Type de rémunération requis';
    }

    // Validate license plate format if manually entered
    const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicule_id));
    if (selectedVehicle) {
      const platePattern = /^[A-Z]{2}-[A-Z]{3}-\d{3}$/;
      if (!platePattern.test(selectedVehicle.plaque_immatriculation)) {
        newErrors.vehicule_id = 'Format de plaque invalide (ex: TX-AAA-171)';
      }
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
      await onSubmit(formData);
      handleClose();
    } catch (err) {
      console.error('Error creating shift:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      vehicule_id: '',
      date: new Date().toISOString().split('T')[0],
      heure_debut: '',
      heure_fin_prevue: '',
      interruptions: '00:00:00',
      km_debut: '',
      type_remuneration: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  const formatPlateDisplay = (plate) => {
    // Ensure proper formatting display
    return plate.replace(/([A-Z]{2})([A-Z]{3})(\d{3})/, '$1-$2-$3');
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <TruckIcon className="h-6 w-6 text-blue-500 mr-2" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Nouvelle feuille de route
              </Dialog.Title>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Vehicle Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Véhicule *
              </label>
              <select
                value={formData.vehicule_id}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicule_id: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.vehicule_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un véhicule</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {formatPlateDisplay(vehicle.plaque_immatriculation)} - {vehicle.marque} {vehicle.modele}
                  </option>
                ))}
              </select>
              {errors.vehicule_id && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicule_id}</p>
              )}
            </div>

            {/* Date and Times */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure début *
                </label>
                <input
                  type="time"
                  value={formData.heure_debut}
                  onChange={(e) => setFormData(prev => ({ ...prev, heure_debut: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.heure_debut ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.heure_debut && (
                  <p className="text-red-500 text-sm mt-1">{errors.heure_debut}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure fin prévue *
                </label>
                <input
                  type="time"
                  value={formData.heure_fin_prevue}
                  onChange={(e) => setFormData(prev => ({ ...prev, heure_fin_prevue: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.heure_fin_prevue ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.heure_fin_prevue && (
                  <p className="text-red-500 text-sm mt-1">{errors.heure_fin_prevue}</p>
                )}
              </div>
            </div>

            {/* Interruptions and Starting KM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interruptions prévues
                </label>
                <input
                  type="time"
                  value={formData.interruptions}
                  onChange={(e) => setFormData(prev => ({ ...prev, interruptions: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Durée totale des pauses prévues
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kilométrage début *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.km_debut}
                  onChange={(e) => setFormData(prev => ({ ...prev, km_debut: e.target.value }))}
                  placeholder="Ex: 125000"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.km_debut ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.km_debut && (
                  <p className="text-red-500 text-sm mt-1">{errors.km_debut}</p>
                )}
              </div>
            </div>

            {/* Remuneration Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de rémunération *
              </label>
              <select
                value={formData.type_remuneration}
                onChange={(e) => setFormData(prev => ({ ...prev, type_remuneration: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.type_remuneration ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un type de rémunération</option>
                {remunerationTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type_remuneration && (
                <p className="text-red-500 text-sm mt-1">{errors.type_remuneration}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows="3"
                placeholder="Notes sur cette feuille de route..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Création...' : 'Créer la feuille'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
