import axios from 'axios';

/**
 * Service pour gérer les feuilles de route via API HTTP
 */

// Créer une nouvelle feuille de route
export async function createFeuilleRoute(data) {
  try {
    const response = await axios.post('/api/feuilles-route', data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la feuille de route:', error);
    throw error;
  }
}

// Terminer une feuille de route
export async function endFeuilleRoute(id, data) {
  try {
    const response = await axios.put(`/api/feuilles-route/${id}/end`, data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la finalisation de la feuille de route:', error);
    throw error;
  }
}

// Récupérer la feuille de route active pour un chauffeur (la plus récente)
export async function getActiveFeuilleRoute(chauffeurId) {
  try {
    const response = await axios.get(`/api/chauffeurs/${chauffeurId}/feuilles-route`);
    const feuilles = response.data;

    // Retourner la feuille la plus récente (par date_service)
    if (feuilles && feuilles.length > 0) {
      const sortedFeuilles = feuilles.sort((a, b) => new Date(b.date_service) - new Date(a.date_service));
      return sortedFeuilles[0];
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la feuille de route active:', error);
    throw error;
  }
}

// Récupérer l'historique des feuilles de route
export async function getFeuillesRouteHistory(chauffeurId, limit = 10) {
  try {
    const response = await axios.get(`/api/feuilles-route/history/${chauffeurId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    throw error;
  }
}
