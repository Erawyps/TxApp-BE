// src/middlewares/error.middleware.js

// Middleware de gestion globale des erreurs
export const errorHandler = (err, req, res) => {
  console.error('Erreur détectée:', err);

  // Erreurs de Prisma
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Conflit de données',
          message: 'Une entrée avec ces données existe déjà',
          details: err.meta?.target ? `Champ(s) concerné(s): ${err.meta.target.join(', ')}` : undefined,
          timestamp: new Date().toISOString()
        });

      case 'P2025':
        return res.status(404).json({
          error: 'Ressource non trouvée',
          message: 'L\'élément demandé n\'existe pas',
          timestamp: new Date().toISOString()
        });

      case 'P2003':
        return res.status(400).json({
          error: 'Contrainte de clé étrangère',
          message: 'Impossible de supprimer cette ressource car elle est référencée ailleurs',
          timestamp: new Date().toISOString()
        });

      default:
        console.error('Erreur Prisma non gérée:', err);
    }
  }

  // Erreurs de validation Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Données de validation invalides',
      message: 'Les données fournies ne respectent pas le format attendu',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      })),
      timestamp: new Date().toISOString()
    });
  }

  // Erreurs de syntaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON invalide',
      message: 'Le corps de la requête contient du JSON mal formé',
      timestamp: new Date().toISOString()
    });
  }

  // Erreurs d'authentification JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide',
      message: 'Le token d\'authentification est invalide',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré',
      message: 'Votre session a expiré, veuillez vous reconnecter',
      timestamp: new Date().toISOString()
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Une erreur interne du serveur est survenue';

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Erreur interne du serveur' : 'Erreur de requête',
    message: statusCode >= 500 ? 'Une erreur inattendue s\'est produite' : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};

// Middleware pour les routes non trouvées
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.method} ${req.path} n'existe pas`,
    timestamp: new Date().toISOString()
  });
};

// Middleware de logging des requêtes
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};

// Middleware de limitation du taux de requêtes (basique)
const requestCounts = new Map();

export const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requestCounts.has(key)) {
      requestCounts.set(key, []);
    }

    const requests = requestCounts.get(key);
    // Filtrer les requêtes dans la fenêtre
    const validRequests = requests.filter(time => time > windowStart);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Trop de requêtes',
        message: 'Vous avez dépassé la limite de requêtes autorisée',
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000),
        timestamp: new Date().toISOString()
      });
    }

    validRequests.push(now);
    requestCounts.set(key, validRequests);

    next();
  };
};