import axios from '../utils/axios.js';

/**
 * Service pour gérer les véhicules
 */

// Récupérer tous les véhicules disponibles
export async function getVehicules() {
  try {
    const response = await axios.get('/vehicules');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    throw error;
  }
}

// Récupérer un véhicule par ID
export async function getVehiculeById(id) {
  try {
    const response = await axios.get(`/vehicules/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du véhicule:', error);
    throw error;
  }
}

// Mettre à jour l'état d'un véhicule
export async function updateVehiculeEtat(id, etat) {
  try {
    const response = await axios.patch(`/vehicules/${id}/etat`, { etat });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'état du véhicule:', error);
    throw error;
  }
}
