import { apiCall } from './api.js';

/**
 * Service pour gérer les modes de paiement via API
 */

// Récupérer tous les modes de paiement actifs
export async function getModesPaiement() {
  try {
    return await apiCall('/modes-paiement');
  } catch (error) {
    console.error('Erreur lors de la récupération des modes de paiement:', error);
    throw error;
  }
}

// Récupérer un mode de paiement par code
export async function getModePaiementByCode(code) {
  try {
    const modes = await apiCall('/modes-paiement');
    return modes.find(mode => mode.code === code);
  } catch (error) {
    console.error('Erreur lors de la récupération du mode de paiement:', error);
    throw error;
  }
}
