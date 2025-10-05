/**
 * Configuration centralisée pour les URLs d'API
 * Utilise les variables d'environnement pour déterminer l'URL de base de l'API
 */

import { getRobustToken } from '../utils/robustStorage.js';

// Configuration de l'URL de base de l'API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.txapp.be/api';

// Log de la configuration en cours
console.log('🔧 [API-CONFIG] Configuration:', {
  baseUrl: API_BASE_URL,
  isProduction: !import.meta.env.DEV,
  environment: import.meta.env.MODE
});

/**
 * Génère une URL complète pour un endpoint API
 * @param {string} endpoint - L'endpoint relatif (ex: '/chauffeurs', '/auth/login')
 * @returns {string} L'URL complète
 */
export const getApiUrl = (endpoint) => {
  // Nettoyer l'endpoint pour éviter les doubles slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  return `${cleanBaseUrl}/${cleanEndpoint}`;
};

/**
 * Configuration des headers par défaut pour les requêtes API
 */
export const getDefaultHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };

  // Ajouter la clé API seulement en production ou si l'URL ne contient pas localhost
  const isLocalhost = API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');
  if (!isLocalhost) {
    headers['X-API-Key'] = 'TxApp-API-Key-2025'; // Clé API pour bypass Cloudflare
  }

  // Utiliser le stockage robuste pour récupérer le token
  console.log('🔑 [API-CONFIG] Getting token for headers...');
  const token = getRobustToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log('✅ [API-CONFIG] Token added to headers');
  } else {
    console.log('❌ [API-CONFIG] No token available for headers');
  }

  return headers;
};

/**
 * Configuration Axios par défaut
 */
export const axiosConfig = {
  baseURL: API_BASE_URL,
  headers: getDefaultHeaders(),
  timeout: 30000, // 30 secondes
  withCredentials: false
};

// Log de la configuration en mode développement
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    API_BASE_URL,
    environment: import.meta.env.MODE,
    VITE_API_URL: import.meta.env.VITE_API_URL
  });
}