// Import Dependencies
import axios from '../utils/axios.js';

/**
 * Service pour récupérer les données des courses depuis l'API HTTP
 */
export const tripsService = {
  /**
   * Récupère la liste des courses avec pagination et filtres
   */
  async getTrips(page = 1, limit = 50, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      // Utiliser la route dashboard qui supporte le filtrage par chauffeur
      const response = await axios.get(`/dashboard/courses?${params}`);

      // La route dashboard retourne un format différent avec .data
      const coursesData = response.data.data || response.data.courses || [];
      const totalCount = response.data.count || coursesData.length;

      return {
        data: coursesData,
        pagination: response.data.pagination || {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des courses:', error);

      if (error.response) {
        // Erreur de réponse du serveur
        const status = error.response.status;
        const message = error.response.data?.error || error.response.data?.message || 'Erreur serveur';

        switch (status) {
          case 400:
            throw new Error(`Données invalides: ${message}`);
          case 401:
            throw new Error('Authentification requise pour accéder aux courses');
          case 403:
            throw new Error('Accès refusé aux données des courses');
          case 404:
            throw new Error('Service de courses non trouvé');
          case 500:
            throw new Error('Erreur interne du serveur lors de la récupération des courses');
          default:
            throw new Error(`Erreur serveur (${status}): ${message}`);
        }
      } else if (error.request) {
        // Erreur de réseau
        throw new Error('Erreur de connexion réseau lors de la récupération des courses');
      } else {
        // Erreur inconnue
        throw new Error(`Erreur inattendue: ${error.message}`);
      }
    }
  },

  /**
   * Récupère les statistiques des courses pour les KPIs
   */
  async getTripsStats(options = {}) {
    const { dateFrom, dateTo, chauffeurId } = options;

    try {
      let url = '/dashboard/courses/stats';
      const params = [];
      if (dateFrom) params.push(`dateFrom=${encodeURIComponent(dateFrom)}`);
      if (dateTo) params.push(`dateTo=${encodeURIComponent(dateTo)}`);
      if (chauffeurId) params.push(`chauffeurId=${chauffeurId}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      console.log('📊 Fetching stats from:', url);
      const response = await axios.get(url);
      console.log('📊 Stats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Gestion spécifique des erreurs
      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 401:
            throw new Error('Authentification requise pour accéder aux statistiques');
          case 403:
            throw new Error('Accès non autorisé aux statistiques');
          case 404:
            throw new Error('Service de statistiques non trouvé');
          case 500:
            throw new Error('Erreur lors du calcul des statistiques');
          default:
            throw new Error(`Erreur serveur (${status}) lors de la récupération des statistiques`);
        }
      } else if (error.request) {
        throw new Error('Erreur de connexion réseau - impossible de récupérer les statistiques');
      } else {
        throw new Error('Erreur inconnue lors de la récupération des statistiques');
      }
    }
  },

  /**
   * Récupère les données pour les graphiques
   */
  async getTripsChartData(options = {}) {
    const { dateFrom, dateTo, type = 'daily' } = options;

    try {
      let url = `/dashboard/courses/chart-data?type=${type}`;
      if (dateFrom) url += `&dateFrom=${encodeURIComponent(dateFrom)}`;
      if (dateTo) url += `&dateTo=${encodeURIComponent(dateTo)}`;

      console.log('📈 Fetching chart data from:', url);
      const response = await axios.get(url);
      console.log('📈 Chart response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données de graphique:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        type
      });

      // Gestion spécifique des erreurs
      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 400:
            throw new Error(`Type de graphique invalide: ${type}`);
          case 401:
            throw new Error('Authentification requise pour accéder aux graphiques');
          case 403:
            throw new Error('Accès non autorisé aux données de graphiques');
          case 404:
            throw new Error('Service de graphiques non trouvé');
          case 500:
            throw new Error('Erreur lors du calcul des données de graphique');
          default:
            throw new Error(`Erreur serveur (${status}) lors de la récupération des graphiques`);
        }
      } else if (error.request) {
        throw new Error('Erreur de connexion réseau - impossible de récupérer les graphiques');
      } else {
        throw new Error('Erreur inconnue lors de la récupération des données de graphique');
      }
    }
  }
};