import { useState } from 'react';
import { findChauffeurByDate, findVehiculeByChauffeurAndDate } from '../../../../services/adminService';

const RequetesSpecifiques = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [activeQuery, setActiveQuery] = useState(null);

  // État pour la requête chauffeur par date
  const [chauffeurDateQuery, setChauffeurDateQuery] = useState({
    date: '',
    statut: 'ALL'
  });

  // État pour la requête véhicule par chauffeur et date
  const [vehiculeQuery, setVehiculeQuery] = useState({
    chauffeur_id: '',
    date: ''
  });

  const handleChauffeurByDate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setActiveQuery('chauffeur-date');

      const data = await findChauffeurByDate(
        chauffeurDateQuery.date,
        chauffeurDateQuery.statut
      );

      setResults(data);
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setError('Erreur lors de la recherche des chauffeurs');
    } finally {
      setLoading(false);
    }
  };

  const handleVehiculeByChauffeurAndDate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setActiveQuery('vehicule-chauffeur-date');

      const data = await findVehiculeByChauffeurAndDate(
        vehiculeQuery.chauffeur_id,
        vehiculeQuery.date
      );

      setResults(data);
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setError('Erreur lors de la recherche des véhicules');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'ACTIF': return 'bg-green-100 text-green-800';
      case 'INACTIF': return 'bg-red-100 text-red-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Requêtes Spécifiques
        </h1>
        <p className="text-gray-600 mt-1">
          Effectuez des recherches spécifiques sur les chauffeurs et véhicules
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requête: Chauffeurs par date */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Chauffeurs par Date
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Trouvez tous les chauffeurs actifs ou ayant travaillé à une date donnée
          </p>

          <form onSubmit={handleChauffeurByDate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={chauffeurDateQuery.date}
                onChange={(e) => setChauffeurDateQuery({...chauffeurDateQuery, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut des chauffeurs
              </label>
              <select
                value={chauffeurDateQuery.statut}
                onChange={(e) => setChauffeurDateQuery({...chauffeurDateQuery, statut: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIF">Actifs uniquement</option>
                <option value="INACTIF">Inactifs uniquement</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </form>
        </div>

        {/* Requête: Véhicules par chauffeur et date */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Véhicules par Chauffeur et Date
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Trouvez les véhicules utilisés par un chauffeur à une date spécifique
          </p>

          <form onSubmit={handleVehiculeByChauffeurAndDate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Chauffeur *
              </label>
              <input
                type="number"
                value={vehiculeQuery.chauffeur_id}
                onChange={(e) => setVehiculeQuery({...vehiculeQuery, chauffeur_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez l'ID du chauffeur"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={vehiculeQuery.date}
                onChange={(e) => setVehiculeQuery({...vehiculeQuery, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </form>
        </div>
      </div>

      {/* Résultats */}
      {results && (
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Résultats de la Recherche
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {activeQuery === 'chauffeur-date' && `Chauffeurs pour le ${formatDate(chauffeurDateQuery.date)}`}
              {activeQuery === 'vehicule-chauffeur-date' && `Véhicules pour le chauffeur ${vehiculeQuery.chauffeur_id} le ${formatDate(vehiculeQuery.date)}`}
            </p>
          </div>

          {activeQuery === 'chauffeur-date' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom & Prénom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Licence Taxi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenus (jour)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Courses (jour)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((chauffeur) => (
                    <tr key={chauffeur.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {chauffeur.nom} {chauffeur.prenom}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {chauffeur.licence_taxi || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatutColor(chauffeur.statut)}`}>
                          {chauffeur.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(chauffeur.revenus_jour)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {chauffeur.courses_jour || 0}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeQuery === 'vehicule-chauffeur-date' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Immatriculation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marque & Modèle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenus (jour)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Courses (jour)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distance (km)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((vehicule) => (
                    <tr key={vehicule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {vehicule.immatriculation}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vehicule.marque} {vehicule.modele}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatutColor(vehicule.statut)}`}>
                          {vehicule.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(vehicule.revenus_jour)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vehicule.courses_jour || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vehicule.distance_jour || 0} km
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {results.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun résultat trouvé pour cette recherche
            </div>
          )}
        </div>
      )}

      {/* Statistiques générales */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Recherches Disponibles
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• Chauffeurs par date et statut</div>
            <div>• Véhicules par chauffeur et date</div>
            <div>• Revenus et statistiques journalières</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Filtres Disponibles
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• Par date spécifique</div>
            <div>• Par statut (Actif/Inactif)</div>
            <div>• Par chauffeur (ID)</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Métriques Affichées
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• Revenus générés</div>
            <div>• Nombre de courses</div>
            <div>• Distance parcourue</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequetesSpecifiques;