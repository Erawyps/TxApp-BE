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

    let data = [];
    const whereClause = {};

    // Construction des filtres de date
    if (dateFrom || dateTo) {
      whereClause.created_at = {};
      if (dateFrom) whereClause.created_at.gte = new Date(dateFrom);
      if (dateTo) whereClause.created_at.lte = new Date(dateTo);
    }

    switch (type) {
      case 'dailyTripsCount': {
        // Nombre de courses par jour
        const tripsData = await prisma.course.groupBy({
          by: ['created_at'],
          _count: {
            course_id: true
          },
          where: whereClause,
          orderBy: {
            created_at: 'asc'
          }
        });

        data = tripsData.map(item => ({
          date: item.created_at.toISOString().split('T')[0],
          count: item._count.course_id
        }));
        break;
      }

      case 'dailyRevenues': {
        // Revenus quotidiens
        const revenueData = await prisma.course.groupBy({
          by: ['created_at'],
          _sum: {
            sommes_percues: true
          },
          where: whereClause,
          orderBy: {
            created_at: 'asc'
          }
        });

        data = revenueData.map(item => ({
          date: item.created_at.toISOString().split('T')[0],
          revenue: item._sum.sommes_percues || 0
        }));
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

      case 'driverPerformance': {
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

        // Grouper manuellement les données
        const performance = {};
        driverData.forEach(item => {
          const driverName = `${item.feuille_route?.chauffeur?.utilisateur?.prenom || ''} ${item.feuille_route?.chauffeur?.utilisateur?.nom || ''}`.trim();
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
    return c.json({
      error: 'Erreur lors de la récupération des données de graphique',
      details: error.message
    }, 500);
  }
});

export default dashboardRoutes;