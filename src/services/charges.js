import axios from '../utils/axios.js';

/**
 * Service pour gérer les charges avec routes dashboard
 */

// Récupérer toutes les charges
export async function getCharges(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.feuilleRouteId) {
      params.append('feuilleRouteId', filters.feuilleRouteId);
    }
    if (filters.chauffeurId) {
      params.append('chauffeurId', filters.chauffeurId);
    }
    
    const url = `/dashboard/charges${params.toString() ? '?' + params.toString() : ''}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des charges:', error);
    throw error;
  }
}

// Créer une nouvelle charge
export async function createCharge(chargeData) {
  try {
    const response = await axios.post('/dashboard/charges', chargeData);
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
