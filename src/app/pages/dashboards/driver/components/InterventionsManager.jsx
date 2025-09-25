import { useState, useEffect } from 'react';
import { fetchChauffeurInterventions, createIntervention } from 'services/chauffeurStats';

const InterventionsManager = ({ chauffeurId }) => {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIntervention, setNewIntervention] = useState({
    type: 'police',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: ''
  });

  useEffect(() => {
    const loadInterventions = async () => {
      if (!chauffeurId) return;

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
    };

    loadInterventions();
  }, [chauffeurId]);

  const handleCreateIntervention = async (e) => {
    e.preventDefault();

    try {
      const interventionData = {
        chauffeurId: parseInt(chauffeurId),
        type: newIntervention.type,
        description: newIntervention.description,
        date: newIntervention.date,
        location: newIntervention.location,
        createdBy: 'system' // À adapter selon le système d'authentification
      };

      await createIntervention(interventionData);

      // Recharger les interventions
      const updatedInterventions = await fetchChauffeurInterventions(chauffeurId);
      setInterventions(updatedInterventions || []);

      // Réinitialiser le formulaire
      setNewIntervention({
        type: 'police',
        description: '',
        date: new Date().toISOString().split('T')[0],
        location: ''
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Erreur lors de la création de l\'intervention:', err);
      setError('Erreur lors de la création de l\'intervention');
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Interventions & Contrôles
        </h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? 'Annuler' : 'Ajouter Intervention'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Formulaire de création */}
      {showCreateForm && (
        <form onSubmit={handleCreateIntervention} className="mb-6 p-4 bg-gray-50 rounded-lg">
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

          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Créer
            </button>
          </div>
        </form>
      )}

      {/* Liste des interventions */}
      <div className="space-y-3">
        {interventions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune intervention enregistrée
          </div>
        ) : (
          interventions.map((intervention) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default InterventionsManager;