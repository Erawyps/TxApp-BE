import axios from '../utils/axios.js';

/**
 * Service d'authentification qui utilise l'API backend au lieu de Prisma directement
 * Prisma sera utilisé uniquement côté serveur (Cloudflare Worker)
 */
export class AuthService {
  /**
   * Authentifie un utilisateur avec email et mot de passe
   */
  static async login(email, password) {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erreur de connexion');
    }
  }

  /**
   * Crée un nouvel utilisateur
   */
  static async register(userData) {
    try {
      const response = await axios.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erreur d\'inscription');
    }
  }

  /**
   * Récupère le profil utilisateur à partir du token stocké
   */
  static async getProfile() {
    try {
      const response = await axios.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erreur de récupération du profil');
    }
  }

  /**
   * Met à jour le profil utilisateur
   */
  static async updateProfile(updateData) {
    try {
      const response = await axios.put('/users/profile', updateData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erreur de mise à jour');
    }
  }

  /**
   * Réinitialise le mot de passe
   */
  static async resetPassword(email) {
    try {
      const response = await axios.post('/auth/reset-password', { email });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erreur de réinitialisation');
    }
  }

  /**
   * Confirme la réinitialisation du mot de passe
   */
  static async confirmPasswordReset(resetToken, newPassword) {
    try {
      const response = await axios.post('/auth/confirm-reset', {
        resetToken,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la confirmation de réinitialisation:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erreur de confirmation');
    }
  }

  /**
   * Vérifie la validité du token
   */
  static async verifyToken() {
    try {
      const response = await axios.get('/auth/verify');
      return response.data;
    } catch (error) {
      console.error('Token invalide:', error);
      return { valid: false };
    }
  }
}

export default AuthService;
