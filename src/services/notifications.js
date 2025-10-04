import axios from '../utils/axios.js';

/**
 * Service pour gérer les notifications
 */

// Créer une notification de changement de véhicule
export async function createVehicleChangeNotification(chauffeurId, oldVehicleId, newVehicleId, shiftDate, shiftTime) {
  try {
    const response = await axios.post('/notifications/vehicle-change', {
      chauffeurId,
      oldVehicleId,
      newVehicleId,
      shiftDate,
      shiftTime
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la notification de changement de véhicule:', error);
    throw error;
  }
}