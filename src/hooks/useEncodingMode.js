import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from 'app/contexts/auth/context';

/**
 * Hook personnalisé pour gérer le mode d'encodage
 * @param {Object} options - Options de configuration
 * @param {string} options.defaultMode - Mode par défaut ('LIVE', 'ULTERIEUR', 'ADMIN')
 * @param {Function} options.onModeChange - Callback appelé lors du changement de mode
 * @param {boolean} options.persistMode - Sauvegarder le mode dans localStorage
 * @returns {Object} État et fonctions de gestion du mode d'encodage
 */
export function useEncodingMode({ 
  defaultMode = 'LIVE', 
  onModeChange,
  persistMode = true 
} = {}) {
  const { user } = useAuthContext();
  const [currentMode, setCurrentMode] = useState(defaultMode);
  const [isChanging, setIsChanging] = useState(false);

  // Déterminer les modes autorisés selon le rôle utilisateur
  const getAllowedModes = useCallback(() => {
    if (!user) return ['LIVE'];
    
    const userRole = user.role || user.type_utilisateur;
    
    switch (userRole) {
      case 'ADMIN':
      case 'Administrateur':
        return ['LIVE', 'ULTERIEUR', 'ADMIN'];
      case 'GESTIONNAIRE':
      case 'Gestionnaire':
        return ['LIVE', 'ULTERIEUR'];
      case 'CHAUFFEUR':
      case 'Chauffeur':
      default:
        return ['LIVE', 'ULTERIEUR'];
    }
  }, [user]);

  const allowedModes = getAllowedModes();

  // Charger le mode depuis localStorage au montage
  useEffect(() => {
    if (persistMode && typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('tx-app-encoding-mode');
      if (savedMode && allowedModes.includes(savedMode)) {
        setCurrentMode(savedMode);
      } else if (!allowedModes.includes(currentMode)) {
        // Si le mode actuel n'est pas autorisé, utiliser le premier mode autorisé
        setCurrentMode(allowedModes[0] || 'LIVE');
      }
    }
  }, [allowedModes, currentMode, persistMode]);

  // Changer le mode d'encodage
  const changeMode = useCallback(async (newMode) => {
    if (!allowedModes.includes(newMode)) {
      console.warn(`Mode d'encodage "${newMode}" non autorisé pour l'utilisateur`);
      return false;
    }

    try {
      setIsChanging(true);
      
      // Appeler le callback de changement si fourni
      if (onModeChange) {
        await onModeChange(newMode, currentMode);
      }

      setCurrentMode(newMode);

      // Sauvegarder dans localStorage si activé
      if (persistMode && typeof window !== 'undefined') {
        localStorage.setItem('tx-app-encoding-mode', newMode);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors du changement de mode d\'encodage:', error);
      return false;
    } finally {
      setIsChanging(false);
    }
  }, [allowedModes, currentMode, onModeChange, persistMode]);

  // Obtenir les informations du mode actuel
  const getModeInfo = useCallback((mode = currentMode) => {
    const modeInfos = {
      LIVE: {
        id: 'LIVE',
        label: 'En Direct',
        description: 'Encodage en temps réel des courses',
        color: 'success',
        badge: 'LIVE',
        priority: 1
      },
      ULTERIEUR: {
        id: 'ULTERIEUR',
        label: 'Ultérieur',
        description: 'Encodage différé des courses',
        color: 'warning',
        badge: 'DIFFÉRÉ',
        priority: 2
      },
      ADMIN: {
        id: 'ADMIN',
        label: 'Administrateur',
        description: 'Mode administrateur avec accès complet',
        color: 'primary',
        badge: 'ADMIN',
        priority: 3
      }
    };

    return modeInfos[mode] || modeInfos.LIVE;
  }, [currentMode]);

  // Vérifier si un mode est autorisé
  const isModeAllowed = useCallback((mode) => {
    return allowedModes.includes(mode);
  }, [allowedModes]);

  // Obtenir le mode recommandé selon le contexte
  const getRecommendedMode = useCallback(() => {
    const userRole = user?.role || user?.type_utilisateur;
    
    // Pour les administrateurs, recommander ADMIN si disponible
    if (['ADMIN', 'Administrateur'].includes(userRole) && allowedModes.includes('ADMIN')) {
      return 'ADMIN';
    }
    
    // Pour les autres rôles, recommander LIVE par défaut
    return 'LIVE';
  }, [user, allowedModes]);

  return {
    // État
    currentMode,
    allowedModes,
    isChanging,
    
    // Informations
    modeInfo: getModeInfo(),
    
    // Actions
    changeMode,
    getModeInfo,
    isModeAllowed,
    getRecommendedMode,
    
    // Utilitaires
    isLiveMode: currentMode === 'LIVE',
    isDeferredMode: currentMode === 'ULTERIEUR',
    isAdminMode: currentMode === 'ADMIN'
  };
}

export default useEncodingMode;