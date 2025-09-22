-- Script pour identifier et supprimer tous les records de l'utilisateur ismaïl.drissi@txapp.be
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Identifier l'utilisateur avec l'email ismaïl.drissi@txapp.be
SELECT '=== UTILISATEUR À SUPPRIMER ===' as section;
SELECT id, email, nom, prenom, type_utilisateur, actif, date_creation
FROM utilisateur
WHERE email = 'ismaïl.drissi@txapp.be';

-- 2. Vérifier les données liées dans chaque table (utiliser les bonnes colonnes)
SELECT '=== DONNÉES CHAUFFEUR ===' as section;
SELECT c.*
FROM chauffeur c
JOIN utilisateur u ON c.utilisateur_id = u.id
WHERE u.email = 'ismaïl.drissi@txapp.be';

SELECT '=== DONNÉES COURSE ===' as section;
-- Adapter selon la vraie structure de la table course
SELECT c.*
FROM course c
WHERE c.chauffeur_id IN (
    SELECT ch.id FROM chauffeur ch
    JOIN utilisateur u ON ch.utilisateur_id = u.id
    WHERE u.email = 'ismaïl.drissi@txapp.be'
) OR c.client_id IN (
    SELECT cl.id FROM client cl
    WHERE cl.email = 'ismaïl.drissi@txapp.be'
);

SELECT '=== DONNÉES FACTURE ===' as section;
-- Adapter selon la vraie structure de la table facture
SELECT f.*
FROM facture f
WHERE f.course_id IN (
    SELECT c.id FROM course c
    WHERE c.chauffeur_id IN (
        SELECT ch.id FROM chauffeur ch
        JOIN utilisateur u ON ch.utilisateur_id = u.id
        WHERE u.email = 'ismaïl.drissi@txapp.be'
    )
);

-- 3. SUPPRESSION SÉCURISÉE (désactivez les contraintes de clés étrangères temporairement)
-- ATTENTION: Cette opération est IRRÉVERSIBLE !

-- Commencer une transaction
BEGIN;

-- Supprimer les données dans l'ordre inverse des dépendances
DELETE FROM facture
WHERE course_id IN (
    SELECT c.id FROM course c
    WHERE c.chauffeur_id IN (
        SELECT ch.id FROM chauffeur ch
        JOIN utilisateur u ON ch.utilisateur_id = u.id
        WHERE u.email = 'ismaïl.drissi@txapp.be'
    )
);

DELETE FROM course
WHERE chauffeur_id IN (
    SELECT ch.id FROM chauffeur ch
    JOIN utilisateur u ON ch.utilisateur_id = u.id
    WHERE u.email = 'ismaïl.drissi@txapp.be'
) OR client_id IN (
    SELECT cl.id FROM client cl
    WHERE cl.email = 'ismaïl.drissi@txapp.be'
);

DELETE FROM chauffeur
WHERE utilisateur_id IN (
    SELECT id FROM utilisateur WHERE email = 'ismaïl.drissi@txapp.be'
);

DELETE FROM utilisateur
WHERE email = 'ismaïl.drissi@txapp.be';

-- Valider la transaction
COMMIT;

-- 4. Vérification de la suppression
SELECT '=== VÉRIFICATION SUPPRESSION ===' as section;
SELECT COUNT(*) as utilisateurs_restants
FROM utilisateur
WHERE email = 'ismaïl.drissi@txapp.be';

SELECT '=== UTILISATEURS ACTIFS RESTANTS ===' as section;
SELECT id, email, nom, prenom, type_utilisateur
FROM utilisateur
WHERE actif = true
ORDER BY id;