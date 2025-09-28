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
    const dateFrom = c.req.query('dateFrom');
    const dateTo = c.req.query('dateTo');
    const type = c.req.query('type');

    console.log('Chart data request:', { type, dateFrom, dateTo });

    let data = [];
    const whereClause = {};

    // Construction des filtres de date
    if (dateFrom || dateTo) {
      whereClause.created_at = {};
      if (dateFrom) whereClause.created_at.gte = new Date(dateFrom);
      if (dateTo) whereClause.created_at.lte = new Date(dateTo);
    }

    console.log('Where clause:', whereClause);

    switch (type) {
      case 'trips-count': {
        // Nombre de courses par jour
        const tripsData = await prisma.course.findMany({
          where: whereClause,
          select: {
            created_at: true
          }
        });

        // Grouper par date
        const groupedData = {};
        tripsData.forEach(item => {
          const date = item.created_at.toISOString().split('T')[0];
          groupedData[date] = (groupedData[date] || 0) + 1;
        });

        data = Object.entries(groupedData)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));
        break;
      }

      case 'daily-revenue': {
        // Revenus quotidiens
        const revenueData = await prisma.course.findMany({
          where: whereClause,
          select: {
            created_at: true,
            sommes_percues: true
          }
        });

        // Grouper par date
        const groupedData = {};
        revenueData.forEach(item => {
          const date = item.created_at.toISOString().split('T')[0];
          groupedData[date] = (groupedData[date] || 0) + (item.sommes_percues || 0);
        });

        data = Object.entries(groupedData)
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date));
        break;
      }

      case 'paymentMethodDistribution': {
        // Distribution des modes de paiement
        const paymentData = await prisma.course.findMany({
          where: whereClause,
          select: {
            mode_paiement: {
              select: {
                libelle: true
              }
            }
          }
        });

        // Grouper manuellement les données
        const distribution = {};
        paymentData.forEach(item => {
          const method = item.mode_paiement?.libelle || 'Non défini';
          distribution[method] = (distribution[method] || 0) + 1;
        });

        data = Object.entries(distribution).map(([method, count]) => ({
          method,
          count
        }));
        break;
      }

      case 'driver-performance': {
        console.log('Processing driver-performance query');
        // Performance des chauffeurs
        const driverData = await prisma.course.findMany({
          where: {
            ...whereClause
          },
          select: {
            sommes_percues: true,
            feuille_route: {
              select: {
                chauffeur: {
                  select: {
                    utilisateur: {
                      select: {
                        nom: true,
                        prenom: true
                      }
                    }
                  }
                }
              }
            }
          }
        });

        console.log('Driver data fetched:', driverData.length, 'records');

        // Grouper manuellement les données
        const performance = {};
        driverData.forEach(item => {
          const driverName = `${item.feuille_route?.chauffeur?.utilisateur?.prenom || ''} ${item.feuille_route?.chauffeur?.utilisateur?.nom || ''}`.trim();
          console.log('Processing driver:', driverName, 'revenue:', item.sommes_percues);
          if (driverName && driverName !== '') {
            if (!performance[driverName]) {
              performance[driverName] = {
                driver: driverName,
                revenue: 0,
                trips: 0
              };
            }
            performance[driverName].revenue += item.sommes_percues || 0;
            performance[driverName].trips += 1;
          }
        });

        data = Object.values(performance);
        console.log('Driver performance data:', data);
        break;
      }

      default:
        return c.json({ error: 'Type de graphique non supporté' }, 400);
    }

    return c.json({
      type,
      data,
      filters: {
        dateFrom,
        dateTo
      }
    });
  } catch (error) {
    console.error('Error in chart data:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return c.json({
      error: 'Erreur lors de la récupération des données de graphique',
      details: error.message,
      stack: error.stack
    }, 500);
  }
});

export default dashboardRoutes;