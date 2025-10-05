import axios from '../utils/axios.js';

/**
 * Service pour récupérer les statistiques d'un chauffeur via API HTTP
 */

/**
 * Récupère les statistiques d'un chauffeur pour une période donnée
 * @param {number} chauffeurId - ID du chauffeur
 * @param {string} startDate - Date de début (YYYY-MM-DD)
 * @param {string} endDate - Date de fin (YYYY-MM-DD)
 * @returns {Promise<Object>} Statistiques du chauffeur
 */
export async function fetchChauffeurStats(chauffeurId, startDate = null, endDate = null) {
  try {
    let url = `/api/chauffeurs/${chauffeurId}/stats`;
    const params = [];

    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques chauffeur:', error);
    throw error;
  }
}

/**
 * Récupère les interventions d'un chauffeur
 * @param {number} chauffeurId - ID du chauffeur
 * @returns {Promise<Array>} Liste des interventions
 */
export async function fetchChauffeurInterventions(chauffeurId) {
  try {
    const response = await axios.get(`/api/chauffeurs/${chauffeurId}/interventions`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des interventions chauffeur:', error);
    throw error;
  }
}

/**
 * Crée une nouvelle intervention pour un chauffeur
 * @param {Object} interventionData - Données de l'intervention
 * @returns {Promise<Object>} Intervention créée
 */
export async function createIntervention(interventionData) {
  try {
    const response = await axios.post('/api/interventions', interventionData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'intervention:', error);
    throw error;
  }
}