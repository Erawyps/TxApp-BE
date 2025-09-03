import { jwtDecode } from "jwt-decode";
import axios from "./axios";
import { TOKEN_STORAGE_KEY } from "configs/auth.config";

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
    const decoded = jwtDecode(authToken);
    const currentTime = Date.now() / 1000; // Current time in seconds since epoch

    return decoded.exp > currentTime;
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
    localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
    axios.defaults.headers.common.Authorization = `Bearer ${authToken}`;
  } else {
    // Remove token from local storage and delete authorization header from axios
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    delete axios.defaults.headers.common.Authorization;
  }
};

/**
 * Gets the current user from the stored token
 *
 * @returns {object|null} - Returns the user data from token or null if no valid token
 */
const getCurrentUser = () => {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token || !isTokenValid(token)) {
      return null;
    }

    const decoded = jwtDecode(token);
    return {
      id: decoded.userId,
      email: decoded.email,
      type: decoded.type,
      exp: decoded.exp,
    };
  } catch (err) {
    console.error("Failed to get current user from token:", err);
    return null;
  }
};

/**
 * Checks if the current user has the required permission
 *
 * @param {string} permission - The permission to check
 * @returns {boolean} - Returns true if user has permission
 */
const hasPermission = (permission) => {
  const user = getCurrentUser();
  if (!user) return false;

  // Import permissions dynamically to avoid circular dependency
  import("configs/auth.config")
    .then(({ USER_PERMISSIONS }) => {
      const userPermissions = USER_PERMISSIONS[user.type] || [];
      return userPermissions.includes(permission);
    })
    .catch((err) => console.error("Failed to load permissions:", err));

  return false;
};

/**
 * Gets the token expiration time
 *
 * @returns {Date|null} - Returns the expiration date or null
 */
const getTokenExpiration = () => {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return null;

    const decoded = jwtDecode(token);
    return new Date(decoded.exp * 1000);
  } catch (err) {
    console.error("Failed to get token expiration:", err);
    return null;
  }
};

/**
 * Generate a simple JWT-like token for local use
 * Note: This is a simple implementation for development/testing
 * In production, use a proper JWT library with signing
 *
 * @param {object} user - User data to encode in token
 * @returns {string} - Generated token
 */
const generateToken = (user) => {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    userId: user.id,
    email: user.email,
    type: user.type_utilisateur || user.type,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };

  // Simple base64 encoding (not secure for production)
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));

  return `${encodedHeader}.${encodedPayload}.fake-signature`;
};

export {
  isTokenValid,
  setSession,
  getCurrentUser,
  hasPermission,
  getTokenExpiration,
  generateToken,
};
