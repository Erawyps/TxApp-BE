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
    const response = await apiCall('/chauffeurs');
    const chauffeur = response.data.find(chauffeur => chauffeur.utilisateur_id === utilisateurId);
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
    let chauffeur;
    if (chauffeurData.id) {
      // Mise à jour
      chauffeur = await apiCall(`/chauffeurs/${chauffeurData.id}`, {
        method: 'PUT',
        body: chauffeurData
      });
    } else {
      // Création
      chauffeur = await apiCall('/chauffeurs', {
        method: 'POST',
        body: chauffeurData
      });
    }
    return chauffeur;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du chauffeur:', error);
    throw error;
  }
}

// Supprimer un chauffeur
export async function deleteChauffeur(chauffeurId) {
  try {
    await apiCall(`/chauffeurs/${chauffeurId}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du chauffeur:', error);
    throw error;
  }
}

// Activer ou désactiver un chauffeur
export async function toggleChauffeurStatus(chauffeurId, isActive) {
  try {
    const updatedChauffeur = await apiCall(`/chauffeurs/${chauffeurId}/status`, {
      method: 'PATCH',
      body: { actif: isActive }
    });
    return updatedChauffeur;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du chauffeur:', error);
    throw error;
  }
}