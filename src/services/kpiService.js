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
        type: 'daily'
      });

      // Transformer pour retourner seulement les revenus
      return chartData.data.map(item => ({
        date: item.date,
        revenue: item.revenue
      })) || [];
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
        type: 'daily'
      });

      // Transformer pour retourner seulement le nombre de courses
      return chartData.data.map(item => ({
        date: item.date,
        count: item.count
      })) || [];
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
      // Pour la distribution des paiements, on récupère toutes les courses
      // et on groupe par mode de paiement
      const trips = await tripsService.getTrips(options);
      const paymentDistribution = {};

      trips.courses.forEach(course => {
        const paymentMethod = course.mode_paiement_libelle || 'Non spécifié';
        if (!paymentDistribution[paymentMethod]) {
          paymentDistribution[paymentMethod] = 0;
        }
        paymentDistribution[paymentMethod] += 1;
      });

      return Object.entries(paymentDistribution).map(([method, count]) => ({
        method,
        count
      }));
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
      // Pour les performances des chauffeurs, on récupère toutes les courses
      // et on groupe par chauffeur
      const trips = await tripsService.getTrips(options);
      const driverPerformance = {};

      trips.courses.forEach(course => {
        const driverName = `${course.chauffeur_prenom} ${course.chauffeur_nom}`.trim();
        if (!driverPerformance[driverName]) {
          driverPerformance[driverName] = {
            name: driverName,
            trips: 0,
            revenue: 0
          };
        }
        driverPerformance[driverName].trips += 1;
        driverPerformance[driverName].revenue += course.prix_course || 0;
      });

      return Object.values(driverPerformance);
    } catch (error) {
      console.error('Erreur lors de la récupération des performances des chauffeurs:', error);
      return [];
    }
  }
};