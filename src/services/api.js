// Configuration API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Fonction pour récupérer le token d'authentification
const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('auth-token') || sessionStorage.getItem('authToken');
};

// Utilitaire pour les appels API avec authentification
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

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

    if (response.status === 401) {
      // Token expiré ou invalide, rediriger vers la connexion
      console.warn('Token d\'authentification invalide ou expiré');
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth-token');
      sessionStorage.removeItem('authToken');

      // Rediriger vers la page de connexion
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      throw new Error('Non authentifié - redirection vers la connexion');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur API ${endpoint}:`, error);
    throw error;
  }
}

export { apiCall };
