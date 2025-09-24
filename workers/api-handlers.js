import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper: Auth check
function authenticateToken(request, env) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) throw new Error('Access token required');
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new Error('Invalid token');
  }
}

// Chauffeur Handlers
export async function handleChauffeurs(request, env) {
  try {
    authenticateToken(request);
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (request.method === 'GET') {
      if (id && id !== 'chauffeurs') {
        const chauffeur = await prisma.chauffeur.findUnique({
          where: { id: parseInt(id) },
          include: {
            utilisateur: true,
            regle_salaire: true,
            vehicules: {
              include: {
                vehicule: true
              }
            }
          }
        });
        if (!chauffeur) return new Response(JSON.stringify({ error: 'Chauffeur not found' }), { status: 404 });
        return new Response(JSON.stringify(chauffeur), { status: 200 });
      }
      const chauffeurs = await prisma.chauffeur.findMany({
        include: {
          utilisateur: true,
          regle_salaire: true,
          vehicules: {
            include: {
              vehicule: true
            }
          }
        }
      });
      return new Response(JSON.stringify(chauffeurs), { status: 200 });
    }

    if (request.method === 'POST') {
      const data = await request.json();
      const chauffeur = await prisma.chauffeur.create({ data });
      return new Response(JSON.stringify(chauffeur), { status: 201 });
    }

    if (request.method === 'PUT' && id) {
      const data = await request.json();
      const chauffeur = await prisma.chauffeur.update({ where: { id: parseInt(id) }, data });
      return new Response(JSON.stringify(chauffeur), { status: 200 });
    }

    if (request.method === 'DELETE' && id) {
      await prisma.chauffeur.delete({ where: { id: parseInt(id) } });
      return new Response(null, { status: 204 });
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// Vehicule Handlers
export async function handleVehicules(request, env) {
  try {
    authenticateToken(request);
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (request.method === 'GET') {
      if (id && id !== 'vehicules') {
        const vehicule = await prisma.vehicule.findUnique({
          where: { id: parseInt(id) },
          include: {
            chauffeurs: {
              include: {
                chauffeur: true
              }
            }
          }
        });
        if (!vehicule) return new Response(JSON.stringify({ error: 'Vehicule not found' }), { status: 404 });
        return new Response(JSON.stringify(vehicule), { status: 200 });
      }
      const vehicules = await prisma.vehicule.findMany({
        include: {
          chauffeurs: {
            include: {
              chauffeur: true
            }
          }
        }
      });
      return new Response(JSON.stringify(vehicules), { status: 200 });
    }

    if (request.method === 'POST') {
      const data = await request.json();
      const vehicule = await prisma.vehicule.create({ data });
      return new Response(JSON.stringify(vehicule), { status: 201 });
    }

    if (request.method === 'PUT' && id) {
      const data = await request.json();
      const vehicule = await prisma.vehicule.update({ where: { id: parseInt(id) }, data });
      return new Response(JSON.stringify(vehicule), { status: 200 });
    }

    if (request.method === 'DELETE' && id) {
      await prisma.vehicule.delete({ where: { id: parseInt(id) } });
      return new Response(null, { status: 204 });
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// Course Handlers
export async function handleCourses(request, env) {
  try {
    authenticateToken(request);
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (request.method === 'GET') {
      if (id && id !== 'courses') {
        const course = await prisma.course.findUnique({
          where: { id: parseInt(id) },
          include: {
            client: true,
            feuille_route: true,
            mode_paiement: true
          }
        });
        if (!course) return new Response(JSON.stringify({ error: 'Course not found' }), { status: 404 });
        return new Response(JSON.stringify(course), { status: 200 });
      }
      const courses = await prisma.course.findMany({
        include: {
          client: true,
          feuille_route: true,
          mode_paiement: true
        }
      });
      return new Response(JSON.stringify(courses), { status: 200 });
    }

    if (request.method === 'POST') {
      const data = await request.json();
      const course = await prisma.course.create({ data });
      return new Response(JSON.stringify(course), { status: 201 });
    }

    if (request.method === 'PUT' && id) {
      const data = await request.json();
      const course = await prisma.course.update({ where: { id: parseInt(id) }, data });
      return new Response(JSON.stringify(course), { status: 200 });
    }

    if (request.method === 'DELETE' && id) {
      await prisma.course.delete({ where: { id: parseInt(id) } });
      return new Response(null, { status: 204 });
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// Feuille Route Handlers
export async function handleFeuilleRoutes(request, env) {
  try {
    authenticateToken(request);
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (request.method === 'GET') {
      if (id && id !== 'feuille-routes') {
        const feuille = await prisma.feuille_route.findUnique({
          where: { id: parseInt(id) },
          include: {
            chauffeur: true,
            vehicule: true,
            course: true
          }
        });
        if (!feuille) return new Response(JSON.stringify({ error: 'Feuille route not found' }), { status: 404 });
        return new Response(JSON.stringify(feuille), { status: 200 });
      }
      const feuilles = await prisma.feuille_route.findMany({
        include: {
          chauffeur: true,
          vehicule: true,
          course: true
        }
      });
      return new Response(JSON.stringify(feuilles), { status: 200 });
    }

    if (request.method === 'POST') {
      const data = await request.json();
      const feuille = await prisma.feuille_route.create({ data });
      return new Response(JSON.stringify(feuille), { status: 201 });
    }

    if (request.method === 'PUT' && id) {
      const data = await request.json();
      const feuille = await prisma.feuille_route.update({ where: { id: parseInt(id) }, data });
      return new Response(JSON.stringify(feuille), { status: 200 });
    }

    if (request.method === 'DELETE' && id) {
      await prisma.feuille_route.delete({ where: { id: parseInt(id) } });
      return new Response(null, { status: 204 });
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// Client Handlers
export async function handleClients(request, env) {
  try {
    authenticateToken(request);
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (request.method === 'GET') {
      if (id && id !== 'clients') {
        const client = await prisma.client.findUnique({ where: { id: parseInt(id) } });
        if (!client) return new Response(JSON.stringify({ error: 'Client not found' }), { status: 404 });
        return new Response(JSON.stringify(client), { status: 200 });
      }
      const clients = await prisma.client.findMany();
      return new Response(JSON.stringify(clients), { status: 200 });
    }

    if (request.method === 'POST') {
      const data = await request.json();
      const client = await prisma.client.create({ data });
      return new Response(JSON.stringify(client), { status: 201 });
    }

    if (request.method === 'PUT' && id) {
      const data = await request.json();
      const client = await prisma.client.update({ where: { id: parseInt(id) }, data });
      return new Response(JSON.stringify(client), { status: 200 });
    }

    if (request.method === 'DELETE' && id) {
      await prisma.client.delete({ where: { id: parseInt(id) } });
      return new Response(null, { status: 204 });
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// Utilisateur Handlers
export async function handleUtilisateurs(request, env) {
  try {
    authenticateToken(request);
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (request.method === 'GET') {
      if (id && id !== 'utilisateurs') {
        const utilisateur = await prisma.utilisateur.findUnique({
          where: { id: parseInt(id) },
          include: {
            chauffeur: true
          }
        });
        if (!utilisateur) return new Response(JSON.stringify({ error: 'Utilisateur not found' }), { status: 404 });
        return new Response(JSON.stringify(utilisateur), { status: 200 });
      }
      const utilisateurs = await prisma.utilisateur.findMany({
        include: {
          chauffeur: true
        }
      });
      return new Response(JSON.stringify(utilisateurs), { status: 200 });
    }

    if (request.method === 'POST') {
      const data = await request.json();
      const utilisateur = await prisma.utilisateur.create({ data });
      return new Response(JSON.stringify(utilisateur), { status: 201 });
    }

    if (request.method === 'PUT' && id) {
      const data = await request.json();
      const utilisateur = await prisma.utilisateur.update({ where: { id: parseInt(id) }, data });
      return new Response(JSON.stringify(utilisateur), { status: 200 });
    }

    if (request.method === 'DELETE' && id) {
      await prisma.utilisateur.delete({ where: { id: parseInt(id) } });
      return new Response(null, { status: 204 });
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}