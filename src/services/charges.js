import { apiCall } from './api.js';

/**
 * Service pour gérer les charges/dépenses via API
 */

// Récupérer les charges d'une feuille de route
export async function getCharges(feuilleRouteId) {
  try {
    return await apiCall(`/charges?feuilleRouteId=${feuilleRouteId}`);
  } catch (error) {
    console.error('Erreur lors de la récupération des charges:', error);
    throw error;
  }
}

// Créer une nouvelle charge
export async function createCharge(chargeData) {
  try {
    return await apiCall('/charges', {
      method: 'POST',
      body: chargeData
    });
  } catch (error) {
    console.error('Erreur lors de la création de la charge:', error);
    throw error;
  }
}

// Mettre à jour une charge
export async function updateCharge(id, chargeData) {
  try {
    return await apiCall(`/charges/${id}`, {
      method: 'PUT',
      body: chargeData
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la charge:', error);
    throw error;
  }
}

// Supprimer une charge
export async function deleteCharge(id) {
  try {
    await apiCall(`/charges/${id}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la charge:', error);
    throw error;
  }
}
