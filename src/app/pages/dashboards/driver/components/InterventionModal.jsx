import { useState, useEffect, useCallback } from 'react';
import { createIntervention, fetchChauffeurInterventions } from 'services/chauffeurStats';

const InterventionModal = ({ isOpen, onClose, chauffeurId }) => {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newIntervention, setNewIntervention] = useState({
    type: 'police',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: ''
  });

  const loadInterventions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const interventionsData = await fetchChauffeurInterventions(chauffeurId);
      setInterventions(interventionsData || []);
    } catch (err) {
      console.error('Erreur lors du chargement des interventions:', err);
      setError('Erreur lors du chargement des interventions');
    } finally {
      setLoading(false);
    }
  }, [chauffeurId]);

  useEffect(() => {
    if (isOpen && chauffeurId) {
      loadInterventions();
    }
  }, [isOpen, chauffeurId, loadInterventions]);

  const handleCreateIntervention = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const interventionData = {
        chauffeurId: parseInt(chauffeurId),
        type: newIntervention.type,
        description: newIntervention.description,
        date: newIntervention.date,
        location: newIntervention.location,
        createdBy: 'system'
      };

      await createIntervention(interventionData);

      // Recharger les interventions
      await loadInterventions();

      // Réinitialiser le formulaire
      setNewIntervention({
        type: 'police',
        description: '',
        date: new Date().toISOString().split('T')[0],
        location: ''
      });
    } catch (err) {
      console.error('Erreur lors de la création de l\'intervention:', err);
      setError('Erreur lors de la création de l\'intervention');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'police': return 'Contrôle Police';
      case 'sp': return 'Contrôle Société de Protection';
      case 'inspection': return 'Inspection';
      default: return type;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'police': return 'bg-red-100 text-red-800';
      case 'sp': return 'bg-blue-100 text-blue-800';
      case 'inspection': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Interventions & Contrôles
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Formulaire de création */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ajouter une nouvelle intervention
            </h3>
            <form onSubmit={handleCreateIntervention}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d&apos;intervention
                  </label>
                  <select
                    value={newIntervention.type}
                    onChange={(e) => setNewIntervention({...newIntervention, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="police">Contrôle Police</option>
                    <option value="sp">Contrôle Société de Protection</option>
                    <option value="inspection">Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newIntervention.date}
                    onChange={(e) => setNewIntervention({...newIntervention, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={newIntervention.location}
                    onChange={(e) => setNewIntervention({...newIntervention, location: e.target.value})}
                    placeholder="Lieu de l'intervention"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newIntervention.description}
                    onChange={(e) => setNewIntervention({...newIntervention, description: e.target.value})}
                    placeholder="Description de l'intervention"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer l\'intervention'}
                </button>
              </div>
            </form>
          </div>

          {/* Liste des interventions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Historique des interventions
            </h3>

            {loading && interventions.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Chargement...</p>
              </div>
            ) : interventions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune intervention enregistrée
              </div>
            ) : (
              <div className="space-y-3">
                {interventions.map((intervention) => (
                  <div key={intervention.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(intervention.type)}`}>
                            {getTypeLabel(intervention.type)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(intervention.date)}
                          </span>
                        </div>
                        {intervention.location && (
                          <div className="text-sm text-gray-600 mb-1">
                            📍 {intervention.location}
                          </div>
                        )}
                        <div className="text-sm text-gray-800">
                          {intervention.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterventionModal;