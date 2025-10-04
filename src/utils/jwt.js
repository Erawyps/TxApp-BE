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
    console.log('🔑 getCurrentUser - Token from storage:', token ? 'present' : 'null');
    if (!token || !isTokenValid(token)) {
      console.log('❌ getCurrentUser - Token invalid or missing');
      return null;
    }

    const decoded = jwtDecode(token);
    console.log('🔍 getCurrentUser - Decoded token:', decoded);
    console.log('🔍 getCurrentUser - Token string (first 50 chars):', token.substring(0, 50));

    // Vérifier que userId ou sub existe
    const userId = decoded.sub || decoded.userId;
    console.log('🔍 getCurrentUser - Extracted userId:', userId, 'type:', typeof userId);
    if (!userId) {
      console.error('❌ getCurrentUser - Token does not contain userId or sub');
      return null;
    }

    // Vérifier que l'ID est valide (pas une string commençant par 'uid-')
    if (typeof userId === 'string' && userId.startsWith('uid-')) {
      console.error('❌ getCurrentUser - Token contains invalid local userId:', userId);
      return null;
    }

    const userData = {
      id: userId,
      email: decoded.email,
      type: decoded.type,
      role: decoded.role,
      exp: decoded.exp,
    };
    console.log('✅ getCurrentUser - Returning user data:', userData);
    return userData;
  } catch (err) {
    console.error("❌ getCurrentUser - Failed to get current user from token:", err);
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
