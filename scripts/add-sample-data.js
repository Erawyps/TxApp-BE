import { PrismaClient } from '@prisma/client';
import { exit } from 'process';

const prisma = new PrismaClient();

async function addSampleData() {
  try {
    console.log('🚀 Début de l\'ajout des données d\'exemple...');

    // 1. Ajouter des utilisateurs supplémentaires
    console.log('📝 Ajout d\'utilisateurs...');
    const newUsers = await Promise.all([
      prisma.utilisateur.create({
        data: {
          nom: 'Dubois',
          prenom: 'Marie',
          email: 'marie.dubois@email.be',
          telephone: '+32456789012',
          role: 'CHAUFFEUR',
          actif: true
        }
      }),
      prisma.utilisateur.create({
        data: {
          nom: 'Leroy',
          prenom: 'Jean',
          email: 'jean.leroy@email.be',
          telephone: '+32456789013',
          role: 'CHAUFFEUR',
          actif: true
        }
      }),
      prisma.utilisateur.create({
        data: {
          nom: 'Moreau',
          prenom: 'Sophie',
          email: 'sophie.moreau@email.be',
          telephone: '+32456789014',
          role: 'CHAUFFEUR',
          actif: true
        }
      }),
      prisma.utilisateur.create({
        data: {
          nom: 'Garcia',
          prenom: 'Carlos',
          email: 'carlos.garcia@email.be',
          telephone: '+32456789015',
          role: 'CHAUFFEUR',
          actif: true
        }
      }),
      prisma.utilisateur.create({
        data: {
          nom: 'Schmidt',
          prenom: 'Anna',
          email: 'anna.schmidt@email.be',
          telephone: '+32456789016',
          role: 'CLIENT',
          actif: true
        }
      })
    ]);

    console.log(`✅ ${newUsers.length} utilisateurs ajoutés`);

    // 2. Créer les chauffeurs correspondants
    console.log('🚗 Création des chauffeurs...');
    const newChauffeurs = await Promise.all([
      prisma.chauffeur.create({
        data: {
          utilisateur_id: newUsers[0].id,
          numero_permis: 'B123456789',
          date_expiration_permis: new Date('2026-12-31'),
          categorie_permis: 'B',
          actif: true
        }
      }),
      prisma.chauffeur.create({
        data: {
          utilisateur_id: newUsers[1].id,
          numero_permis: 'B987654321',
          date_expiration_permis: new Date('2027-06-15'),
          categorie_permis: 'B',
          actif: true
        }
      }),
      prisma.chauffeur.create({
        data: {
          utilisateur_id: newUsers[2].id,
          numero_permis: 'B456789123',
          date_expiration_permis: new Date('2026-08-20'),
          categorie_permis: 'B',
          actif: true
        }
      }),
      prisma.chauffeur.create({
        data: {
          utilisateur_id: newUsers[3].id,
          numero_permis: 'B789123456',
          date_expiration_permis: new Date('2027-03-10'),
          categorie_permis: 'B',
          actif: true
        }
      })
    ]);

    console.log(`✅ ${newChauffeurs.length} chauffeurs ajoutés`);

    // 3. Ajouter des véhicules supplémentaires
    console.log('🚙 Ajout de véhicules...');
    const newVehicules = await Promise.all([
      prisma.vehicule.create({
        data: {
          immatriculation: '1-ABC-123',
          marque: 'Mercedes-Benz',
          modele: 'Sprinter',
          annee: 2022,
          couleur: 'Blanc',
          nombre_places: 9,
          actif: true
        }
      }),
      prisma.vehicule.create({
        data: {
          immatriculation: '1-DEF-456',
          marque: 'Volkswagen',
          modele: 'Crafter',
          annee: 2021,
          couleur: 'Gris',
          nombre_places: 12,
          actif: true
        }
      }),
      prisma.vehicule.create({
        data: {
          immatriculation: '1-GHI-789',
          marque: 'Ford',
          modele: 'Transit',
          annee: 2023,
          couleur: 'Bleu',
          nombre_places: 8,
          actif: true
        }
      })
    ]);

    console.log(`✅ ${newVehicules.length} véhicules ajoutés`);

    // 4. Ajouter des clients supplémentaires
    console.log('👥 Ajout de clients...');
    const newClients = await Promise.all([
      prisma.client.create({
        data: {
          type_client: 'Entreprise',
          nom: 'Tech Solutions SA',
          telephone: '+3223456789',
          email: 'contact@techsolutions.be',
          adresse: 'Boulevard du Souverain 100',
          ville: 'Bruxelles',
          code_postal: '1170',
          pays: 'Belgique',
          num_tva: 'BE0456789123',
          periode_facturation: 'Mensuelle',
          mode_facturation: 'Détaillée',
          actif: true
        }
      }),
      prisma.client.create({
        data: {
          type_client: 'Particulier',
          nom: 'Johnson',
          prenom: 'Michael',
          telephone: '+32456789017',
          email: 'michael.johnson@email.be',
          adresse: 'Rue Royale 50',
          ville: 'Bruxelles',
          code_postal: '1000',
          pays: 'Belgique',
          periode_facturation: 'Mensuelle',
          mode_facturation: 'Simple',
          actif: true
        }
      }),
      prisma.client.create({
        data: {
          type_client: 'Entreprise',
          nom: 'Logistics Plus',
          telephone: '+3224567890',
          email: 'info@logisticsplus.be',
          adresse: 'Avenue Louise 200',
          ville: 'Bruxelles',
          code_postal: '1050',
          pays: 'Belgique',
          num_tva: 'BE0567891234',
          periode_facturation: 'Hebdomadaire',
          mode_facturation: 'Groupée',
          actif: true
        }
      })
    ]);

    console.log(`✅ ${newClients.length} clients ajoutés`);

    // 5. Créer des feuilles de route
    console.log('📋 Création des feuilles de route...');
    const newFeuillesRoute = await Promise.all([
      prisma.feuille_route.create({
        data: {
          chauffeur_id: newChauffeurs[0].id,
          vehicule_id: newVehicules[0].id,
          date: new Date('2024-01-15'),
          heure_debut: '08:00',
          heure_fin: '18:00',
          index_depart: 50000,
          index_arrivee: 50250,
          km_parcourus: 250,
          statut: 'TERMINEE'
        }
      }),
      prisma.feuille_route.create({
        data: {
          chauffeur_id: newChauffeurs[1].id,
          vehicule_id: newVehicules[1].id,
          date: new Date('2024-01-16'),
          heure_debut: '07:30',
          heure_fin: '17:30',
          index_depart: 45000,
          index_arrivee: 45200,
          km_parcourus: 200,
          statut: 'TERMINEE'
        }
      }),
      prisma.feuille_route.create({
        data: {
          chauffeur_id: newChauffeurs[2].id,
          vehicule_id: newVehicules[2].id,
          date: new Date('2024-01-17'),
          heure_debut: '09:00',
          heure_fin: '19:00',
          index_depart: 55000,
          index_arrivee: 55200,
          km_parcourus: 200,
          statut: 'TERMINEE'
        }
      })
    ]);

    console.log(`✅ ${newFeuillesRoute.length} feuilles de route ajoutées`);

    // 6. Ajouter des courses
    console.log('🚕 Ajout de courses...');
    const newCourses = await Promise.all([
      prisma.course.create({
        data: {
          feuille_route_id: newFeuillesRoute[0].id,
          client_id: newClients[0].id,
          date_heure_depart: new Date('2024-01-15T09:00:00'),
          date_heure_arrivee: new Date('2024-01-15T10:30:00'),
          lieu_depart: 'Bruxelles Centre',
          lieu_arrivee: 'Aéroport de Zaventem',
          index_depart: 50000,
          index_arrivee: 50080,
          distance_km: 15,
          duree_minutes: 90,
          montant_euro: 45.00,
          statut: 'TERMINEE',
          notes: 'Transfert aéroport'
        }
      }),
      prisma.course.create({
        data: {
          feuille_route_id: newFeuillesRoute[0].id,
          client_id: newClients[1].id,
          date_heure_depart: new Date('2024-01-15T11:00:00'),
          date_heure_arrivee: new Date('2024-01-15T12:00:00'),
          lieu_depart: 'Aéroport de Zaventem',
          lieu_arrivee: 'Gare Centrale',
          index_depart: 50080,
          index_arrivee: 50120,
          distance_km: 12,
          duree_minutes: 60,
          montant_euro: 35.00,
          statut: 'TERMINEE',
          notes: 'Retour vers centre-ville'
        }
      }),
      prisma.course.create({
        data: {
          feuille_route_id: newFeuillesRoute[1].id,
          client_id: newClients[2].id,
          date_heure_depart: new Date('2024-01-16T08:00:00'),
          date_heure_arrivee: new Date('2024-01-16T09:30:00'),
          lieu_depart: 'Bruxelles Nord',
          lieu_arrivee: 'Anvers',
          index_depart: 45000,
          index_arrivee: 45150,
          distance_km: 45,
          duree_minutes: 90,
          montant_euro: 85.00,
          statut: 'TERMINEE',
          notes: 'Transport longue distance'
        }
      }),
      prisma.course.create({
        data: {
          feuille_route_id: newFeuillesRoute[2].id,
          client_id: newClients[0].id,
          date_heure_depart: new Date('2024-01-17T10:00:00'),
          date_heure_arrivee: new Date('2024-01-17T11:00:00'),
          lieu_depart: 'Ixelles',
          lieu_arrivee: 'Uccle',
          index_depart: 55000,
          index_arrivee: 55030,
          distance_km: 8,
          duree_minutes: 60,
          montant_euro: 25.00,
          statut: 'TERMINEE',
          notes: 'Course locale'
        }
      })
    ]);

    console.log(`✅ ${newCourses.length} courses ajoutées`);

    // 7. Ajouter des charges
    console.log('💰 Ajout de charges...');
    const newCharges = await Promise.all([
      prisma.charge.create({
        data: {
          feuille_route_id: newFeuillesRoute[0].id,
          type_charge: 'CARBURANT',
          description: 'Essence station Shell',
          montant_euro: 75.50,
          date: new Date('2024-01-15'),
          justificatif: 'ticket-station.pdf'
        }
      }),
      prisma.charge.create({
        data: {
          feuille_route_id: newFeuillesRoute[0].id,
          type_charge: 'PEAGE',
          description: 'Péage autoroute',
          montant_euro: 12.50,
          date: new Date('2024-01-15'),
          justificatif: 'ticket-peage.pdf'
        }
      }),
      prisma.charge.create({
        data: {
          feuille_route_id: newFeuillesRoute[1].id,
          type_charge: 'CARBURANT',
          description: 'Diesel station Total',
          montant_euro: 68.30,
          date: new Date('2024-01-16'),
          justificatif: 'ticket-station-total.pdf'
        }
      }),
      prisma.charge.create({
        data: {
          feuille_route_id: newFeuillesRoute[2].id,
          type_charge: 'CARBURANT',
          description: 'Essence station Esso',
          montant_euro: 45.20,
          date: new Date('2024-01-17'),
          justificatif: 'ticket-station-esso.pdf'
        }
      }),
      prisma.charge.create({
        data: {
          feuille_route_id: newFeuillesRoute[2].id,
          type_charge: 'REPARATION',
          description: 'Changement pneus',
          montant_euro: 120.00,
          date: new Date('2024-01-17'),
          justificatif: 'facture-pneus.pdf'
        }
      })
    ]);

    console.log(`✅ ${newCharges.length} charges ajoutées`);

    // 8. Ajouter des alertes
    console.log('🚨 Ajout d\'alertes...');
    const newAlertes = await Promise.all([
      prisma.alerte.create({
        data: {
          chauffeur_id: newChauffeurs[0].id,
          type_alerte: 'MAINTENANCE',
          titre: 'Révision véhicule due',
          message: 'Le véhicule 1-ABC-123 nécessite une révision',
          priorite: 'MOYENNE',
          statut: 'ACTIVE',
          date_creation: new Date()
        }
      }),
      prisma.alerte.create({
        data: {
          chauffeur_id: newChauffeurs[1].id,
          type_alerte: 'PERMIS',
          titre: 'Permis expire bientôt',
          message: 'Le permis de Jean Leroy expire dans 3 mois',
          priorite: 'HAUTE',
          statut: 'ACTIVE',
          date_creation: new Date()
        }
      }),
      prisma.alerte.create({
        data: {
          type_alerte: 'SYSTEME',
          titre: 'Mise à jour disponible',
          message: 'Une nouvelle version de l\'application est disponible',
          priorite: 'BASSE',
          statut: 'ACTIVE',
          date_creation: new Date()
        }
      })
    ]);

    console.log(`✅ ${newAlertes.length} alertes ajoutées`);

    console.log('🎉 Toutes les données d\'exemple ont été ajoutées avec succès!');
    console.log('\n📊 Résumé des ajouts:');
    console.log(`   👥 Utilisateurs: ${newUsers.length}`);
    console.log(`   🚗 Chauffeurs: ${newChauffeurs.length}`);
    console.log(`   🚙 Véhicules: ${newVehicules.length}`);
    console.log(`   🏢 Clients: ${newClients.length}`);
    console.log(`   📋 Feuilles de route: ${newFeuillesRoute.length}`);
    console.log(`   🚕 Courses: ${newCourses.length}`);
    console.log(`   💰 Charges: ${newCharges.length}`);
    console.log(`   🚨 Alertes: ${newAlertes.length}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
addSampleData()
  .then(() => {
    console.log('✅ Script terminé avec succès');
  })
  .catch((error) => {
    console.error('❌ Erreur dans le script:', error);
  });