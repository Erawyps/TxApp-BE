import axios from 'axios';

/**
 * Service pour récupérer toutes les données d'un chauffeur pour new-post-form via API HTTP
 * @param {number} chauffeurId - ID du chauffeur
 * @returns {Object} Données complètes du chauffeur
 */
export async function getChauffeurDataForNewPostForm(chauffeurId) {
  try {
    const response = await axios.get(`/api/chauffeurs/${chauffeurId}/data-for-form`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des données chauffeur:', error);
    throw error;
  }
}

/**
 * Fonction spécifique pour François-José Dubois
 */
export async function getDuboisDataForNewPostForm() {
  try {
    const response = await axios.get('/api/chauffeurs/dubois/data-for-form');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des données Dubois:', error);
    throw error;
  }
}