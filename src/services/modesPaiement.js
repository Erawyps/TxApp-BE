import axios from 'axios';

/**
 * Service pour gérer les modes de paiement via API HTTP
 */

// Récupérer tous les modes de paiement actifs
export async function getModesPaiement() {
  try {
    const response = await axios.get('/api/modes-paiement');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des modes de paiement:', error);
    throw error;
  }
}

// Récupérer un mode de paiement par code
export async function getModePaiementByCode(code) {
  try {
    const response = await axios.get(`/api/modes-paiement/${code}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du mode de paiement:', error);
    throw error;
  }
}
