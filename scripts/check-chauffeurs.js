import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkChauffeurs() {
  try {
    console.log('👥 Vérification des chauffeurs disponibles...');

    const chauffeurs = await prisma.utilisateur.findMany({
      where: { type_utilisateur: 'chauffeur' },
      select: {
        id: true,
        nom: true,
        prenom: true,
        chauffeur: {
          select: { id: true }
        }
      }
    });

    console.log(`\n📋 ${chauffeurs.length} chauffeurs trouvés:`);
    chauffeurs.forEach(c => {
      console.log(`- ${c.prenom} ${c.nom} (Utilisateur ID: ${c.id}, Chauffeur ID: ${c.chauffeur?.id || 'N/A'})`);
    });

    // Chercher François-José Dubois spécifiquement
    const dubois = await prisma.utilisateur.findFirst({
      where: {
        nom: 'Dubois',
        prenom: 'François-José'
      },
      include: {
        chauffeur: true
      }
    });

    if (dubois) {
      console.log(`\n✅ François-José Dubois trouvé:`);
      console.log(`- Utilisateur ID: ${dubois.id}`);
      console.log(`- Chauffeur ID: ${dubois.chauffeur?.id || 'N/A'}`);

      if (dubois.chauffeur) {
        // Vérifier ses feuilles de route
        const feuilles = await prisma.feuille_route.findMany({
          where: { chauffeur_id: dubois.chauffeur.id },
          include: { vehicule: true },
          orderBy: { date: 'desc' },
          take: 5
        });

        console.log(`\n📊 ${feuilles.length} dernières feuilles de route:`);
        feuilles.forEach(f => {
          console.log(`- ${f.date.toISOString().split('T')[0]}: ${f.vehicule.plaque_immatriculation} (${f.vehicule.marque} ${f.vehicule.modele})`);
        });
      }
    } else {
      console.log('\n❌ François-José Dubois non trouvé dans la base de données');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkChauffeurs();