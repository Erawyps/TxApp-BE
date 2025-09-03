import axios from "./axios";
import { verifyToken, isTokenExpired } from "./jwtLocal";
import { USER_PERMISSIONS } from "configs/auth.config";

/**
 * Checks if the provided JWT token is valid (not expired).
 *
 * @param {string} authToken - The JWT token to validate.
 * @returns {boolean} - Returns `true` if the token is valid, otherwise `false`.
 */
const isTokenValid = (authToken) => {
  if (typeof authToken !== "string") {
    console.error("Invalid token format.");
    return false;
  }

  try {
    // Utiliser notre vérification locale
    const decoded = verifyToken(authToken);
    return decoded !== null && !isTokenExpired(authToken);
  } catch (err) {
    console.error("Failed to decode token:", err);
    return false;
  }
};

/**
 * Sets or removes the authentication token in local storage and axios headers.
 *
 * @param {string} [authToken] - The JWT token to set. If `undefined` or `null`, the session will be cleared.
 */
const setSession = (authToken) => {
  if (typeof authToken === "string" && authToken.trim() !== "") {
    // Store token in local storage and set authorization header for axios
    localStorage.setItem("authToken", authToken);
    axios.defaults.headers.common.Authorization = `Bearer ${authToken}`;
  } else {
    // Remove token from local storage and delete authorization header from axios
    localStorage.removeItem("authToken");
    delete axios.defaults.headers.common.Authorization;
  }
};

/**
 * Récupère les informations utilisateur depuis le token
 * @param {string} authToken - Token JWT
 * @returns {Object|null} Informations utilisateur ou null
 */
const getUserFromToken = (authToken) => {
  try {
    const decoded = verifyToken(authToken);
    return decoded;
  } catch (error) {
    console.error("Erreur lors de l'extraction des données utilisateur:", error);
    return null;
  }
};

/**
 * Vérifie si l'utilisateur a une permission spécifique
 * @param {Object} user - Utilisateur
 * @param {string} permission - Permission à vérifier
 * @returns {boolean}
 */
const hasPermission = (user, permission) => {
  if (!user || !user.type_utilisateur) return false;

  const userPermissions = USER_PERMISSIONS[user.type_utilisateur] || [];
  return userPermissions.includes('*') || userPermissions.includes(permission);
};

export { isTokenValid, setSession, getUserFromToken, hasPermission };
