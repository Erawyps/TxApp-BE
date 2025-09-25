// Import Dependencies
import axios from 'axios';

/**
 * Service pour récupérer les données des courses depuis l'API HTTP
 */
export const tripsService = {
  /**
   * Récupère toutes les courses avec pagination et filtres
   */
  async getTrips(options = {}) {
    const {
      page = 1,
      limit = 50,
      search,
      status,
      dateFrom,
      dateTo,
      chauffeurId,
      clientId
    } = options;

    try {
      let url = `/api/courses?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status) url += `&status=${encodeURIComponent(status)}`;
      if (dateFrom) url += `&dateFrom=${encodeURIComponent(dateFrom)}`;
      if (dateTo) url += `&dateTo=${encodeURIComponent(dateTo)}`;
      if (chauffeurId) url += `&chauffeurId=${chauffeurId}`;
      if (clientId) url += `&clientId=${clientId}`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des courses:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques des courses pour les KPIs
   */
  async getTripsStats(options = {}) {
    const { dateFrom, dateTo, chauffeurId } = options;

    try {
      let url = '/api/courses/stats';
      const params = [];
      if (dateFrom) params.push(`dateFrom=${encodeURIComponent(dateFrom)}`);
      if (dateTo) params.push(`dateTo=${encodeURIComponent(dateTo)}`);
      if (chauffeurId) params.push(`chauffeurId=${chauffeurId}`);
      if (params.length > 0) url += '?' + params.join('&');

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  /**
   * Récupère les données pour les graphiques
   */
  async getTripsChartData(options = {}) {
    const { dateFrom, dateTo, type = 'daily' } = options;

    try {
      let url = `/api/courses/chart?type=${type}`;
      if (dateFrom) url += `&dateFrom=${encodeURIComponent(dateFrom)}`;
      if (dateTo) url += `&dateTo=${encodeURIComponent(dateTo)}`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de graphique:', error);
      throw error;
    }
  }
};