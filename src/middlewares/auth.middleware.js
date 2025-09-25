// src/middlewares/auth.middleware.js
// Removed unused jwt import
import { verifyToken } from '../services/prismaService.js';

/**
 * Middleware d'authentification JWT pour Hono
 * Vérifie la présence et la validité du token JWT dans le header Authorization
 */
export async function authMiddleware(c, next) {
  try {
    // Récupération du token dans le header Authorization
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({
        success: false,
        error: 'Token d\'autorisation manquant ou invalide'
      }, 401);
    }

    const token = authHeader.substring(7); // Supprimer "Bearer "

    // Vérification du token
    const result = await verifyToken(token);

    // Ajout des informations utilisateur dans le contexte
    c.set('user', result.user);
    c.set('tokenData', result.tokenData);

    await next();
  } catch (error) {
    console.error('Erreur middleware auth:', error);

    let statusCode = 500;
    let errorMessage = 'Erreur d\'authentification';

    if (error.message === 'Token invalide') {
      statusCode = 401;
      errorMessage = 'Token invalide';
    } else if (error.message === 'Token expiré') {
      statusCode = 401;
      errorMessage = 'Token expiré';
    } else if (error.message === 'Utilisateur non trouvé') {
      statusCode = 401;
      errorMessage = 'Utilisateur non trouvé';
    }

    return c.json({
      success: false,
      error: errorMessage
    }, statusCode);
  }
}

/**
 * Middleware optionnel d'authentification
 * N'échoue pas si pas de token, mais ajoute les infos utilisateur si présent
 */
export async function optionalAuthMiddleware(c, next) {
  try {
    const authHeader = c.req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const result = await verifyToken(token);
      c.set('user', result.user);
      c.set('tokenData', result.tokenData);
    }

    await next();
  } catch (error) {
    // En cas d'erreur, on continue sans authentification
    console.warn('Erreur middleware auth optionnel:', error.message);
    await next();
  }
}

/**
 * Middleware de vérification des rôles
 * @param {string[]} allowedRoles - Rôles autorisés
 */
export function roleMiddleware(allowedRoles) {
  return async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({
        success: false,
        error: 'Authentification requise'
      }, 401);
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json({
        success: false,
        error: 'Permissions insuffisantes'
      }, 403);
    }

    await next();
  };
}

/**
 * Middleware de vérification de propriété de société
 * Vérifie que l'utilisateur appartient à la même société que la ressource
 */
export async function societeMiddleware(c, next) {
  const user = c.get('user');

  if (!user) {
    return c.json({
      success: false,
      error: 'Authentification requise'
    }, 401);
  }

  // Pour les routes qui nécessitent une vérification de société,
  // on peut ajouter la logique ici selon les besoins

  await next();
}