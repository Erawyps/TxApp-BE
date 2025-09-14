// Import Dependencies
import { useAuth } from "./useAuth";

/**
 * Configuration des permissions par type d'utilisateur
 * Basé sur le schéma Prisma et les besoins métier
 */
const USER_PERMISSIONS = {
  admin: [
    // Permissions administrateur complet
    'user.create', 'user.read', 'user.update', 'user.delete',
    'chauffeur.create', 'chauffeur.read', 'chauffeur.update', 'chauffeur.delete',
    'course.create', 'course.read', 'course.update', 'course.delete',
    'shift.create', 'shift.read', 'shift.update', 'shift.delete',
    'expense.create', 'expense.read', 'expense.update', 'expense.delete',
    'report.view', 'report.export',
    'system.config', 'system.backup', 'system.restore',
    'oversight.view', 'oversight.manage',
    'dashboard.admin', 'dashboard.gestionnaire', 'dashboard.chauffeur', 'dashboard.client'
  ],
  gestionnaire: [
    // Permissions gestionnaire (supervision opérationnelle)
    'chauffeur.read', 'chauffeur.update',
    'course.create', 'course.read', 'course.update',
    'shift.read', 'shift.update',
    'expense.read', 'expense.approve',
    'report.view', 'report.export',
    'oversight.view',
    'dashboard.gestionnaire', 'dashboard.chauffeur'
  ],
  chauffeur: [
    // Permissions chauffeur (opérationnel)
    'course.create', 'course.read', 'course.update',
    'shift.create', 'shift.read', 'shift.update', 'shift.end',
    'expense.create', 'expense.read',
    'profile.update',
    'dashboard.chauffeur'
  ],
  client: [
    // Permissions client (réservation et suivi)
    'course.create', 'course.read',
    'profile.update',
    'dashboard.client'
  ]
};

/**
 * Hook pour la gestion des permissions utilisateur
 */
export function usePermissions() {
  const { user } = useAuth();

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   * @param {string} permission - La permission à vérifier
   * @returns {boolean} - True si l'utilisateur a la permission
   */
  const hasPermission = (permission) => {
    if (!user || !user.type_utilisateur) return false;

    const userPermissions = USER_PERMISSIONS[user.type_utilisateur] || [];
    return userPermissions.includes(permission);
  };

  /**
   * Vérifie si l'utilisateur a au moins une des permissions spécifiées
   * @param {string[]} permissions - Liste des permissions à vérifier
   * @returns {boolean} - True si l'utilisateur a au moins une permission
   */
  const hasAnyPermission = (permissions = []) => {
    return permissions.some(permission => hasPermission(permission));
  };

  /**
   * Vérifie si l'utilisateur a toutes les permissions spécifiées
   * @param {string[]} permissions - Liste des permissions à vérifier
   * @returns {boolean} - True si l'utilisateur a toutes les permissions
   */
  const hasAllPermissions = (permissions = []) => {
    return permissions.every(permission => hasPermission(permission));
  };

  /**
   * Vérifie si l'utilisateur peut accéder à un dashboard spécifique
   * @param {string} dashboardType - Type de dashboard ('admin', 'gestionnaire', 'chauffeur', 'client')
   * @returns {boolean} - True si l'utilisateur peut accéder au dashboard
   */
  const canAccessDashboard = (dashboardType) => {
    return hasPermission(`dashboard.${dashboardType}`);
  };

  /**
   * Vérifie si l'utilisateur peut effectuer une action CRUD sur une ressource
   * @param {string} resource - La ressource ('user', 'chauffeur', 'course', etc.)
   * @param {string} action - L'action ('create', 'read', 'update', 'delete')
   * @returns {boolean} - True si l'utilisateur peut effectuer l'action
   */
  const canPerformAction = (resource, action) => {
    return hasPermission(`${resource}.${action}`);
  };

  /**
   * Récupère toutes les permissions de l'utilisateur
   * @returns {string[]} - Liste des permissions de l'utilisateur
   */
  const getUserPermissions = () => {
    if (!user || !user.type_utilisateur) return [];
    return USER_PERMISSIONS[user.type_utilisateur] || [];
  };

  /**
   * Vérifie si l'utilisateur est administrateur
   * @returns {boolean} - True si l'utilisateur est administrateur
   */
  const isAdmin = () => {
    return user?.type_utilisateur === 'admin';
  };

  /**
   * Vérifie si l'utilisateur est gestionnaire
   * @returns {boolean} - True si l'utilisateur est gestionnaire
   */
  const isGestionnaire = () => {
    return user?.type_utilisateur === 'gestionnaire';
  };

  /**
   * Vérifie si l'utilisateur est chauffeur
   * @returns {boolean} - True si l'utilisateur est chauffeur
   */
  const isChauffeur = () => {
    return user?.type_utilisateur === 'chauffeur';
  };

  /**
   * Vérifie si l'utilisateur est client
   * @returns {boolean} - True si l'utilisateur est client
   */
  const isClient = () => {
    return user?.type_utilisateur === 'client';
  };

  return {
    // Méthodes de vérification des permissions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessDashboard,
    canPerformAction,

    // Méthodes utilitaires
    getUserPermissions,
    isAdmin,
    isGestionnaire,
    isChauffeur,
    isClient,

    // Informations utilisateur
    userType: user?.type_utilisateur,
    userPermissions: getUserPermissions()
  };
}

/**
 * Hook pour protéger les composants avec des permissions
 * @param {string|string[]} requiredPermissions - Permissions requises
 * @param {string} requireAll - Si true, nécessite toutes les permissions, sinon au moins une
 * @returns {Object} - Objet avec isAllowed et autres informations
 */
export function usePermissionGuard(requiredPermissions, requireAll = false) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, user } = usePermissions();

  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  const isAllowed = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  return {
    isAllowed,
    user,
    userType: user?.type_utilisateur,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
}

/**
 * Composant wrapper pour protéger l'accès aux composants
 */
export function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  fallback = null
}) {
  const { isAllowed } = usePermissionGuard(permissions, requireAll);

  if (!isAllowed) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Accès non autorisé
          </h3>
          <p className="text-sm text-gray-600">
            Vous n&apos;avez pas les permissions nécessaires pour accéder à cette section.
          </p>
        </div>
      </div>
    );
  }

  return children;
}