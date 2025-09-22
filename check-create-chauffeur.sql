-- VÉRIFICATION RAPIDE : L'ENREGISTREMENT CHAUFFEUR EXISTE-T-IL ?
-- À exécuter dans Supabase Dashboard > SQL Editor

-- Vérifier l'utilisateur 16
SELECT id, email, nom, prenom, type_utilisateur, actif
FROM utilisateur
WHERE id = 16;

-- Vérifier si chauffeur existe pour utilisateur 16
SELECT
  c.id,
  c.numero_badge,
  c.taux_commission,
  c.salaire_base,
  c.actif,
  c.utilisateur_id,
  u.nom,
  u.prenom,
  u.email
FROM chauffeur c
JOIN utilisateur u ON c.utilisateur_id = u.id
WHERE c.utilisateur_id = 16;

-- Si AUCUN résultat pour le chauffeur, exécuter la création :
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
)
ON CONFLICT (utilisateur_id) DO NOTHING;

-- Revérifier après insertion
SELECT
  c.id,
  c.numero_badge,
  c.taux_commission,
  c.salaire_base,
  c.actif,
  c.utilisateur_id,
  u.nom,
  u.prenom,
  u.email
FROM chauffeur c
JOIN utilisateur u ON c.utilisateur_id = u.id
WHERE c.utilisateur_id = 16;