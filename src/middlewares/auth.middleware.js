// src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware d'authentification JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token d\'authentification manquant',
        message: 'Veuillez vous connecter pour accéder à cette ressource',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Vérifier si l'utilisateur existe toujours
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        actif: true
      }
    });

    if (!utilisateur) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé',
        message: 'Le compte utilisateur n\'existe plus',
        timestamp: new Date().toISOString()
      });
    }

    if (!utilisateur.actif) {
      return res.status(401).json({
        error: 'Compte désactivé',
        message: 'Votre compte a été désactivé',
        timestamp: new Date().toISOString()
      });
    }

    // Ajouter les informations utilisateur à la requête
    req.user = {
      id: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token invalide',
        message: 'Le token d\'authentification est invalide',
        timestamp: new Date().toISOString()
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré',
        message: 'Votre session a expiré, veuillez vous reconnecter',
        timestamp: new Date().toISOString()
      });
    }

    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({
      error: 'Erreur d\'authentification',
      message: 'Une erreur est survenue lors de la vérification de l\'authentification',
      timestamp: new Date().toISOString()
    });
  }
};

// Middleware de vérification des rôles
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentification requise',
        message: 'Vous devez être connecté pour accéder à cette ressource',
        timestamp: new Date().toISOString()
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: `Cette ressource nécessite l'un des rôles suivants: ${roles.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

// Middleware pour vérifier si l'utilisateur est propriétaire de la ressource
export const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user.id;

      let isOwner = false;

      switch (resourceType) {
        case 'chauffeur': {
          const chauffeur = await prisma.chauffeur.findUnique({
            where: { id: parseInt(resourceId) },
            select: { utilisateur_id: true }
          });
          isOwner = chauffeur && chauffeur.utilisateur_id === userId;
          break;
        }

        case 'client':
          // Pour les clients, seuls les admins peuvent les modifier
          isOwner = req.user.role === 'admin';
          break;

        case 'vehicule':
          // Pour les véhicules, seuls les admins peuvent les modifier
          isOwner = req.user.role === 'admin';
          break;

        case 'feuille_route': {
          const feuilleRoute = await prisma.feuilleRoute.findUnique({
            where: { id: parseInt(resourceId) },
            select: { chauffeur: { select: { utilisateur_id: true } } }
          });
          isOwner = feuilleRoute && feuilleRoute.chauffeur.utilisateur_id === userId;
          break;
        }

        default:
          isOwner = req.user.role === 'admin';
      }

      if (!isOwner) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Vous n\'avez pas les droits pour modifier cette ressource',
          timestamp: new Date().toISOString()
        });
      }

      next();
    } catch (error) {
      console.error('Erreur de vérification de propriété:', error);
      return res.status(500).json({
        error: 'Erreur de vérification',
        message: 'Une erreur est survenue lors de la vérification des droits',
        timestamp: new Date().toISOString()
      });
    }
  };
};

// Middleware optionnel d'authentification (pour les endpoints publics)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          actif: true
        }
      });

      if (utilisateur && utilisateur.actif) {
        req.user = {
          id: utilisateur.id,
          email: utilisateur.email,
          role: utilisateur.role
        };
      }
    }

    next();
  } catch {
    // Ignorer les erreurs d'authentification optionnelle
    next();
  }
};