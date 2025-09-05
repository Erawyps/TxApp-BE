import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, StopIcon, PencilIcon } from '@heroicons/react/24/outline';

export function EndShiftModal({ isOpen, onClose, onSubmit, currentShift, courses = [] }) {
  const [formData, setFormData] = useState({
    heure_fin: '',
    km_fin: '',
    notes: currentShift?.notes || '',
    signature: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);

  // Calculate statistics for shift summary
  const getShiftSummary = () => {
    if (!courses.length) return { totalCourses: 0, totalRevenue: 0, totalDistance: 0 };

    const completed = courses.filter(c => c.heure_debarquement);
    const totalRevenue = completed.reduce((sum, c) => sum + (parseFloat(c.somme_percue) || 0), 0);
    const totalDistance = completed.reduce((sum, c) => {
      const distance = (c.index_arrivee || 0) - (c.index_depart || 0);
      return sum + (distance > 0 ? distance : 0);
    }, 0);

    return {
      totalCourses: completed.length,
      totalRevenue,
      totalDistance,
      lastCourseIndex: Math.max(...completed.map(c => c.index_arrivee || 0), 0)
    };
  };

  const validateForm = () => {
    const newErrors = {};
    const summary = getShiftSummary();

    if (!formData.heure_fin) {
      newErrors.heure_fin = 'Heure de fin requise';
    }

    if (!formData.km_fin || parseInt(formData.km_fin) < 0) {
      newErrors.km_fin = 'Kilométrage de fin requis';
    }

    // Validate ending kilometers >= starting kilometers
    if (currentShift?.km_debut && formData.km_fin) {
      if (parseInt(formData.km_fin) < currentShift.km_debut) {
        newErrors.km_fin = 'Le kilométrage de fin doit être supérieur ou égal au kilométrage de début';
      }
    }

    // Validate ending kilometers >= last course index
    if (summary.lastCourseIndex > 0 && formData.km_fin) {
      if (parseInt(formData.km_fin) < summary.lastCourseIndex) {
        newErrors.km_fin = `Le kilométrage de fin doit être au moins égal à l'index de la dernière course (${summary.lastCourseIndex})`;
      }
    }

    if (!formData.signature) {
      newErrors.signature = 'Signature numérique requise';
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
      console.error('Error ending shift:', err);
      setErrors({ submit: 'Erreur lors de la finalisation de la feuille de route' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      heure_fin: '',
      km_fin: '',
      notes: currentShift?.notes || '',
      signature: ''
    });
    setErrors({});
    setIsDrawingSignature(false);
    onClose();
  };

  const handleSignature = (signature) => {
    setFormData(prev => ({ ...prev, signature }));
    setIsDrawingSignature(false);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const calculateDuration = () => {
    if (!currentShift?.heure_debut || !formData.heure_fin) return '-';

    const start = new Date(`${currentShift.date}T${currentShift.heure_debut}`);
    const end = new Date(`${currentShift.date}T${formData.heure_fin}`);
    const diffMs = end - start;

    if (diffMs < 0) return 'Heure invalide';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const summary = getShiftSummary();

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <StopIcon className="h-6 w-6 text-red-500 mr-2" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Finaliser la feuille de route
              </Dialog.Title>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Shift Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-md font-medium text-gray-800 mb-4">Résumé de la feuille de route</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{summary.totalCourses}</p>
                  <p className="text-sm text-gray-600">Courses terminées</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">€{summary.totalRevenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Recettes totales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{summary.totalDistance}</p>
                  <p className="text-sm text-gray-600">Distance courses (km)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{calculateDuration()}</p>
                  <p className="text-sm text-gray-600">Durée prévue</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-medium">{formatDate(currentShift?.date)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Début:</span>
                  <span className="ml-2 font-medium">{formatTime(currentShift?.heure_debut)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Véhicule:</span>
                  <span className="ml-2 font-medium">{currentShift?.vehicule?.plaque_immatriculation}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* End Time and Final Kilometers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de fin réelle *
                  </label>
                  <input
                    type="time"
                    value={formData.heure_fin}
                    onChange={(e) => setFormData(prev => ({ ...prev, heure_fin: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors.heure_fin ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.heure_fin && (
                    <p className="text-red-500 text-sm mt-1">{errors.heure_fin}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Heure réelle de fin (peut différer de l&#39;heure prévue)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kilométrage final *
                  </label>
                  <input
                    type="number"
                    min={Math.max(currentShift?.km_debut || 0, summary.lastCourseIndex)}
                    value={formData.km_fin}
                    onChange={(e) => setFormData(prev => ({ ...prev, km_fin: e.target.value }))}
                    placeholder={`Min: ${Math.max(currentShift?.km_debut || 0, summary.lastCourseIndex)}`}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors.km_fin ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.km_fin && (
                    <p className="text-red-500 text-sm mt-1">{errors.km_fin}</p>
                  )}
                  <div className="text-gray-500 text-xs mt-1">
                    <p>Début: {currentShift?.km_debut?.toLocaleString()} km</p>
                    {summary.lastCourseIndex > 0 && (
                      <p>Dernière course: {summary.lastCourseIndex} km</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Final Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observations finales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows="4"
                  placeholder="Notes sur cette feuille de route (ex: remplacement de dernière minute, négociation rémunération, incidents...)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Digital Signature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signature numérique *
                </label>

                {formData.signature ? (
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Signature enregistrée</p>
                          <p className="text-xs text-gray-500">Signature numérique validée</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDrawingSignature(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsDrawingSignature(true)}
                      className={`w-full py-3 px-4 border-2 border-dashed rounded-lg text-center transition-colors ${
                        errors.signature 
                          ? 'border-red-300 text-red-600 hover:border-red-400' 
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <PencilIcon className="h-6 w-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Cliquer pour signer</span>
                    </button>
                    {errors.signature && (
                      <p className="text-red-500 text-sm mt-1">{errors.signature}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Warnings */}
              {courses.some(c => !c.heure_debarquement && parseFloat(c.somme_percue || 0) > 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex">
                    <svg className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-yellow-800">
                        <strong>Attention:</strong> Il y a des courses non terminées avec des montants perçus.
                        Assurez-vous que toutes les courses sont correctement finalisées.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
                  className={`px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Finalisation...' : 'Finaliser la feuille de route'}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Panel>
      </div>

      {/* Simple signature modal (placeholder - would need a proper signature component) */}
      {isDrawingSignature && (
        <Dialog open={isDrawingSignature} onClose={() => setIsDrawingSignature(false)} className="relative z-60">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Signature numérique</h3>
              <div className="border border-gray-300 rounded-lg p-4 mb-4 text-center">
                <p className="text-gray-600 text-sm">Zone de signature simplifiée</p>
                <p className="text-xs text-gray-500 mt-2">
                  Dans une implémentation complète, ici serait intégré un composant de signature tactile
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDrawingSignature(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleSignature(`signature_${Date.now()}`)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Confirmer signature
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </Dialog>
  );
}
