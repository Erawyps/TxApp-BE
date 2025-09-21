import { PrismaClient } from './prisma/node_modules/.prisma/client/index.js';

const prisma = new PrismaClient();

async function checkAndFixDrissiIsmail() {
  try {
    console.log('🔍 Recherche de Drissi Ismail dans la base de données...');

    let user;

    // Chercher l'utilisateur Drissi Ismail
    user = await prisma.utilisateur.findFirst({
      where: {
        nom: 'Drissi',
        prenom: 'Ismail',
        actif: true
      }
    });

    if (!user) {
      console.log('❌ Utilisateur Drissi Ismail non trouvé dans la table utilisateur');
      console.log('Création de l\'utilisateur Drissi Ismail...');

      // Créer l'utilisateur Drissi Ismail
      user = await prisma.utilisateur.create({
        data: {
          type_utilisateur: 'CHAUFFEUR',
          nom: 'Drissi',
          prenom: 'Ismail',
          telephone: '+32 487 12 34 56',
          email: 'ismail.drissi@taxibruxelles.be',
          mot_de_passe: '$2b$10$ok.WxekiLV2CHUVXy3bf7usU1ouTFkTopbKZBRtafUd4x9BkLhHLS', // password123
          adresse: 'Rue de la Loi 123',
          ville: 'Bruxelles',
          code_postal: '1000',
          pays: 'Belgique',
          actif: true
        }
      });

      console.log('✅ Utilisateur Drissi Ismail créé:', user.id);
    } else {
      console.log('✅ Utilisateur Drissi Ismail trouvé:', user.id);
      console.log('Type utilisateur:', user.type_utilisateur);
    }

    // Vérifier si cet utilisateur a un enregistrement chauffeur
    const chauffeur = await prisma.chauffeur.findUnique({
      where: { utilisateur_id: user.id },
      include: {
        regle_salaire: true,
        utilisateur: true
      }
    });

    if (!chauffeur) {
      console.log('❌ Aucun enregistrement chauffeur trouvé pour Drissi Ismail');
      console.log('Création de l\'enregistrement chauffeur...');

      // Récupérer une règle de salaire par défaut
      const defaultRegleSalaire = await prisma.regle_salaire.findFirst({
        where: { actif: true }
      });

      // Créer l'enregistrement chauffeur
      const newChauffeur = await prisma.chauffeur.create({
        data: {
          utilisateur_id: user.id,
          regle_salaire_id: defaultRegleSalaire?.id || null,
          numero_badge: 'CH007', // Numéro suivant disponible
          date_embauche: new Date('2024-01-15'),
          type_contrat: 'CDI',
          compte_bancaire: 'BE12345678901237',
          taux_commission: 35.00,
          salaire_base: 1500.00,
          actif: true,
          notes: 'Chauffeur expérimenté - Créé automatiquement'
        },
        include: {
          utilisateur: true,
          regle_salaire: true
        }
      });

      console.log('✅ Enregistrement chauffeur créé pour Drissi Ismail:', newChauffeur.id);
      console.log('Numéro badge:', newChauffeur.numero_badge);
      console.log('Règle salaire:', newChauffeur.regle_salaire?.nom || 'Aucune');

    } else {
      console.log('✅ Enregistrement chauffeur trouvé pour Drissi Ismail');
      console.log('ID chauffeur:', chauffeur.id);
      console.log('Numéro badge:', chauffeur.numero_badge);
      console.log('Actif:', chauffeur.actif);
      console.log('Règle salaire:', chauffeur.regle_salaire?.nom || 'Aucune');

      // Vérifier si tout est cohérent
      if (!chauffeur.actif) {
        console.log('⚠️ Le chauffeur n\'est pas actif, activation...');
        await prisma.chauffeur.update({
          where: { id: chauffeur.id },
          data: { actif: true }
        });
        console.log('✅ Chauffeur activé');
      }

      if (user.type_utilisateur !== 'chauffeur') {
        console.log('⚠️ Type utilisateur incorrect, correction...');
        await prisma.utilisateur.update({
          where: { id: user.id },
          data: { type_utilisateur: 'chauffeur' }
        });
        console.log('✅ Type utilisateur corrigé');
      }
    }

    // Vérifier les données finales
    console.log('\n🔍 Vérification finale...');
    const finalUser = await prisma.utilisateur.findUnique({
      where: { id: user.id }
    });

    const finalChauffeur = await prisma.chauffeur.findUnique({
      where: { utilisateur_id: user.id },
      include: {
        utilisateur: true,
        regle_salaire: true
      }
    });

    console.log('Utilisateur final:', {
      id: finalUser.id,
      nom: finalUser.nom,
      prenom: finalUser.prenom,
      type_utilisateur: finalUser.type_utilisateur,
      actif: finalUser.actif
    });

    console.log('Chauffeur final:', {
      id: finalChauffeur.id,
      numero_badge: finalChauffeur.numero_badge,
      actif: finalChauffeur.actif,
      regle_salaire: finalChauffeur.regle_salaire?.nom || 'Aucune'
    });

    console.log('\n✅ Configuration terminée pour Drissi Ismail');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification/correction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixDrissiIsmail();