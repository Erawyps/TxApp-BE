import { apiCall } from './api.js';

/**
 * Service pour gérer les feuilles de route via API
 */

// Créer une nouvelle feuille de route
export async function createFeuilleRoute(data) {
  try {
    return await apiCall('/feuilles-route', {
      method: 'POST',
      body: data
    });
  } catch (error) {
    console.error('Erreur lors de la création de la feuille de route:', error);
    throw error;
  }
}

// Terminer une feuille de route
export async function endFeuilleRoute(id, data) {
  try {
    return await apiCall(`/feuilles-route/${id}/end`, {
      method: 'PUT',
      body: data
    });
  } catch (error) {
    console.error('Erreur lors de la finalisation de la feuille de route:', error);
    throw error;
  }
}

// Récupérer la feuille de route active pour un chauffeur
export async function getActiveFeuilleRoute(chauffeurId) {
  try {
    return await apiCall(`/feuilles-route/active/${chauffeurId}`);
  } catch (error) {
    console.error('Erreur lors de la récupération de la feuille de route active:', error);
    throw error;
  }
}

// Récupérer l'historique des feuilles de route
export async function getFeuillesRouteHistory(chauffeurId, limit = 10) {
  try {
    return await apiCall(`/feuilles-route/history/${chauffeurId}?limit=${limit}`);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    throw error;
  }
}
