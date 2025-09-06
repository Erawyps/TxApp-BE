// Utilitaire pour gérer la migration et la validation des paramètres de thème
import { defaultTheme } from "configs/theme.config";

export const THEME_CONFIG_VERSION = "2.0.0";

/**
 * Valide et migre les paramètres de thème stockés
 * @param {Object} storedSettings - Paramètres stockés dans localStorage
 * @returns {Object} - Paramètres validés et migrés
 */
export function validateAndMigrateThemeSettings(storedSettings) {
  // Si aucun paramètre stocké, retourner les défauts
  if (!storedSettings || typeof storedSettings !== 'object') {
    return {
      ...defaultTheme,
      _version: THEME_CONFIG_VERSION,
    };
  }

  const storedVersion = storedSettings._version;

  // Forcer la migration si pas de version ou version différente
  if (!storedVersion || storedVersion !== THEME_CONFIG_VERSION) {
    console.info('Migrating theme settings to version', THEME_CONFIG_VERSION);

    return {
      // Toujours utiliser les nouvelles valeurs par défaut comme base
      ...defaultTheme,
      // Préserver certaines préférences utilisateur si elles sont valides
      themeMode: isValidThemeMode(storedSettings.themeMode) ? storedSettings.themeMode : defaultTheme.themeMode,
      isMonochrome: typeof storedSettings.isMonochrome === 'boolean' ? storedSettings.isMonochrome : defaultTheme.isMonochrome,
      cardSkin: isValidCardSkin(storedSettings.cardSkin) ? storedSettings.cardSkin : defaultTheme.cardSkin,
      // FORCER le nouveau layout par défaut - ne pas préserver l'ancien
      themeLayout: defaultTheme.themeLayout,
      // Préserver les schémas de couleur s'ils sont valides
      darkColorScheme: isValidColorScheme(storedSettings.darkColorScheme) ? storedSettings.darkColorScheme : defaultTheme.darkColorScheme,
      lightColorScheme: isValidColorScheme(storedSettings.lightColorScheme) ? storedSettings.lightColorScheme : defaultTheme.lightColorScheme,
      primaryColorScheme: isValidColorScheme(storedSettings.primaryColorScheme) ? storedSettings.primaryColorScheme : defaultTheme.primaryColorScheme,
      notification: isValidNotificationSettings(storedSettings.notification) ? storedSettings.notification : defaultTheme.notification,
      _version: THEME_CONFIG_VERSION,
    };
  }

  // Si la version est correcte, valider quand même les paramètres
  return {
    ...storedSettings,
    // S'assurer que le layout est valide
    themeLayout: isValidThemeLayout(storedSettings.themeLayout) ? storedSettings.themeLayout : defaultTheme.themeLayout,
  };
}

/**
 * Nettoie complètement les paramètres de thème (force reset)
 */
export function clearThemeSettings() {
  try {
    localStorage.removeItem('settings');
    console.info('Theme settings cleared');
  } catch (error) {
    console.warn('Failed to clear theme settings:', error);
  }
}

// Fonctions de validation
function isValidThemeMode(mode) {
  return ['light', 'dark', 'system'].includes(mode);
}

function isValidThemeLayout(layout) {
  return ['main-layout', 'sideblock'].includes(layout);
}

function isValidCardSkin(skin) {
  return ['bordered', 'shadow-sm'].includes(skin);
}

function isValidColorScheme(scheme) {
  return scheme && typeof scheme === 'object' && typeof scheme.name === 'string';
}

function isValidNotificationSettings(notification) {
  return notification &&
         typeof notification === 'object' &&
         typeof notification.isExpanded === 'boolean' &&
         typeof notification.position === 'string' &&
         typeof notification.visibleToasts === 'number';
}

/**
 * Force l'application du nouveau thème par défaut
 * Utile pour le déploiement en production
 */
export function forceDefaultTheme() {
  try {
    const newSettings = {
      ...defaultTheme,
      _version: THEME_CONFIG_VERSION,
    };
    localStorage.setItem('settings', JSON.stringify(newSettings));
    console.info('Default theme forced');
    return newSettings;
  } catch (error) {
    console.warn('Failed to force default theme:', error);
    return defaultTheme;
  }
}
