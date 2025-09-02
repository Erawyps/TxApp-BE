import { Navigate, useLocation } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";
import { USER_PERMISSIONS } from "configs/auth.config";
import PropTypes from "prop-types";

/**
 * Composant de protection basé sur les permissions utilisateur
 * Redirige vers une page d'erreur si l'utilisateur n'a pas les permissions requises
 */
export default function PermissionGuard({ children, requiredPermissions = [], fallbackPath = "/403" }) {
  const { user, isAuthenticated } = useAuthContext();
  const location = useLocation();

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Si aucune permission n'est requise, autoriser l'accès
  if (requiredPermissions.length === 0) {
    return children;
  }

  // Vérifier les permissions de l'utilisateur
  const userPermissions = USER_PERMISSIONS[user?.type_utilisateur] || [];
  const hasRequiredPermissions = requiredPermissions.every(permission =>
    userPermissions.includes(permission)
  );

  if (!hasRequiredPermissions) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

PermissionGuard.propTypes = {
  children: PropTypes.node.isRequired,
  requiredPermissions: PropTypes.arrayOf(PropTypes.string),
  fallbackPath: PropTypes.string,
};
