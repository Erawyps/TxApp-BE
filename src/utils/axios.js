import axios from 'axios';
import { JWT_HOST_API, TOKEN_STORAGE_KEY } from 'configs/auth.config';

const axiosInstance = axios.create({
  baseURL: JWT_HOST_API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête pour ajouter automatiquement le token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs et la déconnexion automatique
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Gestion des erreurs d'authentification
    if (response?.status === 401) {
      // Token expiré ou invalide - nettoyer la session
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      delete axiosInstance.defaults.headers.common.Authorization;

      // Rediriger vers la page de connexion si pas déjà sur une page publique
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/sign-up')) {
        window.location.href = '/login';
      }
    }

    // Gestion des messages d'erreur
    const data = error?.response?.data;
    const message =
      (typeof data === 'string' && data) ||
      data?.message ||
      data?.error ||
      error?.message ||
      'Une erreur réseau est survenue';

    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
