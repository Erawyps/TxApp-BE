/**
 * Configuration de l'API d'authentification pour l'application TxApp
 * Utilise l'API locale avec Prisma et Supabase
 */

// URL de base de l'API - utilise le serveur local en développement
export const JWT_HOST_API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

// Configuration JWT
export const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || "your-jwt-secret-key";
export const JWT_EXPIRES_IN = "24h";

// Configuration de session
export const TOKEN_STORAGE_KEY = "authToken";
export const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";

// Types d'utilisateurs autorisés
export const USER_TYPES = {
  ADMIN: "admin",
  CHAUFFEUR: "chauffeur",
  MANAGER: "manager",
  CLIENT: "client"
};

// Permissions par type d'utilisateur
export const USER_PERMISSIONS = {
  [USER_TYPES.ADMIN]: ["read", "write", "delete", "manage_users"],
  [USER_TYPES.MANAGER]: ["read", "write", "manage_routes"],
  [USER_TYPES.CHAUFFEUR]: ["read", "update_profile", "view_routes"],
  [USER_TYPES.CLIENT]: ["read", "view_orders"]
};
