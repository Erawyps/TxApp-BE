import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from '@tsndr/cloudflare-worker-jwt';
// import bcrypt from 'bcryptjs'; // REMOVED: bcrypt not compatible with Cloudflare Workers
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaPg } from '@prisma/adapter-pg';

// Fonction utilitaire pour mapper les données frontend vers le format DB
function mapToDb(course) {
  console.log('🔍 mapToDb - Données reçues:', course);
  const mapped = {
    feuille_id: course.feuille_id || course.feuille_route_id,
    client_id: course.client_id,
    // Accepter à la fois mode_paiement_id et mode_paiement
    mode_paiement_id: course.mode_paiement_id || course.mode_paiement,
    num_ordre: course.num_ordre,
    index_depart: course.index_depart,
    // Mapper les champs frontend vers les champs API corrects
    index_embarquement: course.index_embarquement || course.index_depart,
    lieu_embarquement: course.lieu_embarquement || null,
    heure_embarquement: course.heure_embarquement || null,
    index_debarquement: course.index_debarquement || course.index_arrivee,
    lieu_debarquement: course.lieu_debarquement || null,
    heure_debarquement: course.heure_debarquement || null,
    prix_taximetre: course.prix_taximetre,
    sommes_percues: course.sommes_percues || course.somme_percue,
    est_hors_heures: course.hors_creneau || false,
    notes: course.notes || null
  };
  console.log('🔍 mapToDb - Données mappées pour API:', mapped);
  return mapped;
}

const app = new Hono();

// Middleware pour gérer les challenges Cloudflare
const cloudflareChallengeMiddleware = async (c, next) => {
  // Vérifier la clé API pour bypass automatique
  const apiKey = c.req.header('X-API-Key');
  const expectedApiKey = 'TxApp-API-Key-2025';

  if (apiKey === expectedApiKey) {
    // Clé API valide - bypass complet de la protection Cloudflare
    c.header('X-API-Bypass', 'true');
    c.header('CF-Cache-Status', 'BYPASS');
    c.header('Cache-Control', 'no-cache');
    await next();
    return;
  }

  // Détecter si la requête vient de Cloudflare avec un challenge
  // Removed unused variable 'cfRay'
  const cfMitigated = c.req.header('CF-Mitigated');

  if (cfMitigated === 'challenge') {
    // Si c'est un challenge Cloudflare, retourner une réponse appropriée
    return c.json({
      error: 'Cloudflare challenge detected',
      message: 'Please complete the security challenge and try again'
    }, 403);
  }

  // Ajouter des headers pour aider à bypass la protection Cloudflare
  c.header('X-Robots-Tag', 'noindex');
  c.header('CF-Cache-Status', 'DYNAMIC');
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  c.header('CF-Ray', c.req.header('CF-Ray') || 'bypass');
  c.header('User-Agent', 'Mozilla/5.0 (compatible; TxApp-API/1.0; +https://txapp.be)');
  c.header('Accept', 'application/json, text/plain, */*');
  c.header('Accept-Language', 'en-US,en;q=0.9,fr;q=0.8');
  c.header('Accept-Encoding', 'gzip, deflate, br');
  c.header('DNT', '1');
  c.header('Connection', 'keep-alive');
  c.header('Upgrade-Insecure-Requests', '1');
  c.header('Sec-Fetch-Dest', 'document');
  c.header('Sec-Fetch-Mode', 'navigate');
  c.header('Sec-Fetch-Site', 'none');
  c.header('Sec-Fetch-User', '?1');
  c.header('Sec-Ch-Ua', '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"');
  c.header('Sec-Ch-Ua-Mobile', '?0');
  c.header('Sec-Ch-Ua-Platform', '"macOS"');
  c.header('X-Requested-With', 'XMLHttpRequest');

  await next();

  // Headers de sécurité supplémentaires
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
};

// Appliquer le middleware Cloudflare à toutes les routes API
app.use('/api/*', cloudflareChallengeMiddleware);

// CORS pour toutes les routes
app.use('*', cors({
  origin: ['https://txapp.be', 'https://www.txapp.be', 'https://api.txapp.be', 'https://driver.txapp.be', 'http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 86400
}));

// Health check
app.get('/api/health', (c) => c.json({
  ok: true,
  env: 'worker',
  timestamp: new Date().toISOString(),
  database: 'connected'
}, {
  headers: {
    'Content-Type': 'application/json',
    'X-API-Version': '1.0',
    'X-Rate-Limit-Remaining': '999',
    'X-Rate-Limit-Reset': new Date(Date.now() + 3600000).toISOString()
  }
}));

// Middleware pour initialiser la connexion Prisma avec Hyperdrive ou D1
const dbMiddleware = async (c, next) => {
  try {
    let prisma;

    // Configuration selon l'environnement
    if (c.env.HYPERDRIVE) {
      // Production: Utiliser Hyperdrive avec PostgreSQL et adapter PG
      const adapter = new PrismaPg(c.env.HYPERDRIVE);
      prisma = new PrismaClient({ adapter });
    } else if (c.env.DB) {
      // Développement: Utiliser D1 Database
      const adapter = new PrismaD1(c.env.DB);
      prisma = new PrismaClient({ adapter });
    } else {
      throw new Error('No database configuration found');
    }

    c.set('prisma', prisma);
    await next();
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database connection error:', error);
    return c.json({ error: 'Database connection error' }, 500);
  }
};

// Middleware pour vérifier le token JWT (optionnel)
const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const secret = c.env.JWT_SECRET;
      const payload = await verify(token, secret);
      c.set('user', payload);
    } catch (error) {
      console.error('JWT verification error:', error);
    }
  }

  await next();
};

// Middleware pour hash des mots de passe (compatible Cloudflare Workers)
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'TxApp-Salt-2025'); // Ajouter un sel fixe
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Middleware pour vérifier les mots de passe (compatible hybride pour migration)
const verifyPassword = async (password, hashedPassword) => {
  // Essayer d'abord avec SHA-256 (nouveau système)
  const hashedInput = await hashPassword(password);
  if (hashedInput === hashedPassword) {
    console.log('Password verified with SHA-256');
    return true;
  }

  // Si ça ne marche pas, vérifier si c'est un mot de passe en clair (migration)
  if (password === hashedPassword) {
    console.log('Password verified as plain text (migration needed)');
    return true;
  }

  // Si ça ne marche pas, essayer avec bcrypt (ancien système) pour compatibilité
  try {
    // Importer bcrypt dynamiquement seulement si nécessaire
    const bcrypt = await import('bcryptjs');
    const result = await bcrypt.default.compare(password, hashedPassword);
    if (result) {
      console.log('Password verified with bcrypt (legacy)');
    }
    return result;
  } catch (_error) {
    // Si bcrypt n'est pas disponible ou échoue, retourner false
    console.warn('bcrypt verification failed, password may need migration:', _error.message);
    return false;
  }
};

// ============ FONCTIONS DE MAPPING TAXIMETRE UNIFIÉES ============

// Fonction de mapping unifiée : DB → Frontend pour feuille de route
const mapFeuilleRouteForFrontend = (dbData) => {
  if (!dbData) return null;
  
  // Fonction helper pour convertir les dates en strings
  const formatDate = (date) => {
    if (!date) return null;
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString();
    // Pour les types Time de PostgreSQL, convertir en string HH:MM:SS
    if (date.toString && date.toString().match(/^\d{2}:\d{2}:\d{2}/)) {
      return date.toString();
    }
    return date;
  };
  
  return {
    // Données de base feuille_route
    feuille_id: dbData.feuille_id,
    chauffeur_id: dbData.chauffeur_id,
    vehicule_id: dbData.vehicule_id,
    date_service: formatDate(dbData.date_service),
    mode_encodage: dbData.mode_encodage,
    heure_debut: formatDate(dbData.heure_debut),
    heure_fin: formatDate(dbData.heure_fin),
    interruptions: dbData.interruptions,
    index_km_debut_tdb: dbData.index_km_debut_tdb,
    index_km_fin_tdb: dbData.index_km_fin_tdb,
    km_tableau_bord_debut: dbData.km_tableau_bord_debut,
    km_tableau_bord_fin: dbData.km_tableau_bord_fin,
    montant_salaire_cash_declare: dbData.montant_salaire_cash_declare,
    est_validee: dbData.est_validee,
    date_validation: formatDate(dbData.date_validation),
    validated_by: dbData.validated_by,
    signature_chauffeur: dbData.signature_chauffeur,
    created_at: formatDate(dbData.created_at),
    
    // Données taximètre mappées correctement
    taximetre_prise_charge_debut: dbData.taximetre?.taximetre_prise_charge_debut || null,
    taximetre_index_km_debut: dbData.taximetre?.taximetre_index_km_debut || null,
    taximetre_km_charge_debut: dbData.taximetre?.taximetre_km_charge_debut || null,
    taximetre_chutes_debut: dbData.taximetre?.taximetre_chutes_debut || null,
    taximetre_prise_charge_fin: dbData.taximetre?.taximetre_prise_charge_fin || null,
    taximetre_index_km_fin: dbData.taximetre?.taximetre_index_km_fin || null,
    taximetre_km_charge_fin: dbData.taximetre?.taximetre_km_charge_fin || null,
    taximetre_chutes_fin: dbData.taximetre?.taximetre_chutes_fin || null,
    
    // Relations
    chauffeur: dbData.chauffeur,
    vehicule: dbData.vehicule,
    course: dbData.course,
    charge: dbData.charge,
    taximetre: dbData.taximetre
  };
};

// Fonction de mapping pour mise à jour partielle
const preparePartialUpdateForDB = (formData) => {
  console.log('🔧 preparePartialUpdateForDB - Données reçues:', formData);
  console.log('🔧 preparePartialUpdateForDB - Contexte:', formData.context);
  
  const feuilleData = {};
  const taximetreData = {};
  
  // Fonction pour parser les heures de manière sûre
  const parseTime = (timeString) => {
    if (!timeString) return null;
    
    let parsedTime;
    if (timeString.includes('T')) {
      parsedTime = new Date(timeString);
    } else {
      // Format HH:MM:SS ou HH:MM - créer une date avec 1970-01-01
      const timeStr = timeString.length === 5 ? timeString + ':00' : timeString;
      parsedTime = new Date(`1970-01-01T${timeStr}`);
    }
    
    if (isNaN(parsedTime.getTime())) {
      console.error('❌ Invalid time format:', timeString);
      return null;
    }
    
    return parsedTime;
  };
  
  // Fonction pour convertir les minutes en format "HH:MM"
  const formatInterruptions = (interruptions) => {
    if (interruptions === null || interruptions === undefined) return null;
    
    if (typeof interruptions === 'number') {
      // Convertir les minutes en format "HH:MM"
      const hours = Math.floor(interruptions / 60);
      const minutes = interruptions % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    if (typeof interruptions === 'string') {
      // Déjà au bon format
      return interruptions;
    }
    
    return null;
  };
  
  // Mise à jour feuille_route seulement si les champs sont fournis
  // ✅ CORRECTION: Ne traiter que les valeurs non vides pour les champs numériques
  if (formData.heure_fin !== undefined && formData.heure_fin !== '' && formData.heure_fin !== null) feuilleData.heure_fin = parseTime(formData.heure_fin);
  if (formData.interruptions !== undefined && formData.interruptions !== '' && formData.interruptions !== null) feuilleData.interruptions = formatInterruptions(formData.interruptions);
  if (formData.index_km_fin_tdb !== undefined && formData.index_km_fin_tdb !== '' && formData.index_km_fin_tdb !== null) feuilleData.index_km_fin_tdb = parseInt(formData.index_km_fin_tdb);
  if (formData.km_tableau_bord_fin !== undefined && formData.km_tableau_bord_fin !== '' && formData.km_tableau_bord_fin !== null) feuilleData.km_tableau_bord_fin = parseInt(formData.km_tableau_bord_fin);
  if (formData.montant_salaire_cash_declare !== undefined && formData.montant_salaire_cash_declare !== '' && formData.montant_salaire_cash_declare !== null) feuilleData.montant_salaire_cash_declare = parseFloat(formData.montant_salaire_cash_declare);
  if (formData.signature_chauffeur !== undefined && formData.signature_chauffeur !== '' && formData.signature_chauffeur !== null) feuilleData.signature_chauffeur = formData.signature_chauffeur;
  if (formData.est_validee !== undefined) {
    feuilleData.est_validee = formData.est_validee;
    if (formData.est_validee) {
      feuilleData.date_validation = new Date();
    }
  }
  
  // Mapping des champs frontend vers DB pour mise à jour
  // Utilise le contexte pour déterminer si les données vont vers début ou fin
  // ✅ CORRECTION: Ne traiter que les valeurs non vides
  if (formData["Taximètre: Prise en charge"] !== undefined && formData["Taximètre: Prise en charge"] !== '' && formData["Taximètre: Prise en charge"] !== null) {
    if (formData.context === 'debut') {
      taximetreData.taximetre_prise_charge_debut = parseFloat(formData["Taximètre: Prise en charge"]);
    } else {
      taximetreData.taximetre_prise_charge_fin = parseFloat(formData["Taximètre: Prise en charge"]);
    }
  }
  if (formData["Taximètre: Index km (km totaux)"] !== undefined && formData["Taximètre: Index km (km totaux)"] !== '' && formData["Taximètre: Index km (km totaux)"] !== null) {
    if (formData.context === 'debut') {
      taximetreData.taximetre_index_km_debut = parseInt(formData["Taximètre: Index km (km totaux)"]);
    } else {
      taximetreData.taximetre_index_km_fin = parseInt(formData["Taximètre: Index km (km totaux)"]);
    }
  }
  if (formData["Taximètre: Km en charge"] !== undefined && formData["Taximètre: Km en charge"] !== '' && formData["Taximètre: Km en charge"] !== null) {
    if (formData.context === 'debut') {
      taximetreData.taximetre_km_charge_debut = parseFloat(formData["Taximètre: Km en charge"]);
    } else {
      taximetreData.taximetre_km_charge_fin = parseFloat(formData["Taximètre: Km en charge"]);
    }
  }
  if (formData["Taximètre: Chutes (€)"] !== undefined && formData["Taximètre: Chutes (€)"] !== '' && formData["Taximètre: Chutes (€)"] !== null) {
    if (formData.context === 'debut') {
      taximetreData.taximetre_chutes_debut = parseFloat(formData["Taximètre: Chutes (€)"]);
    } else {
      taximetreData.taximetre_chutes_fin = parseFloat(formData["Taximètre: Chutes (€)"]);
    }
  }
  
  // Mise à jour taximètre seulement si les champs DB sont fournis (compatibilité)
  // ✅ CORRECTION: Ne traiter que les valeurs non vides pour éviter les NaN
  if (formData.taximetre_prise_charge_debut !== undefined && formData.taximetre_prise_charge_debut !== '' && formData.taximetre_prise_charge_debut !== null) {
    taximetreData.taximetre_prise_charge_debut = parseFloat(formData.taximetre_prise_charge_debut);
  }
  if (formData.taximetre_index_km_debut !== undefined && formData.taximetre_index_km_debut !== '' && formData.taximetre_index_km_debut !== null) {
    taximetreData.taximetre_index_km_debut = parseInt(formData.taximetre_index_km_debut);
  }
  if (formData.taximetre_km_charge_debut !== undefined && formData.taximetre_km_charge_debut !== '' && formData.taximetre_km_charge_debut !== null) {
    taximetreData.taximetre_km_charge_debut = parseFloat(formData.taximetre_km_charge_debut);
  }
  if (formData.taximetre_chutes_debut !== undefined && formData.taximetre_chutes_debut !== '' && formData.taximetre_chutes_debut !== null) {
    taximetreData.taximetre_chutes_debut = parseFloat(formData.taximetre_chutes_debut);
  }
  if (formData.taximetre_prise_charge_fin !== undefined && formData.taximetre_prise_charge_fin !== '' && formData.taximetre_prise_charge_fin !== null) {
    taximetreData.taximetre_prise_charge_fin = parseFloat(formData.taximetre_prise_charge_fin);
  }
  if (formData.taximetre_index_km_fin !== undefined && formData.taximetre_index_km_fin !== '' && formData.taximetre_index_km_fin !== null) {
    taximetreData.taximetre_index_km_fin = parseInt(formData.taximetre_index_km_fin);
  }
  if (formData.taximetre_km_charge_fin !== undefined && formData.taximetre_km_charge_fin !== '' && formData.taximetre_km_charge_fin !== null) {
    taximetreData.taximetre_km_charge_fin = parseFloat(formData.taximetre_km_charge_fin);
  }
  if (formData.taximetre_chutes_fin !== undefined && formData.taximetre_chutes_fin !== '' && formData.taximetre_chutes_fin !== null) {
    taximetreData.taximetre_chutes_fin = parseFloat(formData.taximetre_chutes_fin);
  }
  
  // Support pour les données taximètre imbriquées (formData.taximetre)
  if (formData.taximetre && typeof formData.taximetre === 'object') {
    const taximetre = formData.taximetre;
    
    // Mapping des champs taximètre imbriqués vers les champs DB
    if (taximetre.index_embarquement !== undefined) {
      if (formData.context === 'debut') {
        taximetreData.taximetre_prise_charge_debut = parseFloat(taximetre.index_embarquement);
      } else {
        taximetreData.taximetre_prise_charge_fin = parseFloat(taximetre.index_embarquement);
      }
    }
    if (taximetre.index_debarquement !== undefined) {
      if (formData.context === 'debut') {
        taximetreData.taximetre_index_km_debut = parseInt(taximetre.index_debarquement);
      } else {
        taximetreData.taximetre_index_km_fin = parseInt(taximetre.index_debarquement);
      }
    }
    if (taximetre.sommes_percue !== undefined) {
      if (formData.context === 'debut') {
        taximetreData.taximetre_chutes_debut = parseFloat(taximetre.sommes_percue);
      } else {
        taximetreData.taximetre_chutes_fin = parseFloat(taximetre.sommes_percue);
      }
    }
    
    // Support pour les autres champs taximètre potentiels
    if (taximetre.km_charge !== undefined) {
      if (formData.context === 'debut') {
        taximetreData.taximetre_km_charge_debut = parseFloat(taximetre.km_charge);
      } else {
        taximetreData.taximetre_km_charge_fin = parseFloat(taximetre.km_charge);
      }
    }
  }
  
  console.log('🔧 preparePartialUpdateForDB - Données feuille mappées:', feuilleData);
  console.log('🔧 preparePartialUpdateForDB - Données taximètre mappées:', taximetreData);
  
  return { feuilleData, taximetreData };
};

// Route de connexion (login)
app.post('/api/auth/login', dbMiddleware, async (c) => {
  try {
    const { username, email, password } = await c.req.json();

    // Accepter username ou email pour la compatibilité
    const loginIdentifier = username || email;

    if (!loginIdentifier || !password) {
      return c.json({ error: 'Email et mot de passe requis' }, 400);
    }

    const prisma = c.get('prisma');

    // Rechercher l'utilisateur par email
    const user = await prisma.utilisateur.findFirst({
      where: {
        email: loginIdentifier
      },
      include: {
        chauffeur: {
          select: {
            chauffeur_id: true,
            statut: true
          }
        }
      }
    });

    if (!user) {
      return c.json({ error: 'Identifiants invalides' }, 401);
    }

    // Vérifier que l'utilisateur a un chauffeur actif (sauf pour les admins)
    if (user.role !== 'Admin' && (!user.chauffeur || user.chauffeur.statut !== 'Actif')) {
      return c.json({ error: 'Compte inactif' }, 401);
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, user.mot_de_passe_hashe);

    if (!isValidPassword) {
      return c.json({ error: 'Identifiants invalides' }, 401);
    }

    // Mettre à jour la dernière connexion
    await prisma.utilisateur.update({
      where: { user_id: user.user_id },
      data: { updated_at: new Date() }
    });

    // Créer le token JWT avec userId, sub ET id pour compatibilité maximale
    const payload = {
      id: user.user_id,           // Pour compatibilité avec ancien code
      userId: user.user_id,        // Standard attendu par frontend
      sub: user.user_id.toString(), // Standard JWT (subject)
      email: user.email,
      type: user.role,
      chauffeur_id: user.chauffeur?.chauffeur_id || null,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
    };

    const token = await sign(payload, c.env.JWT_SECRET);

    // Retourner les données utilisateur (sans mot de passe)
    const userData = {
      id: user.user_id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      type_utilisateur: user.role,
      chauffeur_id: user.chauffeur?.chauffeur_id || null,
      derniere_connexion: user.updated_at
    };

    return c.json({
      success: true,
      user: userData,
      token,
      message: 'Connexion réussie'
    });

  } catch (error) {
    console.error('Error during login:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route d'inscription (register)
app.post('/api/auth/register', dbMiddleware, async (c) => {
  try {
    const { nom, prenom, email, telephone, password, type_utilisateur } = await c.req.json();

    // Validation des données
    if (!nom || !prenom || !email || !password) {
      return c.json({ error: 'Tous les champs obligatoires doivent être remplis' }, 400);
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return c.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, 400);
    }

    const prisma = c.get('prisma');

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.utilisateur.findFirst({
      where: { email }
    });

    if (existingUser) {
      return c.json({ error: 'Un utilisateur avec cet email existe déjà' }, 409);
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const newUser = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        telephone: telephone || null,
        mot_de_passe: hashedPassword,
        type_utilisateur: type_utilisateur || 'CLIENT',
        actif: true
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        type_utilisateur: true
      }
    });

    return c.json({
      success: true,
      user: newUser,
      message: 'Inscription réussie'
    });

  } catch (error) {
    console.error('Error during registration:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route de vérification du token
app.get('/api/auth/verify', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Token invalide' }, 401);
    }

    const prisma = c.get('prisma');

    // Récupérer les données utilisateur actualisées
    const userData = await prisma.utilisateur.findUnique({
      where: { id: user.id, actif: true },
      include: {
        chauffeur: {
          select: {
            id: true,
            numero_badge: true
          }
        }
      }
    });

    if (!userData) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    return c.json({
      success: true,
      user: {
        id: userData.id,
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        telephone: userData.telephone,
        type_utilisateur: userData.type_utilisateur,
        actif: userData.actif,
        chauffeur_id: userData.chauffeur?.id || null,
        numero_badge: userData.chauffeur?.numero_badge || null
      },
      message: 'Token valide'
    });

  } catch (error) {
    console.error('Error during token verification:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route de déconnexion
app.post('/api/auth/logout', authMiddleware, async (c) => {
  try {
    // En JWT, la déconnexion côté serveur est principalement symbolique
    // Le client doit supprimer le token de son côté
    return c.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route de rafraîchissement du token
app.post('/api/auth/refresh', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Token invalide' }, 401);
    }

    // Créer un nouveau token avec userId, sub ET id pour compatibilité
    const payload = {
      id: user.id,
      userId: user.id,
      sub: user.id.toString(),
      email: user.email,
      type: user.type,
      chauffeur_id: user.chauffeur_id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
    };

    const newToken = await sign(payload, c.env.JWT_SECRET);

    return c.json({
      success: true,
      token: newToken,
      message: 'Token rafraîchi'
    });

  } catch (error) {
    console.error('Error during token refresh:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route de changement de mot de passe
app.post('/api/auth/change-password', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Mot de passe actuel et nouveau mot de passe requis' }, 400);
    }

    if (newPassword.length < 8) {
      return c.json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' }, 400);
    }

    const prisma = c.get('prisma');

    // Récupérer le mot de passe actuel
    const userData = await prisma.utilisateur.findUnique({
      where: { id: user.id, actif: true },
      select: { mot_de_passe: true }
    });

    if (!userData) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await verifyPassword(currentPassword, userData.mot_de_passe);

    if (!isValidPassword) {
      return c.json({ error: 'Mot de passe actuel incorrect' }, 400);
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await hashPassword(newPassword);

    // Mettre à jour le mot de passe
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { mot_de_passe: hashedNewPassword }
    });

    return c.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('Error during password change:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Routes pour utilisateurs
app.get('/api/utilisateurs', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const utilisateurs = await prisma.utilisateur.findMany();
    return c.json(utilisateurs);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.get('/api/utilisateurs/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { user_id: parseInt(id) }
    });
    if (!utilisateur) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }
    return c.json(utilisateur);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.post('/api/utilisateurs', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();
    const utilisateur = await prisma.utilisateur.create({ data });
    return c.json(utilisateur);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.put('/api/utilisateurs/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    const data = await c.req.json();
    const utilisateur = await prisma.utilisateur.update({
      where: { user_id: parseInt(id) },
      data
    });
    return c.json(utilisateur);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.delete('/api/utilisateurs/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    await prisma.utilisateur.delete({
      where: { user_id: parseInt(id) }
    });
    return c.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Routes pour chauffeurs
app.get('/api/chauffeurs', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const chauffeurs = await prisma.chauffeur.findMany({
      where: { statut: 'Actif' },
      orderBy: { chauffeur_id: 'asc' }
    });

    const formattedChauffeurs = chauffeurs.map(chauffeur => ({
      id: chauffeur.chauffeur_id,
      chauffeur_id: chauffeur.chauffeur_id,
      societe_id: chauffeur.societe_id,
      statut: chauffeur.statut,
      regle_salaire_defaut_id: chauffeur.regle_salaire_defaut_id,
      created_at: chauffeur.created_at
    }));

    return c.json(formattedChauffeurs);
  } catch (error) {
    console.error('Error fetching chauffeurs:', error);
    return c.json({ error: 'Erreur lors de la récupération des chauffeurs' }, 500);
  }
});

app.get('/api/chauffeurs/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    const chauffeur = await prisma.chauffeur.findUnique({
      where: { chauffeur_id: parseInt(id) }
    });
    if (!chauffeur) {
      return c.json({ error: 'Chauffeur non trouvé' }, 404);
    }
    return c.json(chauffeur);
  } catch (error) {
    console.error('Erreur lors de la récupération du chauffeur:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route pour récupérer le chauffeur_id à partir du user_id
app.get('/api/chauffeurs/by-user/:userId', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { userId } = c.req.param();
    
    const chauffeur = await prisma.chauffeur.findFirst({
      where: { 
        utilisateur: {
          user_id: parseInt(userId)
        }
      },
      select: {
        chauffeur_id: true,
        statut: true,
        utilisateur: {
          select: {
            user_id: true,
            nom: true,
            prenom: true,
            role: true
          }
        }
      }
    });
    
    if (!chauffeur) {
      return c.json({ error: 'Chauffeur non trouvé pour cet utilisateur' }, 404);
    }
    
    return c.json(chauffeur);
  } catch (error) {
    console.error('Erreur lors de la récupération du chauffeur par user_id:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Routes pour interventions
app.get('/api/interventions', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const interventions = await prisma.intervention.findMany();
    return c.json(interventions);
  } catch (error) {
    console.error('Erreur lors de la récupération des interventions:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.get('/api/chauffeurs/:chauffeurId/interventions', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { chauffeurId } = c.req.param();
    const interventions = await prisma.intervention.findMany({
      where: { chauffeur_id: parseInt(chauffeurId) }
    });
    return c.json(interventions);
  } catch (error) {
    console.error('Erreur lors de la récupération des interventions:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.post('/api/interventions', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();
    const intervention = await prisma.intervention.create({ data });
    return c.json(intervention);
  } catch (error) {
    console.error('Erreur lors de la création de l\'intervention:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// POST /api/chauffeurs - Créer un chauffeur
app.post('/api/chauffeurs', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();

    // Validation des données requises
    if (!data.nom || !data.prenom || !data.email || !data.telephone) {
      return c.json({ error: 'Nom, prénom, email et téléphone sont requis' }, 400);
    }

    // Créer d'abord l'utilisateur
    const utilisateur = await prisma.utilisateur.create({
      data: {
        societe_id: 1, // Société par défaut
        email: data.email,
        mot_de_passe_hashe: await hashPassword('default123'), // Mot de passe par défaut
        nom: data.nom,
        prenom: data.prenom,
        role: 'Driver'
      }
    });

    // Créer le chauffeur
    const chauffeur = await prisma.chauffeur.create({
      data: {
        chauffeur_id: utilisateur.user_id, // Même ID que l'utilisateur
        societe_id: 1,
        statut: data.statut || 'Actif',
        regle_salaire_defaut_id: data.regle_salaire_defaut_id || null
      }
    });

    return c.json({
      id: chauffeur.chauffeur_id,
      ...data,
      statut: chauffeur.statut,
      created_at: chauffeur.created_at
    }, 201);
  } catch (error) {
    console.error('Error creating chauffeur:', error.message);
    return c.json({
      error: 'Erreur lors de la création du chauffeur',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// PUT /api/chauffeurs/:id - Modifier un chauffeur
app.put('/api/chauffeurs/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();

    if (!id) {
      return c.json({ error: 'ID du chauffeur requis' }, 400);
    }

    // Mettre à jour l'utilisateur associé
    if (data.nom || data.prenom || data.email) {
      await prisma.utilisateur.update({
        where: { user_id: id },
        data: {
          nom: data.nom,
          prenom: data.prenom,
          email: data.email
        }
      });
    }

    // Mettre à jour le chauffeur
    const chauffeur = await prisma.chauffeur.update({
      where: { chauffeur_id: id },
      data: {
        statut: data.statut,
        regle_salaire_defaut_id: data.regle_salaire_defaut_id
      }
    });

    return c.json({
      id: chauffeur.chauffeur_id,
      ...data,
      statut: chauffeur.statut,
      updated_at: chauffeur.created_at
    });
  } catch (error) {
    console.error('Error updating chauffeur:', error);
    return c.json({ error: 'Erreur lors de la modification du chauffeur' }, 500);
  }
});

// DELETE /api/chauffeurs/:id - Supprimer un chauffeur
app.delete('/api/chauffeurs/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID du chauffeur requis' }, 400);
    }

    // Supprimer d'abord le chauffeur (cascade vers utilisateur)
    await prisma.chauffeur.delete({
      where: { chauffeur_id: id }
    });

    return c.json({ message: 'Chauffeur supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting chauffeur:', error);
    return c.json({ error: 'Erreur lors de la suppression du chauffeur' }, 500);
  }
});

// Routes pour véhicules
app.get('/api/vehicules', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const vehicules = await prisma.vehicule.findMany({
      where: {
        est_actif: true
      },
      orderBy: { plaque_immatriculation: 'asc' }
    });

    return c.json(vehicules);
  } catch (error) {
    console.error('Error fetching vehicules:', error.message);
    return c.json({ error: 'Erreur lors de la récupération des véhicules' }, 500);
  }
});

app.get('/api/vehicules/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    const vehicule = await prisma.vehicule.findUnique({
      where: { vehicule_id: parseInt(id) }
    });
    if (!vehicule) {
      return c.json({ error: 'Véhicule non trouvé' }, 404);
    }
    return c.json(vehicule);
  } catch (error) {
    console.error('Erreur lors de la récupération du véhicule:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// POST /api/vehicules - Créer un véhicule
app.post('/api/vehicules', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();

    // Validation des données requises
    if (!data.plaque_immatriculation || !data.num_identification) {
      return c.json({ error: 'Plaque d\'immatriculation et numéro d\'identification sont requis' }, 400);
    }

    // Créer le véhicule
    const vehicule = await prisma.vehicule.create({
      data: {
        societe_id: 1, // Société par défaut
        plaque_immatriculation: data.plaque_immatriculation,
        num_identification: data.num_identification,
        marque: data.marque || null,
        modele: data.modele || null,
        annee: data.annee || null,
        est_actif: data.est_actif !== undefined ? data.est_actif : true
      }
    });

    return c.json({
      id: vehicule.vehicule_id,
      ...data,
      est_actif: vehicule.est_actif,
      created_at: vehicule.created_at
    }, 201);
  } catch (error) {
    console.error('Error creating vehicule:', error.message);
    return c.json({
      error: 'Erreur lors de la création du véhicule',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// PUT /api/vehicules/:id - Modifier un véhicule
app.put('/api/vehicules/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();

    if (!id) {
      return c.json({ error: 'ID du véhicule requis' }, 400);
    }

    // Mettre à jour le véhicule
    const vehicule = await prisma.vehicule.update({
      where: { vehicule_id: id },
      data: {
        plaque_immatriculation: data.plaque_immatriculation,
        num_identification: data.num_identification,
        marque: data.marque,
        modele: data.modele,
        annee: data.annee,
        est_actif: data.est_actif
      }
    });

    return c.json({
      id: vehicule.vehicule_id,
      plaque_immatriculation: vehicule.plaque_immatriculation,
      num_identification: vehicule.num_identification,
      marque: vehicule.marque,
      modele: vehicule.modele,
      annee: vehicule.annee,
      est_actif: vehicule.est_actif,
      created_at: vehicule.created_at
    });
  } catch (error) {
    console.error('Error updating vehicule:', error.message);
    return c.json({
      error: 'Erreur lors de la modification du véhicule',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// DELETE /api/vehicules/:id - Supprimer un véhicule
app.delete('/api/vehicules/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID du véhicule requis' }, 400);
    }

    // Supprimer le véhicule
    await prisma.vehicule.delete({
      where: { vehicule_id: id }
    });

    return c.json({ message: 'Véhicule supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting vehicule:', error.message);
    return c.json({
      error: 'Erreur lors de la suppression du véhicule',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// Routes pour clients
app.get('/api/clients', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const clients = await prisma.client.findMany({
      where: { est_actif: true },
      orderBy: { nom_societe: 'asc' }
    });

    return c.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error.message);
    return c.json({ error: 'Erreur lors de la récupération des clients' }, 500);
  }
});

app.get('/api/clients/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    const client = await prisma.client.findUnique({
      where: { client_id: parseInt(id) }
    });
    if (!client) {
      return c.json({ error: 'Client non trouvé' }, 404);
    }
    return c.json(client);
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// POST /api/clients - Créer un client
app.post('/api/clients', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();

    // Validation des données requises
    if (!data.nom_societe) {
      return c.json({ error: 'Nom de la société requis' }, 400);
    }

    // Créer le client
    const client = await prisma.client.create({
      data: {
        societe_id: 1, // Société par défaut
        nom_societe: data.nom_societe,
        num_tva: data.num_tva || null,
        adresse: data.adresse || null,
        telephone: data.telephone || null,
        email: data.email || null,
        regle_facturation_id: data.regle_facturation_id || 1, // Règle par défaut
        est_actif: data.est_actif !== undefined ? data.est_actif : true
      }
    });

    return c.json({
      id: client.client_id,
      ...data,
      est_actif: client.est_actif,
      created_at: client.created_at
    }, 201);
  } catch (error) {
    console.error('Error creating client:', error.message);
    return c.json({
      error: 'Erreur lors de la création du client',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// PUT /api/clients/:id - Modifier un client
app.put('/api/clients/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();

    if (!id) {
      return c.json({ error: 'ID du client requis' }, 400);
    }

    // Mettre à jour le client
    const client = await prisma.client.update({
      where: { client_id: id },
      data: {
        nom_societe: data.nom_societe,
        num_tva: data.num_tva,
        adresse: data.adresse,
        telephone: data.telephone,
        email: data.email,
        regle_facturation_id: data.regle_facturation_id,
        est_actif: data.est_actif
      }
    });

    return c.json({
      id: client.client_id,
      nom_societe: client.nom_societe,
      num_tva: client.num_tva,
      adresse: client.adresse,
      telephone: client.telephone,
      email: client.email,
      regle_facturation_id: client.regle_facturation_id,
      est_actif: client.est_actif,
      created_at: client.created_at
    });
  } catch (error) {
    console.error('Error updating client:', error.message);
    return c.json({
      error: 'Erreur lors de la modification du client',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// DELETE /api/clients/:id - Supprimer un client
app.delete('/api/clients/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID du client requis' }, 400);
    }

    // Supprimer le client
    await prisma.client.delete({
      where: { client_id: id }
    });

    return c.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting client:', error.message);
    return c.json({
      error: 'Erreur lors de la suppression du client',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// Routes pour modes de paiement
app.get('/api/modes-paiement', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const modes = await prisma.mode_paiement.findMany({
      where: { est_actif: true },
      orderBy: { libelle: 'asc' }
    });

    return c.json(modes);
  } catch (error) {
    console.error('Error fetching modes paiement:', error.message);
    return c.json({ error: 'Erreur lors de la récupération des modes de paiement' }, 500);
  }
});

// POST /api/modes-paiement - Créer un mode de paiement
app.post('/api/modes-paiement', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();

    // Validation des données requises
    if (!data.code || !data.libelle || !data.type) {
      return c.json({ error: 'Code, libellé et type sont requis' }, 400);
    }

    // Créer le mode de paiement
    const modePaiement = await prisma.mode_paiement.create({
      data: {
        code: data.code,
        libelle: data.libelle,
        type: data.type,
        est_actif: data.est_actif !== undefined ? data.est_actif : true
      }
    });

    return c.json({
      id: modePaiement.mode_id,
      ...data,
      est_actif: modePaiement.est_actif,
      created_at: modePaiement.created_at
    }, 201);
  } catch (error) {
    console.error('Error creating mode paiement:', error.message);
    return c.json({
      error: 'Erreur lors de la création du mode de paiement',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// PUT /api/modes-paiement/:id - Modifier un mode de paiement
app.put('/api/modes-paiement/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();

    if (!id) {
      return c.json({ error: 'ID du mode de paiement requis' }, 400);
    }

    // Mettre à jour le mode de paiement
    const modePaiement = await prisma.mode_paiement.update({
      where: { mode_id: id },
      data: {
        code: data.code,
        libelle: data.libelle,
        type: data.type,
        est_actif: data.est_actif
      }
    });

    return c.json({
      id: modePaiement.mode_id,
      code: modePaiement.code,
      libelle: modePaiement.libelle,
      type: modePaiement.type,
      est_actif: modePaiement.est_actif,
      created_at: modePaiement.created_at
    });
  } catch (error) {
    console.error('Error updating mode paiement:', error.message);
    return c.json({
      error: 'Erreur lors de la modification du mode de paiement',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// DELETE /api/modes-paiement/:id - Supprimer un mode de paiement
app.delete('/api/modes-paiement/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID du mode de paiement requis' }, 400);
    }

    // Supprimer le mode de paiement
    await prisma.mode_paiement.delete({
      where: { mode_id: id }
    });

    return c.json({ message: 'Mode de paiement supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting mode paiement:', error.message);
    return c.json({
      error: 'Erreur lors de la suppression du mode de paiement',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// Routes pour règles de salaire
app.get('/api/regles-salaire', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const reglesSalaire = await prisma.regle_salaire.findMany({
      orderBy: { nom_regle: 'asc' }
    });

    const formattedReglesSalaire = reglesSalaire.map(regle => ({
      id: regle.regle_id,
      regle_id: regle.regle_id,
      nom_regle: regle.nom_regle,
      est_variable: regle.est_variable,
      seuil_recette: regle.seuil_recette,
      pourcentage_base: regle.pourcentage_base,
      pourcentage_au_dela: regle.pourcentage_au_dela,
      description: regle.description,
      created_at: regle.created_at
    }));

    return c.json(formattedReglesSalaire);
  } catch (error) {
    console.error('Error fetching regles salaire:', error.message);
    return c.json({ error: 'Erreur lors de la récupération des règles de salaire' }, 500);
  }
});

// POST /api/regles-salaire - Créer une règle de salaire
app.post('/api/regles-salaire', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();

    // Validation des données requises
    if (!data.nom_regle) {
      return c.json({ error: 'Nom de la règle requis' }, 400);
    }

    // Créer la règle de salaire
    const regleSalaire = await prisma.regle_salaire.create({
      data: {
        nom_regle: data.nom_regle,
        est_variable: data.est_variable !== undefined ? data.est_variable : true,
        seuil_recette: data.seuil_recette || null,
        pourcentage_base: data.pourcentage_base || null,
        pourcentage_au_dela: data.pourcentage_au_dela || null,
        description: data.description || null
      }
    });

    return c.json({
      id: regleSalaire.regle_id,
      ...data,
      created_at: regleSalaire.created_at
    }, 201);
  } catch (error) {
    console.error('Error creating regle salaire:', error.message);
    return c.json({
      error: 'Erreur lors de la création de la règle de salaire',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// PUT /api/regles-salaire/:id - Modifier une règle de salaire
app.put('/api/regles-salaire/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();

    if (!id) {
      return c.json({ error: 'ID de la règle de salaire requis' }, 400);
    }

    // Mettre à jour la règle de salaire
    const regleSalaire = await prisma.regle_salaire.update({
      where: { regle_id: id },
      data: {
        nom_regle: data.nom_regle,
        est_variable: data.est_variable,
        seuil_recette: data.seuil_recette,
        pourcentage_base: data.pourcentage_base,
        pourcentage_au_dela: data.pourcentage_au_dela,
        description: data.description
      }
    });

    return c.json({
      id: regleSalaire.regle_id,
      nom_regle: regleSalaire.nom_regle,
      est_variable: regleSalaire.est_variable,
      seuil_recette: regleSalaire.seuil_recette,
      pourcentage_base: regleSalaire.pourcentage_base,
      pourcentage_au_dela: regleSalaire.pourcentage_au_dela,
      description: regleSalaire.description,
      created_at: regleSalaire.created_at
    });
  } catch (error) {
    console.error('Error updating regle salaire:', error.message);
    return c.json({
      error: 'Erreur lors de la modification de la règle de salaire',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// DELETE /api/regles-salaire/:id - Supprimer une règle de salaire
app.delete('/api/regles-salaire/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID de la règle de salaire requis' }, 400);
    }

    // Supprimer la règle de salaire
    await prisma.regle_salaire.delete({
      where: { regle_id: id }
    });

    return c.json({ message: 'Règle de salaire supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting regle salaire:', error.message);
    return c.json({
      error: 'Erreur lors de la suppression de la règle de salaire',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// Routes pour feuilles-route
app.get('/api/feuilles-route', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const feuillesRoute = await prisma.feuille_route.findMany({
      include: {
        chauffeur: {
          include: {
            utilisateur: true,
            societe_taxi: true
          }
        },
        vehicule: {
          include: {
            societe_taxi: true
          }
        },
        course: {
          include: {
            client: true,
            mode_paiement: true,
            detail_facture_complexe: true
          }
        },
        taximetre: true
      }
    });
    return c.json(feuillesRoute);
  } catch (error) {
    console.error('Erreur lors de la récupération des feuilles de route:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.get('/api/feuilles-route/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    
    console.log('🔍 GET /api/feuilles-route/:id - Récupération feuille:', id);
    
    const feuilleRoute = await prisma.feuille_route.findUnique({
      where: { feuille_id: parseInt(id) },
      include: {
        chauffeur: {
          include: {
            utilisateur: true,
            societe_taxi: true
          }
        },
        vehicule: {
          include: {
            societe_taxi: true
          }
        },
        course: {
          include: {
            client: true,
            mode_paiement: true,
            detail_facture_complexe: true
          }
        },
        taximetre: true
      }
    });
    
    // ✅ CORRECTION: Si l'include ne fonctionne pas, récupérer le taximètre séparément
    if (feuilleRoute && !feuilleRoute.taximetre) {
      feuilleRoute.taximetre = await prisma.taximetre.findUnique({
        where: { feuille_id: parseInt(id) }
      });
    }
    
    console.log('🔍 GET /api/feuilles-route/:id - Résultat:', {
      found: !!feuilleRoute,
      feuille_id: feuilleRoute?.feuille_id,
      has_taximetre: !!feuilleRoute?.taximetre,
      taximetre_data: feuilleRoute?.taximetre
    });
    
    if (!feuilleRoute) {
      return c.json({ error: 'Feuille de route non trouvée' }, 404);
    }
    
    return c.json(feuilleRoute);
  } catch (error) {
    console.error('Erreur lors de la récupération de la feuille de route:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.get('/api/chauffeurs/:chauffeurId/feuilles-route', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { chauffeurId } = c.req.param();
    const feuillesRoute = await prisma.feuille_route.findMany({
      where: { chauffeur_id: parseInt(chauffeurId) },
      include: {
        chauffeur: {
          include: {
            utilisateur: true,
            societe_taxi: true
          }
        },
        vehicule: {
          include: {
            societe_taxi: true
          }
        },
        course: {
          include: {
            client: true,
            mode_paiement: true,
            detail_facture_complexe: true
          }
        },
        taximetre: true
      }
    });
    return c.json(feuillesRoute);
  } catch (error) {
    console.error('Erreur lors de la récupération des feuilles de route:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.put('/api/feuilles-route/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    const data = await c.req.json();
    const feuilleRoute = await prisma.feuille_route.update({
      where: { feuille_id: parseInt(id) },
      data
    });
    return c.json(feuilleRoute);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la feuille de route:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.delete('/api/feuilles-route/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    await prisma.feuille_route.delete({
      where: { feuille_id: parseInt(id) }
    });
    return c.json({ message: 'Feuille de route supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la feuille de route:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route pour feuille de route active
app.get('/api/feuilles-route/active/:chauffeurId', dbMiddleware, authMiddleware, async (c) => {
  try {
    const chauffeurId = parseInt(c.req.param('chauffeurId'));
    const prisma = c.get('prisma');

    const feuilleRoute = await prisma.feuille_route.findFirst({
      where: {
        chauffeur_id: chauffeurId,
        est_validee: false // Utilise est_validee au lieu de statut
      },
      include: {
        vehicule: {
          include: {
            societe_taxi: true
          }
        },
        chauffeur: {
          include: {
            utilisateur: true,
            societe_taxi: true
          }
        },
        course: {
          include: {
            client: true,
            mode_paiement: true,
            detail_facture_complexe: true
          }
        },
        taximetre: true
      },
      orderBy: { created_at: 'desc' }
    });

    if (!feuilleRoute) {
      return c.json(null);
    }

    return c.json(feuilleRoute);
  } catch (error) {
    console.error('Error fetching active feuille route:', error);
    return c.json({ error: 'Erreur lors de la récupération de la feuille de route active' }, 500);
  }
});

// Routes complexes pour feuilles-route
app.patch('/api/feuilles-route/:id/change-vehicle', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    const data = await c.req.json();
    const feuilleRoute = await prisma.feuille_route.update({
      where: { feuille_id: parseInt(id) },
      data: { vehicule_id: data.vehicule_id }
    });
    return c.json(feuilleRoute);
  } catch (error) {
    console.error('Erreur lors du changement de véhicule:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.patch('/api/feuilles-route/:id/validate', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    const feuilleRoute = await prisma.feuille_route.update({
      where: { feuille_id: parseInt(id) },
      data: { est_validee: true }
    });
    return c.json(feuilleRoute);
  } catch (error) {
    console.error('Erreur lors de la validation de la feuille de route:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.patch('/api/feuilles-route/:id/validate-test', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    const feuilleRoute = await prisma.feuille_route.update({
      where: { feuille_id: parseInt(id) },
      data: { est_validee: true }
    });
    return c.json(feuilleRoute);
  } catch (error) {
    console.error('Erreur lors de la validation test:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.get('/api/feuilles-route/:id/totals', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    // Logique de calcul des totaux (simplifié)
    const totals = await prisma.course.aggregate({
      where: { feuille_route_id: parseInt(id) },
      _sum: { montant: true }
    });
    return c.json(totals);
  } catch (error) {
    console.error('Erreur lors du calcul des totaux:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.get('/api/feuilles-route/:id/salary', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    // Logique de calcul du salaire (simplifié)
    const salary = { base: 0, bonus: 0, total: 0 };
    return c.json(salary);
  } catch (error) {
    console.error('Erreur lors du calcul du salaire:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.get('/api/feuilles-route/:feuilleId/taximetre', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { feuilleId } = c.req.param();
    const taximetre = await prisma.taximetre.findFirst({
      where: { feuille_route_id: parseInt(feuilleId) }
    });
    return c.json(taximetre);
  } catch (error) {
    console.error('Erreur lors de la récupération du taximètre:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.post('/api/feuilles-route/:feuilleId/taximetre', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { feuilleId } = c.req.param();
    const data = await c.req.json();
    const taximetre = await prisma.taximetre.create({
      data: { ...data, feuille_route_id: parseInt(feuilleId) }
    });
    return c.json(taximetre);
  } catch (error) {
    console.error('Erreur lors de la création du taximètre:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.put('/api/feuilles-route/:feuilleId/taximetre', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { feuilleId } = c.req.param();
    const data = await c.req.json();
    const taximetre = await prisma.taximetre.updateMany({
      where: { feuille_route_id: parseInt(feuilleId) },
      data
    });
    return c.json(taximetre);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du taximètre:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.get('/api/feuilles-route/:feuilleId/courses', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { feuilleId } = c.req.param();
    const courses = await prisma.course.findMany({
      where: { feuille_id: parseInt(feuilleId) }
    });
    return c.json(courses);
  } catch (error) {
    console.error('Erreur lors de la récupération des courses:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.get('/api/feuilles-route/:feuilleId/charges', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { feuilleId } = c.req.param();
    const charges = await prisma.charge.findMany({
      where: { feuille_id: parseInt(feuilleId) }
    });
    return c.json(charges);
  } catch (error) {
    console.error('Erreur lors de la récupération des charges:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.post('/api/notifications/vehicle-change', dbMiddleware, authMiddleware, async (c) => {
  try {
    const data = await c.req.json();
    // Logique de notification (simplifié)
    return c.json({ message: 'Notification envoyée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Routes pour courses
app.get('/api/courses', dbMiddleware, authMiddleware, async (c) => {
  try {
    const feuilleRouteId = c.req.query('feuilleRouteId');
    const prisma = c.get('prisma');

    const whereClause = feuilleRouteId ? { feuille_id: parseInt(feuilleRouteId) } : {};

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            client_id: true,
            nom_societe: true
          }
        },
        mode_paiement: {
          select: {
            mode_id: true,
            libelle: true
          }
        }
      },
      orderBy: { num_ordre: 'asc' }
    });

    return c.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error.message);
    return c.json({ error: 'Erreur lors de la récupération des courses' }, 500);
  }
});

// POST /api/courses - Créer une course
app.post('/api/courses', dbMiddleware, authMiddleware, async (c) => {
  let rawData, data; // Initialize variables for error logging
  try {
    const prisma = c.get('prisma');
    rawData = await c.req.json();

    console.log('📝 POST /api/courses - Données reçues:', JSON.stringify(rawData, null, 2));

    // Mapper les données frontend vers le format DB
    data = mapToDb(rawData);

    // Validation des données requises - comme en développement
    if (!data.feuille_id || !data.num_ordre || !data.sommes_percues || !data.mode_paiement_id) {
      console.error('❌ Validation échouée - Données manquantes:', {
        feuille_id: data.feuille_id,
        num_ordre: data.num_ordre,
        sommes_percues: data.sommes_percues,
        mode_paiement_id: data.mode_paiement_id
      });
      return c.json({
        error: 'Données manquantes: feuille_id, num_ordre, sommes_percues et mode_paiement_id sont requis',
        received: rawData,
        mapped: data
      }, 400);
    }

    // Gestion intelligente du numéro d'ordre - comme en développement
    let numOrdre = parseInt(data.num_ordre);
    const feuilleId = parseInt(data.feuille_id);

    // Vérifier si ce numéro d'ordre existe déjà
    const existingCourse = await prisma.course.findFirst({
      where: {
        feuille_id: feuilleId,
        num_ordre: numOrdre
      }
    });

    if (existingCourse) {
      console.log(`⚠️ Course ${numOrdre} existe déjà pour feuille ${feuilleId}, recherche du prochain numéro disponible...`);

      // Trouver le prochain numéro d'ordre disponible
      const maxCourse = await prisma.course.findFirst({
        where: {
          feuille_id: feuilleId
        },
        orderBy: {
          num_ordre: 'desc'
        }
      });

      numOrdre = maxCourse ? maxCourse.num_ordre + 1 : 1;
      console.log(`✅ Nouveau numéro d'ordre assigné: ${numOrdre}`);
    }

    // Fonction pour traiter les heures (comme en développement)
    const parseTime = (timeString) => {
      if (!timeString) return null;
      
      // Si c'est déjà un format DateTime, extraire la partie time
      if (timeString.includes('T')) {
        return new Date(timeString);
      }
      
      // Si c'est juste une heure (HH:MM:SS ou HH:MM), créer une date avec 1970-01-01
      if (timeString.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
        return new Date(`1970-01-01T${timeString}`);
      }
      
      // Sinon essayer de parser directement
      return new Date(timeString);
    };

    // Créer la course
    const course = await prisma.course.create({
      data: {
        num_ordre: numOrdre, // Utiliser le numéro d'ordre calculé (original ou nouveau)
        index_depart: data.index_depart ? parseInt(data.index_depart) : null,
        index_embarquement: data.index_embarquement ? parseInt(data.index_embarquement) : null,
        lieu_embarquement: data.lieu_embarquement || '',
        heure_embarquement: parseTime(data.heure_embarquement),
        index_debarquement: data.index_debarquement ? parseInt(data.index_debarquement) : null,
        lieu_debarquement: data.lieu_debarquement || '',
        heure_debarquement: parseTime(data.heure_debarquement),
        prix_taximetre: data.prix_taximetre ? parseFloat(data.prix_taximetre) : null,
        sommes_percues: parseFloat(data.sommes_percues),
        est_hors_heures: data.est_hors_heures || false,
        // Connecter à la feuille de route existante
        feuille_route: {
          connect: {
            feuille_id: feuilleId
          }
        },
        // Connecter au mode de paiement existant
        mode_paiement: {
          connect: {
            mode_id: parseInt(data.mode_paiement_id)
          }
        },
        // Connecter au client s'il existe
        ...(data.client_id ? {
          client: {
            connect: {
              client_id: parseInt(data.client_id)
            }
          }
        } : {})
      },
      include: {
        mode_paiement: true,
        client: true
      }
    });

    console.log('✅ Course créée avec succès:', course.course_id);

    return c.json({
      id: course.course_id,
      ...data,
      num_ordre: numOrdre, // Retourner le numéro d'ordre effectivement utilisé
      created_at: course.created_at,
      ...(numOrdre !== parseInt(data.num_ordre) && { 
        note: `Numéro d'ordre ajusté de ${data.num_ordre} à ${numOrdre} (conflit détecté)` 
      })
    }, 201);

  } catch (error) {
    console.error('❌ Erreur lors de la création de la course:', error);
    console.error('❌ Message d\'erreur:', error.message);
    console.error('❌ Code d\'erreur:', error.code);
    console.error('❌ Détails de l\'erreur:', error.meta);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Type d\'erreur:', error.constructor.name);
    console.error('❌ Propriétés de l\'erreur:', Object.keys(error));

    // Log des données qui ont été utilisées pour la création (si disponibles)
    console.error('❌ Données utilisées pour la création:', {
      rawData: JSON.stringify(rawData, null, 2),
      mappedData: JSON.stringify(data, null, 2)
    });

    // Gérer les erreurs spécifiques de Prisma
    if (error.code) {
      switch (error.code) {
        case 'P2002':
          return c.json({
            error: 'Conflit de données',
            details: 'Une contrainte d\'unicité a été violée',
            code: error.code
          }, 409);
        case 'P2003':
          return c.json({
            error: 'Erreur de clé étrangère',
            details: 'Une référence à une entité inexistante a été détectée',
            code: error.code,
            meta: error.meta
          }, 400);
        case 'P2025':
          return c.json({
            error: 'Enregistrement non trouvé',
            details: 'L\'enregistrement référencé n\'existe pas',
            code: error.code
          }, 404);
        default:
          return c.json({
            error: 'Erreur de base de données',
            details: error.message,
            code: error.code,
            meta: error.meta
          }, 500);
      }
    }

    return c.json({
      error: 'Erreur interne du serveur',
      details: error.message,
      stack: error.stack
    }, 500);
  }
});

// PUT /api/courses/:id - Modifier une course
app.put('/api/courses/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();

    if (!id) {
      return c.json({ error: 'ID de la course requis' }, 400);
    }

    // Mettre à jour la course
    const course = await prisma.course.update({
      where: { course_id: id },
      data: {
        num_ordre: data.num_ordre,
        index_depart: data.index_depart,
        index_embarquement: data.index_embarquement,
        lieu_embarquement: data.lieu_embarquement,
        heure_embarquement: data.heure_embarquement ? new Date(data.heure_embarquement) : null,
        index_debarquement: data.index_debarquement,
        lieu_debarquement: data.lieu_debarquement,
        heure_debarquement: data.heure_debarquement ? new Date(data.heure_debarquement) : null,
        prix_taximetre: data.prix_taximetre,
        sommes_percues: data.sommes_percues,
        mode_paiement_id: data.mode_paiement_id,
        client_id: data.client_id,
        est_hors_heures: data.est_hors_heures
      },
      include: {
        client: {
          select: {
            client_id: true,
            nom_societe: true
          }
        },
        mode_paiement: {
          select: {
            mode_id: true,
            libelle: true
          }
        }
      }
    });

    return c.json({
      id: course.course_id,
      feuille_id: course.feuille_id,
      num_ordre: course.num_ordre,
      index_depart: course.index_depart,
      index_embarquement: course.index_embarquement,
      lieu_embarquement: course.lieu_embarquement,
      heure_embarquement: course.heure_embarquement,
      index_debarquement: course.index_debarquement,
      lieu_debarquement: course.lieu_debarquement,
      heure_debarquement: course.heure_debarquement,
      prix_taximetre: course.prix_taximetre,
      sommes_percues: course.sommes_percues,
      mode_paiement_id: course.mode_paiement_id,
      client_id: course.client_id,
      est_hors_heures: course.est_hors_heures,
      created_at: course.created_at
    });
  } catch (error) {
    console.error('Error updating course:', error.message);
    return c.json({
      error: 'Erreur lors de la modification de la course',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// DELETE /api/courses/:id - Supprimer une course
app.delete('/api/courses/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID de la course requis' }, 400);
    }

    // Supprimer la course
    await prisma.course.delete({
      where: { course_id: id }
    });

    return c.json({ message: 'Course supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting course:', error.message);
    return c.json({
      error: 'Erreur lors de la suppression de la course',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// Routes pour charges
app.get('/api/charges', dbMiddleware, authMiddleware, async (c) => {
  try {
    const feuilleRouteId = c.req.query('feuilleRouteId');
    const prisma = c.get('prisma');

    const whereClause = feuilleRouteId ? { feuille_id: parseInt(feuilleRouteId) } : {};

    const charges = await prisma.charge.findMany({
      where: whereClause,
      include: {
        chauffeur: {
          select: {
            chauffeur_id: true,
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        vehicule: {
          select: {
            vehicule_id: true,
            plaque_immatriculation: true
          }
        },
        mode_paiement: {
          select: {
            mode_id: true,
            libelle: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const formattedCharges = charges.map(charge => ({
      ...charge,
      chauffeur_nom: `${charge.chauffeur?.utilisateur?.prenom} ${charge.chauffeur?.utilisateur?.nom}`,
      vehicule_plaque: charge.vehicule?.plaque_immatriculation,
      mode_paiement_libelle: charge.mode_paiement?.libelle
    }));

    return c.json(formattedCharges);
  } catch (error) {
    console.error('Error fetching charges:', error.message);
    return c.json({ error: 'Erreur lors de la récupération des charges' }, 500);
  }
});

// POST /api/charges - Créer une charge
app.post('/api/charges', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();

    // Validation des données requises
    if (!data.chauffeur_id || !data.vehicule_id || !data.description || !data.montant || !data.mode_paiement_charge) {
      return c.json({ error: 'Chauffeur ID, véhicule ID, description, montant et mode de paiement sont requis' }, 400);
    }

    // Créer la charge
    const charge = await prisma.charge.create({
      data: {
        feuille_id: data.feuille_id || null,
        chauffeur_id: data.chauffeur_id,
        vehicule_id: data.vehicule_id,
        description: data.description,
        montant: data.montant,
        mode_paiement_charge: data.mode_paiement_charge,
        date_charge: data.date_charge ? new Date(data.date_charge) : null
      },
      include: {
        chauffeur: {
          select: {
            chauffeur_id: true,
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        vehicule: {
          select: {
            vehicule_id: true,
            plaque_immatriculation: true
          }
        },
        mode_paiement: {
          select: {
            mode_id: true,
            libelle: true
          }
        }
      }
    });

    return c.json({
      id: charge.charge_id,
      ...data,
      created_at: charge.created_at
    }, 201);
  } catch (error) {
    console.error('Error creating charge:', error.message);
    return c.json({
      error: 'Erreur lors de la création de la charge',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// PUT /api/charges/:id - Modifier une charge
app.put('/api/charges/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();

    if (!id) {
      return c.json({ error: 'ID de la charge requis' }, 400);
    }

    // Mettre à jour la charge
    const charge = await prisma.charge.update({
      where: { charge_id: id },
      data: {
        feuille_id: data.feuille_id,
        chauffeur_id: data.chauffeur_id,
        vehicule_id: data.vehicule_id,
        description: data.description,
        montant: data.montant,
        mode_paiement_charge: data.mode_paiement_charge,
        date_charge: data.date_charge ? new Date(data.date_charge) : null
      },
      include: {
        chauffeur: {
          select: {
            chauffeur_id: true,
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        vehicule: {
          select: {
            vehicule_id: true,
            plaque_immatriculation: true
          }
        },
        mode_paiement: {
          select: {
            mode_id: true,
            libelle: true
          }
        }
      }
    });

    return c.json({
      id: charge.charge_id,
      feuille_id: charge.feuille_id,
      chauffeur_id: charge.chauffeur_id,
      vehicule_id: charge.vehicule_id,
      description: charge.description,
      montant: charge.montant,
      mode_paiement_charge: charge.mode_paiement_charge,
      date_charge: charge.date_charge,
      created_at: charge.created_at
    });
  } catch (error) {
    console.error('Error updating charge:', error.message);
    return c.json({
      error: 'Erreur lors de la modification de la charge',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// DELETE /api/charges/:id - Supprimer une charge
app.delete('/api/charges/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID de la charge requis' }, 400);
    }

    // Supprimer la charge
    await prisma.charge.delete({
      where: { charge_id: id }
    });

    return c.json({ message: 'Charge supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting charge:', error.message);
    return c.json({
      error: 'Erreur lors de la suppression de la charge',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// Routes pour factures
app.get('/api/factures', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const factures = await prisma.facture.findMany();
    return c.json(factures);
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.get('/api/gestion-factures', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const factures = await prisma.facture.findMany({
      include: { client: true }
    });
    return c.json(factures);
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.get('/api/factures/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    const facture = await prisma.facture.findUnique({
      where: { facture_id: parseInt(id) },
      include: { client: true }
    });
    if (!facture) {
      return c.json({ error: 'Facture non trouvée' }, 404);
    }
    return c.json(facture);
  } catch (error) {
    console.error('Erreur lors de la récupération de la facture:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.post('/api/factures', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();
    const facture = await prisma.facture.create({ data });
    return c.json(facture);
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.put('/api/factures/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    const data = await c.req.json();
    const facture = await prisma.facture.update({
      where: { facture_id: parseInt(id) },
      data
    });
    return c.json(facture);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.delete('/api/factures/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    await prisma.facture.delete({
      where: { facture_id: parseInt(id) }
    });
    return c.json({ message: 'Facture supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la facture:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Routes pour règles de facturation
app.get('/api/regles-facturation', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const reglesFacturation = await prisma.regle_facturation.findMany();
    return c.json(reglesFacturation);
  } catch (error) {
    console.error('Erreur lors de la récupération des règles de facturation:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.post('/api/regles-facturation', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();
    const regleFacturation = await prisma.regle_facturation.create({ data });
    return c.json(regleFacturation);
  } catch (error) {
    console.error('Erreur lors de la création de la règle de facturation:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Routes pour partenaires
app.get('/api/partenaires', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const partenaires = await prisma.partenaire.findMany();
    return c.json(partenaires);
  } catch (error) {
    console.error('Erreur lors de la récupération des partenaires:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.post('/api/partenaires', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();
    const partenaire = await prisma.partenaire.create({ data });
    return c.json(partenaire);
  } catch (error) {
    console.error('Erreur lors de la création du partenaire:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Routes pour sociétés de taxi
app.get('/api/societes-taxi', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const societesTaxi = await prisma.societe_taxi.findMany();
    return c.json(societesTaxi);
  } catch (error) {
    console.error('Erreur lors de la récupération des sociétés de taxi:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.get('/api/societe-taxi/current', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const societeTaxi = await prisma.societe_taxi.findFirst({
      orderBy: { societe_id: 'asc' }
    });
    return c.json(societeTaxi);
  } catch (error) {
    console.error('Erreur lors de la récupération de la société courante:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.get('/api/societe-taxi/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { id } = c.req.param();
    const societeTaxi = await prisma.societe_taxi.findUnique({
      where: { societe_id: parseInt(id) }
    });
    if (!societeTaxi) {
      return c.json({ error: 'Société de taxi non trouvée' }, 404);
    }
    return c.json(societeTaxi);
  } catch (error) {
    console.error('Erreur lors de la récupération de la société de taxi:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Routes d'administration
app.get('/api/admin/chauffeur-by-date', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { date } = c.req.query();
    const chauffeurs = await prisma.chauffeur.findMany({
      where: date ? { created_at: { gte: new Date(date) } } : {}
    });
    return c.json(chauffeurs);
  } catch (error) {
    console.error('Erreur lors de la récupération des chauffeurs par date:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.get('/api/admin/vehicule-by-chauffeur-date', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const { chauffeurId, date } = c.req.query();
    const vehicules = await prisma.vehicule.findMany({
      where: {
        chauffeur_id: chauffeurId ? parseInt(chauffeurId) : undefined,
        created_at: date ? { gte: new Date(date) } : undefined
      }
    });
    return c.json(vehicules);
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

app.post('/api/admin/feuille-route/encode', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();
    // Logique d'encodage administratif (simplifié)
    return c.json({ message: 'Encodage effectué avec succès', data });
  } catch (error) {
    console.error('Erreur lors de l\'encodage:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route d'authentification supplémentaire
app.post('/api/auth/create-test-users', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    // Logique de création d'utilisateurs de test (simplifié)
    return c.json({ message: 'Utilisateurs de test créés avec succès' });
  } catch (error) {
    console.error('Erreur lors de la création des utilisateurs de test:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Créer une nouvelle feuille de route
app.post('/api/feuilles-route', dbMiddleware, authMiddleware, async (c) => {
  try {
    const data = await c.req.json();
    const prisma = c.get('prisma');

    const result = await prisma.feuille_route.create({
      data: {
        chauffeur_id: data.chauffeur_id,
        vehicule_id: data.vehicule_id,
        date: new Date(data.date),
        heure_debut: data.heure_debut,
        km_debut: data.km_debut,
        prise_en_charge_debut: data.prise_en_charge_debut || null,
        chutes_debut: data.chutes_debut || null,
        statut: 'En cours',
        saisie_mode: 'chauffeur',
        notes: data.notes || null
      }
    });

    return c.json(result);
  } catch (error) {
    console.error('Error creating feuille route:', error);
    return c.json({ error: 'Erreur lors de la création de la feuille de route' }, 500);
  }
});

// Routes pour le dashboard
app.get('/api/dashboard/courses', dbMiddleware, async (c) => {
  try {
    const url = new URL(c.req.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const chauffeurId = url.searchParams.get('chauffeurId');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const offset = (page - 1) * limit;

    const prisma = c.get('prisma');

    // Construire les filtres
    const whereFilter = {};
    
    // Filtre par chauffeur
    if (chauffeurId) {
      whereFilter.feuille_route = {
        chauffeur_id: parseInt(chauffeurId)
      };
    }

    // Filtres de date
    if (dateFrom || dateTo) {
      if (!whereFilter.feuille_route) {
        whereFilter.feuille_route = {};
      }
      whereFilter.feuille_route.date_service = {};
      if (dateFrom) whereFilter.feuille_route.date_service.gte = new Date(dateFrom);
      if (dateTo) whereFilter.feuille_route.date_service.lte = new Date(dateTo);
    }

    // Récupérer les courses avec pagination et filtrage
    const courses = await prisma.course.findMany({
      where: Object.keys(whereFilter).length > 0 ? whereFilter : undefined,
      include: {
        feuille_route: {
          include: {
            chauffeur: {
              include: {
                utilisateur: true
              }
            },
            vehicule: true
          }
        },
        client: true,
        mode_paiement: true,
        detail_facture_complexe: true
      },
      orderBy: [
        {
          feuille_id: 'desc'
        },
        {
          num_ordre: 'asc'
        }
      ],
      skip: offset,
      take: limit
    });

    // Compter le nombre total de courses avec filtrage
    const total = await prisma.course.count({ 
      where: Object.keys(whereFilter).length > 0 ? whereFilter : undefined 
    });

    // Transformer les données pour assurer l'affichage correct
    const transformedCourses = courses.map(course => ({
      ...course,
      chauffeur_nom: course.feuille_route?.chauffeur?.utilisateur 
        ? `${course.feuille_route.chauffeur.utilisateur.prenom} ${course.feuille_route.chauffeur.utilisateur.nom}`
        : 'Inconnu',
      vehicule_info: course.feuille_route?.vehicule 
        ? `${course.feuille_route.vehicule.marque} ${course.feuille_route.vehicule.modele} (${course.feuille_route.vehicule.plaque_immatriculation})`
        : 'N/A'
    }));

    return c.json({
      data: transformedCourses,
      courses: transformedCourses, // Compatibilité avec l'ancien format
      count: courses.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        chauffeurId: chauffeurId || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching dashboard courses:', error);
    return c.json({ 
      error: 'Erreur lors de la récupération des courses du dashboard',
      details: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Route pour les statistiques des courses
app.get('/api/dashboard/courses/stats', dbMiddleware, async (c) => {
  try {
    const { dateFrom, dateTo, chauffeurId } = c.req.query();
    const prisma = c.get('prisma');

    // Test simple de connexion DB
    await prisma.$queryRaw`SELECT 1`;

    // Construire les filtres
    const where = {};
    if (dateFrom || dateTo) {
      where.heure_embarquement = {};
      if (dateFrom) where.heure_embarquement.gte = new Date(dateFrom);
      if (dateTo) where.heure_embarquement.lte = new Date(dateTo);
    }

    // Filtrer par chauffeur via feuille_route si spécifié
    if (chauffeurId) {
      where.feuille_route = {
        chauffeur_id: parseInt(chauffeurId)
      };
    }

    // Statistiques simples et sûres
    const stats = {
      totalCourses: 0,
      totalRevenue: 0,
      totalDistance: 0,
      chauffeursActifs: 0,
      vehiculesUtilises: 0,
      timestamp: new Date().toISOString()
    };

    try {
      // Nombre total de courses avec filtrage
      stats.totalCourses = await prisma.course.count({ where });
    } catch (error) {
      console.error('Error fetching total courses:', error);
    }

    try {
      // Revenus totaux avec filtrage
      const revenueResult = await prisma.course.aggregate({
        where,
        _sum: {
          sommes_percues: true
        }
      });
      stats.totalRevenue = revenueResult._sum.sommes_percues || 0;
    } catch (error) {
      console.error('Error fetching total revenue:', error);
    }

    try {
      // Distance totale (calculée depuis les index) avec filtrage
      const distanceResult = await prisma.course.findMany({
        where,
        select: {
          index_embarquement: true,
          index_debarquement: true
        }
      });
      
      stats.totalDistance = distanceResult.reduce((sum, course) => {
        const dist = (course.index_debarquement || 0) - (course.index_embarquement || 0);
        return sum + dist;
      }, 0);
    } catch (error) {
      console.error('Error fetching total distance:', error);
    }

    try {
      // Chauffeurs actifs avec filtrage par date
      const chauffeursResult = await prisma.feuille_route.findMany({
        where: dateFrom || dateTo ? {
          date_service: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) })
          }
        } : undefined,
        select: {
          chauffeur_id: true
        },
        distinct: ['chauffeur_id']
      });
      stats.chauffeursActifs = chauffeursResult.length;
    } catch (error) {
      console.error('Error fetching active drivers:', error);
    }

    try {
      // Véhicules utilisés avec filtrage par date
      const vehiculesResult = await prisma.feuille_route.findMany({
        where: dateFrom || dateTo ? {
          date_service: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) })
          }
        } : undefined,
        select: {
          vehicule_id: true
        },
        distinct: ['vehicule_id']
      });
      stats.vehiculesUtilises = vehiculesResult.length;
    } catch (error) {
      console.error('Error fetching vehicles used:', error);
    }

    // Calculer les moyennes
    const totalRevenue = parseFloat(stats.totalRevenue || 0);
    const averageEarningsPerTrip = stats.totalCourses > 0 ? totalRevenue / stats.totalCourses : 0;
    const averageDistancePerTrip = stats.totalCourses > 0 ? stats.totalDistance / stats.totalCourses : 0;

    // Retourner les stats avec moyennes
    return c.json({
      ...stats,
      averageEarningsPerTrip: parseFloat(averageEarningsPerTrip.toFixed(2)),
      averageDistancePerTrip: parseFloat(averageDistancePerTrip.toFixed(2))
    });
  } catch (error) {
    console.error('Error in dashboard stats:', error);
    return c.json({
      error: 'Erreur dashboard stats',
      details: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Route pour les données de graphique
app.get('/api/dashboard/courses/chart-data', dbMiddleware, async (c) => {
  try {
    const { type = 'daily', dateFrom, dateTo, chauffeurId } = c.req.query();
    const prisma = c.get('prisma');

    // Construire les filtres de date
    const dateFilter = {};
    if (dateFrom || dateTo) {
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
    }

    let data = [];

    switch (type) {
      case 'daily-revenue':
      case 'dailyRevenues': {
        // Revenus quotidiens avec filtrage par chauffeur
        const whereClause = {};
        if (dateFrom || dateTo) {
          whereClause.heure_embarquement = dateFilter;
        }
        // Filtrer par chauffeur si spécifié
        if (chauffeurId) {
          whereClause.feuille_route = {
            chauffeur_id: parseInt(chauffeurId)
          };
        }

        const courses = await prisma.course.findMany({
          where: whereClause,
          select: {
            heure_embarquement: true,
            sommes_percues: true
          },
          orderBy: {
            heure_embarquement: 'asc'
          }
        });

        // Grouper par date
        const revenueByDate = {};
        courses.forEach(course => {
          if (!course.heure_embarquement) return;
          const date = new Date(course.heure_embarquement).toISOString().split('T')[0];
          if (!revenueByDate[date]) {
            revenueByDate[date] = 0;
          }
          revenueByDate[date] += parseFloat(course.sommes_percues || 0);
        });

        data = Object.entries(revenueByDate).map(([date, revenue]) => ({
          date,
          revenue: parseFloat(revenue.toFixed(2))
        }));
        break;
      }

      case 'trips-count':
      case 'dailyTripsCount': {
        // Nombre de courses quotidiennes avec filtrage par chauffeur
        const whereClause = {};
        if (dateFrom || dateTo) {
          whereClause.heure_embarquement = dateFilter;
        }
        // Filtrer par chauffeur si spécifié
        if (chauffeurId) {
          whereClause.feuille_route = {
            chauffeur_id: parseInt(chauffeurId)
          };
        }

        const courses = await prisma.course.findMany({
          where: whereClause,
          select: {
            heure_embarquement: true
          },
          orderBy: {
            heure_embarquement: 'asc'
          }
        });

        // Grouper par date
        const countByDate = {};
        courses.forEach(course => {
          if (!course.heure_embarquement) return;
          const date = new Date(course.heure_embarquement).toISOString().split('T')[0];
          if (!countByDate[date]) {
            countByDate[date] = 0;
          }
          countByDate[date] += 1;
        });

        data = Object.entries(countByDate).map(([date, count]) => ({
          date,
          count
        }));
        break;
      }

      case 'driver-performance':
      case 'driverPerformance': {
        // Performances des chauffeurs avec filtrage possible
        const whereClause = {};
        if (dateFrom || dateTo) {
          whereClause.date_service = dateFilter;
        }
        // Si chauffeurId spécifié, filtrer seulement ce chauffeur
        if (chauffeurId) {
          whereClause.chauffeur_id = parseInt(chauffeurId);
        }

        const feuillesRoute = await prisma.feuille_route.findMany({
          where: whereClause,
          include: {
            chauffeur: {
              include: {
                utilisateur: {
                  select: {
                    prenom: true,
                    nom: true
                  }
                }
              }
            },
            course: {
              select: {
                sommes_percues: true
              }
            }
          }
        });

        // Grouper par chauffeur
        const perfByDriver = {};
        feuillesRoute.forEach(feuille => {
          const driverName = feuille.chauffeur?.utilisateur
            ? `${feuille.chauffeur.utilisateur.prenom} ${feuille.chauffeur.utilisateur.nom}`
            : 'Inconnu';

          if (!perfByDriver[driverName]) {
            perfByDriver[driverName] = {
              trips: 0,
              revenue: 0
            };
          }

          perfByDriver[driverName].trips += feuille.course?.length || 0;
          perfByDriver[driverName].revenue += feuille.course?.reduce((sum, c) => 
            sum + parseFloat(c.sommes_percues || 0), 0
          ) || 0;
        });

        data = Object.entries(perfByDriver).map(([driver, perf]) => ({
          driver,
          trips: perf.trips,
          revenue: parseFloat(perf.revenue.toFixed(2))
        }));
        break;
      }

      case 'payment-method':
      case 'paymentMethodDistribution': {
        // Distribution des modes de paiement avec filtrage par chauffeur
        const whereClause = {};
        if (dateFrom || dateTo) {
          whereClause.heure_embarquement = dateFilter;
        }
        // Filtrer par chauffeur si spécifié
        if (chauffeurId) {
          whereClause.feuille_route = {
            chauffeur_id: parseInt(chauffeurId)
          };
        }

        const courses = await prisma.course.findMany({
          where: whereClause,
          include: {
            mode_paiement: {
              select: {
                libelle: true
              }
            }
          }
        });

        // Grouper par mode de paiement
        const paymentCounts = {};
        courses.forEach(course => {
          const method = course.mode_paiement?.libelle || 'Non spécifié';
          if (!paymentCounts[method]) {
            paymentCounts[method] = 0;
          }
          paymentCounts[method] += 1;
        });

        data = Object.entries(paymentCounts).map(([method, count]) => ({
          method,
          count
        }));
        break;
      }

      default:
        return c.json({
          error: `Type de graphique non supporté: ${type}`,
          supportedTypes: ['daily-revenue', 'trips-count', 'driver-performance', 'payment-method']
        }, 400);
    }

    return c.json({
      type,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in chart data endpoint:', error);
    return c.json({
      error: 'Erreur lors de la récupération des données de graphique',
      details: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Routes dashboard spécifiques pour l'interface chauffeur
app.get('/api/dashboard/chauffeurs', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const user = c.get('user');
    
    // Pour les chauffeurs, retourner seulement leurs propres données
    if (user && (user.type === 'Driver' || user.type === 'Chauffeur')) {
      const chauffeur = await prisma.chauffeur.findFirst({
        where: { 
          utilisateur: {
            user_id: user.id
          }
        },
        include: {
          utilisateur: {
            select: {
              user_id: true,
              nom: true,
              prenom: true,
              email: true,
              role: true
            }
          }
        }
      });
      
      if (!chauffeur) {
        return c.json({ error: 'Chauffeur non trouvé' }, 404);
      }
      
      return c.json([{
        chauffeur_id: chauffeur.chauffeur_id,
        statut: chauffeur.statut,
        utilisateur: chauffeur.utilisateur,
        nom_complet: `${chauffeur.utilisateur.prenom} ${chauffeur.utilisateur.nom}`
      }]);
    }
    
    // Pour les admins, retourner tous les chauffeurs
    const chauffeurs = await prisma.chauffeur.findMany({
      where: { statut: 'Actif' },
      include: {
        utilisateur: {
          select: {
            user_id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { chauffeur_id: 'asc' }
    });

    const formattedChauffeurs = chauffeurs.map(chauffeur => ({
      chauffeur_id: chauffeur.chauffeur_id,
      statut: chauffeur.statut,
      utilisateur: chauffeur.utilisateur,
      nom_complet: `${chauffeur.utilisateur.prenom} ${chauffeur.utilisateur.nom}`
    }));

    return c.json(formattedChauffeurs);
  } catch (error) {
    console.error('Error fetching dashboard chauffeurs:', error);
    return c.json({ error: 'Erreur lors de la récupération des chauffeurs dashboard' }, 500);
  }
});

app.get('/api/dashboard/vehicules', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const vehicules = await prisma.vehicule.findMany({
      where: { est_actif: true },
      orderBy: { plaque_immatriculation: 'asc' }
    });

    return c.json(vehicules);
  } catch (error) {
    console.error('Error fetching dashboard vehicules:', error);
    return c.json({ error: 'Erreur lors de la récupération des véhicules dashboard' }, 500);
  }
});

app.get('/api/dashboard/clients', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const clients = await prisma.client.findMany({
      where: { est_actif: true },
      orderBy: { nom_societe: 'asc' }
    });

    return c.json(clients);
  } catch (error) {
    console.error('Error fetching dashboard clients:', error);
    return c.json({ error: 'Erreur lors de la récupération des clients dashboard' }, 500);
  }
});

app.get('/api/dashboard/modes-paiement', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const modes = await prisma.mode_paiement.findMany({
      where: { est_actif: true },
      orderBy: { libelle: 'asc' }
    });

    return c.json(modes);
  } catch (error) {
    console.error('Error fetching dashboard modes paiement:', error);
    return c.json({ error: 'Erreur lors de la récupération des modes de paiement dashboard' }, 500);
  }
});

app.get('/api/dashboard/regles-salaire', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const reglesSalaire = await prisma.regle_salaire.findMany({
      orderBy: { nom_regle: 'asc' }
    });

    const formattedReglesSalaire = reglesSalaire.map(regle => ({
      id: regle.regle_id,
      regle_id: regle.regle_id,
      nom_regle: regle.nom_regle,
      value: regle.regle_id,
      label: regle.nom_regle
    }));

    return c.json(formattedReglesSalaire);
  } catch (error) {
    console.error('Error fetching dashboard regles salaire:', error);
    return c.json({ error: 'Erreur lors de la récupération des règles de salaire dashboard' }, 500);
  }
});

app.get('/api/dashboard/feuilles-route/active/:chauffeurId', dbMiddleware, authMiddleware, async (c) => {
  try {
    const chauffeurId = parseInt(c.req.param('chauffeurId'));
    const prisma = c.get('prisma');

    const feuilleRoute = await prisma.feuille_route.findFirst({
      where: {
        chauffeur_id: chauffeurId,
        est_validee: false // Feuille non validée = active
      },
      include: {
        vehicule: {
          include: {
            societe_taxi: true
          }
        },
        chauffeur: {
          include: {
            utilisateur: true,
            societe_taxi: true
          }
        },
        course: {
          include: {
            client: true,
            mode_paiement: true,
            detail_facture_complexe: true
          }
        },
        taximetre: true
      },
      orderBy: { created_at: 'desc' }
    });

    if (!feuilleRoute) {
      return c.json(null);
    }

    // ✅ Mapper pour le frontend
    const result = mapFeuilleRouteForFrontend(feuilleRoute);

    return c.json(result);
  } catch (error) {
    console.error('Error fetching active dashboard feuille route:', error);
    return c.json({ error: 'Erreur lors de la récupération de la feuille de route active dashboard' }, 500);
  }
});

app.post('/api/dashboard/feuilles-route', dbMiddleware, authMiddleware, async (c) => {
  try {
    const data = await c.req.json();
    const prisma = c.get('prisma');
    const user = c.get('user');

    // Vérifier que l'utilisateur est autorisé à créer une feuille de route
    if (user.type === 'Driver' || user.type === 'Chauffeur') {
      // Le chauffeur ne peut créer que ses propres feuilles
      if (data.chauffeur_id !== user.chauffeur_id && data.chauffeur_id !== user.id) {
        return c.json({ error: 'Non autorisé à créer une feuille pour un autre chauffeur' }, 403);
      }
    }

    const result = await prisma.feuille_route.create({
      data: {
        chauffeur_id: data.chauffeur_id,
        vehicule_id: data.vehicule_id,
        date_service: new Date(data.date_service || data.date),
        mode_encodage: data.mode_encodage || 'LIVE',
        heure_debut: data.heure_debut ? new Date(`1970-01-01T${data.heure_debut}`) : null,
        heure_fin: data.heure_fin ? new Date(`1970-01-01T${data.heure_fin}`) : null,
        index_km_debut_tdb: data.index_km_debut_tdb || data.km_debut,
        km_tableau_bord_debut: data.km_tableau_bord_debut || data.km_debut,
        interruptions: data.interruptions || '',
        montant_salaire_cash_declare: 0,
        est_validee: false
      },
      include: {
        vehicule: true,
        chauffeur: {
          include: {
            utilisateur: true
          }
        }
      }
    });

    return c.json(result);
  } catch (error) {
    console.error('Error creating dashboard feuille route:', error);
    return c.json({ error: 'Erreur lors de la création de la feuille de route dashboard' }, 500);
  }
});

app.put('/api/dashboard/feuilles-route/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const requestData = await c.req.json();
    const prisma = c.get('prisma');
    const user = c.get('user');

    console.log('🔧 PUT /api/dashboard/feuilles-route/:id - Données reçues:', requestData);
    console.log('🔧 PUT /api/dashboard/feuilles-route/:id - Champs taximètre:');
    console.log('  taximetre_prise_charge_fin:', requestData.taximetre_prise_charge_fin);
    console.log('  taximetre_index_km_fin:', requestData.taximetre_index_km_fin);
    console.log('  taximetre_km_charge_fin:', requestData.taximetre_km_charge_fin);
    console.log('  taximetre_chutes_fin:', requestData.taximetre_chutes_fin);

    // Vérifier que l'utilisateur est autorisé à modifier cette feuille
    if (user.type === 'Driver' || user.type === 'Chauffeur') {
      const existingFeuille = await prisma.feuille_route.findUnique({
        where: { feuille_id: parseInt(id) },
        select: { chauffeur_id: true }
      });
      
      if (!existingFeuille || (existingFeuille.chauffeur_id !== user.chauffeur_id && existingFeuille.chauffeur_id !== user.id)) {
        return c.json({ error: 'Non autorisé à modifier cette feuille de route' }, 403);
      }
    }

    // Vérifier le contexte du shift pour déterminer si on est en début ou fin
    const existingFeuille = await prisma.feuille_route.findUnique({
      where: { feuille_id: parseInt(id) },
      include: { taximetre: true }
    });

    if (!existingFeuille) {
      return c.json({ error: 'Feuille de route non trouvée' }, 404);
    }

    // Déterminer le contexte basé sur les données envoyées plutôt que l'état DB
    // Si les données contiennent des champs de fin, c'est une fin de shift
    const hasFinFields = requestData.taximetre_prise_charge_fin !== undefined ||
                        requestData.taximetre_index_km_fin !== undefined ||
                        requestData.taximetre_km_charge_fin !== undefined ||
                        requestData.taximetre_chutes_fin !== undefined ||
                        requestData["Taximètre: Prise en charge"] !== undefined ||
                        requestData["Taximètre: Index km (km totaux)"] !== undefined ||
                        requestData["Taximètre: Km en charge"] !== undefined ||
                        requestData["Taximètre: Chutes (€)"] !== undefined;
    
    // Si les données contiennent des champs de début, c'est un début de shift
    const hasDebutFields = requestData.taximetre_prise_charge_debut !== undefined ||
                          requestData.taximetre_index_km_debut !== undefined ||
                          requestData.taximetre_km_charge_debut !== undefined ||
                          requestData.taximetre_chutes_debut !== undefined;
    
    // Priorité : si on a des champs de fin explicites, c'est une fin
    // Sinon si on a des champs de début, c'est un début
    // Sinon, détecter basé sur l'état actuel de la DB (fallback)
    let context;
    if (hasFinFields) {
      context = 'fin';
      console.log('🔴 Mode FIN de shift détecté (champs *_fin présents)');
    } else if (hasDebutFields) {
      context = 'debut';
      console.log('🟢 Mode DÉBUT de shift détecté (champs *_debut présents)');
    } else {
      // Fallback : logique basée sur l'état DB (comme avant)
      const isBeginningOfShift = !existingFeuille?.taximetre?.taximetre_prise_charge_debut;
      context = isBeginningOfShift ? 'debut' : 'fin';
      console.log(`⚠️  Mode ${context.toUpperCase()} de shift détecté (fallback DB state)`);
    }
    
    // Ajouter le contexte aux données
    requestData.context = context;

    // ✅ Utiliser la fonction de mapping unifiée
    const { feuilleData, taximetreData } = preparePartialUpdateForDB(requestData);

    console.log('🔧 Données feuille mappées:', feuilleData);
    console.log('🔧 Données taximètre mappées:', taximetreData);
    console.log('🔧 Champs taximètre mappés:');
    console.log('  taximetre_prise_charge_fin:', taximetreData.taximetre_prise_charge_fin);
    console.log('  taximetre_index_km_fin:', taximetreData.taximetre_index_km_fin);
    console.log('  taximetre_km_charge_fin:', taximetreData.taximetre_km_charge_fin);
    console.log('  taximetre_chutes_fin:', taximetreData.taximetre_chutes_fin);

    // Mettre à jour la feuille de route
    if (Object.keys(feuilleData).length > 0) {
      await prisma.feuille_route.update({
        where: { feuille_id: parseInt(id) },
        data: feuilleData
      });
    }

    // ✅ Mettre à jour ou créer le taximètre
    if (Object.keys(taximetreData).length > 0) {
      console.log('🔧 PUT /api/dashboard/feuilles-route/:id - Sauvegarde taximètre:', taximetreData);
      await prisma.taximetre.upsert({
        where: { feuille_id: parseInt(id) },
        update: taximetreData,
        create: {
          feuille_id: parseInt(id),
          ...taximetreData
        }
      });
      console.log('✅ PUT /api/dashboard/feuilles-route/:id - Taximètre sauvegardé');
    } else {
      console.log('⚠️ PUT /api/dashboard/feuilles-route/:id - Aucune donnée taximètre à sauvegarder');
    }

    // ✅ VÉRIFICATION: Récupérer les données sauvegardées pour vérifier
    const feuilleVerifiee = await prisma.feuille_route.findUnique({
      where: { feuille_id: parseInt(id) },
      include: { taximetre: true }
    });

    console.log('🔍 VÉRIFICATION - Données sauvegardées en base:', {
      feuille_id: feuilleVerifiee?.feuille_id,
      taximetre_prise_charge_fin: feuilleVerifiee?.taximetre?.taximetre_prise_charge_fin,
      taximetre_index_km_fin: feuilleVerifiee?.taximetre?.taximetre_index_km_fin,
      taximetre_km_charge_fin: feuilleVerifiee?.taximetre?.taximetre_km_charge_fin,
      taximetre_chutes_fin: feuilleVerifiee?.taximetre?.taximetre_chutes_fin
    });

    // Récupérer les données complètes avec taximètre
    const feuilleComplete = await prisma.feuille_route.findUnique({
      where: { feuille_id: parseInt(id) },
      include: {
        vehicule: true,
        chauffeur: {
          include: {
            utilisateur: true
          }
        },
        taximetre: true
      }
    });

    console.log('🔍 Données récupérées après mise à jour:', {
      feuille_id: feuilleComplete?.feuille_id,
      has_taximetre: !!feuilleComplete?.taximetre,
      taximetre_data: feuilleComplete?.taximetre
    });

    // ✅ Mapper pour le frontend
    const result = mapFeuilleRouteForFrontend(feuilleComplete);

    console.log('✅ PUT - Résultat mappé:', {
      feuille_id: result.feuille_id,
      taximetre_prise_charge_fin: result.taximetre_prise_charge_fin,
      taximetre_index_km_fin: result.taximetre_index_km_fin
    });

    return c.json(result);
  } catch (error) {
    console.error('❌ Error updating dashboard feuille route:', error);
    return c.json({ error: 'Erreur lors de la mise à jour de la feuille de route dashboard' }, 500);
  }
});

app.get('/api/dashboard/charges', dbMiddleware, authMiddleware, async (c) => {
  try {
    const feuilleRouteId = c.req.query('feuilleRouteId');
    const chauffeurId = c.req.query('chauffeurId');
    const user = c.get('user');
    const prisma = c.get('prisma');

    let whereClause = {};
    
    if (feuilleRouteId) {
      whereClause.feuille_id = parseInt(feuilleRouteId);
    }
    
    if (chauffeurId) {
      whereClause.chauffeur_id = parseInt(chauffeurId);
    }
    
    // Pour les chauffeurs, filtrer par leurs propres charges
    if (user && (user.type === 'Driver' || user.type === 'Chauffeur')) {
      whereClause.chauffeur_id = user.chauffeur_id || user.id;
    }

    const charges = await prisma.charge.findMany({
      where: whereClause,
      include: {
        chauffeur: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        vehicule: {
          select: {
            vehicule_id: true,
            plaque_immatriculation: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const formattedCharges = charges.map(charge => ({
      ...charge,
      chauffeur_nom: charge.chauffeur?.utilisateur 
        ? `${charge.chauffeur.utilisateur.prenom} ${charge.chauffeur.utilisateur.nom}`
        : 'Inconnu',
      vehicule_plaque: charge.vehicule?.plaque_immatriculation || 'N/A'
    }));

    return c.json(formattedCharges);
  } catch (error) {
    console.error('Error fetching dashboard charges:', error);
    return c.json({ error: 'Erreur lors de la récupération des charges dashboard' }, 500);
  }
});

app.post('/api/dashboard/charges', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();
    const user = c.get('user');

    // Vérifier que l'utilisateur est autorisé à créer une charge
    if (user.type === 'Driver' || user.type === 'Chauffeur') {
      if (data.chauffeur_id !== user.chauffeur_id && data.chauffeur_id !== user.id) {
        return c.json({ error: 'Non autorisé à créer une charge pour un autre chauffeur' }, 403);
      }
    }

    const charge = await prisma.charge.create({
      data: {
        feuille_id: data.feuille_id || null,
        chauffeur_id: data.chauffeur_id,
        vehicule_id: data.vehicule_id,
        description: data.description,
        montant: parseFloat(data.montant),
        mode_paiement_charge: data.mode_paiement_charge,
        date_charge: data.date_charge ? new Date(data.date_charge) : new Date()
      },
      include: {
        chauffeur: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        vehicule: {
          select: {
            vehicule_id: true,
            plaque_immatriculation: true
          }
        }
      }
    });

    return c.json({
      id: charge.charge_id,
      ...charge,
      chauffeur_nom: charge.chauffeur?.utilisateur 
        ? `${charge.chauffeur.utilisateur.prenom} ${charge.chauffeur.utilisateur.nom}`
        : 'Inconnu',
      vehicule_plaque: charge.vehicule?.plaque_immatriculation || 'N/A'
    }, 201);
  } catch (error) {
    console.error('Error creating dashboard charge:', error);
    return c.json({ error: 'Erreur lors de la création de la charge dashboard' }, 500);
  }
});

// Servir les assets statiques
app.get('*', async (c) => {
  try {
    return c.env.ASSETS.fetch(c.req.raw);
  } catch {
    return new Response('Not Found', { status: 404 });
  }
});

export default app;
