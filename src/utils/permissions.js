/**
 * Utilitaires de permissions pour TxApp
 * Fonctions pour vérifier les rôles des utilisateurs
 */

/**
 * Vérifie si l'utilisateur a le rôle Admin
 * @param {Object} user - L'utilisateur connecté
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return user?.role === 'Admin';
};

/**
 * Vérifie si l'utilisateur a le rôle Controleur
 * @param {Object} user - L'utilisateur connecté
 * @returns {boolean}
 */
export const isControleur = (user) => {
  return user?.role === 'Controleur';
};

/**
 * Vérifie si l'utilisateur a le rôle Chauffeur
 * @param {Object} user - L'utilisateur connecté
 * @returns {boolean}
 */
export const isChauffeur = (user) => {
  return user?.role === 'Chauffeur';
};

/**
 * Vérifie si l'utilisateur peut accéder aux données d'un chauffeur spécifique
 * - Admin : accès à tous les chauffeurs
 * - Controleur : accès après authentification supplémentaire
 * - Chauffeur : accès uniquement à ses propres données
 * @param {Object} user - L'utilisateur connecté
 * @param {number} chauffeurId - ID du chauffeur dont on veut voir les données
 * @returns {boolean|Object} - true si accès autorisé, {needsAuth: true} si authentification contrôleur requise
 */
export const canAccessChauffeurData = (user, chauffeurId) => {
  if (!user) return false;

  if (isAdmin(user)) {
    return true;
  }

  if (isChauffeur(user)) {
    // Le chauffeur ne peut voir que ses propres données
    return user.chauffeur?.id === chauffeurId;
  }

  if (isControleur(user)) {
    // Le contrôleur doit s'authentifier à nouveau pour voir les données
    return { needsAuth: true, chauffeurId };
  }

  return false;
};

/**
 * Vérifie si l'utilisateur peut voir toutes les données chauffeur
 * @param {Object} user - L'utilisateur connecté
 * @returns {boolean}
 */
export const canViewAllChauffeurData = (user) => {
  return isAdmin(user);
};

/**
 * Vérifie si l'utilisateur peut accéder au modal de contrôle
 * @param {Object} user - L'utilisateur connecté
 * @returns {boolean}
 */
export const canAccessControlModal = (user) => {
  return isAdmin(user) || isControleur(user);
};

/**
 * Obtient la liste des rôles disponibles
 * @returns {Array<string>}
 */
export const getAvailableRoles = () => {
  return ['Admin', 'Controleur', 'Chauffeur'];
};

/**
 * Obtient le libellé d'un rôle
 * @param {string} role - Le rôle
 * @returns {string}
 */
export const getRoleLabel = (role) => {
  const labels = {
    Admin: 'Administrateur',
    Controleur: 'Contrôleur',
    Chauffeur: 'Chauffeur'
  };
  return labels[role] || role;
};