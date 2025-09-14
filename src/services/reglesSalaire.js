import { apiCall } from './api.js';

/**
 * Service pour gérer les règles de salaire via API
 */

/**
 * Récupère toutes les règles de salaire pour les dropdowns
 * @returns {Promise<Array>} Liste des règles de salaire
 */
export async function getReglesSalaireForDropdown() {
  try {
    const response = await apiCall('/regles-salaire?actif=true&limit=100');
    return response.data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des règles de salaire:', error);
    throw error;
  }
}

/**
 * Récupère toutes les règles de salaire avec pagination et recherche
 * @param {Object} options - Options de requête
 * @param {number} options.page - Page actuelle (défaut: 1)
 * @param {number} options.limit - Nombre d'éléments par page (défaut: 50)
 * @param {string} options.search - Terme de recherche
 * @param {boolean} options.actif - Filtrer par statut actif (défaut: true)
 * @returns {Promise<Object>} Liste des règles de salaire avec pagination
 */
export const getReglesSalaire = async (options = {}) => {
  try {
    const { page = 1, limit = 50, search, actif = true } = options;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      actif: actif.toString()
    });

    if (search) {
      params.append('search', search);
    }

    return await apiCall(`/regles-salaire?${params.toString()}`);
  } catch (error) {
    console.error('Erreur lors de la récupération des règles de salaire:', error);
    throw error;
  }
};

/**
 * Récupère une règle de salaire par son ID
 * @param {number} id - ID de la règle de salaire
 * @returns {Promise<Object>} Règle de salaire
 */
export async function getRegleSalaireById(id) {
  try {
    return await apiCall(`/regles-salaire/${id}`);
  } catch (error) {
    console.error('Erreur lors de la récupération de la règle de salaire:', error);
    throw error;
  }
}

/**
 * Formate une règle de salaire pour l'affichage dans un dropdown
 * @param {Object} regle - Règle de salaire
 * @returns {Object} Règle formatée pour le dropdown
 */
export const formatRegleSalaireForDropdown = (regle) => {
  return {
    value: regle.id,
    label: `${regle.nom} - ${regle.type_regle}`,
    description: regle.description,
    type: regle.type_regle,
    parametres: regle.parametres
  };
};