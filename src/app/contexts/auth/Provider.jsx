// Import Dependencies
import { useEffect, useReducer } from "react";
import isObject from "lodash/isObject";
import PropTypes from "prop-types";
import isString from "lodash/isString";

// Local Imports
import AuthService from "services/auth.service";
import { isTokenValid, setSession } from "utils/jwt";
import { AuthContext } from "./context";

// ----------------------------------------------------------------------

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  errorMessage: null,
  user: null,
};

const reducerHandlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      isLoading: false,
      user,
    };
  },

  LOGIN_REQUEST: (state) => {
    return {
      ...state,
      isLoading: true,
      errorMessage: null,
    };
  },

  LOGIN_SUCCESS: (state, action) => {
    const { user } = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      isLoading: false,
      errorMessage: null,
      user,
    };
  },

  LOGIN_ERROR: (state, action) => {
    const { errorMessage } = action.payload;

    return {
      ...state,
      isAuthenticated: false,
      errorMessage,
      isLoading: false,
      user: null,
    };
  },

  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
    errorMessage: null,
  }),

  UPDATE_PROFILE: (state, action) => {
    const { user } = action.payload;
    return {
      ...state,
      user: { ...state.user, ...user },
    };
  },

  CLEAR_ERROR: (state) => ({
    ...state,
    errorMessage: null,
  }),
};

const reducer = (state, action) => {
  const handler = reducerHandlers[action.type];
  if (handler) {
    return handler(state, action);
  }
  return state;
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const authToken = window.localStorage.getItem("authToken");

        if (authToken && isTokenValid(authToken)) {
          setSession(authToken);

          // Utiliser l'API pour récupérer le profil au lieu de Prisma directement
          const user = await AuthService.getProfile();

          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: true,
              user,
            },
          });
        } else {
          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error("Erreur d'initialisation:", err);
        setSession(null); // Nettoyer la session en cas d'erreur
        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    init();
  }, []);

  const login = async ({ email, password }) => {
    dispatch({
      type: "LOGIN_REQUEST",
    });

    try {
      // Utiliser l'API pour la connexion
      const response = await AuthService.login(email, password);
      const { authToken, user } = response;

      if (!isString(authToken) || !isObject(user)) {
        throw new Error("Réponse de connexion invalide");
      }

      setSession(authToken);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user,
        },
      });

      return { success: true };
    } catch (err) {
      console.error("Erreur de connexion:", err);
      dispatch({
        type: "LOGIN_ERROR",
        payload: {
          errorMessage: err.message || "Erreur de connexion",
        },
      });
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    dispatch({
      type: "LOGIN_REQUEST",
    });

    try {
      const user = await AuthService.register(userData);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user,
        },
      });

      return { success: true, user };
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      dispatch({
        type: "LOGIN_ERROR",
        payload: {
          errorMessage: err.message || "Erreur d'inscription",
        },
      });
      return { success: false, error: err.message };
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const updatedUser = await AuthService.updateProfile(updateData);

      dispatch({
        type: "UPDATE_PROFILE",
        payload: {
          user: updatedUser,
        },
      });

      return { success: true, user: updatedUser };
    } catch (err) {
      console.error("Erreur de mise à jour du profil:", err);
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      const result = await AuthService.resetPassword(email);
      return { success: true, result };
    } catch (err) {
      console.error("Erreur de réinitialisation:", err);
      return { success: false, error: err.message };
    }
  };

  const confirmPasswordReset = async (resetToken, newPassword) => {
    try {
      await AuthService.confirmPasswordReset(resetToken, newPassword);
      return { success: true };
    } catch (err) {
      console.error("Erreur de confirmation de réinitialisation:", err);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    setSession(null);
    dispatch({ type: "LOGOUT" });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  if (!children) {
    return null;
  }

  return (
    <AuthContext
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        resetPassword,
        confirmPasswordReset,
        clearError,
      }}
    >
      {children}
    </AuthContext>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
