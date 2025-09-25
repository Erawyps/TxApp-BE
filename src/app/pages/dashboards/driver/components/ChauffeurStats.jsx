import { useState, useEffect } from 'react';
import { fetchChauffeurStats } from 'services/chauffeurStats';

const ChauffeurStats = ({ chauffeurId, startDate = null, endDate = null }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!chauffeurId) return;

      try {
        setLoading(true);
        setError(null);
        const statsData = await fetchChauffeurStats(chauffeurId, startDate, endDate);
        setStats(statsData);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [chauffeurId, startDate, endDate]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500 text-sm">Aucune statistique disponible</div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num || 0);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Statistiques Chauffeur
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ratio €/km */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-blue-600">Ratio €/km</div>
              <div className="text-2xl font-bold text-blue-900">
                {stats.ratioEuroParKm ? `${stats.ratioEuroParKm.toFixed(2)} €/km` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11M9 11h6" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-green-600">Total Courses</div>
              <div className="text-2xl font-bold text-green-900">
                {formatNumber(stats.totalCourses)}
              </div>
            </div>
          </div>
        </div>

        {/* Total Kilomètres */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-purple-600">Kilomètres Parcourus</div>
              <div className="text-2xl font-bold text-purple-900">
                {formatNumber(stats.totalKilometres)} km
              </div>
            </div>
          </div>
        </div>

        {/* Total Recettes */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-yellow-600">Total Recettes</div>
              <div className="text-2xl font-bold text-yellow-900">
                {formatCurrency(stats.totalRecettes)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Détails supplémentaires */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-500">Courses Terminées</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatNumber(stats.coursesTerminees)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Courses Annulées</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatNumber(stats.coursesAnnulees)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Moyenne par Course</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(stats.moyenneParCourse)}
          </div>
        </div>
      </div>

      {/* Période */}
      {(startDate || endDate) && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Période: {startDate || 'Début'} - {endDate || 'Aujourd\'hui'}
        </div>
      )}
    </div>
  );
};

export default ChauffeurStats;