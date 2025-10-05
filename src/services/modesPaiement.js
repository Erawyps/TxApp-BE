import axios from '../utils/axios.js';

/**
 * Service pour gérer les modes de paiement avec routes dashboard
 */

// Récupérer tous les modes de paiement actifs
export async function getModesPaiement() {
  try {
    const response = await axios.get('/dashboard/modes-paiement');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des modes de paiement:', error);
    throw error;
  }
}

// Récupérer un mode de paiement par ID
export async function getModePaiementById(id) {
  try {
    const response = await axios.get(`/dashboard/modes-paiement/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du mode de paiement:', error);
    throw error;
  }
}

// Récupérer un mode de paiement par code
export async function getModePaiementByCode(code) {
  try {
    const response = await axios.get(`/dashboard/modes-paiement/${code}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du mode de paiement:', error);
    throw error;
  }
}
