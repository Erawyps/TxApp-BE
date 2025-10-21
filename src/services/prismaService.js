import prisma from '../configs/database.config.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Service Prisma unifié pour toutes les opérations de base de données
 * Utilise directement les modèles Prisma au lieu des appels API HTTP
 */

// ==================== GESTION DES UTILISATEURS ====================

export async function getUtilisateurs() {
  try {
    return await prisma.utilisateur.findMany({
      include: {
        chauffeur: {
          include: {
            societe_taxi: true,
            regle_salaire: true,
            feuille_route: {
              include: {
                vehicule: true,
                course: {
                  include: {
                    client: true,
                    mode_paiement: true,
                    detail_facture_complexe: true
                  }
                },
                charge: {
                  include: {
                    vehicule: true,
                    mode_paiement: true
                  }
                }
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
}

export async function getUtilisateurById(userId) {
  try {
    return await prisma.utilisateur.findUnique({
      where: { user_id: parseInt(userId) },
      include: {
        chauffeur: {
          include: {
            societe_taxi: true,
            regle_salaire: true,
            feuille_route: {
              include: {
                vehicule: true,
                course: { // ✅ SINGULIER - le schéma utilise 'course'
                  include: {
                    client: true,
                    mode_paiement: true,
                    detail_facture_complexe: true
                  }
                },
                charge: { // ✅ SINGULIER - le schéma utilise 'charge'
                  include: {
                    vehicule: true,
                    mode_paiement: true
                  }
                }
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
}

export async function createUtilisateur(userData) {
  try {
    // Utiliser une transaction pour créer l'utilisateur et le chauffeur si nécessaire
    return await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur
      const utilisateur = await tx.utilisateur.create({
        data: {
          societe_id: userData.societe_id,
          email: userData.email,
          mot_de_passe_hash: userData.mot_de_passe_hash,
          nom: userData.nom,
          prenom: userData.prenom,
          telephone: userData.telephone,
          role: userData.role
        }
      });

      // Si le rôle est Chauffeur, créer automatiquement l'enregistrement chauffeur
      if (userData.role === 'Chauffeur') {
        await tx.chauffeur.create({
          data: {
            chauffeur_id: utilisateur.user_id, // Le chauffeur_id est le même que user_id
            societe_id: userData.societe_id,
            statut: 'Actif',
            regle_salaire_defaut_id: 2 // Règle par défaut
          }
        });
      }

      // Récupérer l'utilisateur avec ses relations
      return await tx.utilisateur.findUnique({
        where: { user_id: utilisateur.user_id },
        include: {
          chauffeur: {
            include: {
              societe_taxi: true,
              regle_salaire: true
            }
          }
        }
      });
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    throw error;
  }
}

export async function updateUtilisateur(userId, userData) {
  try {
    return await prisma.utilisateur.update({
      where: { user_id: parseInt(userId) },
      data: {
        email: userData.email,
        mot_de_passe_hash: userData.mot_de_passe_hash,
        nom: userData.nom,
        prenom: userData.prenom,
        telephone: userData.telephone,
        role: userData.role
      },
      include: {
        chauffeur: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw error;
  }
}

export async function deleteUtilisateur(userId) {
  try {
    return await prisma.utilisateur.delete({
      where: { user_id: parseInt(userId) }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw error;
  }
}

// ==================== GESTION DES CHAUFFEURS ====================

export async function getChauffeurs() {
  try {
    return await prisma.chauffeur.findMany({
      include: {
        utilisateur: true,
        societe_taxi: true,
        regle_salaire: true,
        feuille_route: {
          include: {
            vehicule: true,
            course: { // ✅ SINGULIER - le schéma utilise 'course'
              include: {
                client: true,
                mode_paiement: true
              }
            },
            charge: { // ✅ SINGULIER - le schéma utilise 'charge'
              include: {
                vehicule: true,
                mode_paiement: true
              }
            },
            taximetre: true // ✅ Ajouter les données taximètre
          }
        },
        charge: {
          include: {
            vehicule: true,
            mode_paiement: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des chauffeurs:', error);
    throw error;
  }
}

export async function getChauffeurById(chauffeurId) {
  try {
    return await prisma.chauffeur.findUnique({
      where: { chauffeur_id: parseInt(chauffeurId) },
      include: {
        utilisateur: true,
        societe_taxi: true,
        regle_salaire: true,
        feuille_route: {
          include: {
            vehicule: true,
            course: {
              include: {
                client: true,
                mode_paiement: true,
                detail_facture_complexe: true
              }
            },
            charge: {
              include: {
                vehicule: true,
                mode_paiement: true
              }
            }
          }
        },
        charge: {
          include: {
            vehicule: true,
            mode_paiement: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du chauffeur:', error);
    throw error;
  }
}

export async function createChauffeur(chauffeurData) {
  try {
    // Créer d'abord l'utilisateur
    const utilisateur = await prisma.utilisateur.create({
      data: {
        societe_id: chauffeurData.societe_id,
        email: chauffeurData.email,
        mot_de_passe_hash: chauffeurData.mot_de_passe_hash,
        nom: chauffeurData.nom,
        prenom: chauffeurData.prenom,
        telephone: chauffeurData.telephone,
        role: 'Driver'
      }
    });

    // Créer le chauffeur lié à l'utilisateur
    const chauffeur = await prisma.chauffeur.create({
      data: {
        chauffeur_id: utilisateur.user_id, // Le chauffeur_id est le même que user_id
        societe_id: chauffeurData.societe_id,
        statut: chauffeurData.statut || 'Actif',
        regle_salaire_defaut_id: chauffeurData.regle_salaire_defaut_id
      },
      include: {
        utilisateur: true,
        societe_taxi: true,
        regle_salaire: true
      }
    });

    return chauffeur;
  } catch (error) {
    console.error('Erreur lors de la création du chauffeur:', error);
    throw error;
  }
}

export async function updateChauffeur(chauffeurId, chauffeurData) {
  try {
    // Mettre à jour le chauffeur
    await prisma.chauffeur.update({
      where: { chauffeur_id: parseInt(chauffeurId) },
      data: {
        statut: chauffeurData.statut,
        regle_salaire_defaut_id: chauffeurData.regle_salaire_defaut_id
      }
    });

    // Mettre à jour l'utilisateur associé si nécessaire
    if (chauffeurData.nom || chauffeurData.prenom || chauffeurData.email || chauffeurData.telephone) {
      await prisma.utilisateur.update({
        where: { user_id: parseInt(chauffeurId) },
        data: {
          nom: chauffeurData.nom,
          prenom: chauffeurData.prenom,
          email: chauffeurData.email,
          telephone: chauffeurData.telephone
        }
      });
    }

    return await getChauffeurById(chauffeurId);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du chauffeur:', error);
    throw error;
  }
}

export async function deleteChauffeur(chauffeurId) {
  try {
    // Supprimer d'abord le chauffeur (cascade vers utilisateur)
    return await prisma.chauffeur.delete({
      where: { chauffeur_id: parseInt(chauffeurId) }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du chauffeur:', error);
    throw error;
  }
}

// ==================== GESTION DES VÉHICULES ====================

export async function getVehicules() {
  try {
    return await prisma.vehicule.findMany({
      include: {
        societe_taxi: true,
        feuille_route: {
          include: {
            chauffeur: {
              include: {
                utilisateur: true
              }
            }
          }
        },
        charge: {
          include: {
            chauffeur: {
              include: {
                utilisateur: true
              }
            },
            mode_paiement: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    throw error;
  }
}

export async function getVehiculeById(vehiculeId) {
  try {
    return await prisma.vehicule.findUnique({
      where: { vehicule_id: parseInt(vehiculeId) },
      include: {
        societe_taxi: true,
        feuille_route: {
          include: {
            chauffeur: {
              include: {
                utilisateur: true
              }
            }
          }
        },
        charge: {
          include: {
            chauffeur: {
              include: {
                utilisateur: true
              }
            },
            mode_paiement: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du véhicule:', error);
    throw error;
  }
}

export async function createVehicule(vehiculeData) {
  try {
    return await prisma.vehicule.create({
      data: {
        societe_id: vehiculeData.societe_id,
        plaque_immatriculation: vehiculeData.plaque_immatriculation,
        num_identification: vehiculeData.num_identification,
        marque: vehiculeData.marque,
        modele: vehiculeData.modele,
        statut: vehiculeData.statut || 'Actif',
        date_mise_circulation: vehiculeData.date_mise_circulation ? new Date(vehiculeData.date_mise_circulation) : null,
        date_fin_service: vehiculeData.date_fin_service ? new Date(vehiculeData.date_fin_service) : null,
        commune_rattachee: vehiculeData.commune_rattachee,
        prix_achat: vehiculeData.prix_achat,
        media_carte_grise: vehiculeData.media_carte_grise
      },
      include: {
        societe_taxi: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du véhicule:', error);
    throw error;
  }
}

export async function updateVehicule(vehiculeId, vehiculeData) {
  try {
    return await prisma.vehicule.update({
      where: { vehicule_id: parseInt(vehiculeId) },
      data: {
        plaque_immatriculation: vehiculeData.plaque_immatriculation,
        num_identification: vehiculeData.num_identification,
        marque: vehiculeData.marque,
        modele: vehiculeData.modele,
        statut: vehiculeData.statut,
        date_mise_circulation: vehiculeData.date_mise_circulation ? new Date(vehiculeData.date_mise_circulation) : null,
        date_fin_service: vehiculeData.date_fin_service ? new Date(vehiculeData.date_fin_service) : null,
        commune_rattachee: vehiculeData.commune_rattachee,
        prix_achat: vehiculeData.prix_achat,
        media_carte_grise: vehiculeData.media_carte_grise
      },
      include: {
        societe_taxi: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du véhicule:', error);
    throw error;
  }
}

export async function deleteVehicule(vehiculeId) {
  try {
    return await prisma.vehicule.delete({
      where: { vehicule_id: parseInt(vehiculeId) }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du véhicule:', error);
    throw error;
  }
}

// ==================== GESTION DES CLIENTS ====================

export async function getClients() {
  try {
    return await prisma.client.findMany({
      include: {
        societe_taxi: true,
        regle_facturation: true,
        course: {
          include: {
            feuille_route: {
              include: {
                chauffeur: {
                  include: {
                    utilisateur: true
                  }
                },
                vehicule: true
              }
            },
            mode_paiement: true,
            detail_facture_complexe: true
          }
        },
        gestion_facture: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    throw error;
  }
}

export async function getClientById(clientId) {
  try {
    return await prisma.client.findUnique({
      where: { client_id: parseInt(clientId) },
      include: {
        societe_taxi: true,
        regle_facturation: true,
        course: {
          include: {
            feuille_route: {
              include: {
                chauffeur: {
                  include: {
                    utilisateur: true
                  }
                },
                vehicule: true
              }
            },
            mode_paiement: true,
            detail_facture_complexe: true
          }
        },
        gestion_facture: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    throw error;
  }
}

export async function createClient(clientData) {
  try {
    return await prisma.client.create({
      data: {
        societe_id: clientData.societe_id,
        nom_societe: clientData.nom_societe,
        num_tva: clientData.num_tva,
        adresse: clientData.adresse,
        telephone: clientData.telephone,
        email: clientData.email,
        regle_facturation_id: clientData.regle_facturation_id,
        est_actif: clientData.est_actif !== undefined ? clientData.est_actif : true
      },
      include: {
        societe_taxi: true,
        regle_facturation: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    throw error;
  }
}

export async function updateClient(clientId, clientData) {
  try {
    return await prisma.client.update({
      where: { client_id: parseInt(clientId) },
      data: {
        nom_societe: clientData.nom_societe,
        num_tva: clientData.num_tva,
        adresse: clientData.adresse,
        telephone: clientData.telephone,
        email: clientData.email,
        regle_facturation_id: clientData.regle_facturation_id,
        est_actif: clientData.est_actif
      },
      include: {
        societe_taxi: true,
        regle_facturation: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    throw error;
  }
}

export async function deleteClient(clientId) {
  try {
    return await prisma.client.delete({
      where: { client_id: parseInt(clientId) }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    throw error;
  }
}

// ==================== GESTION DES FEUILLES DE ROUTE ====================

export async function getFeuillesRoute() {
  try {
    return await prisma.feuille_route.findMany({
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        },
        vehicule: true,
        course: {
          include: {
            client: true,
            mode_paiement: true,
            detail_facture_complexe: true
          },
          orderBy: {
            num_ordre: 'asc'
          }
        },
        charge: {
          include: {
            vehicule: true,
            mode_paiement: true
          }
        },
        taximetre: true,
        utilisateur: true
      },
      orderBy: {
        date_service: 'desc'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des feuilles de route:', error);
    throw error;
  }
}

export async function getFeuilleRouteById(feuilleId) {
  try {
    return await prisma.feuille_route.findUnique({
      where: { feuille_id: parseInt(feuilleId) },
      include: {
        chauffeur: {
          include: {
            utilisateur: true,
            societe_taxi: true // ✅ Ajouter pour nom_exploitant
          }
        },
        vehicule: {
          include: {
            societe_taxi: true // ✅ Ajouter pour nom_exploitant du véhicule
          }
        },
        course: { // ✅ SINGULIER - le schéma Prisma utilise 'course' pas 'courses'
          include: {
            client: true,
            mode_paiement: true,
            detail_facture_complexe: true
          },
          orderBy: {
            num_ordre: 'asc'
          }
        },
        charge: { // ✅ SINGULIER - le schéma Prisma utilise 'charge' pas 'charges'
          include: {
            vehicule: true,
            mode_paiement: true
          }
        },
        taximetre: true // ✅ Ajouter les données taximètre
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la feuille de route:', error);
    throw error;
  }
}

export async function getFeuillesRouteByChauffeur(chauffeurId, date = null) {
  try {
    const where = {
      chauffeur_id: parseInt(chauffeurId)
    };

    if (date) {
      where.date_service = new Date(date);
    }

    return await prisma.feuille_route.findMany({
      where,
      include: {
        chauffeur: {
          include: {
            utilisateur: true,
            societe_taxi: true // ✅ Ajouter pour nom_exploitant
          }
        },
        vehicule: {
          include: {
            societe_taxi: true // ✅ Ajouter pour nom_exploitant du véhicule
          }
        },
        course: { // ✅ SINGULIER - le schéma Prisma utilise 'course' pas 'courses'
          include: {
            client: true,
            mode_paiement: true,
            detail_facture_complexe: true
          },
          orderBy: {
            num_ordre: 'asc'
          }
        },
        charge: { // ✅ SINGULIER - le schéma Prisma utilise 'charge' pas 'charges'
          include: {
            vehicule: true,
            mode_paiement: true
          }
        },
        taximetre: true // ✅ Inclure les données taximètre
      },
      orderBy: {
        date_service: 'desc'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des feuilles de route du chauffeur:', error);
    throw error;
  }
}

export async function createFeuilleRouteSimple(feuilleData) {
  try {
    // Validation des données requises
    if (!feuilleData.chauffeur_id) {
      throw new Error('chauffeur_id est requis pour créer une feuille de route');
    }
    if (!feuilleData.vehicule_id) {
      throw new Error('vehicule_id est requis pour créer une feuille de route');
    }
    if (!feuilleData.date_service) {
      throw new Error('date_service est requis pour créer une feuille de route');
    }

    const feuilleRouteData = {
      chauffeur_id: feuilleData.chauffeur_id,
      vehicule_id: feuilleData.vehicule_id,
      date_service: new Date(feuilleData.date_service),
      mode_encodage: feuilleData.mode_encodage || 'LIVE',
      heure_debut: feuilleData.heure_debut ? new Date(`1970-01-01T${feuilleData.heure_debut}:00`) : null,
      heure_fin: feuilleData.heure_fin ? new Date(`1970-01-01T${feuilleData.heure_fin}:00`) : null,
      interruptions: feuilleData.interruptions,
      index_km_debut_tdb: feuilleData.index_km_debut_tdb,
      index_km_fin_tdb: feuilleData.index_km_fin_tdb,
      km_tableau_bord_debut: feuilleData.km_tableau_bord_debut,
      km_tableau_bord_fin: feuilleData.km_tableau_bord_fin,
      montant_salaire_cash_declare: feuilleData.montant_salaire_cash_declare || 0,
      // ✅ Autres champs optionnels
      signature_chauffeur: feuilleData.signature_chauffeur || null,
      // ✅ Créer TOUJOURS la relation taximètre lors de la création d'une feuille
      // Les valeurs peuvent être nulles et seront mises à jour plus tard
      taximetre: {
        create: {
          taximetre_prise_charge_debut: feuilleData.taximetre_prise_charge_debut || null,
          taximetre_index_km_debut: feuilleData.taximetre_index_km_debut || null,
          taximetre_km_charge_debut: feuilleData.taximetre_km_charge_debut || null,
          taximetre_chutes_debut: feuilleData.taximetre_chutes_debut || null,
          // Les champs de fin seront mis à jour lors de la validation
          taximetre_prise_charge_fin: feuilleData.taximetre_prise_charge_fin || null,
          taximetre_index_km_fin: feuilleData.taximetre_index_km_fin || null,
          taximetre_km_charge_fin: feuilleData.taximetre_km_charge_fin || null,
          taximetre_chutes_fin: feuilleData.taximetre_chutes_fin || null
        }
      }
    };

    console.log('🔧 createFeuilleRouteSimple - Données à créer:', feuilleRouteData);

    return await prisma.feuille_route.create({
      data: feuilleRouteData,
      include: {
        chauffeur: {
          include: {
            utilisateur: true,
            societe_taxi: true
          }
        },
        vehicule: {
          include: {
            societe_taxi: true
          }
        },
        taximetre: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la feuille de route:', error);
    throw error;
  }
}

export async function validateFeuilleRouteData(feuilleId, feuilleData) {
  // Récupérer la feuille existante pour les validations
  const existingFeuille = await prisma.feuille_route.findUnique({
    where: { feuille_id: parseInt(feuilleId) },
    include: {
      course: true
    }
  });

  if (!existingFeuille) {
    throw new Error('Feuille de route non trouvée');
  }

  // Validation des horaires
  if (feuilleData.heure_debut && feuilleData.heure_fin) {
    const heureDebut = new Date(`1970-01-01T${feuilleData.heure_debut}:00`);
    const heureFin = new Date(`1970-01-01T${feuilleData.heure_fin}:00`);

    if (heureFin <= heureDebut) {
      throw new Error('L\'heure de fin doit être postérieure à l\'heure de début');
    }
  }

  // Validation des kilométrages
  if (feuilleData.index_km_fin_tdb !== undefined && feuilleData.index_km_fin_tdb !== null) {
    if (feuilleData.index_km_fin_tdb < 0) {
      throw new Error('Le kilométrage de fin ne peut pas être négatif');
    }

    if (existingFeuille.index_km_debut_tdb && feuilleData.index_km_fin_tdb < existingFeuille.index_km_debut_tdb) {
      throw new Error('Le kilométrage de fin doit être supérieur ou égal au kilométrage de début');
    }

    // Vérifier que le km fin >= dernier index de course
    const lastCourseIndex = Math.max(...existingFeuille.course.map(c => c.index_debarquement || 0), 0);
    if (lastCourseIndex > 0 && feuilleData.index_km_fin_tdb < lastCourseIndex) {
      throw new Error(`Le kilométrage de fin doit être au moins égal au dernier index de course (${lastCourseIndex})`);
    }
  }

  if (feuilleData.index_km_debut_tdb !== undefined && feuilleData.index_km_debut_tdb !== null) {
    if (feuilleData.index_km_debut_tdb < 0) {
      throw new Error('Le kilométrage de début ne peut pas être négatif');
    }
  }

  // Validation des courses terminées
  const coursesNonTerminees = existingFeuille.course.filter(c =>
    c.heure_embarquement && !c.heure_debarquement && parseFloat(c.sommes_percues || 0) > 0
  );

  if (coursesNonTerminees.length > 0 && feuilleData.heure_fin) {
    throw new Error('Toutes les courses doivent être terminées avant de finaliser la feuille de route');
  }

  // Validation du mode d'encodage
  if (feuilleData.mode_encodage && !['LIVE', 'ULTERIEUR'].includes(feuilleData.mode_encodage)) {
    throw new Error('Le mode d\'encodage doit être LIVE ou ULTERIEUR');
  }

  // Validation du montant salaire
  if (feuilleData.montant_salaire_cash_declare !== undefined &&
      feuilleData.montant_salaire_cash_declare !== null &&
      feuilleData.montant_salaire_cash_declare < 0) {
    throw new Error('Le montant du salaire déclaré ne peut pas être négatif');
  }
}

export async function updateFeuilleRoute(feuilleId, feuilleData) {
  try {
    // Validation des données
    await validateFeuilleRouteData(feuilleId, feuilleData);

    const updateData = {
      vehicule_id: feuilleData.vehicule_id,
      mode_encodage: feuilleData.mode_encodage,
      heure_debut: feuilleData.heure_debut ? new Date(`1970-01-01T${feuilleData.heure_debut}:00`) : null,
      heure_fin: feuilleData.heure_fin ? new Date(`1970-01-01T${feuilleData.heure_fin}:00`) : null,
      interruptions: feuilleData.interruptions,
      index_km_debut_tdb: feuilleData.index_km_debut_tdb,
      index_km_fin_tdb: feuilleData.index_km_fin_tdb,
      km_tableau_bord_debut: feuilleData.km_tableau_bord_debut,
      km_tableau_bord_fin: feuilleData.km_tableau_bord_fin,
      date_validation: feuilleData.date_validation ? new Date(feuilleData.date_validation) : null,
      validated_by: feuilleData.validated_by,
      montant_salaire_cash_declare: feuilleData.montant_salaire_cash_declare,
      // ✅ Autres champs optionnels
      signature_chauffeur: feuilleData.signature_chauffeur !== undefined ? feuilleData.signature_chauffeur : undefined,
      // ✅ Mise à jour de la relation taximètre
      taximetre: {
        upsert: {
          create: {
            taximetre_prise_charge_debut: feuilleData.taximetre_prise_charge_debut || null,
            taximetre_index_km_debut: feuilleData.taximetre_index_km_debut || null,
            taximetre_km_charge_debut: feuilleData.taximetre_km_charge_debut || null,
            taximetre_chutes_debut: feuilleData.taximetre_chutes_debut || null,
            taximetre_prise_charge_fin: feuilleData.taximetre_prise_charge_fin || null,
            taximetre_index_km_fin: feuilleData.taximetre_index_km_fin || null,
            taximetre_km_charge_fin: feuilleData.taximetre_km_charge_fin || null,
            taximetre_chutes_fin: feuilleData.taximetre_chutes_fin || null
          },
          update: {
            taximetre_prise_charge_debut: feuilleData.taximetre_prise_charge_debut !== undefined ? feuilleData.taximetre_prise_charge_debut : undefined,
            taximetre_index_km_debut: feuilleData.taximetre_index_km_debut !== undefined ? feuilleData.taximetre_index_km_debut : undefined,
            taximetre_km_charge_debut: feuilleData.taximetre_km_charge_debut !== undefined ? feuilleData.taximetre_km_charge_debut : undefined,
            taximetre_chutes_debut: feuilleData.taximetre_chutes_debut !== undefined ? feuilleData.taximetre_chutes_debut : undefined,
            taximetre_prise_charge_fin: feuilleData.taximetre_prise_charge_fin !== undefined ? feuilleData.taximetre_prise_charge_fin : undefined,
            taximetre_index_km_fin: feuilleData.taximetre_index_km_fin !== undefined ? feuilleData.taximetre_index_km_fin : undefined,
            taximetre_km_charge_fin: feuilleData.taximetre_km_charge_fin !== undefined ? feuilleData.taximetre_km_charge_fin : undefined,
            taximetre_chutes_fin: feuilleData.taximetre_chutes_fin !== undefined ? feuilleData.taximetre_chutes_fin : undefined
          }
        }
      }
    };

    // Nettoyer les champs undefined pour éviter les erreurs Prisma
    // Note: On ne nettoie pas les champs de taximetre car ils sont dans un objet nested
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined && key !== 'taximetre') {
        delete updateData[key];
      }
    });

    console.log('🔧 updateFeuilleRoute - Données à mettre à jour:', updateData);

    return await prisma.feuille_route.update({
      where: { feuille_id: parseInt(feuilleId) },
      data: updateData,
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        },
        vehicule: true,
        taximetre: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la feuille de route:', error);
    throw error;
  }
}

export async function deleteFeuilleRoute(feuilleId) {
  try {
    return await prisma.feuille_route.delete({
      where: { feuille_id: parseInt(feuilleId) }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la feuille de route:', error);
    throw error;
  }
}

export async function createVehicleChangeNotification(chauffeur, oldVehicle, newVehicle, shiftDate, shiftTime) {
  try {
    const notificationMessage = `🚗 CHANGEMENT DE VÉHICULE - Nouveau shift\n` +
      `Chauffeur: ${chauffeur.utilisateur.prenom} ${chauffeur.utilisateur.nom}\n` +
      `Ancien véhicule: ${oldVehicle ? oldVehicle.plaque_immatriculation : 'N/A'}\n` +
      `Nouveau véhicule: ${newVehicle ? newVehicle.plaque_immatriculation : 'N/A'}\n` +
      `Date: ${shiftDate} à ${shiftTime}`;

    console.log('NOTIFICATION ADMIN VEHICLE CHANGE:', notificationMessage);

    // TODO: Implémenter la persistance en base ou envoi d'email/webhook
    // Pour l'instant, on retourne le message pour utilisation dans l'interface

    return {
      message: notificationMessage,
      type: 'VEHICLE_CHANGE',
      severity: 'WARNING',
      timestamp: new Date().toISOString(),
      data: {
        chauffeur_id: chauffeur.chauffeur_id,
        old_vehicle_id: oldVehicle?.vehicule_id,
        new_vehicle_id: newVehicle?.vehicule_id,
        shift_date: shiftDate,
        shift_time: shiftTime
      }
    };
  } catch (error) {
    console.error('Erreur lors de la création de la notification de changement de véhicule:', error);
    throw error;
  }
}

export async function changeVehicleInShift(feuilleId, newVehiculeId, chauffeurId) {
  try {
    // Vérifier que la feuille de route existe et appartient au chauffeur
    const existingFeuille = await prisma.feuille_route.findUnique({
      where: { feuille_id: parseInt(feuilleId) },
      include: {
        vehicule: true,
        chauffeur: {
          include: {
            utilisateur: true
          }
        }
      }
    });

    if (!existingFeuille) {
      throw new Error('Feuille de route non trouvée');
    }

    if (existingFeuille.chauffeur_id !== parseInt(chauffeurId)) {
      throw new Error('Accès non autorisé à cette feuille de route');
    }

    // Vérifier que le nouveau véhicule existe et est actif
    const newVehicule = await prisma.vehicule.findUnique({
      where: { vehicule_id: parseInt(newVehiculeId) }
    });

    if (!newVehicule) {
      throw new Error('Véhicule non trouvé');
    }

    if (!newVehicule.est_actif) {
      throw new Error('Le véhicule sélectionné n\'est pas actif');
    }

    // Vérifier qu'il n'y a pas déjà une feuille de route active avec ce véhicule pour ce chauffeur aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const conflictingFeuille = await prisma.feuille_route.findFirst({
      where: {
        chauffeur_id: parseInt(chauffeurId),
        vehicule_id: parseInt(newVehiculeId),
        date_service: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        },
        est_validee: false // Shift non terminé
      }
    });

    if (conflictingFeuille && conflictingFeuille.feuille_id !== parseInt(feuilleId)) {
      throw new Error('Ce véhicule est déjà utilisé dans une autre feuille de route active aujourd\'hui');
    }

    // Créer une notification pour l'admin
    const notificationMessage = `Changement de véhicule - Chauffeur: ${existingFeuille.chauffeur.utilisateur.prenom} ${existingFeuille.chauffeur.utilisateur.nom}, Ancien véhicule: ${existingFeuille.vehicule.plaque_immatriculation}, Nouveau véhicule: ${newVehicule.plaque_immatriculation}`;

    // TODO: Implémenter le système de notifications
    console.log('NOTIFICATION ADMIN:', notificationMessage);

    // Mettre à jour la feuille de route avec le nouveau véhicule
    const updatedFeuille = await prisma.feuille_route.update({
      where: { feuille_id: parseInt(feuilleId) },
      data: {
        vehicule_id: parseInt(newVehiculeId)
      },
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        },
        vehicule: true,
        course: {
          include: {
            client: true,
            mode_paiement: true,
            detail_facture_complexe: true
          },
          orderBy: {
            num_ordre: 'asc'
          }
        },
        charge: {
          include: {
            vehicule: true,
            mode_paiement: true
          }
        }
      }
    });

    return {
      success: true,
      data: updatedFeuille,
      notification: notificationMessage
    };

  } catch (error) {
    console.error('Erreur lors du changement de véhicule:', error);
    throw error;
  }
}

// ==================== GESTION DES COURSES ====================

export async function getCourses() {
  try {
    return await prisma.course.findMany({
      include: {
        feuille_route: {
          include: {
            chauffeur: {
              include: {
                utilisateur: true
              }
            },
            vehicule: true
          }
        },
        client: true,
        mode_paiement: true,
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
  } catch (error) {
    console.error('Erreur lors de la récupération des courses:', error);
    throw error;
  }
}

export async function getCoursesByFeuille(feuilleId) {
  try {
    return await prisma.course.findMany({
      where: { feuille_id: parseInt(feuilleId) },
      include: {
        client: true,
        mode_paiement: true,
        detail_facture_complexe: true
      },
      orderBy: {
        num_ordre: 'asc'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des courses de la feuille:', error);
    throw error;
  }
}

export async function createCourse(courseData) {
  try {
    return await prisma.course.create({
      data: {
        feuille_id: courseData.feuille_id,
        num_ordre: courseData.num_ordre,
        index_depart: courseData.index_depart,
        index_embarquement: courseData.index_embarquement,
        lieu_embarquement: courseData.lieu_embarquement,
        heure_embarquement: courseData.heure_embarquement ? new Date(courseData.heure_embarquement) : null,
        index_debarquement: courseData.index_debarquement,
        lieu_debarquement: courseData.lieu_debarquement,
        heure_debarquement: courseData.heure_debarquement ? new Date(courseData.heure_debarquement) : null,
        prix_taximetre: courseData.prix_taximetre,
        sommes_percues: courseData.sommes_percues,
        mode_paiement_id: courseData.mode_paiement_id,
        client_id: courseData.client_id,
        est_hors_heures: courseData.est_hors_heures || false
      },
      include: {
        client: true,
        mode_paiement: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la course:', error);
    throw error;
  }
}

export async function updateCourse(courseId, courseData) {
  try {
    return await prisma.course.update({
      where: { course_id: parseInt(courseId) },
      data: {
        num_ordre: courseData.num_ordre,
        index_depart: courseData.index_depart,
        index_embarquement: courseData.index_embarquement,
        lieu_embarquement: courseData.lieu_embarquement,
        heure_embarquement: courseData.heure_embarquement ? new Date(courseData.heure_embarquement) : null,
        index_debarquement: courseData.index_debarquement,
        lieu_debarquement: courseData.lieu_debarquement,
        heure_debarquement: courseData.heure_debarquement ? new Date(courseData.heure_debarquement) : null,
        prix_taximetre: courseData.prix_taximetre,
        sommes_percues: courseData.sommes_percues,
        mode_paiement_id: courseData.mode_paiement_id,
        client_id: courseData.client_id,
        est_hors_heures: courseData.est_hors_heures
      },
      include: {
        client: true,
        mode_paiement: true,
        detail_facture_complexe: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la course:', error);
    throw error;
  }
}

export async function deleteCourse(courseId) {
  try {
    return await prisma.course.delete({
      where: { course_id: parseInt(courseId) }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la course:', error);
    throw error;
  }
}

// ==================== GESTION DES CHARGES ====================

export async function getCharges() {
  try {
    return await prisma.charge.findMany({
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        },
        vehicule: true,
        feuille_route: {
          include: {
            chauffeur: {
              include: {
                utilisateur: true
              }
            },
            vehicule: true
          }
        },
        mode_paiement: true
      },
      orderBy: {
        date_charge: 'desc'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des charges:', error);
    throw error;
  }
}

export async function getChargesByFeuille(feuilleId) {
  try {
    return await prisma.charge.findMany({
      where: { feuille_id: parseInt(feuilleId) },
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        },
        vehicule: true,
        mode_paiement: true
      },
      orderBy: {
        date_charge: 'desc'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des charges de la feuille:', error);
    throw error;
  }
}

export async function createCharge(chargeData) {
  try {
    return await prisma.charge.create({
      data: {
        feuille_id: chargeData.feuille_id,
        chauffeur_id: chargeData.chauffeur_id,
        vehicule_id: chargeData.vehicule_id,
        description: chargeData.description,
        montant: chargeData.montant,
        mode_paiement_charge: chargeData.mode_paiement_id,
        date_charge: chargeData.date_charge ? new Date(chargeData.date_charge) : new Date()
      },
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        },
        vehicule: true,
        mode_paiement: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la charge:', error);
    throw error;
  }
}

export async function updateCharge(chargeId, chargeData) {
  try {
    return await prisma.charge.update({
      where: { charge_id: parseInt(chargeId) },
      data: {
        description: chargeData.description,
        montant: chargeData.montant,
        mode_paiement_charge: chargeData.mode_paiement_id,
        date_charge: chargeData.date_charge ? new Date(chargeData.date_charge) : undefined
      },
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        },
        vehicule: true,
        mode_paiement: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la charge:', error);
    throw error;
  }
}

export async function deleteCharge(chargeId) {
  try {
    return await prisma.charge.delete({
      where: { charge_id: parseInt(chargeId) }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la charge:', error);
    throw error;
  }
}

// ==================== GESTION DES MODES DE PAIEMENT ====================

export async function getModesPaiement() {
  try {
    return await prisma.mode_paiement.findMany({
      include: {
        _count: {
          select: {
            course: true,
            charge: true,
            gestion_facture: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des modes de paiement:', error);
    throw error;
  }
}

export async function createModePaiement(modeData) {
  try {
    return await prisma.mode_paiement.create({
      data: {
        libelle: modeData.libelle,
        type: modeData.type
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du mode de paiement:', error);
    throw error;
  }
}

// ==================== GESTION DES RÈGLES DE SALAIRE ====================

export async function getReglesSalaire() {
  try {
    return await prisma.regle_salaire.findMany({
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des règles de salaire:', error);
    throw error;
  }
}

export async function createRegleSalaire(regleData) {
  try {
    return await prisma.regle_salaire.create({
      data: {
        nom_regle: regleData.nom_regle,
        description: regleData.description,
        est_fixe: regleData.est_fixe || false,
        taux_fixe_heure: regleData.taux_fixe_heure,
        est_variable: regleData.est_variable || true,
        seuil_recette: regleData.seuil_recette,
        pourcentage_base: regleData.pourcentage_base,
        pourcentage_au_dela: regleData.pourcentage_au_dela
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la règle de salaire:', error);
    throw error;
  }
}

// ==================== GESTION DES RÈGLES DE FACTURATION ====================

export async function getReglesFacturation() {
  try {
    return await prisma.regle_facturation.findMany({
      include: {
        client: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des règles de facturation:', error);
    throw error;
  }
}

export async function createRegleFacturation(regleData) {
  try {
    return await prisma.regle_facturation.create({
      data: {
        nom: regleData.nom,
        description_format: regleData.description_format
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la règle de facturation:', error);
    throw error;
  }
}

// ==================== GESTION DES PARTENAIRES ====================

export async function getPartenaires() {
  try {
    return await prisma.partenaire.findMany({
      include: {
        societe_taxi: true,
        liaison_partenaire: {
          include: {
            societe_taxi: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des partenaires:', error);
    throw error;
  }
}

export async function createPartenaire(partenaireData) {
  try {
    return await prisma.partenaire.create({
      data: {
        societe_id: partenaireData.societe_id,
        nom_societe: partenaireData.nom_societe,
        nom_prenom_representant: partenaireData.nom_prenom_representant,
        num_tva: partenaireData.num_tva
      },
      include: {
        societe_taxi: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du partenaire:', error);
    throw error;
  }
}

// ==================== GESTION DES FACTURES ====================

export async function getGestionFactures() {
  try {
    return await prisma.gestion_facture.findMany({
      include: {
        client: {
          include: {
            societe_taxi: true
          }
        },
        mode_paiement: true
      },
      orderBy: {
        date_emission: 'desc'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    // Return empty array if table doesn't exist yet
    if (error.code === 'PGRST116' || error.message.includes('gestion_facture')) {
      return [];
    }
    throw error;
  }
}

export async function getGestionFactureById(factureId) {
  try {
    return await prisma.gestion_facture.findUnique({
      where: { facture_id: parseInt(factureId) },
      include: {
        client: {
          include: {
            societe_taxi: true
          }
        },
        mode_paiement: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la facture:', error);
    // Return null if table doesn't exist yet
    if (error.code === 'PGRST116' || error.message.includes('gestion_facture')) {
      return null;
    }
    throw error;
  }
}

export async function createGestionFacture(factureData) {
  try {
    return await prisma.gestion_facture.create({
      data: {
        client_id: factureData.client_id,
        numero_facture: factureData.numero_facture,
        date_emission: new Date(factureData.date_emission),
        date_echeance: factureData.date_echeance ? new Date(factureData.date_echeance) : null,
        montant_total: factureData.montant_total,
        montant_tva: factureData.montant_tva || 0,
        est_payee: factureData.est_payee || false,
        date_paiement: factureData.date_paiement ? new Date(factureData.date_paiement) : null,
        mode_paiement_id: factureData.mode_paiement_id,
        notes: factureData.notes
      },
      include: {
        client: {
          include: {
            societe_taxi: true
          }
        },
        mode_paiement: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    // Throw error if table doesn't exist yet
    if (error.code === 'PGRST116' || error.message.includes('gestion_facture')) {
      throw new Error('Table gestion_facture n\'existe pas encore');
    }
    throw error;
  }
}

export async function updateGestionFacture(factureId, factureData) {
  try {
    return await prisma.gestion_facture.update({
      where: { facture_id: parseInt(factureId) },
      data: {
        numero_facture: factureData.numero_facture,
        date_emission: new Date(factureData.date_emission),
        date_echeance: factureData.date_echeance ? new Date(factureData.date_echeance) : null,
        montant_total: factureData.montant_total,
        montant_tva: factureData.montant_tva || 0,
        est_payee: factureData.est_payee || false,
        date_paiement: factureData.date_paiement ? new Date(factureData.date_paiement) : null,
        mode_paiement_id: factureData.mode_paiement_id,
        notes: factureData.notes
      },
      include: {
        client: {
          include: {
            societe_taxi: true
          }
        },
        mode_paiement: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error);
    // Throw error if table doesn't exist yet
    if (error.code === 'PGRST116' || error.message.includes('gestion_facture')) {
      throw new Error('Table gestion_facture n\'existe pas encore');
    }
    throw error;
  }
}

export async function deleteGestionFacture(factureId) {
  try {
    return await prisma.gestion_facture.delete({
      where: { facture_id: parseInt(factureId) }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la facture:', error);
    // Throw error if table doesn't exist yet
    if (error.code === 'PGRST116' || error.message.includes('gestion_facture')) {
      throw new Error('Table gestion_facture n\'existe pas encore');
    }
    throw error;
  }
}

// ==================== GESTION DES SOCIÉTÉS TAXI ====================

export async function getSocietesTaxi() {
  try {
    return await prisma.societe_taxi.findMany({
      include: {
        utilisateurs: true,
        chauffeurs: {
          include: {
            utilisateur: true
          }
        },
        clients: true,
        vehicules: true,
        partenaires: true,
        societe_emettrice: true,
        partenaires_lies: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sociétés taxi:', error);
    throw error;
  }
}

export async function getCurrentSocieteTaxi() {
  try {
    // For now, return the first societe_taxi as "current"
    // This can be modified later to use a specific logic for determining the current one
    const societes = await prisma.societe_taxi.findMany({
      include: {
        chauffeur: true,
        client: true,
        vehicule: true,
        partenaire: true
      },
      take: 1
    });
    return societes.length > 0 ? societes[0] : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la société taxi actuelle:', error);
    throw error;
  }
}

export async function getSocieteTaxiById(id) {
  try {
    return await prisma.societe_taxi.findUnique({
      where: { societe_id: parseInt(id) },
      include: {
        utilisateur: true,
        chauffeur: {
          include: {
            utilisateur: true
          }
        },
        client: true,
        vehicule: true,
        partenaire: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la société taxi par ID:', error);
    throw error;
  }
}

// ==================== REQUÊTES SPÉCIFIQUES ====================

export async function findChauffeurByDate(date) {
  try {
    const dateObj = new Date(date);
    return await prisma.feuille_route.findMany({
      where: {
        date_service: dateObj
      },
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        },
        vehicule: true,
        course: { // ✅ SINGULIER - le schéma utilise 'course'
          include: {
            client: true,
            mode_paiement: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la recherche par date:', error);
    throw error;
  }
}

export async function findVehiculeByChauffeurAndDate(chauffeurId, date) {
  try {
    const dateObj = new Date(date);
    return await prisma.feuille_route.findMany({
      where: {
        chauffeur_id: parseInt(chauffeurId),
        date_service: dateObj
      },
      include: {
        vehicule: true,
        course: { // ✅ SINGULIER - le schéma utilise 'course'
          include: {
            client: true,
            mode_paiement: true
          }
        },
        charge: { // ✅ SINGULIER - le schéma utilise 'charge'
          include: {
            mode_paiement: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la recherche véhicule par chauffeur et date:', error);
    throw error;
  }
}

// ==================== ENCODAGE FEUILLE DE ROUTE ADMIN ====================

export async function encodeFeuilleRouteAdmin(feuilleData) {
  try {
    // Créer ou mettre à jour la feuille de route
    const feuille = await prisma.feuille_route.upsert({
      where: {
        chauffeur_id_date_service: {
          chauffeur_id: feuilleData.chauffeur_id,
          date_service: new Date(feuilleData.date_service)
        }
      },
      update: {
        vehicule_id: feuilleData.vehicule_id,
        mode_encodage: 'ADMIN',
        heure_debut: feuilleData.heure_debut ? new Date(feuilleData.heure_debut) : null,
        heure_fin: feuilleData.heure_fin ? new Date(feuilleData.heure_fin) : null,
        index_km_debut_tdb: feuilleData.index_km_debut_tdb,
        index_km_fin_tdb: feuilleData.index_km_fin_tdb,
        total_km_tdb: feuilleData.total_km_tdb,
        montant_salaire_cash_declare: feuilleData.montant_salaire_cash_declare || 0
      },
      create: {
        chauffeur_id: feuilleData.chauffeur_id,
        vehicule_id: feuilleData.vehicule_id,
        date_service: new Date(feuilleData.date_service),
        mode_encodage: 'ADMIN',
        heure_debut: feuilleData.heure_debut ? new Date(feuilleData.heure_debut) : null,
        heure_fin: feuilleData.heure_fin ? new Date(feuilleData.heure_fin) : null,
        index_km_debut_tdb: feuilleData.index_km_debut_tdb,
        index_km_fin_tdb: feuilleData.index_km_fin_tdb,
        total_km_tdb: feuilleData.total_km_tdb,
        montant_salaire_cash_declare: feuilleData.montant_salaire_cash_declare || 0
      },
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        },
        vehicule: true
      }
    });

    // Traiter les courses
    if (feuilleData.courses && feuilleData.courses.length > 0) {
      for (const courseData of feuilleData.courses) {
        await prisma.course.upsert({
          where: {
            feuille_id_num_ordre: {
              feuille_id: feuille.feuille_id,
              num_ordre: courseData.num_ordre
            }
          },
          update: {
            index_depart: courseData.index_depart,
            index_embarquement: courseData.index_embarquement,
            lieu_embarquement: courseData.lieu_embarquement,
            heure_embarquement: courseData.heure_embarquement ? new Date(courseData.heure_embarquement) : null,
            index_debarquement: courseData.index_debarquement,
            lieu_debarquement: courseData.lieu_debarquement,
            heure_debarquement: courseData.heure_debarquement ? new Date(courseData.heure_debarquement) : null,
            prix_taximetre: courseData.prix_taximetre,
            sommes_percues: courseData.sommes_percues,
            mode_paiement_id: courseData.mode_paiement_id,
            client_id: courseData.client_id,
            est_hors_heures: courseData.est_hors_heures || false
          },
          create: {
            feuille_id: feuille.feuille_id,
            num_ordre: courseData.num_ordre,
            index_depart: courseData.index_depart,
            index_embarquement: courseData.index_embarquement,
            lieu_embarquement: courseData.lieu_embarquement,
            heure_embarquement: courseData.heure_embarquement ? new Date(courseData.heure_embarquement) : null,
            index_debarquement: courseData.index_debarquement,
            lieu_debarquement: courseData.lieu_debarquement,
            heure_debarquement: courseData.heure_debarquement ? new Date(courseData.heure_debarquement) : null,
            prix_taximetre: courseData.prix_taximetre,
            sommes_percues: courseData.sommes_percues,
            mode_paiement_id: courseData.mode_paiement_id,
            client_id: courseData.client_id,
            est_hors_heures: courseData.est_hors_heures || false
          }
        });
      }
    }

    // Traiter les charges
    if (feuilleData.charges && feuilleData.charges.length > 0) {
      for (const chargeData of feuilleData.charges) {
        await prisma.charge.create({
          data: {
            feuille_id: feuille.feuille_id,
            chauffeur_id: feuilleData.chauffeur_id,
            vehicule_id: feuilleData.vehicule_id,
            description: chargeData.description,
            montant: chargeData.montant,
            mode_paiement_charge: chargeData.mode_paiement_id,
            date_charge: chargeData.date_charge ? new Date(chargeData.date_charge) : new Date()
          }
        });
      }
    }

    return await getFeuilleRouteById(feuille.feuille_id);
  } catch (error) {
    console.error('Erreur lors de l\'encodage admin de la feuille de route:', error);
    throw error;
  }
}

// ==================== GESTION DES INTERVENTIONS ====================

export async function getInterventions() {
  try {
    return await prisma.intervention.findMany({
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des interventions:', error);
    throw error;
  }
}

export async function getInterventionsByChauffeur(chauffeurId) {
  try {
    return await prisma.intervention.findMany({
      where: {
        chauffeur_id: parseInt(chauffeurId)
      },
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des interventions du chauffeur:', error);
    throw error;
  }
}

export async function createIntervention(interventionData) {
  try {
    return await prisma.intervention.create({
      data: {
        chauffeur_id: parseInt(interventionData.chauffeurId),
        type: interventionData.type,
        description: interventionData.description,
        date: new Date(interventionData.date),
        location: interventionData.location || null,
        created_by: interventionData.createdBy
      },
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'intervention:', error);
    throw error;
  }
}

// ==================== AUTHENTIFICATION ====================

/**
 * Fonction de hashage des mots de passe (SHA-256 avec salt)
 * @param {string} password - Mot de passe en clair
 * @returns {string} - Hash du mot de passe
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'TxApp-Salt-2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Authentifie un utilisateur et retourne un token JWT
 * @param {string} emailOrUsername - Email ou nom d'utilisateur de l'utilisateur
 * @param {string} password - Mot de passe en clair
 * @returns {Object} - Token JWT et informations utilisateur
 */
export async function login(emailOrUsername, password) {
  try {
    // Recherche de l'utilisateur par email
    const user = await prisma.utilisateur.findUnique({
      where: { email: emailOrUsername },
      include: {
        chauffeur: {
          include: {
            societe_taxi: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérification du mot de passe (support bcrypt et SHA-256 salé)
    let isValidPassword = false;
    
    // Tenter d'abord avec bcrypt (nouveaux comptes)
    try {
      isValidPassword = await bcrypt.compare(password, user.mot_de_passe_hashe);
      if (isValidPassword) {
        console.log('Authentification réussie avec bcrypt pour:', user.email);
      }
    } catch {
      // Ignore, on essaiera SHA-256
    }
    
    // Si bcrypt échoue, tenter avec SHA-256 + salt TxApp (anciens comptes)
    if (!isValidPassword) {
      const saltedPassword = password + 'TxApp-Salt-2025';
      const sha256Hash = crypto.createHash('sha256').update(saltedPassword).digest('hex');
      isValidPassword = (sha256Hash === user.mot_de_passe_hashe);
      
      if (isValidPassword) {
        console.log('Authentification réussie avec SHA-256 + salt pour:', user.email);
      }
    }
    
    if (!isValidPassword) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Génération du token JWT
    const token = jwt.sign(
      {
        sub: user.user_id, // Utiliser 'sub' comme identifiant standard JWT
        userId: user.user_id, // Garder userId pour compatibilité
        email: user.email,
        role: user.role,
        societeId: user.societe_id
      },
      process.env.JWT_SECRET || 'txapp-secret-key-2025',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'txapp-api',
        audience: 'txapp-client'
      }
    );

    // Retour des informations utilisateur (sans le mot de passe hashé)
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.mot_de_passe_hashe;

    return {
      success: true,
      user: userWithoutPassword,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
}

/**
 * Vérifie la validité d'un token JWT
 * @param {string} token - Token JWT à vérifier
 * @returns {Object} - Informations du token décodé
 */
export async function verifyToken(token) {
  try {
    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'txapp-secret-key-2025', {
      issuer: 'txapp-api',
      audience: 'txapp-client'
    });

    // Récupération des informations utilisateur à jour
    const userId = decoded.sub || decoded.userId; // Utiliser sub en priorité, fallback sur userId
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { user_id: userId },
      include: {
        societe_taxi: true,
        chauffeur: {
          include: {
            regle_salaire: true
          }
        }
      }
    });

    if (!utilisateur) {
      throw new Error('Utilisateur non trouvé');
    }

    // Retour des informations utilisateur (sans le mot de passe hashé)
    const userWithoutPassword = { ...utilisateur };
    delete userWithoutPassword.mot_de_passe_hashe;

    return {
      valid: true,
      user: userWithoutPassword,
      tokenData: decoded
    };
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token invalide');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expiré');
    }
    throw error;
  }
}

/**
 * Change le mot de passe d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {string} oldPassword - Ancien mot de passe
 * @param {string} newPassword - Nouveau mot de passe
 * @returns {Object} - Confirmation du changement
 */
export async function changePassword(userId, oldPassword, newPassword) {
  try {
    // Récupération de l'utilisateur
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { user_id: parseInt(userId) }
    });

    if (!utilisateur) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérification de l'ancien mot de passe
    // Certains utilisateurs ont des mots de passe en clair, d'autres sont hashés
    let isOldPasswordValid = false;
    if (utilisateur.mot_de_passe_hashe === oldPassword) {
      // Mot de passe en clair
      isOldPasswordValid = true;
    } else {
      // Mot de passe hashé
      const hashedInput = await hashPassword(oldPassword);
      isOldPasswordValid = hashedInput === utilisateur.mot_de_passe_hashe;
    }

    if (!isOldPasswordValid) {
      throw new Error('Ancien mot de passe incorrect');
    }

    // Validation du nouveau mot de passe
    if (newPassword.length < 8) {
      throw new Error('Le nouveau mot de passe doit contenir au moins 8 caractères');
    }

    // Hashage du nouveau mot de passe avec SHA-256
    const hashedNewPassword = await hashPassword(newPassword);

    // Mise à jour du mot de passe
    await prisma.utilisateur.update({
      where: { user_id: parseInt(userId) },
      data: {
        mot_de_passe_hashe: hashedNewPassword,
        updated_at: new Date()
      }
    });

    return {
      success: true,
      message: 'Mot de passe changé avec succès',
      changedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    throw error;
  }
}

// ==================== UTILITAIRES ====================

export async function createOrUpdateTaximetre(feuilleId, taximetreData) {
  try {
    // Vérifier que la feuille existe
    const feuille = await prisma.feuille_route.findUnique({
      where: { feuille_id: parseInt(feuilleId) }
    });

    if (!feuille) {
      throw new Error('Feuille de route non trouvée');
    }

    // Calculs automatiques
    const calculs = {};

    // Calcul des km parcourus
    if (taximetreData.index_km_fin_tax && taximetreData.index_km_debut_tax) {
      calculs.km_parcourus_tax = taximetreData.index_km_fin_tax - taximetreData.index_km_debut_tax;
    }

    // Calcul des chutes
    if (taximetreData.chutes_fin_tax && taximetreData.chutes_debut_tax) {
      calculs.chutes_totales = taximetreData.chutes_fin_tax - taximetreData.chutes_debut_tax;
    }

    // Calcul du PC (prise en charge)
    if (taximetreData.taximetre_prise_charge_fin && taximetreData.taximetre_prise_charge_debut) {
      calculs.pc_total = taximetreData.taximetre_prise_charge_fin - taximetreData.taximetre_prise_charge_debut;
    }

    // Créer ou mettre à jour le taximètre
    const taximetre = await prisma.taximetre.upsert({
      where: { feuille_id: parseInt(feuilleId) },
      update: {
        pc_debut_tax: taximetreData.pc_debut_tax,
        pc_fin_tax: taximetreData.pc_fin_tax,
        index_km_debut_tax: taximetreData.index_km_debut_tax,
        index_km_fin_tax: taximetreData.index_km_fin_tax,
        km_charge_debut: taximetreData.km_charge_debut,
        km_charge_fin: taximetreData.km_charge_fin,
        chutes_debut_tax: taximetreData.chutes_debut_tax,
        chutes_fin_tax: taximetreData.chutes_fin_tax,
        taximetre_prise_charge_debut: taximetreData.taximetre_prise_charge_debut,
        taximetre_prise_charge_fin: taximetreData.taximetre_prise_charge_fin,
        taximetre_index_km_debut: taximetreData.taximetre_index_km_debut,
        taximetre_index_km_fin: taximetreData.taximetre_index_km_fin,
        taximetre_km_charge_debut: taximetreData.taximetre_km_charge_debut,
        taximetre_km_charge_fin: taximetreData.taximetre_km_charge_fin,
        taximetre_chutes_debut: taximetreData.taximetre_chutes_debut,
        taximetre_chutes_fin: taximetreData.taximetre_chutes_fin
      },
      create: {
        feuille_id: parseInt(feuilleId),
        pc_debut_tax: taximetreData.pc_debut_tax,
        pc_fin_tax: taximetreData.pc_fin_tax,
        index_km_debut_tax: taximetreData.index_km_debut_tax,
        index_km_fin_tax: taximetreData.index_km_fin_tax,
        km_charge_debut: taximetreData.km_charge_debut,
        km_charge_fin: taximetreData.km_charge_fin,
        chutes_debut_tax: taximetreData.chutes_debut_tax,
        chutes_fin_tax: taximetreData.chutes_fin_tax,
        taximetre_prise_charge_debut: taximetreData.taximetre_prise_charge_debut,
        taximetre_prise_charge_fin: taximetreData.taximetre_prise_charge_fin,
        taximetre_index_km_debut: taximetreData.taximetre_index_km_debut,
        taximetre_index_km_fin: taximetreData.taximetre_index_km_fin,
        taximetre_km_charge_debut: taximetreData.taximetre_km_charge_debut,
        taximetre_km_charge_fin: taximetreData.taximetre_km_charge_fin,
        taximetre_chutes_debut: taximetreData.taximetre_chutes_debut,
        taximetre_chutes_fin: taximetreData.taximetre_chutes_fin
      }
    });

    return {
      ...taximetre,
      calculs: calculs
    };
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour du taximètre:', error);
    throw error;
  }
}

export async function getTaximetreByFeuille(feuilleId) {
  try {
    const taximetre = await prisma.taximetre.findUnique({
      where: { feuille_id: parseInt(feuilleId) }
    });

    if (!taximetre) {
      return null;
    }

    // Calculs automatiques
    const calculs = {
      km_parcourus_tax: taximetre.index_km_fin_tax && taximetre.index_km_debut_tax
        ? taximetre.index_km_fin_tax - taximetre.index_km_debut_tax
        : 0,
      chutes_totales: taximetre.chutes_fin_tax && taximetre.chutes_debut_tax
        ? taximetre.chutes_fin_tax - taximetre.chutes_debut_tax
        : 0,
      pc_total: taximetre.taximetre_prise_charge_fin && taximetre.taximetre_prise_charge_debut
        ? taximetre.taximetre_prise_charge_fin - taximetre.taximetre_prise_charge_debut
        : 0
    };

    return {
      ...taximetre,
      calculs: calculs
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du taximètre:', error);
    throw error;
  }
}

export async function calculateDriverSalary(feuilleId) {
  try {
    // Récupérer la feuille avec le chauffeur et sa règle de salaire
    const feuille = await prisma.feuille_route.findUnique({
      where: { feuille_id: parseInt(feuilleId) },
      include: {
        chauffeur: {
          include: {
            regle_salaire: true
          }
        },
        course: {
          where: {
            heure_debarquement: {
              not: null
            }
          }
        }
      }
    });

    if (!feuille) {
      throw new Error('Feuille de route non trouvée');
    }

    if (!feuille.chauffeur.regle_salaire) {
      throw new Error('Aucune règle de salaire définie pour ce chauffeur');
    }

    const regleSalaire = feuille.chauffeur.regle_salaire;

    // Calculer les recettes totales (courses terminées)
    const recettesTotales = feuille.courses.reduce((sum, course) => {
      return sum + (parseFloat(course.sommes_percues) || 0);
    }, 0);

    let salaireCalcule = 0;
    const seuil = parseFloat(regleSalaire.seuil_recette) || 0;
    const pourcentageBase = parseFloat(regleSalaire.pourcentage_base) || 0;
    const pourcentageAuDela = parseFloat(regleSalaire.pourcentage_au_dela) || pourcentageBase;

    if (regleSalaire.est_variable) {
      // Calcul variable avec seuil
      if (recettesTotales <= seuil) {
        salaireCalcule = (recettesTotales * pourcentageBase) / 100;
      } else {
        const salaireBase = (seuil * pourcentageBase) / 100;
        const salaireAuDela = ((recettesTotales - seuil) * pourcentageAuDela) / 100;
        salaireCalcule = salaireBase + salaireAuDela;
      }
    } else {
      // Calcul fixe
      salaireCalcule = (recettesTotales * pourcentageBase) / 100;
    }

    return {
      feuille_id: feuille.feuille_id,
      chauffeur_id: feuille.chauffeur_id,
      regle_salaire_id: regleSalaire.regle_id,
      recettes_totales: recettesTotales,
      seuil_recette: seuil,
      pourcentage_base: pourcentageBase,
      pourcentage_au_dela: pourcentageAuDela,
      est_variable: regleSalaire.est_variable,
      salaire_calcule: Math.round(salaireCalcule * 100) / 100, // Arrondi à 2 décimales
      nombre_courses: feuille.course?.length || 0 // ✅ SINGULIER - le schéma utilise 'course'
    };
  } catch (error) {
    console.error('Erreur lors du calcul du salaire:', error);
    throw error;
  }
}

export async function validateFeuilleRouteAdmin(feuilleId, validatedByUserId) {
  try {
    // Vérifier que la feuille existe et n'est pas déjà validée
    const feuille = await prisma.feuille_route.findUnique({
      where: { feuille_id: parseInt(feuilleId) },
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        },
        vehicule: true,
        course: true,
        charge: true
      }
    });

    if (!feuille) {
      throw new Error('Feuille de route non trouvée');
    }

    if (feuille.est_validee) {
      throw new Error('Cette feuille de route est déjà validée');
    }

    // Validation finale avant validation administrative
    if (!feuille.heure_fin) {
      throw new Error('La feuille de route doit être finalisée avant validation');
    }

    if (!feuille.index_km_fin_tdb) {
      throw new Error('Le kilométrage de fin doit être saisi');
    }

    // Calculer les totaux avant validation
    const totals = await calculateFeuilleTotals(feuilleId);

    // Marquer comme validée
    const updatedFeuille = await prisma.feuille_route.update({
      where: { feuille_id: parseInt(feuilleId) },
      data: {
        est_validee: true,
        date_validation: new Date(),
        validated_by: parseInt(validatedByUserId)
      },
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        },
        vehicule: true
      }
    });

    return {
      ...updatedFeuille,
      totals: totals
    };
  } catch (error) {
    console.error('Erreur lors de la validation administrative:', error);
    throw error;
  }
}

export async function calculateFeuilleTotals(feuilleId) {
  try {
    // Récupérer la feuille de route avec ses courses et charges
    const feuille = await prisma.feuille_route.findUnique({
      where: { feuille_id: parseInt(feuilleId) },
      include: {
        course: {
          include: {
            mode_paiement: true
          }
        },
        charge: {
          include: {
            mode_paiement: true
          }
        }
      }
    });

    if (!feuille) {
      throw new Error('Feuille de route non trouvée');
    }

    // Calculer les km parcourus
    const kmParcourus = feuille.index_km_fin_tdb && feuille.index_km_debut_tdb
      ? feuille.index_km_fin_tdb - feuille.index_km_debut_tdb
      : 0;

    // Calculer les recettes totales (courses terminées)
    const recettesTotales = feuille.courses
      .filter(c => c.heure_debarquement) // Uniquement les courses terminées
      .reduce((sum, course) => sum + (parseFloat(course.sommes_percues) || 0), 0);

    // Calculer les dépenses totales
    const depensesTotales = feuille.charges
      .reduce((sum, charge) => sum + (parseFloat(charge.montant) || 0), 0);

    // Calculer la durée totale (gestion des shifts qui se terminent le lendemain)
    let dureeTotale = null;
    if (feuille.heure_debut && feuille.heure_fin) {
      const debut = new Date(`1970-01-01T${feuille.heure_debut}`);
      let fin = new Date(`1970-01-01T${feuille.heure_fin}`);

      // Si l'heure de fin est avant l'heure de début, cela signifie que le shift se termine le lendemain
      if (fin < debut) {
        fin.setDate(fin.getDate() + 1); // Ajouter un jour
      }

      dureeTotale = (fin - debut) / (1000 * 60); // Durée en minutes
    }

    // Calculer les recettes par mode de paiement
    const recettesParMode = feuille.courses
      .filter(c => c.heure_debarquement)
      .reduce((acc, course) => {
        const mode = course.mode_paiement?.code || 'AUTRE';
        acc[mode] = (acc[mode] || 0) + (parseFloat(course.sommes_percues) || 0);
        return acc;
      }, {});

    // Calculer les dépenses par mode de paiement
    const depensesParMode = feuille.charges
      .reduce((acc, charge) => {
        const mode = charge.mode_paiement?.code || 'AUTRE';
        acc[mode] = (acc[mode] || 0) + (parseFloat(charge.montant) || 0);
        return acc;
      }, {});

    return {
      feuille_id: feuille.feuille_id,
      km_parcourus: kmParcourus,
      recettes_totales: recettesTotales,
      depenses_totales: depensesTotales,
      duree_totale_minutes: dureeTotale,
      recettes_par_mode: recettesParMode,
      depenses_par_mode: depensesParMode,
      nombre_courses: feuille.course?.filter(c => c.heure_debarquement).length || 0, // ✅ SINGULIER
      nombre_charges: feuille.charge?.length || 0 // ✅ SINGULIER
    };
  } catch (error) {
    console.error('Erreur lors du calcul des totaux:', error);
    throw error;
  }
}

export async function disconnect() {
  await prisma.$disconnect();
}

export { prisma };