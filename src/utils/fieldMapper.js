/**
 * Mapper pour convertir les données de la base de données (Prisma)
 * vers le format attendu par le frontend
 */

/**
 * Mappe une feuille de route depuis le format DB vers le format frontend
 * @param {Object} dbData - Données brutes de la base de données
 * @returns {Object} - Données formatées pour le frontend
 */
export const mapFeuilleRouteFromDB = (dbData) => {
  if (!dbData) return null;

  console.log('🔍 mapFeuilleRouteFromDB - Données reçues:', {
    feuille_id: dbData.feuille_id,
    has_taximetre: !!dbData.taximetre,
    taximetre_keys: dbData.taximetre ? Object.keys(dbData.taximetre) : [],
    // Anciens champs (sans préfixe)
    pc_debut_tax: dbData.taximetre?.pc_debut_tax,
    pc_fin_tax: dbData.taximetre?.pc_fin_tax,
    index_km_debut_tax: dbData.taximetre?.index_km_debut_tax,
    index_km_fin_tax: dbData.taximetre?.index_km_fin_tax,
    km_charge_debut: dbData.taximetre?.km_charge_debut,
    km_charge_fin: dbData.taximetre?.km_charge_fin,
    chutes_debut_tax: dbData.taximetre?.chutes_debut_tax,
    chutes_fin_tax: dbData.taximetre?.chutes_fin_tax,
    // Nouveaux champs (avec préfixe)
    taximetre_prise_charge_debut: dbData.taximetre?.taximetre_prise_charge_debut,
    taximetre_prise_charge_fin: dbData.taximetre?.taximetre_prise_charge_fin,
    taximetre_index_km_debut: dbData.taximetre?.taximetre_index_km_debut,
    taximetre_index_km_fin: dbData.taximetre?.taximetre_index_km_fin,
    taximetre_km_charge_debut: dbData.taximetre?.taximetre_km_charge_debut,
    taximetre_km_charge_fin: dbData.taximetre?.taximetre_km_charge_fin,
    taximetre_chutes_debut: dbData.taximetre?.taximetre_chutes_debut,
    taximetre_chutes_fin: dbData.taximetre?.taximetre_chutes_fin
  });

  const result = {
    id: dbData.feuille_id,
    feuille_id: dbData.feuille_id,
    date: dbData.date_service,
    date_service: dbData.date_service,
    chauffeur_id: dbData.chauffeur_id,
    vehicule_id: dbData.vehicule_id,
    heure_debut: dbData.heure_debut,
    heure_fin: dbData.heure_fin,
    heure_fin_estimee: dbData.heure_fin_estimee,
    interruptions: dbData.interruptions?.toString() || '',
    
    // Taximètre - tableau de bord
    km_tableau_bord_debut: dbData.index_km_debut_tdb,
    km_tableau_bord_fin: dbData.index_km_fin_tdb,
    index_km_debut_tdb: dbData.index_km_debut_tdb,
    index_km_fin_tdb: dbData.index_km_fin_tdb,
    
    // Taximètre - données détaillées (depuis la relation taximetre)
    // Mapper les vrais noms de champs depuis le schéma Prisma
    taximetre_prise_charge_debut: dbData.taximetre?.taximetre_prise_charge_debut || 
                                   dbData.taximetre?.pc_debut_tax || null,
    taximetre_prise_charge_fin: dbData.taximetre?.taximetre_prise_charge_fin || 
                                 dbData.taximetre?.pc_fin_tax || null,
    taximetre_index_km_debut: dbData.taximetre?.taximetre_index_km_debut || 
                              dbData.taximetre?.index_km_debut_tax || 
                              dbData.index_km_debut_tdb,
    taximetre_index_km_fin: dbData.taximetre?.taximetre_index_km_fin || 
                            dbData.taximetre?.index_km_fin_tax || 
                            dbData.index_km_fin_tdb,
    taximetre_km_charge_debut: dbData.taximetre?.taximetre_km_charge_debut || 
                               dbData.taximetre?.km_charge_debut || null,
    taximetre_km_charge_fin: dbData.taximetre?.taximetre_km_charge_fin || 
                             dbData.taximetre?.km_charge_fin || null,
    taximetre_chutes_debut: dbData.taximetre?.taximetre_chutes_debut || 
                            dbData.taximetre?.chutes_debut_tax || null,
    taximetre_chutes_fin: dbData.taximetre?.taximetre_chutes_fin || 
                          dbData.taximetre?.chutes_fin_tax || null,
    
    // Informations financières
    montant_salaire_cash_declare: dbData.montant_salaire_cash_declare || null,
    salaire_calcule: dbData.salaire_calcule || null,
    statut: dbData.statut,
    validated_at: dbData.validated_at,
    
    // Informations supplémentaires
    nom_exploitant: dbData.chauffeur?.societe_taxi?.nom_exploitant || 
                    dbData.vehicule?.societe_taxi?.nom_exploitant || 
                    'Non renseigné',
    
    // Relations
    chauffeur: dbData.chauffeur,
    vehicule: dbData.vehicule,
    courses: dbData.course || [], // ✅ SINGULIER - le schéma utilise 'course'
    charges: dbData.charge || [], // ✅ SINGULIER - le schéma utilise 'charge'
    taximetre: dbData.taximetre,
    
    // Timestamps
    created_at: dbData.created_at,
    updated_at: dbData.updated_at
  };

  console.log('🔍 mapFeuilleRouteFromDB - Résultat mappé:', {
    feuille_id: result.feuille_id,
    // Champs mappés (avec priorité nouveaux -> anciens)
    taximetre_prise_charge_debut: {
      final: result.taximetre_prise_charge_debut,
      nouveau: dbData.taximetre?.taximetre_prise_charge_debut,
      ancien: dbData.taximetre?.pc_debut_tax
    },
    taximetre_prise_charge_fin: {
      final: result.taximetre_prise_charge_fin,
      nouveau: dbData.taximetre?.taximetre_prise_charge_fin,
      ancien: dbData.taximetre?.pc_fin_tax
    },
    taximetre_index_km_debut: {
      final: result.taximetre_index_km_debut,
      nouveau: dbData.taximetre?.taximetre_index_km_debut,
      ancien: dbData.taximetre?.index_km_debut_tax,
      tdb_fallback: dbData.index_km_debut_tdb
    },
    taximetre_index_km_fin: {
      final: result.taximetre_index_km_fin,
      nouveau: dbData.taximetre?.taximetre_index_km_fin,
      ancien: dbData.taximetre?.index_km_fin_tax,
      tdb_fallback: dbData.index_km_fin_tdb
    },
    taximetre_km_charge_debut: {
      final: result.taximetre_km_charge_debut,
      nouveau: dbData.taximetre?.taximetre_km_charge_debut,
      ancien: dbData.taximetre?.km_charge_debut
    },
    taximetre_km_charge_fin: {
      final: result.taximetre_km_charge_fin,
      nouveau: dbData.taximetre?.taximetre_km_charge_fin,
      ancien: dbData.taximetre?.km_charge_fin
    },
    taximetre_chutes_debut: {
      final: result.taximetre_chutes_debut,
      nouveau: dbData.taximetre?.taximetre_chutes_debut,
      ancien: dbData.taximetre?.chutes_debut_tax
    },
    taximetre_chutes_fin: {
      final: result.taximetre_chutes_fin,
      nouveau: dbData.taximetre?.taximetre_chutes_fin,
      ancien: dbData.taximetre?.chutes_fin_tax
    }
  });

  return result;
};

/**
 * Mappe une course depuis le format DB vers le format frontend
 * @param {Object} dbCourse - Données brutes de la course
 * @returns {Object} - Données formatées pour le frontend
 */
export const mapCourseFromDB = (dbCourse) => {
  if (!dbCourse) return null;

  return {
    id: dbCourse.course_id,
    course_id: dbCourse.course_id,
    feuille_id: dbCourse.feuille_id,
    numero_ordre: dbCourse.num_ordre,
    num_ordre: dbCourse.num_ordre,
    
    // Index de départ (utiliser le champ index_depart du schéma, ou index_embarquement comme fallback)
    index_depart: dbCourse.index_depart ?? dbCourse.index_embarquement,
    
    // Embarquement
    index_embarquement: dbCourse.index_embarquement,
    lieu_embarquement: dbCourse.lieu_embarquement,
    heure_embarquement: dbCourse.heure_embarquement,
    
    // Débarquement
    index_debarquement: dbCourse.index_debarquement,
    lieu_debarquement: dbCourse.lieu_debarquement,
    heure_debarquement: dbCourse.heure_debarquement,
    
    // Informations financières
    prix_taximetre: dbCourse.prix_taximetre,
    sommes_percues: dbCourse.sommes_percues,
    
    // Informations client
    client_id: dbCourse.client_id,
    client: dbCourse.client,
    
    // Mode de paiement
    mode_paiement_id: dbCourse.mode_paiement_id,
    mode_paiement: dbCourse.mode_paiement,
    
    // Facture complexe
    detail_facture_complexe: dbCourse.detail_facture_complexe,
    
    // Timestamps
    created_at: dbCourse.created_at
  };
};

/**
 * Mappe une charge depuis le format DB vers le format frontend
 * @param {Object} dbCharge - Données brutes de la charge
 * @returns {Object} - Données formatées pour le frontend
 */
export const mapChargeFromDB = (dbCharge) => {
  if (!dbCharge) return null;

  return {
    id: dbCharge.charge_id,
    charge_id: dbCharge.charge_id,
    feuille_id: dbCharge.feuille_id,
    chauffeur_id: dbCharge.chauffeur_id,
    vehicule_id: dbCharge.vehicule_id,
    
    // Détails de la charge
    type_charge: dbCharge.type_charge,
    description: dbCharge.description,
    montant: dbCharge.montant,
    date_charge: dbCharge.date_charge,
    
    // Mode de paiement
    mode_paiement_id: dbCharge.mode_paiement_id,
    mode_paiement: dbCharge.mode_paiement,
    
    // Relations
    vehicule: dbCharge.vehicule,
    
    // Timestamps
    created_at: dbCharge.created_at
  };
};

/**
 * Mappe un chauffeur depuis le format DB vers le format frontend
 * @param {Object} dbChauffeur - Données brutes du chauffeur
 * @returns {Object} - Données formatées pour le frontend
 */
export const mapChauffeurFromDB = (dbChauffeur) => {
  if (!dbChauffeur) return null;

  return {
    id: dbChauffeur.chauffeur_id,
    chauffeur_id: dbChauffeur.chauffeur_id,
    societe_id: dbChauffeur.societe_id,
    statut: dbChauffeur.statut,
    regle_salaire_defaut_id: dbChauffeur.regle_salaire_defaut_id,
    
    // Informations utilisateur
    utilisateur: dbChauffeur.utilisateur,
    user_id: dbChauffeur.utilisateur?.user_id,
    nom: dbChauffeur.utilisateur?.nom,
    prenom: dbChauffeur.utilisateur?.prenom,
    email: dbChauffeur.utilisateur?.email,
    role: dbChauffeur.utilisateur?.role,
    
    // Société
    societe_taxi: dbChauffeur.societe_taxi,
    nom_exploitant: dbChauffeur.societe_taxi?.nom_exploitant,
    
    // Règle de salaire
    regle_salaire: dbChauffeur.regle_salaire,
    
    // Relations
    feuille_route: dbChauffeur.feuille_route || [],
    
    // Timestamps
    created_at: dbChauffeur.created_at
  };
};

/**
 * Mappe un véhicule depuis le format DB vers le format frontend
 * @param {Object} dbVehicule - Données brutes du véhicule
 * @returns {Object} - Données formatées pour le frontend
 */
export const mapVehiculeFromDB = (dbVehicule) => {
  if (!dbVehicule) return null;

  return {
    id: dbVehicule.vehicule_id,
    vehicule_id: dbVehicule.vehicule_id,
    societe_id: dbVehicule.societe_id,
    plaque_immatriculation: dbVehicule.plaque_immatriculation,
    numero_identification: dbVehicule.numero_identification,
    modele: dbVehicule.modele,
    statut: dbVehicule.statut,
    
    // Société
    societe_taxi: dbVehicule.societe_taxi,
    nom_exploitant: dbVehicule.societe_taxi?.nom_exploitant,
    
    // Timestamps
    created_at: dbVehicule.created_at,
    updated_at: dbVehicule.updated_at
  };
};
