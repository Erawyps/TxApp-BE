import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testAPI() {
  try {
    console.log('=== TEST DE L\'API CHAUFFEURS ===\n');

    // Simuler ce que fait l'API
    const chauffeursBase = await prisma.chauffeur.findMany({
      where: { actif: true },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            telephone: true,
            email: true
          }
        },
        regle_salaire: true,
        feuille_route: {
          include: {
            vehicule: {
              select: {
                id: true,
                plaque_immatriculation: true,
                marque: true,
                modele: true,
                etat: true
              }
            },
            course: {
              include: {
                mode_paiement: true,
                client: {
                  select: {
                    id: true,
                    nom: true,
                    prenom: true
                  }
                }
              }
            },
            charge: {
              include: {
                mode_paiement: true
              }
            }
          }
        }
      },
      orderBy: { numero_badge: 'asc' }
    });

    console.log('Chauffeurs trouvés:', chauffeursBase.length);
    console.log('Premier chauffeur:', chauffeursBase[0]?.utilisateur?.prenom, chauffeursBase[0]?.utilisateur?.nom);

    // Vérifier les courses du premier chauffeur
    if (chauffeursBase[0]?.feuille_route?.[0]?.course) {
      console.log('Courses du premier chauffeur:');
      console.log(chauffeursBase[0].feuille_route[0].course.map(c => ({
        id: c.id,
        depart: c.lieu_embarquement,
        arrivee: c.lieu_debarquement,
        index_depart: c.index_depart,
        index_arrivee: c.index_arrivee,
        somme_percue: c.somme_percue
      })));
    }

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();