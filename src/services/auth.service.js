/**
 * Service d'authentification pour TxApp - Production Ready
 * Gère la connexion, inscription, déconnexion et gestion des tokens
 */

import {
  JWT_HOST_API,
  TOKEN_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  AUTH_ENDPOINTS,
  AUTH_ERRORS,
  SECURITY_CONFIG
} from '../configs/auth.config.js';

class AuthService {
  constructor() {
    this.baseURL = JWT_HOST_API;
    this.tokenKey = TOKEN_STORAGE_KEY;
    this.sessionKey = SESSION_STORAGE_KEY;
    this.loginAttempts = 0;
    this.lockoutTime = null;
  }

  /**
   * Effectuer une requête HTTP avec gestion d'erreurs
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur de connexion' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur API ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Vérifier si le compte est verrouillé
   */
  isAccountLocked() {
    if (this.lockoutTime && Date.now() < this.lockoutTime) {
      return true;
    }
    if (this.lockoutTime && Date.now() >= this.lockoutTime) {
      this.lockoutTime = null;
      this.loginAttempts = 0;
    }
    return false;
  }

  /**
   * Gérer les tentatives de connexion échouées
   */
  handleFailedLogin() {
    this.loginAttempts++;
    if (this.loginAttempts >= SECURITY_CONFIG.maxLoginAttempts) {
      this.lockoutTime = Date.now() + SECURITY_CONFIG.lockoutDuration;
    }
  }

  /**
   * Réinitialiser les tentatives de connexion
   */
  resetLoginAttempts() {
    this.loginAttempts = 0;
    this.lockoutTime = null;
  }

  /**
   * Connexion utilisateur
   */
  async login(credentials) {
    if (this.isAccountLocked()) {
      const remainingTime = Math.ceil((this.lockoutTime - Date.now()) / 60000);
      throw new Error(`${AUTH_ERRORS.ACCOUNT_LOCKED}. Réessayez dans ${remainingTime} minutes.`);
    }

    try {
      const response = await this.makeRequest(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: credentials
      });

      if (response.success) {
        this.setToken(response.token);
        this.setUser(response.user);
        this.resetLoginAttempts();

        // Enregistrer l'heure de connexion
        this.setSessionData({
          loginTime: Date.now(),
          lastActivity: Date.now()
        });

        return response;
      } else {
        this.handleFailedLogin();
        throw new Error(response.error || AUTH_ERRORS.INVALID_CREDENTIALS);
      }
    } catch (error) {
      this.handleFailedLogin();
      throw error;
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(userData) {
    // Validation côté client
    if (!userData.email || !userData.password) {
      throw new Error('Email et mot de passe requis');
    }

    if (userData.password.length < SECURITY_CONFIG.passwordMinLength) {
      throw new Error(`Le mot de passe doit contenir au moins ${SECURITY_CONFIG.passwordMinLength} caractères`);
    }

    const response = await this.makeRequest(AUTH_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: userData
    });

    return response;
  }

  /**
   * Déconnexion utilisateur
   */
  async logout() {
    try {
      // Notifier le serveur de la déconnexion
      await this.makeRequest(AUTH_ENDPOINTS.LOGOUT, {
        method: 'POST'
      });
    } catch (error) {
      console.warn('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      // Nettoyer les données locales même si la requête serveur échoue
      this.clearToken();
      this.clearUser();
      this.clearSessionData();
      this.resetLoginAttempts();
    }
  }

  /**
   * Vérifier la validité du token
   */
  async verifyToken() {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      const response = await this.makeRequest(AUTH_ENDPOINTS.VERIFY);

      if (response.success) {
        this.setUser(response.user);
        this.updateLastActivity();
        return true;
      } else {
        this.clearAuth();
        return false;
      }
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      this.clearAuth();
      return false;
    }
  }

  /**
   * Rafraîchir le token
   */
  async refreshToken() {
    try {
      const response = await this.makeRequest(AUTH_ENDPOINTS.REFRESH, {
        method: 'POST'
      });

      if (response.success) {
        this.setToken(response.token);
        return response.token;
      } else {
        throw new Error(response.error || 'Impossible de rafraîchir le token');
      }
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(passwordData) {
    const response = await this.makeRequest(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
      method: 'POST',
      body: passwordData
    });

    return response;
  }

  /**
   * Gestion du token
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Gestion des données utilisateur
   */
  setUser(user) {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  clearUser() {
    localStorage.removeItem('user');
  }

  /**
   * Gestion des données de session
   */
  setSessionData(sessionData) {
    if (sessionData) {
      sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    }
  }

  getSessionData() {
    try {
      const sessionData = sessionStorage.getItem(this.sessionKey);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de session:', error);
      return null;
    }
  }

  clearSessionData() {
    sessionStorage.removeItem(this.sessionKey);
  }

  /**
   * Mettre à jour la dernière activité
   */
  updateLastActivity() {
    const sessionData = this.getSessionData() || {};
    sessionData.lastActivity = Date.now();
    this.setSessionData(sessionData);
  }

  /**
   * Vérifier l'inactivité
   */
  checkInactivity() {
    const sessionData = this.getSessionData();
    if (sessionData && sessionData.lastActivity) {
      const inactiveTime = Date.now() - sessionData.lastActivity;
      return inactiveTime > SECURITY_CONFIG.maxInactivity;
    }
    return false;
  }

  /**
   * Nettoyer toutes les données d'authentification
   */
  clearAuth() {
    this.clearToken();
    this.clearUser();
    this.clearSessionData();
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Obtenir les informations de l'utilisateur actuel
   */
  getCurrentUser() {
    return this.getUser();
  }

  /**
   * Vérifier les permissions utilisateur
   */
  hasPermission(permission) {
    const user = this.getUser();
    if (!user || !user.type_utilisateur) {
      return false;
    }

    // Import dynamique pour éviter les dépendances circulaires
    import('../configs/auth.config.js').then(({ USER_PERMISSIONS }) => {
      const userPermissions = USER_PERMISSIONS[user.type_utilisateur] || [];
      return userPermissions.includes(permission);
    });

    return false;
  }
}

// Instance singleton
const authService = new AuthService();

export default authService;
