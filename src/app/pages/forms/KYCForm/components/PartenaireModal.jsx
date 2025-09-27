import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from 'components/ui';

export const PartenaireModal = ({ isOpen, onClose, partenaire, onSave }) => {
  const [formData, setFormData] = useState({
    nom: '',
    type_partenaire: '',
    contact_nom: '',
    contact_prenom: '',
    telephone: '',
    email: '',
    adresse: '',
    commission_pourcentage: '',
    est_actif: true
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (partenaire) {
      setFormData({
        nom: partenaire.nom || '',
        type_partenaire: partenaire.type_partenaire || '',
        contact_nom: partenaire.contact_nom || '',
        contact_prenom: partenaire.contact_prenom || '',
        telephone: partenaire.telephone || '',
        email: partenaire.email || '',
        adresse: partenaire.adresse || '',
        commission_pourcentage: partenaire.commission_pourcentage || '',
        est_actif: partenaire.est_actif ?? true
      });
    } else {
      setFormData({
        nom: '',
        type_partenaire: '',
        contact_nom: '',
        contact_prenom: '',
        telephone: '',
        email: '',
        adresse: '',
        commission_pourcentage: '',
        est_actif: true
      });
    }
    setErrors({});
  }, [partenaire, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom?.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.type_partenaire?.trim()) newErrors.type_partenaire = 'Le type de partenaire est requis';
    if (!formData.contact_nom?.trim()) newErrors.contact_nom = 'Le nom du contact est requis';
    if (!formData.contact_prenom?.trim()) newErrors.contact_prenom = 'Le prénom du contact est requis';
    if (!formData.telephone?.trim()) newErrors.telephone = 'Le téléphone est requis';

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (formData.commission_pourcentage && (parseFloat(formData.commission_pourcentage) < 0 || parseFloat(formData.commission_pourcentage) > 100)) {
      newErrors.commission_pourcentage = 'La commission doit être entre 0 et 100%';
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
        commission_pourcentage: formData.commission_pourcentage ? parseFloat(formData.commission_pourcentage) : null
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

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg bg-white dark:bg-dark-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              {partenaire ? 'Modifier le partenaire' : 'Nouveau partenaire'}
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
                  Nom du partenaire *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.nom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nom de l'entreprise"
                />
                {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type de partenaire *
                </label>
                <select
                  value={formData.type_partenaire}
                  onChange={(e) => handleInputChange('type_partenaire', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.type_partenaire ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un type</option>
                  <option value="hôtel">Hôtel</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="agence">Agence de voyage</option>
                  <option value="entreprise">Entreprise</option>
                  <option value="autre">Autre</option>
                </select>
                {errors.type_partenaire && <p className="mt-1 text-sm text-red-600">{errors.type_partenaire}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du contact *
                </label>
                <input
                  type="text"
                  value={formData.contact_nom}
                  onChange={(e) => handleInputChange('contact_nom', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.contact_nom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nom du contact"
                />
                {errors.contact_nom && <p className="mt-1 text-sm text-red-600">{errors.contact_nom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prénom du contact *
                </label>
                <input
                  type="text"
                  value={formData.contact_prenom}
                  onChange={(e) => handleInputChange('contact_prenom', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.contact_prenom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Prénom du contact"
                />
                {errors.contact_prenom && <p className="mt-1 text-sm text-red-600">{errors.contact_prenom}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.telephone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+33 6 XX XX XX XX"
                />
                {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="contact@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Adresse
              </label>
              <textarea
                value={formData.adresse}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                placeholder="Adresse complète"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Commission (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.commission_pourcentage}
                onChange={(e) => handleInputChange('commission_pourcentage', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                  errors.commission_pourcentage ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="5.00"
              />
              {errors.commission_pourcentage && <p className="mt-1 text-sm text-red-600">{errors.commission_pourcentage}</p>}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="est_actif"
                checked={formData.est_actif}
                onChange={(e) => handleInputChange('est_actif', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="est_actif" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Partenaire actif
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
                {saving ? 'Enregistrement...' : (partenaire ? 'Modifier' : 'Créer')}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};