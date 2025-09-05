import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';
import { supabase } from 'utils/supabase';

export function ExpenseModal({ isOpen, onClose, onSubmit, shiftId }) {
  const [formData, setFormData] = useState({
    type_charge: '',
    description: '',
    montant: '',
    date: new Date().toISOString().split('T')[0],
    mode_paiement_id: '',
    justificatif: '',
    notes: ''
  });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const expenseTypes = [
    { id: 'carburant', label: 'Carburant' },
    { id: 'parking', label: 'Parking' },
    { id: 'peage', label: 'Péage' },
    { id: 'repas', label: 'Repas' },
    { id: 'entretien', label: 'Entretien véhicule' },
    { id: 'autre', label: 'Autre' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('mode_paiement')
        .select('id, code, libelle')
        .eq('actif', true)
        .order('libelle');

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type_charge) {
      newErrors.type_charge = 'Type de charge requis';
    }

    if (!formData.description) {
      newErrors.description = 'Description requise';
    }

    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      newErrors.montant = 'Montant requis et doit être positif';
    }

    if (!formData.mode_paiement_id) {
      newErrors.mode_paiement_id = 'Mode de paiement requis';
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
      const expenseData = {
        ...formData,
        feuille_route_id: shiftId,
        montant: parseFloat(formData.montant)
      };

      await onSubmit(expenseData);
      handleClose();
    } catch (err) {
      console.error('Error creating expense:', err);
      setErrors({ submit: 'Erreur lors de la création de la charge' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type_charge: '',
      description: '',
      montant: '',
      date: new Date().toISOString().split('T')[0],
      mode_paiement_id: '',
      justificatif: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <CurrencyEuroIcon className="h-6 w-6 text-orange-500 mr-2" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Ajouter une charge
              </Dialog.Title>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Expense Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de charge *
              </label>
              <select
                value={formData.type_charge}
                onChange={(e) => setFormData(prev => ({ ...prev, type_charge: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.type_charge ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un type</option>
                {expenseTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type_charge && (
                <p className="text-red-500 text-sm mt-1">{errors.type_charge}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ex: Parking Charles Airport"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.montant}
                  onChange={(e) => setFormData(prev => ({ ...prev, montant: e.target.value }))}
                  placeholder="10.00"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.montant ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.montant && (
                  <p className="text-red-500 text-sm mt-1">{errors.montant}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode de paiement *
              </label>
              <select
                value={formData.mode_paiement_id}
                onChange={(e) => setFormData(prev => ({ ...prev, mode_paiement_id: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.mode_paiement_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un mode</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.libelle}
                  </option>
                ))}
              </select>
              {errors.mode_paiement_id && (
                <p className="text-red-500 text-sm mt-1">{errors.mode_paiement_id}</p>
              )}
            </div>

            {/* Receipt/Justification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justificatif
              </label>
              <input
                type="text"
                value={formData.justificatif}
                onChange={(e) => setFormData(prev => ({ ...prev, justificatif: e.target.value }))}
                placeholder="Numéro de ticket, référence..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows="2"
                placeholder="Notes supplémentaires..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}

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
                className={`px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Ajout...' : 'Ajouter la charge'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
