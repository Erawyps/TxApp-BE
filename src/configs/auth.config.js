/**
 * This is simple JWT API for testing purposes.
 * https://github.com/pinia-studio/jwt-api-node
**/

export const JWT_HOST_API = "https://jwt-api-node.vercel.app";

// Token storage key for localStorage
export const TOKEN_STORAGE_KEY = "authToken";

// Types d'utilisateurs
export const USER_TYPES = {
  ADMIN: "admin",
  CHAUFFEUR: "chauffeur",
  DISPATCHER: "dispatcher",
  COMPTABLE: "comptable"
};
