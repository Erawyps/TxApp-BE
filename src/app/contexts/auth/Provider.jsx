// Import Dependencies
import { useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import isObject from "lodash/isObject";
import { jwtDecode } from "jwt-decode";

// Local Imports
import { loginUser, getUserProfile, createUser, updateUserProfile } from "services/auth";
import { isTokenValid, setSession, getCurrentUser } from "utils/jwt";
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

  REGISTER_SUCCESS: (state, action) => {
    const { message } = action.payload;
    return {
      ...state,
      isAuthenticated: false,
      isLoading: false,
      errorMessage: null,
      user: null,
      successMessage: message,
    };
  },

  LOGIN_ERROR: (state, action) => {
    const { errorMessage } = action.payload;

    return {
      ...state,
      errorMessage,
      isLoading: false,
      isAuthenticated: false,
      user: null,
    };
  },

  UPDATE_PROFILE: (state, action) => {
    const { user } = action.payload;
    return {
      ...state,
      user: { ...state.user, ...user },
    };
  },

  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
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
        console.log('🔍 Token from localStorage:', authToken ? 'present' : 'null');

        // Nettoyer immédiatement les tokens manifestement invalides
        if (authToken) {
          try {
            const decoded = jwtDecode(authToken);
            // Vérifier si c'est un token avec une signature fake ou un ID invalide
            if (authToken.includes('fake-signature') ||
                (decoded.sub && typeof decoded.sub === 'string' && decoded.sub.startsWith('uid-')) ||
                (decoded.userId && typeof decoded.userId === 'string' && decoded.userId.startsWith('uid-'))) {
              console.log('🧹 Token invalide détecté au démarrage, suppression...');
              setSession(null);
              dispatch({
                type: "INITIALIZE",
                payload: {
                  isAuthenticated: false,
                  user: null,
                },
              });
              return;
            }
          } catch (decodeError) {
            console.log('🧹 Token non décodable détecté, suppression...', decodeError.message);
            setSession(null);
            dispatch({
              type: "INITIALIZE",
              payload: {
                isAuthenticated: false,
                user: null,
              },
            });
            return;
          }
        }

        if (authToken && isTokenValid(authToken)) {
          console.log('✅ Token is valid, extracting user data...');
          // Vérifier si c'est un ancien token local (avec "uid-" dans l'ID ou signature "fake-signature")
          const userFromToken = getCurrentUser();
          console.log('🔍 User from token:', userFromToken);

          // Détecter les tokens locaux par leur signature ou leur contenu
          const isLocalToken = authToken.includes('fake-signature') ||
                              (userFromToken && typeof userFromToken.id === 'string' && userFromToken.id.startsWith('uid-'));

          console.log('🔍 Is local token?', isLocalToken, 'Token ends with fake-signature?', authToken.includes('fake-signature'));

          if (isLocalToken || !userFromToken) {
            console.log('🧹 Token invalide ou local détecté, suppression...', { isLocalToken, hasUserFromToken: !!userFromToken });
            setSession(null);
            dispatch({
              type: "INITIALIZE",
              payload: {
                isAuthenticated: false,
                user: null,
              },
            });
            return;
          }

          setSession(authToken);

          console.log('🔍 User from token:', userFromToken);

          if (userFromToken) {
            console.log('✅ User ID from token:', userFromToken.id);

            // Récupérer le profil complet depuis la base de données
            try {
              const fullUserProfile = await getUserProfile(userFromToken.id);

              dispatch({
                type: "INITIALIZE",
                payload: {
                  isAuthenticated: true,
                  user: fullUserProfile,
                },
              });
            } catch (profileError) {
              console.warn("Erreur récupération profil:", profileError);

              // Si la session est expirée ou l'utilisateur n'existe plus
              if (profileError.message?.includes('Session expirée') ||
                  profileError.message?.includes('Utilisateur non trouvé')) {
                console.log("Session expirée ou utilisateur invalide, nettoyage...");
                setSession(null);
                dispatch({
                  type: "INITIALIZE",
                  payload: {
                    isAuthenticated: false,
                    user: null,
                  },
                });
                return;
              }

              // Pour d'autres erreurs, utiliser les données du token comme fallback
              console.warn("Utilisation du token comme fallback:", profileError);
              dispatch({
                type: "INITIALIZE",
                payload: {
                  isAuthenticated: true,
                  user: userFromToken,
                },
              });
            }
          } else {
            console.log('❌ Token valide mais données utilisateur non extraites, nettoyage...');
            setSession(null);
            dispatch({
              type: "INITIALIZE",
              payload: {
                isAuthenticated: false,
                user: null,
              },
            });
            return;
          }
        } else {
          // Token invalide ou expiré
          setSession(null);
          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error("Erreur d'initialisation de l'authentification:", err);
        // Nettoyer en cas d'erreur
        setSession(null);
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

  const login = async ({ username, password }) => {
    dispatch({
      type: "LOGIN_REQUEST",
    });

    try {
      // Utiliser notre service d'authentification local
      // Note: username is actually the email in this context
      const { user, token } = await loginUser(username, password);

      if (!isObject(user)) {
        throw new Error("Réponse d'authentification invalide");
      }

      // Utiliser le token JWT du backend au lieu de générer un token local
      setSession(token);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user,
        },
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || "Erreur de connexion";
      dispatch({
        type: "LOGIN_ERROR",
        payload: {
          errorMessage: { message: errorMessage },
        },
      });
      throw err;
    }
  };

  const register = async (userData) => {
    dispatch({
      type: "LOGIN_REQUEST",
    });

    try {
      // Créer le nouvel utilisateur
      const newUser = await createUser(userData);

      if (!isObject(newUser)) {
        throw new Error("Erreur lors de la création de l'utilisateur");
      }

      // NE PAS connecter automatiquement l'utilisateur après l'inscription
      // L'utilisateur doit se connecter manuellement après la création du compte

      dispatch({
        type: "REGISTER_SUCCESS", // Nouveau type d'action pour l'inscription réussie
        payload: {
          message: "Compte créé avec succès. Veuillez vous connecter.",
        },
      });

      return { success: true, message: "Compte créé avec succès. Veuillez vous connecter." };
    } catch (err) {
      const errorMessage = err.message || "Erreur lors de l'inscription";
      dispatch({
        type: "LOGIN_ERROR",
        payload: {
          errorMessage: { message: errorMessage },
        },
      });
      throw err;
    }
  };

  const logout = async () => {
    setSession(null);
    dispatch({ type: "LOGOUT" });
  };

  const updateProfile = async (profileData) => {
    try {
      // Mettre à jour en base de données
      const updatedUser = await updateUserProfile(state.user.id, profileData);

      // Mettre à jour l'état local avec l'utilisateur mis à jour
      dispatch({
        type: "UPDATE_PROFILE",
        payload: {
          user: updatedUser,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    try {
      if (state.user?.id) {
        const updatedProfile = await getUserProfile(state.user.id);
        dispatch({
          type: "UPDATE_PROFILE",
          payload: {
            user: updatedProfile,
          },
        });
        return updatedProfile;
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du profil:", error);
      throw error;
    }
  };

  if (!children) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};