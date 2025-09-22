-- SCAN COMPLET DE LA BASE DE DONNÉES
-- À exécuter dans Supabase Dashboard > SQL Editor

-- 1. Vérifier l'utilisateur 16
SELECT 'UTILISATEUR 16:' as section;
SELECT id, email, nom, prenom, type_utilisateur, actif
FROM utilisateur
WHERE id = 16;

-- 2. Lister TOUS les chauffeurs existants
SELECT 'TOUS LES CHAUFFEURS:' as section;
SELECT
  c.id,
  c.numero_badge,
  c.utilisateur_id,
  c.actif,
  c.taux_commission,
  c.salaire_base,
  u.nom,
  u.prenom,
  u.email
FROM chauffeur c
LEFT JOIN utilisateur u ON c.utilisateur_id = u.id
ORDER BY c.id;

-- 3. Vérifier spécifiquement chauffeur pour utilisateur 16
SELECT 'CHAUFFEUR UTILISATEUR 16:' as section;
SELECT
  c.id,
  c.numero_badge,
  c.utilisateur_id,
  c.actif,
  c.taux_commission,
  c.salaire_base,
  u.nom,
  u.prenom,
  u.email
FROM chauffeur c
LEFT JOIN utilisateur u ON c.utilisateur_id = u.id
WHERE c.utilisateur_id = 16;

-- 4. SI AUCUN RÉSULTAT pour l'utilisateur 16, créer l'enregistrement
-- DÉCOMMENTEZ ET EXÉCUTEZ CETTE PARTIE SI NÉCESSAIRE:

-- 4. SI AUCUN RÉSULTAT pour l'utilisateur 16, créer l'enregistrement
-- DÉCOMMENTEZ ET EXÉCUTEZ CETTE PARTIE SI NÉCESSAIRE:

-- Méthode automatique pour trouver un numero_badge unique
DO $$
DECLARE
    next_badge TEXT;
BEGIN
    -- Trouver le prochain numero_badge disponible
    SELECT CONCAT('CH', LPAD((COALESCE(MAX(CAST(SUBSTRING(numero_badge FROM 3) AS INTEGER)), 0) + 1)::TEXT, 2, '0'))
    INTO next_badge
    FROM chauffeur
    WHERE numero_badge LIKE 'CH%';

    -- Insérer le chauffeur avec le numero_badge disponible
    INSERT INTO chauffeur (
      utilisateur_id,
      numero_badge,
      date_embauche,
      taux_commission,
      salaire_base,
      actif
    ) VALUES (
      16,
      next_badge,
      CURRENT_DATE,
      10.00,
      2500.00,
      true
    );

    RAISE NOTICE 'Chauffeur créé avec numero_badge: %', next_badge;
END $$;

-- 5. Revérifier après création
-- SELECT 'APRÈS CRÉATION:' as section;
-- SELECT
--   c.id,
--   c.numero_badge,
--   c.utilisateur_id,
--   c.actif,
--   u.nom,
--   u.prenom,
--   u.email
-- FROM chauffeur c
-- LEFT JOIN utilisateur u ON c.utilisateur_id = u.id
-- WHERE c.utilisateur_id = 16;