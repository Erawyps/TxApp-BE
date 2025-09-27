import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from 'components/ui';

export const ReglesModal = ({ isOpen, onClose, regle, onSave, type }) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    type_regle: type === 'salaire' ? 'pourcentage' : 'forfaitaire',
    valeur: '',
    est_actif: true,
    // Champs spécifiques aux règles de salaire
    chauffeur_id: null,
    // Champs spécifiques aux règles de facturation
    type_course: '',
    heure_debut: '',
    heure_fin: '',
    jour_semaine: ''
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (regle) {
      setFormData({
        nom: regle.nom || '',
        description: regle.description || '',
        type_regle: regle.type_regle || (type === 'salaire' ? 'pourcentage' : 'forfaitaire'),
        valeur: regle.valeur || '',
        est_actif: regle.est_actif ?? true,
        chauffeur_id: regle.chauffeur_id || null,
        type_course: regle.type_course || '',
        heure_debut: regle.heure_debut || '',
        heure_fin: regle.heure_fin || '',
        jour_semaine: regle.jour_semaine || ''
      });
    } else {
      setFormData({
        nom: '',
        description: '',
        type_regle: type === 'salaire' ? 'pourcentage' : 'forfaitaire',
        valeur: '',
        est_actif: true,
        chauffeur_id: null,
        type_course: '',
        heure_debut: '',
        heure_fin: '',
        jour_semaine: ''
      });
    }
    setErrors({});
  }, [regle, type, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom?.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.type_regle) newErrors.type_regle = 'Le type de règle est requis';
    if (!formData.valeur || parseFloat(formData.valeur) <= 0) {
      newErrors.valeur = 'La valeur doit être positive';
    }

    if (type === 'salaire' && formData.type_regle === 'pourcentage' && parseFloat(formData.valeur) > 100) {
      newErrors.valeur = 'Le pourcentage ne peut pas dépasser 100%';
    }

    if (type === 'facturation' && formData.heure_debut && formData.heure_fin) {
      if (formData.heure_debut >= formData.heure_fin) {
        newErrors.heure_fin = 'L\'heure de fin doit être après l\'heure de début';
      }
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
        valeur: parseFloat(formData.valeur),
        chauffeur_id: formData.chauffeur_id || null
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

  const joursSemaine = [
    { value: 'lundi', label: 'Lundi' },
    { value: 'mardi', label: 'Mardi' },
    { value: 'mercredi', label: 'Mercredi' },
    { value: 'jeudi', label: 'Jeudi' },
    { value: 'vendredi', label: 'Vendredi' },
    { value: 'samedi', label: 'Samedi' },
    { value: 'dimanche', label: 'Dimanche' }
  ];

  const typesCourse = [
    { value: 'standard', label: 'Course standard' },
    { value: 'longue_distance', label: 'Longue distance' },
    { value: 'aeroport', label: 'Aéroport' },
    { value: 'nuit', label: 'Course de nuit' },
    { value: 'weekend', label: 'Week-end' }
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg bg-white dark:bg-dark-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              {regle ? `Modifier la règle de ${type}` : `Nouvelle règle de ${type}`}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom de la règle *
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                  errors.nom ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={`Nom de la règle de ${type}`}
              />
              {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                placeholder="Description de la règle"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type de règle *
                </label>
                <select
                  value={formData.type_regle}
                  onChange={(e) => handleInputChange('type_regle', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.type_regle ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {type === 'salaire' ? (
                    <>
                      <option value="pourcentage">Pourcentage</option>
                      <option value="forfaitaire">Forfaitaire</option>
                    </>
                  ) : (
                    <>
                      <option value="forfaitaire">Forfaitaire</option>
                      <option value="au_km">Au kilomètre</option>
                      <option value="horaire">Horaire</option>
                    </>
                  )}
                </select>
                {errors.type_regle && <p className="mt-1 text-sm text-red-600">{errors.type_regle}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valeur *
                  {formData.type_regle === 'pourcentage' ? ' (%)' : ' (€)'}
                </label>
                <input
                  type="number"
                  step={formData.type_regle === 'pourcentage' ? '0.01' : '0.01'}
                  min="0"
                  max={formData.type_regle === 'pourcentage' ? '100' : undefined}
                  value={formData.valeur}
                  onChange={(e) => handleInputChange('valeur', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.valeur ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={formData.type_regle === 'pourcentage' ? '15.00' : '50.00'}
                />
                {errors.valeur && <p className="mt-1 text-sm text-red-600">{errors.valeur}</p>}
              </div>
            </div>

            {type === 'facturation' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type de course
                  </label>
                  <select
                    value={formData.type_course}
                    onChange={(e) => handleInputChange('type_course', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                  >
                    <option value="">Tous types</option>
                    {typesCourse.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Jour
                    </label>
                    <select
                      value={formData.jour_semaine}
                      onChange={(e) => handleInputChange('jour_semaine', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                    >
                      <option value="">Tous les jours</option>
                      {joursSemaine.map(jour => (
                        <option key={jour.value} value={jour.value}>{jour.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Heure début
                    </label>
                    <input
                      type="time"
                      value={formData.heure_debut}
                      onChange={(e) => handleInputChange('heure_debut', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Heure fin
                    </label>
                    <input
                      type="time"
                      value={formData.heure_fin}
                      onChange={(e) => handleInputChange('heure_fin', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                        errors.heure_fin ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.heure_fin && <p className="mt-1 text-sm text-red-600">{errors.heure_fin}</p>}
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="est_actif"
                checked={formData.est_actif}
                onChange={(e) => handleInputChange('est_actif', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="est_actif" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Règle active
              </label>
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
                {saving ? 'Enregistrement...' : (regle ? 'Modifier' : 'Créer')}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};