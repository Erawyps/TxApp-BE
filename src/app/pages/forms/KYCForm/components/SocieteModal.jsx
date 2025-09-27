import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from 'components/ui';

export const SocieteModal = ({ isOpen, onClose, societe, onSave }) => {
  const [formData, setFormData] = useState({
    nom: '',
    siret: '',
    tva_intracommunautaire: '',
    adresse: '',
    code_postal: '',
    ville: '',
    telephone: '',
    email: '',
    site_web: '',
    numero_licence: '',
    date_creation: '',
    capital_social: '',
    forme_juridique: 'SARL',
    gérant_nom: '',
    gérant_prenom: '',
    gérant_telephone: '',
    gérant_email: ''
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (societe) {
      setFormData({
        nom: societe.nom || '',
        siret: societe.siret || '',
        tva_intracommunautaire: societe.tva_intracommunautaire || '',
        adresse: societe.adresse || '',
        code_postal: societe.code_postal || '',
        ville: societe.ville || '',
        telephone: societe.telephone || '',
        email: societe.email || '',
        site_web: societe.site_web || '',
        numero_licence: societe.numero_licence || '',
        date_creation: societe.date_creation ? societe.date_creation.slice(0, 10) : '',
        capital_social: societe.capital_social || '',
        forme_juridique: societe.forme_juridique || 'SARL',
        gérant_nom: societe.gérant_nom || '',
        gérant_prenom: societe.gérant_prenom || '',
        gérant_telephone: societe.gérant_telephone || '',
        gérant_email: societe.gérant_email || ''
      });
    } else {
      setFormData({
        nom: '',
        siret: '',
        tva_intracommunautaire: '',
        adresse: '',
        code_postal: '',
        ville: '',
        telephone: '',
        email: '',
        site_web: '',
        numero_licence: '',
        date_creation: '',
        capital_social: '',
        forme_juridique: 'SARL',
        gérant_nom: '',
        gérant_prenom: '',
        gérant_telephone: '',
        gérant_email: ''
      });
    }
    setErrors({});
  }, [societe, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom?.trim()) newErrors.nom = 'Le nom de la société est requis';
    if (!formData.adresse?.trim()) newErrors.adresse = 'L\'adresse est requise';
    if (!formData.code_postal?.trim()) newErrors.code_postal = 'Le code postal est requis';
    if (!formData.ville?.trim()) newErrors.ville = 'La ville est requise';
    if (!formData.telephone?.trim()) newErrors.telephone = 'Le téléphone est requis';

    if (formData.siret && !/^\d{14}$/.test(formData.siret.replace(/\s/g, ''))) {
      newErrors.siret = 'Le SIRET doit contenir 14 chiffres';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (formData.gérant_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.gérant_email)) {
      newErrors.gérant_email = 'L\'email du gérant n\'est pas valide';
    }

    if (formData.capital_social && parseFloat(formData.capital_social) <= 0) {
      newErrors.capital_social = 'Le capital social doit être positif';
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
        siret: formData.siret.replace(/\s/g, ''),
        capital_social: formData.capital_social ? parseFloat(formData.capital_social) : null
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

  const formesJuridiques = [
    'SARL', 'SAS', 'SA', 'EURL', 'SNC', 'SCS', 'SCA', 'EI', 'EIRL', 'Auto-entrepreneur'
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white dark:bg-dark-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              {societe ? 'Modifier la société' : 'Configuration de la société'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informations générales */}
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Informations générales
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom de la société *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                      errors.nom ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Taxi Express SARL"
                  />
                  {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Forme juridique
                  </label>
                  <select
                    value={formData.forme_juridique}
                    onChange={(e) => handleInputChange('forme_juridique', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                  >
                    {formesJuridiques.map(forme => (
                      <option key={forme} value={forme}>{forme}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={formData.siret}
                    onChange={(e) => handleInputChange('siret', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                      errors.siret ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 456 789 01234"
                  />
                  {errors.siret && <p className="mt-1 text-sm text-red-600">{errors.siret}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    N° TVA
                  </label>
                  <input
                    type="text"
                    value={formData.tva_intracommunautaire}
                    onChange={(e) => handleInputChange('tva_intracommunautaire', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                    placeholder="FR 12 345678901"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capital social (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.capital_social}
                    onChange={(e) => handleInputChange('capital_social', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                      errors.capital_social ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="10000.00"
                  />
                  {errors.capital_social && <p className="mt-1 text-sm text-red-600">{errors.capital_social}</p>}
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Adresse
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adresse *
                </label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => handleInputChange('adresse', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.adresse ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Rue de la République"
                />
                {errors.adresse && <p className="mt-1 text-sm text-red-600">{errors.adresse}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    value={formData.code_postal}
                    onChange={(e) => handleInputChange('code_postal', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                      errors.code_postal ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="75001"
                  />
                  {errors.code_postal && <p className="mt-1 text-sm text-red-600">{errors.code_postal}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={formData.ville}
                    onChange={(e) => handleInputChange('ville', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                      errors.ville ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Paris"
                  />
                  {errors.ville && <p className="mt-1 text-sm text-red-600">{errors.ville}</p>}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Contact
              </h3>
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
                    placeholder="+33 1 23 45 67 89"
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
                    placeholder="contact@taxi-express.fr"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Site web
                  </label>
                  <input
                    type="url"
                    value={formData.site_web}
                    onChange={(e) => handleInputChange('site_web', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                    placeholder="https://taxi-express.fr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    N° licence taxi
                  </label>
                  <input
                    type="text"
                    value={formData.numero_licence}
                    onChange={(e) => handleInputChange('numero_licence', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                    placeholder="LIC-2024-001"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de création
                </label>
                <input
                  type="date"
                  value={formData.date_creation}
                  onChange={(e) => handleInputChange('date_creation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                />
              </div>
            </div>

            {/* Gérant */}
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Gérant
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom du gérant
                  </label>
                  <input
                    type="text"
                    value={formData.gérant_nom}
                    onChange={(e) => handleInputChange('gérant_nom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                    placeholder="Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prénom du gérant
                  </label>
                  <input
                    type="text"
                    value={formData.gérant_prenom}
                    onChange={(e) => handleInputChange('gérant_prenom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                    placeholder="Jean"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Téléphone du gérant
                  </label>
                  <input
                    type="tel"
                    value={formData.gérant_telephone}
                    onChange={(e) => handleInputChange('gérant_telephone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email du gérant
                  </label>
                  <input
                    type="email"
                    value={formData.gérant_email}
                    onChange={(e) => handleInputChange('gérant_email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                      errors.gérant_email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="gerant@taxi-express.fr"
                  />
                  {errors.gérant_email && <p className="mt-1 text-sm text-red-600">{errors.gérant_email}</p>}
                </div>
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
                {saving ? 'Enregistrement...' : (societe ? 'Modifier' : 'Créer')}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};