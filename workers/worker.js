import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import bcrypt from 'bcryptjs';
import { sign, verify } from '@tsndr/cloudflare-worker-jwt';

/**
 * Cloudflare Worker API pour l'authentification TxApp
 * Utilise Prisma avec D1 Database (dev) et Hyperdrive + PostgreSQL (prod)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    // Configuration CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Gérer les requêtes OPTIONS (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let prisma;

      // Initialiser Prisma selon l'environnement
      if (env.NODE_ENV === 'production' && env.HYPERDRIVE) {
        // Production: Utiliser Hyperdrive avec PostgreSQL
        console.log('🚀 Production mode: Using Hyperdrive + PostgreSQL');
        prisma = new PrismaClient({
          datasourceUrl: env.HYPERDRIVE.connectionString,
        });
      } else if (env.DB) {
        // Développement: Utiliser D1 Database
        console.log('🔧 Development mode: Using D1 Database');
        const adapter = new PrismaD1(env.DB);
        prisma = new PrismaClient({ adapter });
      } else {
        throw new Error('No database configuration found');
      }

      // Router API
      if (pathname.startsWith('/api/auth/')) {
        return await handleAuthRoutes(request, prisma, env, pathname);
      }

      if (pathname.startsWith('/api/users/')) {
        return await handleUserRoutes(request, prisma, env, pathname);
      }

      return new Response('Not Found', {
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Worker Error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};

/**
 * Gestion des routes d'authentification
 */
async function handleAuthRoutes(request, prisma, env, pathname) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  try {
    if (pathname === '/api/auth/login' && request.method === 'POST') {
      const { email, password } = await request.json();

      if (!email || !password) {
        return new Response(JSON.stringify({
          error: 'Email et mot de passe requis'
        }), { status: 400, headers: corsHeaders });
      }

      // Rechercher l'utilisateur
      const user = await prisma.utilisateur.findUnique({
        where: { email },
        include: {
          chauffeur: true
        }
      });

      if (!user || !user.actif) {
        return new Response(JSON.stringify({
          error: 'Utilisateur non trouvé ou inactif'
        }), { status: 401, headers: corsHeaders });
      }

      // Vérifier le mot de passe
      const isValidPassword = await bcrypt.compare(password, user.mot_de_passe);
      if (!isValidPassword) {
        return new Response(JSON.stringify({
          error: 'Mot de passe incorrect'
        }), { status: 401, headers: corsHeaders });
      }

      // Mettre à jour la dernière connexion
      await prisma.utilisateur.update({
        where: { id: user.id },
        data: { last_login: new Date() }
      });

      // Générer le token JWT
      const token = await sign({
        userId: user.id,
        email: user.email,
        type: user.type_utilisateur,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
      }, env.JWT_SECRET);

      // Retourner les données sans le mot de passe
      const { mot_de_passe, ...userWithoutPassword } = user;

      return new Response(JSON.stringify({
        authToken: token,
        user: userWithoutPassword
      }), { headers: corsHeaders });
    }

    if (pathname === '/api/auth/register' && request.method === 'POST') {
      const userData = await request.json();
      const { email, password, nom, prenom, telephone, type_utilisateur = 'chauffeur' } = userData;

      if (!email || !password || !nom || !telephone) {
        return new Response(JSON.stringify({
          error: 'Champs requis manquants'
        }), { status: 400, headers: corsHeaders });
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.utilisateur.findUnique({
        where: { email }
      });

      if (existingUser) {
        return new Response(JSON.stringify({
          error: 'Un utilisateur avec cet email existe déjà'
        }), { status: 409, headers: corsHeaders });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);

      // Créer l'utilisateur
      const newUser = await prisma.utilisateur.create({
        data: {
          email,
          mot_de_passe: hashedPassword,
          nom,
          prenom,
          telephone,
          type_utilisateur,
          actif: true,
          date_creation: new Date()
        },
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          type_utilisateur: true,
          telephone: true,
          actif: true
        }
      });

      return new Response(JSON.stringify(newUser), { headers: corsHeaders });
    }

    if (pathname === '/api/auth/profile' && request.method === 'GET') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({
          error: 'Token d\'authentification requis'
        }), { status: 401, headers: corsHeaders });
      }

      const token = authHeader.substring(7);
      const decoded = await verify(token, env.JWT_SECRET);

      if (!decoded) {
        return new Response(JSON.stringify({
          error: 'Token invalide'
        }), { status: 401, headers: corsHeaders });
      }

      const user = await prisma.utilisateur.findUnique({
        where: { id: decoded.userId },
        include: {
          chauffeur: true
        },
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          type_utilisateur: true,
          telephone: true,
          adresse: true,
          ville: true,
          code_postal: true,
          pays: true,
          actif: true,
          last_login: true,
          chauffeur: {
            select: {
              numero_badge: true,
              date_embauche: true,
              type_contrat: true,
              taux_commission: true,
              salaire_base: true,
              actif: true
            }
          }
        }
      });

      if (!user || !user.actif) {
        return new Response(JSON.stringify({
          error: 'Utilisateur non trouvé ou inactif'
        }), { status: 404, headers: corsHeaders });
      }

      return new Response(JSON.stringify(user), { headers: corsHeaders });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });

  } catch (error) {
    console.error('Auth Route Error:', error);
    return new Response(JSON.stringify({
      error: 'Erreur serveur',
      message: error.message
    }), { status: 500, headers: corsHeaders });
  }
}

/**
 * Gestion des routes utilisateurs
 */
async function handleUserRoutes(request, prisma, env, pathname) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        error: 'Token d\'authentification requis'
      }), { status: 401, headers: corsHeaders });
    }

    const token = authHeader.substring(7);
    const decoded = await verify(token, env.JWT_SECRET);

    if (!decoded) {
      return new Response(JSON.stringify({
        error: 'Token invalide'
      }), { status: 401, headers: corsHeaders });
    }

    if (pathname.includes('/profile') && request.method === 'PUT') {
      const updateData = await request.json();
      const { chauffeur, ...userData } = updateData;

      // Mettre à jour les données utilisateur
      const updatedUser = await prisma.utilisateur.update({
        where: { id: decoded.userId },
        data: {
          ...userData,
          updated_at: new Date()
        },
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          type_utilisateur: true,
          telephone: true,
          adresse: true,
          ville: true,
          code_postal: true,
          pays: true
        }
      });

      return new Response(JSON.stringify(updatedUser), { headers: corsHeaders });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });

  } catch (error) {
    console.error('User Route Error:', error);
    return new Response(JSON.stringify({
      error: 'Erreur serveur',
      message: error.message
    }), { status: 500, headers: corsHeaders });
  }
}
