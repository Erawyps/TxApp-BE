import { Hono } from 'hono';
import prisma from '../configs/database.config.js';

const dashboardRoutes = new Hono();

// Route pour les statistiques des courses
dashboardRoutes.get('/courses/stats', async (c) => {
  try {
    // Test simple de connexion DB
    await prisma.$queryRaw`SELECT 1`;

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
      // Nombre total de courses
      stats.totalCourses = await prisma.course.count();
    } catch (error) {
      console.error('Error fetching total courses:', error);
    }

    try {
      // Revenus totaux
      const revenueResult = await prisma.course.aggregate({
        _sum: {
          sommes_percues: true
        }
      });
      stats.totalRevenue = revenueResult._sum.sommes_percues || 0;
    } catch (error) {
      console.error('Error fetching total revenue:', error);
    }

    try {
      // Distance totale (calculée à partir des index)
      const distanceResult = await prisma.course.aggregate({
        _sum: {
          index_debarquement: true,
          index_embarquement: true
        }
      });
      stats.totalDistance = (distanceResult._sum.index_debarquement || 0) - (distanceResult._sum.index_embarquement || 0);
    } catch (error) {
      console.error('Error fetching total distance:', error);
    }

    try {
      // Nombre de chauffeurs actifs (tous les chauffeurs ayant des feuilles de route)
      const chauffeursResult = await prisma.feuille_route.findMany({
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
      // Nombre de véhicules utilisés
      const vehiculesResult = await prisma.feuille_route.findMany({
        select: {
          vehicule_id: true
        },
        distinct: ['vehicule_id']
      });

      stats.vehiculesUtilises = vehiculesResult.length;
    } catch (error) {
      console.error('Error fetching vehicles used:', error);
    }

    return c.json(stats);
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
dashboardRoutes.get('/courses/chart-data', async (c) => {
  try {
    console.log('Chart data endpoint called');
    return c.json({
      type: 'test',
      data: [{ date: '2025-09-29', value: 100 }],
      message: 'Test response'
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return c.json({ error: 'Test error' }, 500);
  }
});

export default dashboardRoutes;