import { apiCall } from './api.js';

/**
 * Service pour gérer les chauffeurs via API
 */

// Récupérer tous les chauffeurs actifs
export async function getChauffeurs() {
  try {
    return await apiCall('/chauffeurs');
  } catch (error) {
    console.error('Erreur lors de la récupération des chauffeurs:', error);
    throw error;
  }
}

// Récupérer un chauffeur par ID
export async function getChauffeurById(id) {
  try {
    return await apiCall(`/chauffeurs/${id}`);
  } catch (error) {
    console.error('Erreur lors de la récupération du chauffeur:', error);
    throw error;
  }
}

// Récupérer un chauffeur par utilisateur ID
export async function getChauffeurByUserId(utilisateurId) {
  try {
    const chauffeurs = await apiCall('/chauffeurs');
    return chauffeurs.find(chauffeur => chauffeur.utilisateur_id === utilisateurId);
  } catch (error) {
    console.error('Erreur lors de la récupération du chauffeur par utilisateur:', error);
    throw error;
  }
}
