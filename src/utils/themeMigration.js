// Script de migration pour forcer l'application du nouveau thème en production
// À exécuter une seule fois lors du déploiement

import { forceDefaultTheme } from '../utils/themeUtils.js';

/**
 * Force la migration vers le nouveau thème par défaut (sideblock)
 * Ce script peut être exécuté côté client pour nettoyer les anciens paramètres
 */
function migrateToSideblockLayout() {
  console.log('🔄 Migration vers le layout Sideblock...');

  try {
    // Vérifier les paramètres actuels
    const currentSettings = localStorage.getItem('settings');

    if (currentSettings) {
      const parsed = JSON.parse(currentSettings);
      console.log('📋 Paramètres actuels:', parsed);

      if (parsed.themeLayout === 'main-layout') {
        console.log('🔧 Migration nécessaire: main-layout → sideblock');

        // Forcer les nouveaux paramètres
        const newSettings = forceDefaultTheme();
        console.log('✅ Nouveaux paramètres appliqués:', newSettings);

        // Recharger la page pour appliquer les changements
        if (confirm('Migration terminée ! Voulez-vous recharger la page pour appliquer les changements ?')) {
          window.location.reload();
        }
      } else {
        console.log('ℹ️ Le layout sideblock est déjà appliqué');
      }
    } else {
      console.log('ℹ️ Aucun paramètre trouvé, les défauts seront appliqués');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

// Exposer la fonction globalement pour pouvoir l'appeler depuis la console
if (typeof window !== 'undefined') {
  window.migrateToSideblockLayout = migrateToSideblockLayout;

  // Option: Exécuter automatiquement la migration au chargement
  // migrateToSideblockLayout();
}

export { migrateToSideblockLayout };
