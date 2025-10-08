/**
 * Configuration d'authentification pour TxApp - Production Ready
 */

// Détecter environnement production de manière robuste
const isProduction = () => {
  // 1. Variable d'environnement Vite explicite
  if (import.meta.env.VITE_API_URL) return true;
  
  // 2. Hostname production
  if (typeof window !== 'undefined' && window.location.hostname === 'txapp.be') return true;
  
  // 3. Mode Vite (fallback)
  if (import.meta.env.PROD) return true;
  
  // 4. NODE_ENV (dernière chance)
  if (import.meta.env.MODE === 'production') return true;
  
  return false;
};

// Configuration de l'API - logique robuste pour la production
export const JWT_HOST_API = import.meta.env.VITE_API_URL || 
  (isProduction() 
    ? "https://api.txapp.be/api"  // Fallback production
    : "http://localhost:3001/api"); // Fallback développement

console.log('🔧 API URL configurée:', JWT_HOST_API);
console.log('🔧 Mode:', import.meta.env.MODE);
console.log('🔧 PROD detecté:', isProduction());
console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔧 Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');

// Token storage key pour localStorage
export const TOKEN_STORAGE_KEY = "txapp-auth-token";

// Session storage key pour les données temporaires
export const SESSION_STORAGE_KEY = "txapp-session";

// Types d'utilisateurs - alignés avec la contrainte DB
export const USER_TYPES = {
  ADMIN: "ADMIN",
  GESTIONNAIRE: "GESTIONNAIRE",
  CHAUFFEUR: "CHAUFFEUR",
  CLIENT: "CLIENT"
};

// Permissions par type d'utilisateur
export const USER_PERMISSIONS = {
  ADMIN: [
    'user.create',
    'user.read',
    'user.update',
    'user.delete',
    'chauffeur.create',
    'chauffeur.read',
    'chauffeur.update',
    'chauffeur.delete',
    'vehicule.create',
    'vehicule.read',
    'vehicule.update',
    'vehicule.delete',
    'course.create',
    'course.read',
    'course.update',
    'course.delete',
    'feuille_route.create',
    'feuille_route.read',
    'feuille_route.update',
    'feuille_route.delete',
    'client.create',
    'client.read',
    'client.update',
    'client.delete',
    'rapport.read',
    'rapport.export'
  ],
  GESTIONNAIRE: [
    'chauffeur.read',
    'chauffeur.update',
    'vehicule.read',
    'vehicule.update',
    'course.read',
    'course.update',
    'feuille_route.read',
    'feuille_route.update',
    'client.read',
    'client.update',
    'rapport.read',
    'rapport.export'
  ],
  CHAUFFEUR: [
    'course.create',
    'course.read',
    'course.update',
    'feuille_route.create',
    'feuille_route.read',
    'feuille_route.update',
    'vehicule.read',
    'client.read'
  ],
  CLIENT: [
    'course.read',
    'feuille_route.read'
  ]
};

// Configuration JWT
export const JWT_CONFIG = {
  secret: import.meta.env.VITE_JWT_SECRET || "TxApp-2025-Super-Secure-JWT-Secret-Key-Change-In-Production-9f8e7d6c5b4a3",
  expiresIn: '24h',
  issuer: 'txapp.be',
  audience: 'txapp-users'
};

// Configuration de session
export const SESSION_CONFIG = {
  timeout: 24 * 60 * 60 * 1000, // 24 heures en millisecondes
  refreshThreshold: 2 * 60 * 60 * 1000, // Rafraîchir 2h avant expiration
  maxInactivity: 4 * 60 * 60 * 1000 // Déconnexion après 4h d'inactivité
};

// Routes protégées par type d'utilisateur
export const PROTECTED_ROUTES = {
  ADMIN: ['/admin', '/users', '/settings', '/reports'],
  GESTIONNAIRE: ['/dashboard', '/management', '/reports'],
  CHAUFFEUR: ['/driver', '/shift', '/courses'],
  CLIENT: ['/client', '/bookings']
};

// Routes publiques (accessibles sans authentification)
export const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/health',
  '/api/health'
];

// Configuration de sécurité
export const SECURITY_CONFIG = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  passwordMinLength: 8,
  passwordRequireSpecialChar: true,
  passwordRequireNumber: true,
  passwordRequireUppercase: true,
  sessionSecure: import.meta.env.PROD, // HTTPS seulement en production
  sameSite: 'strict'
};

// Messages d'erreur d'authentification
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Identifiants invalides',
  ACCOUNT_LOCKED: 'Compte verrouillé temporairement',
  SESSION_EXPIRED: 'Session expirée, veuillez vous reconnecter',
  INSUFFICIENT_PERMISSIONS: 'Permissions insuffisantes',
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  TOKEN_INVALID: 'Token d\'authentification invalide',
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  WEAK_PASSWORD: 'Mot de passe trop faible'
};

// Points de terminaison d'authentification
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  VERIFY: '/auth/verify',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  PROFILE: '/auth/profile'
};
