-- Migration: Ajouter le champ signature_chauffeur à la table feuille_route
-- Date: 2024-06-15
-- Description: Permet de stocker la signature du chauffeur (nom + prénom) lors de la fin de shift

ALTER TABLE feuille_route 
ADD COLUMN signature_chauffeur VARCHAR(255);

-- Commentaire de la colonne
COMMENT ON COLUMN feuille_route.signature_chauffeur IS 'Signature du chauffeur (nom + prénom) lors de la clôture de la feuille de route';
