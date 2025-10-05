import { Hono } from 'hono';
import prisma from '../configs/database.config.js';

const dashboardRoutes = new Hono();

// Route pour les statistiques des courses
dashboardRoutes.get('/courses/stats', async (c) => {
  try {
    const { dateFrom, dateTo, chauffeurId } = c.req.query();

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

    // Statistiques des courses
    const [
      totalCourses,
      revenueResult,
      distanceResult,
      chauffeursActifs,
      vehiculesUtilises
    ] = await Promise.all([
      // Nombre total de courses
      prisma.course.count({ where }),
      
      // Revenus totaux
      prisma.course.aggregate({
        where,
        _sum: {
          sommes_percues: true
        }
      }),
      
      // Distance totale (index_debarquement - index_embarquement)
      prisma.course.findMany({
        where,
        select: {
          index_embarquement: true,
          index_debarquement: true
        }
      }),
      
      // Chauffeurs actifs (via feuilles de route distinctes)
      prisma.feuille_route.findMany({
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
      }),
      
      // Véhicules utilisés (via feuilles de route distinctes)
      prisma.feuille_route.findMany({
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
      })
    ]);

    // Calculer la distance totale
    const totalDistance = distanceResult.reduce((sum, course) => {
      const dist = (course.index_debarquement || 0) - (course.index_embarquement || 0);
      return sum + dist;
    }, 0);

    const totalRevenue = parseFloat(revenueResult._sum.sommes_percues || 0);

    // Calculer les moyennes
    const averageEarningsPerTrip = totalCourses > 0 ? totalRevenue / totalCourses : 0;
    const averageDistancePerTrip = totalCourses > 0 ? totalDistance / totalCourses : 0;

    return c.json({
      totalCourses,
      totalRevenue,
      totalDistance,
      chauffeursActifs: chauffeursActifs.length,
      vehiculesUtilises: vehiculesUtilises.length,
      averageEarningsPerTrip,
      averageDistancePerTrip,
      timestamp: new Date().toISOString()
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
dashboardRoutes.get('/courses/chart-data', async (c) => {
  try {
    const { type = 'daily', dateFrom, dateTo } = c.req.query();

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
        // Revenus quotidiens
        const courses = await prisma.course.findMany({
          where: dateFrom || dateTo ? {
            heure_embarquement: dateFilter
          } : undefined,
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
        // Nombre de courses quotidiennes
        const courses = await prisma.course.findMany({
          where: dateFrom || dateTo ? {
            heure_embarquement: dateFilter
          } : undefined,
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
        // Performances des chauffeurs
        const feuillesRoute = await prisma.feuille_route.findMany({
          where: dateFrom || dateTo ? {
            date_service: dateFilter
          } : undefined,
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
        // Distribution des modes de paiement
        const courses = await prisma.course.findMany({
          where: dateFrom || dateTo ? {
            heure_embarquement: dateFilter
          } : undefined,
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

// Route pour la liste des courses avec filtrage par chauffeur
dashboardRoutes.get('/courses', async (c) => {
  try {
    const { chauffeurId, dateFrom, dateTo } = c.req.query();

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

    const courses = await prisma.course.findMany({
      where: Object.keys(whereFilter).length > 0 ? whereFilter : undefined,
      include: {
        feuille_route: {
          include: {
            chauffeur: {
              include: {
                utilisateur: {
                  select: {
                    nom: true,
                    prenom: true,
                    email: true
                  }
                }
              }
            },
            vehicule: {
              select: {
                vehicule_id: true,
                plaque_immatriculation: true,
                num_identification: true,
                marque: true,
                modele: true,
                annee: true
              }
            }
          }
        },
        client: {
          select: {
            client_id: true,
            nom_societe: true,
            telephone: true,
            email: true
          }
        },
        mode_paiement: {
          select: {
            mode_id: true,
            code: true,
            libelle: true,
            type: true
          }
        },
        detail_facture_complexe: true
      },
      orderBy: [
        {
          feuille_id: 'desc'
        },
        {
          num_ordre: 'asc'
        }
      ]
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
      count: courses.length,
      filters: {
        chauffeurId: chauffeurId || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in dashboard courses endpoint:', error);
    return c.json({
      error: 'Erreur lors de la récupération des courses du dashboard',
      details: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

export default dashboardRoutes;