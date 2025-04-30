import { tripsList } from "../trips/data";

// KPIs Calculés basés sur le nouveau schéma
export const kpis = {
  totalCourses: tripsList.length,
  totalRevenue: tripsList.reduce((acc, trip) => acc + trip.prix_final, 0),
  totalDistance: tripsList.reduce((acc, trip) => acc + trip.distance_km, 0),
  chauffeursActifs: new Set(tripsList.map((trip) => trip.chauffeur.id)).size,
  vehiculesUtilises: new Set(tripsList.map((trip) => trip.vehicule.id)).size,
  averageEarningsPerTrip: tripsList.reduce((acc, trip) => acc + trip.prix_final, 0) / tripsList.length,
  averageDistancePerTrip: tripsList.reduce((acc, trip) => acc + trip.distance_km, 0) / tripsList.length,
};

// Données pour graphiques
export const dailyRevenues = Object.values(
  tripsList.reduce((acc, trip) => {
    const date = new Date(trip.heure_embarquement).toLocaleDateString();
    if (!acc[date]) acc[date] = { date, earnings: 0 };
    acc[date].earnings += trip.prix_final;
    return acc;
  }, {})
);

export const dailyTripsCount = Object.values(
  tripsList.reduce((acc, trip) => {
    const date = new Date(trip.heure_embarquement).toLocaleDateString();
    if (!acc[date]) acc[date] = { date, count: 0 };
    acc[date].count += 1;
    return acc;
  }, {})
);

export const paymentMethodDistribution = Object.values(
  tripsList.reduce((acc, trip) => {
    const method = trip.mode_paiement;
    if (!acc[method]) acc[method] = { name: method, value: 0 };
    acc[method].value += 1;
    return acc;
  }, {})
);

export const driverPerformance = Object.values(
  tripsList.reduce((acc, trip) => {
    const driverId = trip.chauffeur.id;
    if (!acc[driverId]) {
      acc[driverId] = {
        name: trip.chauffeur.nom,
        trips: 0,
        revenue: 0,
        distance: 0,
      };
    }
    acc[driverId].trips += 1;
    acc[driverId].revenue += trip.prix_final;
    acc[driverId].distance += trip.distance_km;
    return acc;
  }, {})
).map(driver => ({
  ...driver,
  avgRevenuePerTrip: driver.revenue / driver.trips,
  avgDistancePerTrip: driver.distance / driver.trips,
}));