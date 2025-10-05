/**
 * Point d'entrée unifié pour l'authentification - TxApp
 */

// Provider principal
export { default as UnifiedAuthProvider } from './UnifiedProvider.jsx';

// Hook d'utilisation
export { useUnifiedAuth } from '../../hooks/useUnifiedAuth.js';

// Pour compatibilité
export { default as AuthProvider } from './UnifiedProvider.jsx';

// Context (si nécessaire)
export { AuthContext } from './UnifiedProvider.jsx';
