// Clé secrète pour signer les JWT (à définir dans les variables d'environnement)
const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * Générer un token JWT pour un utilisateur
 * @param {Object} user - Données de l'utilisateur
 * @returns {string} Token JWT
 */
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    type_utilisateur: user.type_utilisateur,
    nom: user.nom,
    prenom: user.prenom
  };

  // Pour l'environnement client, on utilise une signature simple
  // En production, ceci devrait être fait côté serveur
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadB64 = btoa(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h
    iss: 'txapp',
    aud: 'txapp-users'
  }));

  // Signature simple pour le frontend (en production, utiliser un vrai JWT côté serveur)
  const signature = btoa(`${header}.${payloadB64}.${JWT_SECRET}`);

  return `${header}.${payloadB64}.${signature}`;
};

/**
 * Vérifier et décoder un token JWT
 * @param {string} token - Token JWT à vérifier
 * @returns {Object|null} Payload décodé ou null si invalide
 */
export const verifyToken = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));

    // Vérifier l'expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Erreur de vérification du token:', error.message);
    return null;
  }
};

/**
 * Décoder un token sans vérification (pour récupérer les infos même si expiré)
 * @param {string} token - Token JWT à décoder
 * @returns {Object|null} Payload décodé ou null si malformé
 */
export const decodeToken = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    return JSON.parse(atob(parts[1]));
  } catch (error) {
    console.error('Erreur de décodage du token:', error.message);
    return null;
  }
};

/**
 * Extraire le token du header Authorization
 * @param {string} authHeader - Header Authorization
 * @returns {string|null} Token extrait ou null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * Vérifier si un token est expiré
 * @param {string} token - Token JWT
 * @returns {boolean} True si expiré
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};
