import { tripsList } from "../trips/data";

// KPIs Calculés
export const kpis = {
  totalCourses: tripsList.length,
  totalRevenue: tripsList.reduce((acc, trip) => acc + trip.earnings, 0),
  totalCommission: tripsList.reduce((acc, trip) => acc + trip.commission, 0),
  chauffeursActifs: new Set(tripsList.map((trip) => trip.driver.id)).size,
  totalDistance: tripsList.reduce((acc, trip) => acc + trip.distance, 0),
  vehiculesUtilises: new Set(tripsList.map((trip) => trip.vehicle?.id)).size,
};

// Données pour graphiques
export const dailyRevenues = Object.values(
  tripsList.reduce((acc, trip) => {
    const date = new Date(trip.start_time).toLocaleDateString();
    if (!acc[date]) acc[date] = { date, earnings: 0 };
    acc[date].earnings += trip.earnings;
    return acc;
  }, {})
);

export const dailyTripsCount = Object.values(
  tripsList.reduce((acc, trip) => {
    const date = new Date(trip.start_time).toLocaleDateString();
    if (!acc[date]) acc[date] = { date, count: 0 };
    acc[date].count += 1;
    return acc;
  }, {})
);
