// Import Dependencies
import { kpiService } from "services/kpiService";

// Fonction pour récupérer les KPIs depuis la base de données
export const getKPIs = async (options = {}) => {
  return await kpiService.getKPIs(options);
};

// Fonction pour récupérer les données des graphiques
export const getChartData = async (type, options = {}) => {
  switch (type) {
    case 'dailyRevenues':
      return await kpiService.getDailyRevenues(options);
    case 'dailyTripsCount':
      return await kpiService.getDailyTripsCount(options);
    case 'paymentMethodDistribution':
      return await kpiService.getPaymentMethodDistribution(options);
    case 'driverPerformance':
      return await kpiService.getDriverPerformance(options);
    default:
      return [];
  }
};

// Valeurs par défaut pour l'initialisation
export const defaultKPIs = {
  totalCourses: 0,
  totalRevenue: 0,
  totalDistance: 0,
  chauffeursActifs: 0,
  vehiculesUtilises: 0,
  averageEarningsPerTrip: 0,
  averageDistancePerTrip: 0,
};