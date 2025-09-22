-- CRÉER UN CHAUFFEUR POUR L'UTILISATEUR 16
-- À exécuter dans Supabase Dashboard > SQL Editor

-- D'abord vérifier que l'utilisateur 16 existe et est un chauffeur
SELECT id, email, nom, prenom, type_utilisateur, actif
FROM utilisateur
WHERE id = 16 AND type_utilisateur = 'CHAUFFEUR';

-- Créer l'enregistrement chauffeur pour l'utilisateur 16
INSERT INTO chauffeur (
  utilisateur_id,
  numero_badge,
  date_embauche,
  taux_commission,
  salaire_base,
  actif
) VALUES (
  16,
  'CH16',
  CURRENT_DATE,
  10.00,
  2500.00,
  true
);

-- Vérifier que l'enregistrement a été créé
SELECT
  c.id,
  c.numero_badge,
  c.taux_commission,
  c.salaire_base,
  c.actif,
  u.nom,
  u.prenom,
  u.email
FROM chauffeur c
JOIN utilisateur u ON c.utilisateur_id = u.id
WHERE c.utilisateur_id = 16;