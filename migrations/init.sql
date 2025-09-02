-- Migration initiale complète pour TxApp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table des règles de salaire
CREATE TABLE IF NOT EXISTS regle_salaire (
                                             id SERIAL PRIMARY KEY,
                                             nom VARCHAR(100) NOT NULL,
    description TEXT,
    type_regle VARCHAR(50) NOT NULL CHECK (type_regle IN ('fixe', 'variable', 'fixe_variable', 'commission')),
    taux_fixe DECIMAL(10,2),
    taux_variable DECIMAL(10,2),
    seuil DECIMAL(10,2),
    heure_debut TIME,
    heure_fin TIME,
    jours_semaine VARCHAR(20) DEFAULT '1,2,3,4,5',
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
    );

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS utilisateur (
                                           id SERIAL PRIMARY KEY,
                                           type_utilisateur VARCHAR(20) NOT NULL CHECK (type_utilisateur IN ('admin', 'gestionnaire', 'chauffeur', 'client')),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    mot_de_passe VARCHAR(255),
    date_creation TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP(6),
    actif BOOLEAN DEFAULT true,
    role VARCHAR(20) DEFAULT 'chauffeur' CHECK (role IN ('admin', 'gestionnaire', 'chauffeur', 'client')),
    preferences JSONB,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
    );

-- Index pour utilisateur
CREATE INDEX IF NOT EXISTS idx_utilisateur_email ON utilisateur(email);
CREATE INDEX IF NOT EXISTS idx_utilisateur_telephone ON utilisateur(telephone);

-- Table des chauffeurs
CREATE TABLE IF NOT EXISTS chauffeur (
                                         id SERIAL PRIMARY KEY,
                                         utilisateur_id INTEGER UNIQUE REFERENCES utilisateur(id) ON DELETE CASCADE,
    regle_salaire_id INTEGER REFERENCES regle_salaire(id),
    numero_badge VARCHAR(50) UNIQUE NOT NULL,
    date_embauche DATE NOT NULL,
    date_fin_contrat DATE,
    type_contrat VARCHAR(50) CHECK (type_contrat IN ('CDI', 'CDD', 'Freelance', 'Stage')),
    compte_bancaire VARCHAR(50),
    taux_commission DECIMAL(5,2) DEFAULT 0.00,
    salaire_base DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
    );

-- Table des véhicules
CREATE TABLE IF NOT EXISTS vehicule (
                                        id SERIAL PRIMARY KEY,
                                        numero_plaque VARCHAR(20) UNIQUE NOT NULL,
    marque VARCHAR(50) NOT NULL,
    modele VARCHAR(50) NOT NULL,
    annee INTEGER CHECK (annee >= 1900 AND annee <= 2030),
    couleur VARCHAR(30),
    numero_chassis VARCHAR(50) UNIQUE,
    date_mise_service DATE,
    date_fin_service DATE,
    capacite_passagers INTEGER DEFAULT 4 CHECK (capacite_passagers > 0),
    type_carburant VARCHAR(20) DEFAULT 'Essence' CHECK (type_carburant IN ('Essence', 'Diesel', 'Électrique', 'Hybride', 'GPL')),
    consommation_moy DECIMAL(5,2) CHECK (consommation_moy > 0),
    notes TEXT,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
    );

-- Table des clients
CREATE TABLE IF NOT EXISTS client (
                                      id SERIAL PRIMARY KEY,
                                      type_client VARCHAR(20) NOT NULL CHECK (type_client IN ('particulier', 'entreprise', 'collectivite')),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(20),
    pays VARCHAR(50) DEFAULT 'Belgique',
    num_tva VARCHAR(20),
    periode_facturation VARCHAR(50) DEFAULT 'Mensuelle',
    mode_facturation VARCHAR(50) DEFAULT 'Simple',
    procedure_envoi TEXT,
    adresse_facturation_diff BOOLEAN DEFAULT false,
    adresse_facturation TEXT,
    notes TEXT,
    date_creation TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
    );

-- Table des modes de paiement
CREATE TABLE IF NOT EXISTS mode_paiement (
                                             id SERIAL PRIMARY KEY,
                                             code VARCHAR(10) UNIQUE NOT NULL,
    libelle VARCHAR(50) NOT NULL,
    type_paiement VARCHAR(20) NOT NULL CHECK (type_paiement IN ('liquide', 'electronique', 'credit', 'papier')),
    facturation_requise BOOLEAN DEFAULT false,
    tva_applicable BOOLEAN DEFAULT true,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
    );

-- Table des feuilles de route
CREATE TABLE IF NOT EXISTS feuille_route (
                                             id SERIAL PRIMARY KEY,
                                             chauffeur_id INTEGER NOT NULL REFERENCES chauffeur(id) ON DELETE CASCADE,
    vehicule_id INTEGER NOT NULL REFERENCES vehicule(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME,
    interruptions INTERVAL,
    km_debut INTEGER NOT NULL CHECK (km_debut >= 0),
    km_fin INTEGER CHECK (km_fin >= km_debut),
    prise_en_charge_debut DECIMAL(10,2),
    prise_en_charge_fin DECIMAL(10,2),
    chutes_debut DECIMAL(10,2),
    chutes_fin DECIMAL(10,2),
    statut VARCHAR(20) DEFAULT 'En cours' CHECK (statut IN ('En cours', 'Terminée', 'Validée', 'Annulée')),
    saisie_mode VARCHAR(20) DEFAULT 'chauffeur',
    notes TEXT,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    valide_par INTEGER REFERENCES utilisateur(id),
    date_validation TIMESTAMP(6)
    );

-- Table des courses
CREATE TABLE IF NOT EXISTS course (
                                      id SERIAL PRIMARY KEY,
                                      feuille_route_id INTEGER NOT NULL REFERENCES feuille_route(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES client(id),
    mode_paiement_id INTEGER REFERENCES mode_paiement(id),
    numero_ordre INTEGER,
    index_depart INTEGER NOT NULL CHECK (index_depart >= 0),
    lieu_embarquement TEXT NOT NULL,
    heure_embarquement TIMESTAMP(6) NOT NULL,
    index_arrivee INTEGER NOT NULL CHECK (index_arrivee >= index_depart),
    lieu_debarquement TEXT NOT NULL,
    heure_debarquement TIMESTAMP(6),
    prix_taximetre DECIMAL(10,2) NOT NULL CHECK (prix_taximetre >= 0),
    somme_percue DECIMAL(10,2) NOT NULL CHECK (somme_percue >= 0),
    hors_creneau BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
    );

-- Table des factures
CREATE TABLE IF NOT EXISTS facture (
                                       id SERIAL PRIMARY KEY,
                                       numero_facture VARCHAR(40) UNIQUE NOT NULL,
    client_id INTEGER NOT NULL REFERENCES client(id) ON DELETE CASCADE,
    date_emission DATE DEFAULT CURRENT_DATE,
    montant_ht DECIMAL(12,2) NOT NULL CHECK (montant_ht >= 0),
    tva_percent DECIMAL(5,2) DEFAULT 21.00,
    statut VARCHAR(20) DEFAULT 'En attente',
    mode_paiement VARCHAR(20),
    date_paiement DATE,
    notes TEXT,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
    );

-- Table de liaison facture_course
CREATE TABLE IF NOT EXISTS facture_course (
                                              facture_id INTEGER NOT NULL REFERENCES facture(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    numero_bon VARCHAR(50),
    raison TEXT,
    prix_facture DECIMAL(10,2) NOT NULL CHECK (prix_facture >= 0),
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (facture_id, course_id)
    );

-- Table des charges
CREATE TABLE IF NOT EXISTS charge (
                                      id SERIAL PRIMARY KEY,
                                      feuille_route_id INTEGER REFERENCES feuille_route(id) ON DELETE CASCADE,
    type_charge VARCHAR(50) NOT NULL,
    description TEXT,
    montant DECIMAL(12,2) NOT NULL CHECK (montant >= 0),
    date DATE DEFAULT CURRENT_DATE,
    mode_paiement_id INTEGER REFERENCES mode_paiement(id),
    justificatif VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
    );

-- Insertion des données de base

-- Règles de salaire par défaut
INSERT INTO regle_salaire (nom, type_regle, taux_fixe, taux_variable, description)
VALUES
    ('Salaire Standard', 'fixe_variable', 100.00, 0.15, 'Salaire fixe journalier + commission sur les courses'),
    ('Commission Pure', 'commission', 0.00, 0.25, 'Commission uniquement basée sur les recettes'),
    ('Fixe Simple', 'fixe', 120.00, 0.00, 'Salaire fixe journalier')
    ON CONFLICT (nom) DO NOTHING;

-- Modes de paiement par défaut
INSERT INTO mode_paiement (code, libelle, type_paiement, facturation_requise, tva_applicable)
VALUES
    ('CASH', 'Espèces', 'liquide', false, true),
    ('CARD', 'Carte bancaire', 'electronique', false, true),
    ('CHEQUE', 'Chèque', 'papier', true, true),
    ('VIREMENT', 'Virement', 'electronique', true, true),
    ('TICKET', 'Ticket restaurant', 'papier', false, false)
    ON CONFLICT (code) DO NOTHING;

-- Création d'un utilisateur administrateur par défaut
INSERT INTO utilisateur (type_utilisateur, nom, prenom, telephone, email, mot_de_passe, role, actif)
VALUES
    ('admin', 'Administrateur', 'TxApp', '+32123456789', 'admin@txapp.be',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYUgbhHKpGrOXHi', -- mot de passe: admin123
     'admin', true)
    ON CONFLICT (email) DO NOTHING;

-- Triggers pour mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Application des triggers
CREATE TRIGGER update_utilisateur_updated_at BEFORE UPDATE ON utilisateur FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chauffeur_updated_at BEFORE UPDATE ON chauffeur FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicule_updated_at BEFORE UPDATE ON vehicule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_updated_at BEFORE UPDATE ON client FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mode_paiement_updated_at BEFORE UPDATE ON mode_paiement FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feuille_route_updated_at BEFORE UPDATE ON feuille_route FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_updated_at BEFORE UPDATE ON course FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facture_updated_at BEFORE UPDATE ON facture FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_charge_updated_at BEFORE UPDATE ON charge FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regle_salaire_updated_at BEFORE UPDATE ON regle_salaire FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
