import axios from 'axios';

/**
 * Service pour gérer les charges/dépenses via API HTTP
 */

// Récupérer les charges d'une feuille de route
export async function getCharges(feuilleRouteId) {
  try {
    const response = await axios.get(`/api/charges?feuille_route_id=${feuilleRouteId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des charges:', error);
    throw error;
  }
}

// Créer une nouvelle charge
export async function createCharge(chargeData) {
  try {
    const response = await axios.post('/api/charges', chargeData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la charge:', error);
    throw error;
  }
}

// Mettre à jour une charge
export async function updateCharge(id, chargeData) {
  try {
    const response = await axios.put(`/api/charges/${id}`, chargeData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la charge:', error);
    throw error;
  }
}

// Supprimer une charge
export async function deleteCharge(id) {
  try {
    await axios.delete(`/api/charges/${id}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la charge:', error);
    throw error;
  }
}
