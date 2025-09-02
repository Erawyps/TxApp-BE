import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding...');

  try {
    // Modes de paiement avec les bonnes valeurs pour type_paiement
    // Les valeurs doivent correspondre aux contraintes CHECK de la base
    await prisma.mode_paiement.createMany({
      data: [
        { code: 'CASH', libelle: 'Espèces', type_paiement: 'ESPECES' },
        { code: 'CARD', libelle: 'Carte bancaire', type_paiement: 'CARTE' },
        { code: 'CHEQUE', libelle: 'Chèque', type_paiement: 'CHEQUE' },
        { code: 'BANK', libelle: 'Virement bancaire', type_paiement: 'VIREMENT' }
      ],
      skipDuplicates: true
    });
    console.log('Modes de paiement créés');

    // Règles de salaire
    await prisma.regle_salaire.createMany({
      data: [
        {
          nom: 'Salaire Standard',
          type_regle: 'MIXTE',
          taux_fixe: 100.00,
          taux_variable: 15.00,
          description: 'Salaire fixe journalier + commission sur les courses'
        },
        {
          nom: 'Commission Pure',
          type_regle: 'VARIABLE',
          taux_fixe: 0.00,
          taux_variable: 25.00,
          description: 'Commission uniquement basée sur les recettes'
        },
        {
          nom: 'Salaire Fixe',
          type_regle: 'FIXE',
          taux_fixe: 150.00,
          taux_variable: 0.00,
          description: 'Salaire fixe journalier sans commission'
        }
      ],
      skipDuplicates: true
    });
    console.log('Règles de salaire créées');

    // Paramètres système
    await prisma.parametres_systeme.createMany({
      data: [
        { cle: 'tva_default', valeur: '21.00', description: 'Taux de TVA par défaut (Belgique)', categorie: 'fiscal' },
        { cle: 'devise', valeur: 'EUR', description: 'Devise utilisée', categorie: 'general' },
        { cle: 'km_prix_unitaire', valeur: '0.35', description: 'Prix au kilomètre par défaut', categorie: 'tarification' },
        { cle: 'backup_auto', valeur: 'true', description: 'Sauvegarde automatique activée', categorie: 'system' },
        { cle: 'max_courses_par_jour', valeur: '50', description: 'Nombre maximum de courses par jour et par chauffeur', categorie: 'business' }
      ],
      skipDuplicates: true
    });
    console.log('Paramètres système créés');

    // Utilisateur administrateur de test
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.utilisateur.upsert({
      where: { email: 'admin@taxi.be' },
      update: {},
      create: {
        type_utilisateur: 'ADMIN',
        nom: 'Administrateur',
        prenom: 'Test',
        telephone: '+32123456789',
        email: 'admin@taxi.be',
        mot_de_passe: hashedPassword,
        adresse: 'Rue de Test 123',
        ville: 'Bruxelles',
        code_postal: '1000',
        pays: 'Belgique',
        actif: true
      }
    });
    console.log('Utilisateur administrateur créé:', adminUser.email);

    // Véhicules de test
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
          carburant: 'Diesel',
          consommation: 6.5,
          etat: 'Disponible'
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
          carburant: 'Diesel',
          consommation: 5.8,
          etat: 'Disponible'
        }
      ],
      skipDuplicates: true
    });
    console.log('Véhicules créés');

    // Clients de test
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
    console.log('Clients créés');

    console.log('Seeding terminé avec succès!');
  } catch (error) {
    console.error('Erreur pendant le seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
