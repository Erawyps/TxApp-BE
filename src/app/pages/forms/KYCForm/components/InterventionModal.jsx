import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from 'components/ui';

export const InterventionModal = ({ isOpen, onClose, intervention, onSave, vehicules = [] }) => {
  const [formData, setFormData] = useState({
    vehicule_id: '',
    type_intervention: '',
    description: '',
    date_intervention: new Date().toISOString().slice(0, 10),
    cout_main_oeuvre: '',
    cout_pieces: '',
    kilometrage: '',
    prestataire: '',
    statut: 'planifiée'
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (intervention) {
      setFormData({
        vehicule_id: intervention.vehicule_id || '',
        type_intervention: intervention.type_intervention || '',
        description: intervention.description || '',
        date_intervention: intervention.date_intervention ? intervention.date_intervention.slice(0, 10) : '',
        cout_main_oeuvre: intervention.cout_main_oeuvre || '',
        cout_pieces: intervention.cout_pieces || '',
        kilometrage: intervention.kilometrage || '',
        prestataire: intervention.prestataire || '',
        statut: intervention.statut || 'planifiée'
      });
    } else {
      setFormData({
        vehicule_id: '',
        type_intervention: '',
        description: '',
        date_intervention: new Date().toISOString().slice(0, 10),
        cout_main_oeuvre: '',
        cout_pieces: '',
        kilometrage: '',
        prestataire: '',
        statut: 'planifiée'
      });
    }
    setErrors({});
  }, [intervention, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicule_id) newErrors.vehicule_id = 'Le véhicule est requis';
    if (!formData.type_intervention?.trim()) newErrors.type_intervention = 'Le type d\'intervention est requis';
    if (!formData.description?.trim()) newErrors.description = 'La description est requise';
    if (!formData.date_intervention) newErrors.date_intervention = 'La date d\'intervention est requise';

    if (formData.cout_main_oeuvre && parseFloat(formData.cout_main_oeuvre) < 0) {
      newErrors.cout_main_oeuvre = 'Le coût de main d\'œuvre ne peut pas être négatif';
    }

    if (formData.cout_pieces && parseFloat(formData.cout_pieces) < 0) {
      newErrors.cout_pieces = 'Le coût des pièces ne peut pas être négatif';
    }

    if (formData.kilometrage && parseInt(formData.kilometrage) < 0) {
      newErrors.kilometrage = 'Le kilométrage ne peut pas être négatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        cout_main_oeuvre: formData.cout_main_oeuvre ? parseFloat(formData.cout_main_oeuvre) : null,
        cout_pieces: formData.cout_pieces ? parseFloat(formData.cout_pieces) : null,
        kilometrage: formData.kilometrage ? parseInt(formData.kilometrage) : null
      };
      await onSave(dataToSave);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const totalCost = (parseFloat(formData.cout_main_oeuvre) || 0) + (parseFloat(formData.cout_pieces) || 0);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg bg-white dark:bg-dark-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              {intervention ? 'Modifier l\'intervention' : 'Nouvelle intervention'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Véhicule *
                </label>
                <select
                  value={formData.vehicule_id}
                  onChange={(e) => handleInputChange('vehicule_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.vehicule_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un véhicule</option>
                  {vehicules.map(vehicule => (
                    <option key={vehicule.id} value={vehicule.id}>
                      {vehicule.marque} {vehicule.modele} - {vehicule.plaque_immatriculation}
                    </option>
                  ))}
                </select>
                {errors.vehicule_id && <p className="mt-1 text-sm text-red-600">{errors.vehicule_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type d&apos;intervention *
                </label>
                <select
                  value={formData.type_intervention}
                  onChange={(e) => handleInputChange('type_intervention', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.type_intervention ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un type</option>
                  <option value="entretien">Entretien</option>
                  <option value="réparation">Réparation</option>
                  <option value="révision">Révision</option>
                  <option value="carrosserie">Carrosserie</option>
                  <option value="pneumatiques">Pneumatiques</option>
                  <option value="autre">Autre</option>
                </select>
                {errors.type_intervention && <p className="mt-1 text-sm text-red-600">{errors.type_intervention}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Description détaillée de l'intervention"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date d&apos;intervention *
                </label>
                <input
                  type="date"
                  value={formData.date_intervention}
                  onChange={(e) => handleInputChange('date_intervention', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.date_intervention ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date_intervention && <p className="mt-1 text-sm text-red-600">{errors.date_intervention}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kilométrage
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.kilometrage}
                  onChange={(e) => handleInputChange('kilometrage', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.kilometrage ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="150000"
                />
                {errors.kilometrage && <p className="mt-1 text-sm text-red-600">{errors.kilometrage}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Coût main d&apos;œuvre (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cout_main_oeuvre}
                  onChange={(e) => handleInputChange('cout_main_oeuvre', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.cout_main_oeuvre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="150.00"
                />
                {errors.cout_main_oeuvre && <p className="mt-1 text-sm text-red-600">{errors.cout_main_oeuvre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Coût des pièces (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cout_pieces}
                  onChange={(e) => handleInputChange('cout_pieces', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.cout_pieces ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="200.00"
                />
                {errors.cout_pieces && <p className="mt-1 text-sm text-red-600">{errors.cout_pieces}</p>}
              </div>
            </div>

            {totalCost > 0 && (
              <div className="bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Coût total: {totalCost.toFixed(2)}€
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prestataire
                </label>
                <input
                  type="text"
                  value={formData.prestataire}
                  onChange={(e) => handleInputChange('prestataire', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                  placeholder="Nom du garage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut
                </label>
                <select
                  value={formData.statut}
                  onChange={(e) => handleInputChange('statut', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                >
                  <option value="planifiée">Planifiée</option>
                  <option value="en_cours">En cours</option>
                  <option value="terminée">Terminée</option>
                  <option value="annulée">Annulée</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? 'Enregistrement...' : (intervention ? 'Modifier' : 'Créer')}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};