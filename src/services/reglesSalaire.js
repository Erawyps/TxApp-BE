import axios from '../utils/axios.js';

/**
 * Service pour gérer les règles de salaire avec routes dashboard
 */

// Récupérer toutes les règles de salaire pour dropdown
export async function getReglesSalaireForDropdown() {
  try {
    const response = await axios.get('/dashboard/regles-salaire');
    return response.data;
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

    let url = `/api/regles-salaire?page=${page}&limit=${limit}&actif=${actif}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const response = await axios.get(url);
    return response.data;
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
    const response = await axios.get(`/api/regles-salaire/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la règle de salaire:', error);
    throw error;
  }
}/**
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