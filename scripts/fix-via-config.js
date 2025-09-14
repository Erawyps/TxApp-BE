import prisma from '../src/configs/database.config.js';

async function fixData() {
  try {
    console.log('🔧 Correction des données via API...');

    // 1. Vérifier François-José Dubois
    const dubois = await prisma.chauffeur.findUnique({
      where: { id: 15 },
      include: { regle_salaire: true, utilisateur: true }
    });

    console.log('François-José Dubois actuel:', {
      id: dubois?.id,
      nom: dubois?.utilisateur?.nom,
      prenom: dubois?.utilisateur?.prenom,
      regle_salaire_id: dubois?.regle_salaire_id,
      regle_salaire_nom: dubois?.regle_salaire?.nom
    });

    // 2. Assigner la règle de salaire si elle n'existe pas
    if (!dubois?.regle_salaire_id) {
      const regleSalaire = await prisma.regle_salaire.findFirst({
        where: { nom: 'Commission avec Pourboires', actif: true }
      });

      if (regleSalaire) {
        await prisma.chauffeur.update({
          where: { id: 15 },
          data: { regle_salaire_id: regleSalaire.id }
        });
        console.log('✅ Règle de salaire assignée à François-José Dubois');
      }
    }

    // 3. Créer la relation véhicule
    try {
      const vehicule = await prisma.vehicule.findFirst({
        where: { plaque_immatriculation: '1-ABC-123' }
      });

      if (vehicule) {
        await prisma.chauffeur_vehicule.upsert({
          where: {
            chauffeur_id_vehicule_id: {
              chauffeur_id: 15,
              vehicule_id: vehicule.id
            }
          },
          update: { actif: true },
          create: {
            chauffeur_id: 15,
            vehicule_id: vehicule.id,
            date_assignation: new Date('2023-01-15'),
            actif: true
          }
        });
        console.log('✅ Véhicule assigné à François-José Dubois');
      }
    } catch (error) {
      console.log('ℹ️ Erreur relation véhicule:', error.message);
    }

    console.log('🎉 Correction terminée!');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

fixData();