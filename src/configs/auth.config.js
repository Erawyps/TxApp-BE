/**
 * Configuration d'authentification pour TxApp
 * Utilise l'API locale avec Supabase PostgreSQL
 */

// URL de base pour l'API d'authentification locale
export const JWT_HOST_API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Configuration des endpoints d'authentification
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  PROFILE: "/auth/profile",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  CHANGE_PASSWORD: "/auth/change-password",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
};

// Configuration JWT
export const JWT_CONFIG = {
  SECRET: import.meta.env.VITE_JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  EXPIRES_IN: '24h',
  REFRESH_THRESHOLD: 3600000, // 1 heure en millisecondes
};

// Types d'utilisateurs autorisés (correspondant aux contraintes DB)
export const USER_TYPES = {
  ADMIN: 'ADMIN',
  CHAUFFEUR: 'CHAUFFEUR',
  DISPATCHER: 'DISPATCHER',
  COMPTABLE: 'COMPTABLE'
};

// Permissions par type d'utilisateur
export const USER_PERMISSIONS = {
  [USER_TYPES.ADMIN]: ['*'], // Toutes les permissions
  [USER_TYPES.CHAUFFEUR]: ['view_own_routes', 'manage_own_routes', 'view_own_profile'],
  [USER_TYPES.DISPATCHER]: ['view_routes', 'manage_routes', 'view_drivers', 'view_vehicles'],
  [USER_TYPES.COMPTABLE]: ['view_invoices', 'manage_invoices', 'view_payments', 'view_reports']
};
