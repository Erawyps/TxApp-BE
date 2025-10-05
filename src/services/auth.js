import axios from '../utils/axios.js';

/**
 * Service d'authentification pour TxApp
 * Utilise l'API backend Hono avec Prisma
 */

/**
 * Connexion d'un utilisateur
 * @param {string} username - Email de l'utilisateur (utilisé comme username)
 * @param {string} password - Mot de passe
 * @returns {Promise<{user: Object, token: string}>}
 */
export const loginUser = async (username, password) => {
  try {
    // Utiliser l'API backend au lieu de Supabase
    const response = await axios.post('/auth/login', {
      username: username, // L'API attend 'username' pas 'email'
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erreur de connexion');
    }

    return {
      user: response.data.user,
      token: response.data.token,
      success: true
    };
  } catch (error) {
    console.error('Erreur loginUser:', error);

    // Gérer les erreurs de l'API
    if (error.response) {
      // Erreur de l'API (400, 401, 500, etc.)
      const errorMessage = error.response.data?.error || 'Erreur de connexion';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Erreur réseau
      throw new Error('Erreur de connexion réseau');
    } else {
      // Autre erreur
      throw new Error(error.message || 'Erreur inconnue');
    }
  }
};

/**
 * Récupérer le profil utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<Object>}
 */
export const getUserProfile = async (userId) => {
  try {
    // Utiliser l'API backend pour récupérer le profil
    const response = await axios.get(`/utilisateurs/${userId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erreur getUserProfile:', error);
    throw new Error('Erreur lors de la récupération du profil utilisateur');
  }
};

/**
 * Vérifier la validité d'un token
 * @param {string} token - Token JWT
 * @returns {Promise<Object>}
 */
export const verifyToken = async (token) => {
  try {
    const response = await axios.post('/auth/verify', {
      token
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Token invalide');
    }

    return response.data;
  } catch (error) {
    console.error('Erreur verifyToken:', error);
    throw new Error('Token invalide');
  }
};

/**
 * Créer un nouvel utilisateur
 * @param {Object} userData - Données de l'utilisateur
 * @returns {Promise<Object>}
 */
export const createUser = async (userData) => {
  try {
    const response = await axios.post('/utilisateurs', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erreur createUser:', error);
    throw new Error('Erreur lors de la création de l\'utilisateur');
  }
};

/**
 * Changer le mot de passe
 * @param {Object} passwordData - Données du changement de mot de passe
 * @returns {Promise<Object>}
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await axios.post('/auth/change-password', passwordData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erreur changePassword:', error);
    throw new Error('Erreur lors du changement de mot de passe');
  }
};

/**
 * Mettre à jour le profil utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>}
 */
export const updateUserProfile = async (userId, updateData) => {
  try {
    const response = await axios.put(`/utilisateurs/${userId}`, updateData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erreur updateUserProfile:', error);
    throw new Error('Erreur lors de la mise à jour du profil');
  }
};
