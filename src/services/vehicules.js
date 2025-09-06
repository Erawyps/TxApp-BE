import { apiCall } from './api.js';

/**
 * Service pour gérer les véhicules via API
 */

// Récupérer tous les véhicules disponibles
export async function getVehicules() {
  try {
    return await apiCall('/vehicules');
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    throw error;
  }
}

// Récupérer un véhicule par ID
export async function getVehiculeById(id) {
  try {
    return await apiCall(`/vehicules/${id}`);
  } catch (error) {
    console.error('Erreur lors de la récupération du véhicule:', error);
    throw error;
  }
}

// Mettre à jour l'état d'un véhicule
export async function updateVehiculeEtat(id, etat) {
  try {
    return await apiCall(`/vehicules/${id}`, {
      method: 'PUT',
      body: { etat }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'état du véhicule:', error);
    throw error;
  }
}
