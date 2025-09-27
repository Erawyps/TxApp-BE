import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from 'components/ui';

export const FactureModal = ({ isOpen, onClose, facture, onSave, clients = [] }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    numero_facture: '',
    date_emission: new Date().toISOString().slice(0, 10),
    date_echeance: '',
    montant_ht: '',
    tva: 20,
    montant_ttc: '',
    est_payee: false,
    date_paiement: '',
    mode_paiement: ''
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (facture) {
      setFormData({
        client_id: facture.client_id || '',
        numero_facture: facture.numero_facture || '',
        date_emission: facture.date_emission ? facture.date_emission.slice(0, 10) : '',
        date_echeance: facture.date_echeance ? facture.date_echeance.slice(0, 10) : '',
        montant_ht: facture.montant_ht || '',
        tva: facture.tva || 20,
        montant_ttc: facture.montant_ttc || '',
        est_payee: facture.est_payee || false,
        date_paiement: facture.date_paiement ? facture.date_paiement.slice(0, 10) : '',
        mode_paiement: facture.mode_paiement || ''
      });
    } else {
      setFormData({
        client_id: '',
        numero_facture: '',
        date_emission: new Date().toISOString().slice(0, 10),
        date_echeance: '',
        montant_ht: '',
        tva: 20,
        montant_ttc: '',
        est_payee: false,
        date_paiement: '',
        mode_paiement: ''
      });
    }
    setErrors({});
  }, [facture, isOpen]);

  // Calcul automatique du TTC
  useEffect(() => {
    if (formData.montant_ht && formData.tva) {
      const ht = parseFloat(formData.montant_ht) || 0;
      const tva = parseFloat(formData.tva) || 0;
      const ttc = ht * (1 + tva / 100);
      setFormData(prev => ({ ...prev, montant_ttc: ttc.toFixed(2) }));
    }
  }, [formData.montant_ht, formData.tva]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.client_id) newErrors.client_id = 'Le client est requis';
    if (!formData.numero_facture?.trim()) newErrors.numero_facture = 'Le numéro de facture est requis';
    if (!formData.date_emission) newErrors.date_emission = 'La date d\'émission est requise';
    if (!formData.montant_ht || parseFloat(formData.montant_ht) <= 0) {
      newErrors.montant_ht = 'Le montant HT doit être positif';
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
        montant_ht: parseFloat(formData.montant_ht),
        montant_ttc: parseFloat(formData.montant_ttc),
        tva: parseFloat(formData.tva)
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
              {facture ? 'Modifier la facture' : 'Nouvelle facture'}
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
                  Client *
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => handleInputChange('client_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.client_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.prenom} {client.nom}
                    </option>
                  ))}
                </select>
                {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Numéro de facture *
                </label>
                <input
                  type="text"
                  value={formData.numero_facture}
                  onChange={(e) => handleInputChange('numero_facture', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.numero_facture ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="FAC-2024-001"
                />
                {errors.numero_facture && <p className="mt-1 text-sm text-red-600">{errors.numero_facture}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date d&apos;émission *
                </label>
                <input
                  type="date"
                  value={formData.date_emission}
                  onChange={(e) => handleInputChange('date_emission', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.date_emission ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date_emission && <p className="mt-1 text-sm text-red-600">{errors.date_emission}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date d&apos;échéance
                </label>
                <input
                  type="date"
                  value={formData.date_echeance}
                  onChange={(e) => handleInputChange('date_echeance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Montant HT (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.montant_ht}
                  onChange={(e) => handleInputChange('montant_ht', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white ${
                    errors.montant_ht ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="100.00"
                />
                {errors.montant_ht && <p className="mt-1 text-sm text-red-600">{errors.montant_ht}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  TVA (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tva}
                  onChange={(e) => handleInputChange('tva', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                  placeholder="20.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Montant TTC (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.montant_ttc}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-dark-600 dark:border-dark-500 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="est_payee"
                checked={formData.est_payee}
                onChange={(e) => handleInputChange('est_payee', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="est_payee" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Facture payée
              </label>
            </div>

            {formData.est_payee && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de paiement
                  </label>
                  <input
                    type="date"
                    value={formData.date_paiement}
                    onChange={(e) => handleInputChange('date_paiement', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mode de paiement
                  </label>
                  <select
                    value={formData.mode_paiement}
                    onChange={(e) => handleInputChange('mode_paiement', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                  >
                    <option value="">Sélectionner</option>
                    <option value="espèces">Espèces</option>
                    <option value="carte">Carte bancaire</option>
                    <option value="virement">Virement</option>
                    <option value="chèque">Chèque</option>
                  </select>
                </div>
              </div>
            )}

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
                {saving ? 'Enregistrement...' : (facture ? 'Modifier' : 'Créer')}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};