-- Migration: Ajout des champs chauffeur (statut, pourboire, compteurs km)
-- Date: 2024
-- Description: Ajout des nouveaux champs pour supporter l'interface chauffeur améliorée

-- Ajouter le champ statut à la table course
ALTER TABLE course ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'Active' CHECK (statut IN ('Active', 'Annulee'));

-- Ajouter le champ pourboire à la table course
ALTER TABLE course ADD COLUMN IF NOT EXISTS pourboire DECIMAL(10,2) DEFAULT 0.00;

-- Ajouter les nouveaux champs compteur à la table feuille_route
ALTER TABLE feuille_route ADD COLUMN IF NOT EXISTS km_en_charge_debut INTEGER;
ALTER TABLE feuille_route ADD COLUMN IF NOT EXISTS km_en_charge_fin INTEGER;
ALTER TABLE feuille_route ADD COLUMN IF NOT EXISTS compteur_total_debut INTEGER;
ALTER TABLE feuille_route ADD COLUMN IF NOT EXISTS compteur_total_fin INTEGER;

-- Créer la table intervention si elle n'existe pas (optionnel pour les contrôles police/SP)
CREATE TABLE IF NOT EXISTS intervention (
    id SERIAL PRIMARY KEY,
    feuille_route_id INTEGER NOT NULL REFERENCES feuille_route(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Police', 'SP', 'Gendarmerie', 'Douane')),
    date_heure TIMESTAMP NOT NULL,
    lieu VARCHAR(255) NOT NULL,
    motif TEXT,
    observations TEXT,
    duree_minutes INTEGER,
    suite_donnee TEXT,
    created_by INTEGER REFERENCES chauffeur(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer un index sur feuille_route_id pour les performances
CREATE INDEX IF NOT EXISTS idx_intervention_feuille_route ON intervention(feuille_route_id);
CREATE INDEX IF NOT EXISTS idx_intervention_date ON intervention(date_heure);
CREATE INDEX IF NOT EXISTS idx_intervention_type ON intervention(type);

-- Mettre à jour les courses existantes pour calculer les pourboires
UPDATE course
SET pourboire = GREATEST(somme_percue - prix_taximetre, 0)
WHERE pourboire = 0 OR pourboire IS NULL;

-- Commentaires pour documenter les changements
COMMENT ON COLUMN course.statut IS 'Statut de la course: Active ou Annulee';
COMMENT ON COLUMN course.pourboire IS 'Montant du pourboire calculé automatiquement (somme_percue - prix_taximetre)';
COMMENT ON COLUMN feuille_route.km_en_charge_debut IS 'Kilomètres en charge au début de la journée';
COMMENT ON COLUMN feuille_route.km_en_charge_fin IS 'Kilomètres en charge à la fin de la journée';
COMMENT ON COLUMN feuille_route.compteur_total_debut IS 'Compteur total du véhicule au début de la journée';
COMMENT ON COLUMN feuille_route.compteur_total_fin IS 'Compteur total du véhicule à la fin de la journée';