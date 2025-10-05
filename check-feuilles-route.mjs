import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFeuillesRoute() {
  try {
    console.log('🔍 Vérification de la table feuille_route...');
    
    const count = await prisma.feuille_route.count();
    console.log(`📊 Nombre total de feuilles de route: ${count}`);
    
    if (count > 0) {
      const sample = await prisma.feuille_route.findFirst({
        select: {
          feuille_id: true,
          chauffeur_id: true,
          date_service: true
        }
      });
      console.log('📋 Exemple de feuille de route:', sample);
    }
    
    // Vérifier les feuilles pour le chauffeur ID 6 (Ismail)
    const ismailFeuilles = await prisma.feuille_route.count({
      where: { chauffeur_id: 6 }
    });
    console.log(`👤 Feuilles de route pour chauffeur ID 6: ${ismailFeuilles}`);
    
    // Tester la requête complète comme dans l'API
    console.log('\n🔍 Test de la requête API complète...');
    const feuilles = await prisma.feuille_route.findMany({
      where: { chauffeur_id: 6 },
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        },
        vehicule: true,
        course: true, // Corrigé
        charge: true  // Corrigé
      },
      orderBy: {
        date_service: 'desc'
      }
    });
    
    console.log(`✅ Requête API réussie, feuilles trouvées: ${feuilles.length}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFeuillesRoute();