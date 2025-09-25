import axios from '../utils/axios.js';

/**
 * Service pour gérer les chauffeurs
 */

// Récupérer tous les chauffeurs actifs
export async function getChauffeurs() {
  try {
    const response = await axios.get('/chauffeurs');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des chauffeurs:', error);
    throw error;
  }
}

// Récupérer un chauffeur par ID
export async function getChauffeurById(id) {
  try {
    const response = await axios.get(`/chauffeurs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du chauffeur:', error);
    throw error;
  }
}

// Récupérer un chauffeur par utilisateur ID
export async function getChauffeurByUserId(utilisateurId) {
  try {
    const chauffeurs = await getChauffeurs();
    const chauffeur = chauffeurs.find(chauffeur => chauffeur.utilisateur_id === utilisateurId);
    if (!chauffeur) {
      throw new Error('Chauffeur non trouvé');
    }
    return chauffeur;
  } catch (error) {
    console.error('Erreur lors de la récupération du chauffeur par utilisateur:', error);
    throw error;
  }
}

// Créer ou mettre à jour un chauffeur
export async function upsertChauffeur(chauffeurData) {
  try {
    const response = await axios.post('/chauffeurs', chauffeurData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du chauffeur:', error);
    throw error;
  }
}

// Supprimer un chauffeur
export async function deleteChauffeur(chauffeurId) {
  try {
    await axios.delete(`/chauffeurs/${chauffeurId}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du chauffeur:', error);
    throw error;
  }
}

// Activer ou désactiver un chauffeur
export async function toggleChauffeurStatus(chauffeurId, isActive) {
  try {
    const response = await axios.patch(`/chauffeurs/${chauffeurId}/status`, { actif: isActive });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du chauffeur:', error);
    throw error;
  }
}