import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { supabase } from 'utils/supabase';

export function CourseModal({ isOpen, onClose, onSubmit, shiftId, course = null, autoSaveCourse = null }) {
  const [formData, setFormData] = useState({
    index_depart: '',
    lieu_embarquement: '',
    heure_embarquement: '',
    index_arrivee: '',
    lieu_debarquement: '',
    heure_debarquement: '',
    prix_taximetre: '',
    somme_percue: '',
    mode_paiement_id: '',
    client_id: '',
    notes: '',
    hors_creneau: false
  });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [clients, setClients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [pourboire, setPourboire] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
      fetchClients();

      if (course) {
        // Edit mode - populate form with existing course data
        setFormData({
          index_depart: course.index_depart || '',
          lieu_embarquement: course.lieu_embarquement || '',
          heure_embarquement: course.heure_embarquement ?
            new Date(course.heure_embarquement).toISOString().slice(0, 16) : '',
          index_arrivee: course.index_arrivee || '',
          lieu_debarquement: course.lieu_debarquement || '',
          heure_debarquement: course.heure_debarquement ?
            new Date(course.heure_debarquement).toISOString().slice(0, 16) : '',
          prix_taximetre: course.prix_taximetre || '',
          somme_percue: course.somme_percue || '',
          mode_paiement_id: course.mode_paiement_id || '',
          client_id: course.client_id || '',
          notes: course.notes || '',
          hors_creneau: course.hors_creneau || false
        });
      }
    }
  }, [isOpen, course]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('mode_paiement')
        .select('id, code, libelle')
        .eq('actif', true)
        .order('libelle');

      if (error) {
        console.error('Error fetching payment methods:', error);
        return;
      }
      setPaymentMethods(data || []);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('client')
        .select('id, nom, prenom, type_client')
        .eq('actif', true)
        .order('nom');

      if (error) {
        console.error('Error fetching clients:', error);
        return;
      }
      setClients(data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  // Calculer le pourboire automatiquement
  useEffect(() => {
    const prix = parseFloat(formData.prix_taximetre) || 0;
    const percu = parseFloat(formData.somme_percue) || 0;
    const calculatedPourboire = percu > prix ? percu - prix : 0;
    setPourboire(calculatedPourboire);
  }, [formData.prix_taximetre, formData.somme_percue]);

  // Auto-save functionality for real-time updates
  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new timeout for auto-save (500ms after user stops typing)
    if (course && shiftId) {
      const timeout = setTimeout(() => {
        autoSaveField(fieldName, value);
      }, 500);
      setAutoSaveTimeout(timeout);
    }
  };

  const autoSaveField = async (fieldName, value) => {
    if (!course || !autoSaveCourse) return;

    try {
      // Préparer les données pour la sauvegarde automatique
      const autoSaveData = {
        [fieldName]: value
      };

      // Calculer le pourboire si nécessaire
      if (fieldName === 'prix_taximetre' || fieldName === 'somme_percue') {
        const prix = fieldName === 'prix_taximetre' ? parseFloat(value) : parseFloat(formData.prix_taximetre);
        const percu = fieldName === 'somme_percue' ? parseFloat(value) : parseFloat(formData.somme_percue);
        if (prix && percu && percu > prix) {
          autoSaveData.pourboire = percu - prix;
        }
      }

      // Utiliser le service de sauvegarde automatique
      await autoSaveCourse(course.id, autoSaveData);
    } catch (err) {
      console.error('Auto-save error:', err);
      // Ne pas afficher d'erreur à l'utilisateur pour la sauvegarde automatique
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.index_depart) {
      newErrors.index_depart = 'Index de départ requis';
    }

    if (!formData.lieu_embarquement) {
      newErrors.lieu_embarquement = 'Lieu d\'embarquement requis';
    }

    if (!formData.heure_embarquement) {
      newErrors.heure_embarquement = 'Heure d\'embarquement requise';
    }

    // Index validation
    if (formData.index_arrivee && formData.index_depart) {
      if (parseInt(formData.index_arrivee) <= parseInt(formData.index_depart)) {
        newErrors.index_arrivee = 'L\'index d\'arrivée doit être supérieur à l\'index de départ';
      }
    }

    // Price validation
    if (formData.prix_taximetre && formData.somme_percue) {
      if (parseFloat(formData.somme_percue) > parseFloat(formData.prix_taximetre)) {
        newErrors.somme_percue = 'Le montant perçu ne peut pas dépasser le prix du taximètre (sauf pourboire)';
      }
    }

    // Payment method required if amount collected > 0
    if (formData.somme_percue && parseFloat(formData.somme_percue) > 0 && !formData.mode_paiement_id) {
      newErrors.mode_paiement_id = 'Mode de paiement requis si montant perçu > 0';
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
      const courseData = {
        ...formData,
        feuille_route_id: shiftId,
        // Convert datetime-local to ISO format
        heure_embarquement: formData.heure_embarquement ?
          new Date(formData.heure_embarquement).toISOString() : null,
        heure_debarquement: formData.heure_debarquement ?
          new Date(formData.heure_debarquement).toISOString() : null,
        // Convert strings to numbers
        index_depart: parseInt(formData.index_depart) || null,
        index_arrivee: parseInt(formData.index_arrivee) || null,
        prix_taximetre: parseFloat(formData.prix_taximetre) || 0,
        somme_percue: parseFloat(formData.somme_percue) || 0
      };

      await onSubmit(courseData);
      handleClose();
    } catch (err) {
      console.error('Error saving course:', err);
      setErrors({ submit: 'Erreur lors de la sauvegarde de la course' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    setFormData({
      index_depart: '',
      lieu_embarquement: '',
      heure_embarquement: '',
      index_arrivee: '',
      lieu_debarquement: '',
      heure_debarquement: '',
      prix_taximetre: '',
      somme_percue: '',
      mode_paiement_id: '',
      client_id: '',
      notes: '',
      hors_creneau: false
    });
    setErrors({});
    onClose();
  };

  const handleCancel = async () => {
    if (course) {
      // Cancel course - set amount to 0 and grey out payment fields
      setFormData(prev => ({
        ...prev,
        somme_percue: '0',
        mode_paiement_id: '',
        notes: 'Course annulée'
      }));
    }
  };

  const isAmountZero = parseFloat(formData.somme_percue) === 0;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <MapPinIcon className="h-6 w-6 text-green-500 mr-2" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {course ? 'Modifier la course' : 'Nouvelle course'}
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
            {/* Embarkment Section */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-green-800 mb-4">Embarquement</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Index * (obligatoire)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.index_depart}
                    onChange={(e) => handleFieldChange('index_depart', e.target.value)}
                    placeholder="Ex: 109"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.index_depart ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.index_depart && (
                    <p className="text-red-500 text-sm mt-1">{errors.index_depart}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu *
                  </label>
                  <input
                    type="text"
                    value={formData.lieu_embarquement}
                    onChange={(e) => handleFieldChange('lieu_embarquement', e.target.value)}
                    placeholder="Ex: Otignies"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.lieu_embarquement ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.lieu_embarquement && (
                    <p className="text-red-500 text-sm mt-1">{errors.lieu_embarquement}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.heure_embarquement}
                    onChange={(e) => handleFieldChange('heure_embarquement', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.heure_embarquement ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.heure_embarquement && (
                    <p className="text-red-500 text-sm mt-1">{errors.heure_embarquement}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Disembarkment Section */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-red-800 mb-4">Débarquement</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Index (&gt; index départ)
                  </label>
                  <input
                    type="number"
                    min={formData.index_depart ? parseInt(formData.index_depart) + 1 : 0}
                    value={formData.index_arrivee}
                    onChange={(e) => handleFieldChange('index_arrivee', e.target.value)}
                    placeholder="Ex: 135"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors.index_arrivee ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.index_arrivee && (
                    <p className="text-red-500 text-sm mt-1">{errors.index_arrivee}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={formData.lieu_debarquement}
                    onChange={(e) => handleFieldChange('lieu_debarquement', e.target.value)}
                    placeholder="Ex: Schaerbeek Delta"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.heure_debarquement}
                    onChange={(e) => handleFieldChange('heure_debarquement', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Financial Details Section */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-blue-800 mb-4">Détails financiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix taximètre (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.prix_taximetre}
                    onChange={(e) => handleFieldChange('prix_taximetre', e.target.value)}
                    placeholder="Ex: 8.60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant perçu (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.somme_percue}
                    onChange={(e) => handleFieldChange('somme_percue', e.target.value)}
                    placeholder="Ex: 70.00"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.somme_percue ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.somme_percue && (
                    <p className="text-red-500 text-sm mt-1">{errors.somme_percue}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pourboire (€)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={pourboire.toFixed(2)}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-xs text-gray-500">Auto-calculé</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Calculé automatiquement : Montant perçu - Prix taximètre
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode de paiement
                  </label>
                  <select
                    value={formData.mode_paiement_id}
                    onChange={(e) => handleFieldChange('mode_paiement_id', e.target.value)}
                    disabled={isAmountZero}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isAmountZero ? 'bg-gray-100 text-gray-500' : 'border-gray-300'
                    } ${errors.mode_paiement_id ? 'border-red-500' : ''}`}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => handleFieldChange('client_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Client particulier</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.nom} {client.prenom} ({client.type_client})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hors_creneau"
                  checked={formData.hors_creneau}
                  onChange={(e) => handleFieldChange('hors_creneau', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hors_creneau" className="ml-2 block text-sm text-gray-900">
                  Course hors créneau
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observations
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  rows="3"
                  placeholder="Ex: Attente 15 minutes au départ..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <div>
                {course && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    Annuler la course
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Sauvegarde...' : (course ? 'Mettre à jour' : 'Créer la course')}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
