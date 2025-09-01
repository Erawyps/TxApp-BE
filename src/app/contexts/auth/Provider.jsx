// Import Dependencies
import { useEffect, useReducer } from "react";
import isObject from "lodash/isObject";
import PropTypes from "prop-types";
import isString from "lodash/isString";

// Local Imports
import axios from "utils/axios";
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
      user,
    };
  },

  LOGIN_REQUEST: (state) => {
    return {
      ...state,
      isLoading: true,
    };
  },

  LOGIN_SUCCESS: (state, action) => {
    const { user } = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      isLoading: false,
      user,
    };
  },

  LOGIN_ERROR: (state, action) => {
    const { errorMessage } = action.payload;

    return {
      ...state,
      errorMessage,
      isLoading: false,
    };
  },

  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
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
        console.log("🔄 Initialisation du contexte d'authentification...");
        const authToken = window.localStorage.getItem("authToken");
        console.log("🔑 Token trouvé:", !!authToken);

        if (authToken && isTokenValid(authToken)) {
          console.log("✅ Token valide, vérification avec l'API...");
          setSession(authToken);

          try {
            type: "INITIALIZE",
            payload: {
              isAuthenticated: true,
              user,
            },
          });
        } else {
          dispatch({
            const { user } = response.data;
            console.log("✅ Utilisateur vérifié:", user);

            dispatch({
              type: "INITIALIZE",
              payload: {
                isAuthenticated: true,
                user,
              },
            });
          } catch (apiError) {
            console.error("❌ Erreur API de vérification:", apiError.message);
            // API non disponible ou token invalide, on nettoie et continue
            setSession(null);
            dispatch({
              type: "INITIALIZE",
              payload: {
                isAuthenticated: false,
                user: null,
              },
            });
          }
          });
          console.log("❌ Pas de token valide, utilisateur non authentifié");
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: "INITIALIZE",
            },
          });
            user: null,
          },
        console.error("❌ Erreur lors de l'initialisation:", err);
      }
    };

    init();
  }, []);

  const login = async ({ username, password }) => {
    dispatch({
      type: "LOGIN_REQUEST",
    });

    try {
      const response = await axios.post("/auth/login", {
        email: username, // Le backend attend 'email' pas 'username'
        password,
      });

      const { token, user } = response.data; // Backend retourne 'token' pas 'authToken'

      if (!isString(token) && !isObject(user)) {
        throw new Error("Response is not valid");
      }

      setSession(token); // Utiliser 'token' au lieu de 'authToken'

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user,
        },
      });
    } catch (err) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: {
          errorMessage: err,
        },
      });
    }
  };

  const register = async ({ email, password, nom, prenom, telephone }) => {
    dispatch({
      type: "LOGIN_REQUEST",
    });

    try {
      const response = await axios.post("/auth/register", {
        email,
        password,
        nom,
        prenom,
        telephone,
      });

      const { token, user } = response.data;

      if (!isString(token) && !isObject(user)) {
        throw new Error("Response is not valid");
      }

      setSession(token);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user,
        },
      });
    } catch (err) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: {
          errorMessage: err,
        },
      });
    }
  };

  const logout = async () => {
    setSession(null);
    dispatch({ type: "LOGOUT" });
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
      }}
    >
      {children}
    </AuthContext>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
