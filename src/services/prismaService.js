import prisma from '../configs/database.config.js';
import jwt from 'jsonwebtoken';

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
                courses: {
                  include: {
                    client: true,
                    mode_paiement: true,
                    detail_facture_complexe: true
                  }
                },
                charges: {
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
    return await prisma.utilisateur.create({
      data: {
        societe_id: userData.societe_id,
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
            course: {
              include: {
                client: true,
                mode_paiement: true
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
            courses: {
              include: {
                client: true,
                mode_paiement: true,
                detail_facture_complexe: true
              }
            },
            charges: {
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
            utilisateur: true
          }
        },
        vehicule: true,
        courses: {
          include: {
            client: true,
            mode_paiement: true,
            detail_facture_complexe: true
          },
          orderBy: {
            num_ordre: 'asc'
          }
        },
        charges: {
          include: {
            vehicule: true,
            mode_paiement: true
          }
        },
        taximetre: true,
        validee_par: true
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
        vehicule: true,
        courses: {
          include: {
            client: true,
            mode_paiement: true,
            detail_facture_complexe: true
          },
          orderBy: {
            num_ordre: 'asc'
          }
        },
        charges: {
          include: {
            vehicule: true,
            mode_paiement: true
          }
        },
        taximetre: true
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

export async function createFeuilleRoute(feuilleData) {
  try {
    return await prisma.feuille_route.create({
      data: {
        chauffeur_id: feuilleData.chauffeur_id,
        vehicule_id: feuilleData.vehicule_id,
        date_service: new Date(feuilleData.date_service),
        mode_encodage: feuilleData.mode_encodage || 'MANUEL',
        heure_debut: feuilleData.heure_debut ? new Date(feuilleData.heure_debut) : null,
        heure_fin: feuilleData.heure_fin ? new Date(feuilleData.heure_fin) : null,
        interruptions: feuilleData.interruptions,
        total_heures: feuilleData.total_heures,
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
  } catch (error) {
    console.error('Erreur lors de la création de la feuille de route:', error);
    throw error;
  }
}

export async function updateFeuilleRoute(feuilleId, feuilleData) {
  try {
    return await prisma.feuille_route.update({
      where: { feuille_id: parseInt(feuilleId) },
      data: {
        vehicule_id: feuilleData.vehicule_id,
        mode_encodage: feuilleData.mode_encodage,
        heure_debut: feuilleData.heure_debut ? new Date(feuilleData.heure_debut) : null,
        heure_fin: feuilleData.heure_fin ? new Date(feuilleData.heure_fin) : null,
        interruptions: feuilleData.interruptions,
        total_heures: feuilleData.total_heures,
        index_km_debut_tdb: feuilleData.index_km_debut_tdb,
        index_km_fin_tdb: feuilleData.index_km_fin_tdb,
        total_km_tdb: feuilleData.total_km_tdb,
        date_validation: feuilleData.date_validation ? new Date(feuilleData.date_validation) : null,
        validee_par_user_id: feuilleData.validee_par_user_id,
        montant_salaire_cash_declare: feuilleData.montant_salaire_cash_declare
      },
      include: {
        chauffeur: {
          include: {
            utilisateur: true
          }
        },
        vehicule: true,
        courses: {
          include: {
            client: true,
            mode_paiement: true
          }
        },
        charges: {
          include: {
            vehicule: true,
            mode_paiement: true
          }
        }
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
            societe_emettrice: true,
            mode_paiement: true,
            client_prestation: true
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
        courses: {
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
        courses: {
          include: {
            client: true,
            mode_paiement: true
          }
        },
        charges: {
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
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe en clair
 * @returns {Object} - Token JWT et informations utilisateur
 */
export async function login(email, password) {
  try {
    // Recherche de l'utilisateur par email
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email: email },
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

    // Vérification du mot de passe
    // Certains utilisateurs ont des mots de passe en clair, d'autres sont hashés
    let isPasswordValid = false;
    if (utilisateur.mot_de_passe_hashe === password) {
      // Mot de passe en clair
      isPasswordValid = true;
    } else {
      // Mot de passe hashé
      const hashedInput = await hashPassword(password);
      isPasswordValid = hashedInput === utilisateur.mot_de_passe_hashe;
    }

    if (!isPasswordValid) {
      throw new Error('Mot de passe incorrect');
    }

    // Génération du token JWT
    const token = jwt.sign(
      {
        userId: utilisateur.user_id,
        email: utilisateur.email,
        role: utilisateur.role,
        societeId: utilisateur.societe_id
      },
      process.env.JWT_SECRET || 'txapp-secret-key-2025',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'txapp-api',
        audience: 'txapp-client'
      }
    );

    // Retour des informations utilisateur (sans le mot de passe hashé)
    const { mot_de_passe_hashe, ...userWithoutPassword } = utilisateur;

    return {
      token,
      user: userWithoutPassword,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
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
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { user_id: decoded.userId },
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
    const { mot_de_passe_hashe, ...userWithoutPassword } = utilisateur;

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

export async function disconnect() {
  await prisma.$disconnect();
}

export { prisma };