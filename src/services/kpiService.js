// Import Dependencies
import { tripsService } from "./tripsService";

/**
 * Service pour calculer et récupérer les KPIs du dashboard
 */
export const kpiService = {
  /**
   * Calcule les KPIs principaux basés sur les données des courses
   */
  async getKPIs(options = {}) {
    try {
      const stats = await tripsService.getTripsStats(options);

      return {
        totalCourses: stats.totalCourses || 0,
        totalRevenue: stats.totalRevenue || 0,
        totalDistance: stats.totalDistance || 0,
        chauffeursActifs: stats.chauffeursActifs || 0,
        vehiculesUtilises: stats.vehiculesUtilises || 0,
        averageEarningsPerTrip: stats.averageEarningsPerTrip || 0,
        averageDistancePerTrip: stats.averageDistancePerTrip || 0,
      };
    } catch (error) {
      console.error('Erreur lors du calcul des KPIs:', error);
      // Propager l'erreur avec un message spécifique pour les KPIs
      throw new Error(`Erreur lors du calcul des indicateurs de performance: ${error.message}`);
    }
  },

  /**
   * Récupère les données pour le graphique des revenus quotidiens
   */
  async getDailyRevenues(options = {}) {
    try {
      const chartData = await tripsService.getTripsChartData({
        ...options,
        type: 'dailyRevenues'
      });

      // Transformer pour retourner seulement les revenus
      return chartData.data.map(item => ({
        date: item.date,
        revenue: parseFloat(item.revenue) || 0
      })) || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des revenus quotidiens:', error);
      throw new Error(`Erreur lors de la récupération des données de revenus quotidiens: ${error.message}`);
    }
  },

  /**
   * Récupère les données pour le graphique du nombre de courses quotidiennes
   */
  async getDailyTripsCount(options = {}) {
    try {
      const chartData = await tripsService.getTripsChartData({
        ...options,
        type: 'dailyTripsCount'
      });

      // Transformer pour retourner seulement le nombre de courses
      return chartData.data.map(item => ({
        date: item.date,
        count: item.count
      })) || [];
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de courses quotidiennes:', error);
      throw new Error(`Erreur lors de la récupération des données de courses quotidiennes: ${error.message}`);
    }
  },

  /**
   * Récupère la distribution des méthodes de paiement
   */
  async getPaymentMethodDistribution(options = {}) {
    try {
      // Pour la distribution des paiements, on récupère toutes les courses
      // et on groupe par mode de paiement
      const tripsResponse = await tripsService.getTrips(options);
      const trips = tripsResponse.data || tripsResponse;
      const paymentDistribution = {};

      if (trips && Array.isArray(trips)) {
        trips.forEach(course => {
          const paymentMethod = course.mode_paiement?.libelle || 'Non spécifié';
          if (!paymentDistribution[paymentMethod]) {
            paymentDistribution[paymentMethod] = 0;
          }
          paymentDistribution[paymentMethod] += 1;
        });
      }

      return Object.entries(paymentDistribution).map(([method, count]) => ({
        method,
        count
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération de la distribution des paiements:', error);
      throw new Error(`Erreur lors de l'analyse des méthodes de paiement: ${error.message}`);
    }
  },

  /**
   * Récupère les performances des chauffeurs
   */
  async getDriverPerformance(options = {}) {
    try {
      const chartData = await tripsService.getTripsChartData({
        ...options,
        type: 'driverPerformance'
      });

      // Transformer les données pour le graphique
      return chartData.data.map(item => ({
        name: item.driver,
        trips: item.trips,
        revenue: parseFloat(item.revenue) || 0
      })) || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des performances des chauffeurs:', error);
      throw new Error(`Erreur lors de l'analyse des performances des chauffeurs: ${error.message}`);
    }
  }
};