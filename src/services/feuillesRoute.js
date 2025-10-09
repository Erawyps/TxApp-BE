import axios from '../utils/axios.js';

/**
 * Service pour gérer les feuilles de route via API dashboard
 */

// Créer une nouvelle feuille de route
export async function createFeuilleRoute(data) {
  try {
    const response = await axios.post('/dashboard/feuilles-route', data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la feuille de route:', error);
    throw error;
  }
}

// Mettre à jour une feuille de route
export async function updateFeuilleRoute(id, data) {
  try {
    console.log('🔧 updateFeuilleRoute - Service appelé avec:', { id, data });
    
    // Utiliser l'endpoint dashboard de mise à jour
    const response = await axios.put(`/dashboard/feuilles-route/${id}`, data);
    
    console.log('✅ updateFeuilleRoute - Réponse API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la feuille de route:', error);
    throw error;
  }
}

// Terminer une feuille de route (alias pour updateFeuilleRoute)
export async function endFeuilleRoute(id, data) {
  try {
    console.log('🔧 endFeuilleRoute - Service appelé avec:', { id, data });

    // ✅ CORRECTION: Respecter la valeur de est_validee passée en paramètre
    // au lieu de la forcer à true
    const endData = {
      ...data
    };

    return await updateFeuilleRoute(id, endData);
  } catch (error) {
    console.error('Erreur lors de la finalisation de la feuille de route:', error);
    throw error;
  }
}

// Récupérer la feuille de route active pour un chauffeur (la plus récente)
export async function getActiveFeuilleRoute(chauffeurId) {
  try {
    const response = await axios.get(`/dashboard/feuilles-route/active/${chauffeurId}`);
    const feuilleRoute = response.data;

    if (!feuilleRoute) {
      console.log('🔍 getActiveFeuilleRoute - Aucune feuille active trouvée pour chauffeur:', chauffeurId);
      return null;
    }

    console.log('✅ getActiveFeuilleRoute - Feuille active trouvée:', {
      id: feuilleRoute.feuille_id,
      date: feuilleRoute.date_service,
      chauffeur: feuilleRoute.chauffeur_id,
      est_validee: feuilleRoute.est_validee
    });

    return feuilleRoute;
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
