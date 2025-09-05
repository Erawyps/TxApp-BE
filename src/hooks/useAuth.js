import { useState, useEffect } from 'react';
import { useAuthContext } from 'app/contexts/auth/context';

/**
 * Hook personnalisé pour la gestion des utilisateurs avec Prisma
 */
export function useAuth() {
  const context = useAuthContext();

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Hook pour gérer le profil utilisateur
 */
export function useProfile() {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUserProfile = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateProfile(data);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    updateProfile: updateUserProfile,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}

/**
 * Hook pour la gestion des permissions
 */
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission) => {
    if (!user) return false;

    // Import dynamique pour éviter les dépendances circulaires
    import('configs/auth.config').then(({ USER_PERMISSIONS }) => {
      const userPermissions = USER_PERMISSIONS[user.type_utilisateur] || [];
      return userPermissions.includes(permission);
    });

    return false;
  };

  const hasAnyPermission = (permissions = []) => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions = []) => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userType: user?.type_utilisateur
  };
}

/**
 * Hook pour la gestion de la session
 */
export function useSession() {
  const { isAuthenticated, isLoading, isInitialized, logout } = useAuth();
  const [sessionExpiry, setSessionExpiry] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Vérifier l'expiration du token
      import('../utils/jwt').then(({ getTokenExpiration }) => {
        const expiry = getTokenExpiration();
        setSessionExpiry(expiry);

        if (expiry) {
          // Configurer un timeout pour déconnecter automatiquement
          const timeUntilExpiry = expiry.getTime() - Date.now();
          const timeout = setTimeout(() => {
            logout();
          }, timeUntilExpiry);

          return () => clearTimeout(timeout);
        }
      });
    }
  }, [isAuthenticated, logout]);

  return {
    isAuthenticated,
    isLoading,
    isInitialized,
    sessionExpiry,
    logout
  };
}
