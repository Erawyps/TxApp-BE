import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function completeSeeding() {
  console.log('🚀 Completion du seeding...');

  try {
    // 1. Créer les véhicules
    try {
      await prisma.vehicule.createMany({
        data: [
          {
            plaque_immatriculation: '1-ABC-123',
            numero_identification: 'VIN123456789',
            marque: 'Mercedes',
            modele: 'E-Class',
            annee: 2020,
            type_vehicule: 'BERLINE',
            couleur: 'Noir',
            date_mise_circulation: new Date('2020-01-15'),
            capacite: 4,
            carburant: 'DIESEL',
            consommation: 6.5,
            etat: 'DISPONIBLE'
          },
          {
            plaque_immatriculation: '1-XYZ-789',
            numero_identification: 'VIN987654321',
            marque: 'BMW',
            modele: 'Série 3',
            annee: 2019,
            type_vehicule: 'BERLINE',
            couleur: 'Blanc',
            date_mise_circulation: new Date('2019-06-10'),
            capacite: 4,
            carburant: 'DIESEL',
            consommation: 5.8,
            etat: 'DISPONIBLE'
          }
        ],
        skipDuplicates: true
      });
      console.log('✅ Véhicules créés');
    } catch (error) {
      console.log('❌ Erreur véhicules:', error.message);
    }

    // 2. Créer les clients
    try {
      await prisma.client.createMany({
        data: [
          {
            type_client: 'PARTICULIER',
            nom: 'Dupont',
            prenom: 'Jean',
            telephone: '+32987654321',
            email: 'jean.dupont@email.com',
            adresse: 'Avenue Louise 123',
            ville: 'Bruxelles',
            code_postal: '1050',
            pays: 'Belgique',
            actif: true
          },
          {
            type_client: 'ENTREPRISE',
            nom: 'TaxiCorp SPRL',
            telephone: '+32456789123',
            email: 'contact@taxicorp.be',
            adresse: 'Boulevard Anspach 45',
            ville: 'Bruxelles',
            code_postal: '1000',
            pays: 'Belgique',
            num_tva: 'BE0123456789',
            periode_facturation: 'MENSUELLE',
            mode_facturation: 'DETAILLE',
            actif: true
          }
        ],
        skipDuplicates: true
      });
      console.log('✅ Clients créés');
    } catch (error) {
      console.log('❌ Erreur clients:', error.message);
    }

    // 3. Créer les utilisateurs chauffeurs
    const chauffeurPassword = await bcrypt.hash('chauffeur123', 10);
    const dispatcherPassword = await bcrypt.hash('dispatcher123', 10);

    try {
      // Utilisateur chauffeur 1
      const user1 = await prisma.utilisateur.upsert({
        where: { email: 'pierre.martin@taxi.be' },
        update: {},
        create: {
          type_utilisateur: 'CHAUFFEUR',
          nom: 'Martin',
          prenom: 'Pierre',
          telephone: '+32456789012',
          email: 'pierre.martin@taxi.be',
          mot_de_passe: chauffeurPassword,
          adresse: 'Rue des Chauffeurs 12',
          ville: 'Bruxelles',
          code_postal: '1030',
          pays: 'Belgique',
          actif: true
        }
      });

      // Utilisateur chauffeur 2
      const user2 = await prisma.utilisateur.upsert({
        where: { email: 'marie.dupuis@taxi.be' },
        update: {},
        create: {
          type_utilisateur: 'CHAUFFEUR',
          nom: 'Dupuis',
          prenom: 'Marie',
          telephone: '+32456789013',
          email: 'marie.dupuis@taxi.be',
          mot_de_passe: chauffeurPassword,
          adresse: 'Avenue de la Liberté 45',
          ville: 'Liège',
          code_postal: '4000',
          pays: 'Belgique',
          actif: true
        }
      });

      // Dispatcher
      await prisma.utilisateur.upsert({
        where: { email: 'dispatcher@taxi.be' },
        update: {},
        create: {
          type_utilisateur: 'DISPATCHER',
          nom: 'Central',
          prenom: 'Dispatcher',
          telephone: '+32123456790',
          email: 'dispatcher@taxi.be',
          mot_de_passe: dispatcherPassword,
          adresse: 'Centre de Dispatch',
          ville: 'Bruxelles',
          code_postal: '1000',
          pays: 'Belgique',
          actif: true
        }
      });

      console.log('✅ Utilisateurs chauffeurs et dispatcher créés');

      // 4. Créer les profils chauffeurs
      const regleSalaire = await prisma.regle_salaire.findFirst({
        where: { nom: 'Salaire Standard' }
      });

      await prisma.chauffeur.upsert({
        where: { numero_badge: 'CH001' },
        update: {},
        create: {
          numero_badge: 'CH001',
          utilisateur_id: user1.id,
          regle_salaire_id: regleSalaire?.id,
          date_embauche: new Date('2023-01-15'),
          type_contrat: 'CDI',
          compte_bancaire: 'BE68539007547034',
          taux_commission: 20.00,
          salaire_base: 120.00,
          notes: 'Chauffeur expérimenté, très ponctuel',
          actif: true
        }
      });

      await prisma.chauffeur.upsert({
        where: { numero_badge: 'CH002' },
        update: {},
        create: {
          numero_badge: 'CH002',
          utilisateur_id: user2.id,
          regle_salaire_id: regleSalaire?.id,
          date_embauche: new Date('2023-03-20'),
          type_contrat: 'CDI',
          compte_bancaire: 'BE68539007547035',
          taux_commission: 18.00,
          salaire_base: 110.00,
          notes: 'Excellente connaissance de la ville',
          actif: true
        }
      });

      console.log('✅ Profils chauffeurs créés');

    } catch (error) {
      console.log('❌ Erreur utilisateurs/chauffeurs:', error.message);
    }

    console.log('🎉 Seeding complet terminé!');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeSeeding();
