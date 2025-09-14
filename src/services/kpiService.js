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
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        totalCourses: 0,
        totalRevenue: 0,
        totalDistance: 0,
        chauffeursActifs: 0,
        vehiculesUtilises: 0,
        averageEarningsPerTrip: 0,
        averageDistancePerTrip: 0,
      };
    }
  },

  /**
   * Récupère les données pour le graphique des revenus quotidiens
   */
  async getDailyRevenues(options = {}) {
    try {
      const chartData = await tripsService.getTripsChartData({
        ...options,
        type: 'daily-revenue'
      });

      return chartData.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des revenus quotidiens:', error);
      return [];
    }
  },

  /**
   * Récupère les données pour le graphique du nombre de courses quotidiennes
   */
  async getDailyTripsCount(options = {}) {
    try {
      const chartData = await tripsService.getTripsChartData({
        ...options,
        type: 'trips-count'
      });

      return chartData.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de courses quotidiennes:', error);
      return [];
    }
  },

  /**
   * Récupère la distribution des méthodes de paiement
   */
  async getPaymentMethodDistribution(options = {}) {
    try {
      const chartData = await tripsService.getTripsChartData({
        ...options,
        type: 'payment-methods'
      });

      return chartData.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de la distribution des paiements:', error);
      return [];
    }
  },

  /**
   * Récupère les performances des chauffeurs
   */
  async getDriverPerformance(options = {}) {
    try {
      const chartData = await tripsService.getTripsChartData({
        ...options,
        type: 'driver-performance'
      });

      return chartData.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des performances des chauffeurs:', error);
      return [];
    }
  }
};