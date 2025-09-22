-- Script SIMPLIFIÉ pour supprimer l'utilisateur ismail.drissi@txapp.be
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Identifier l'utilisateur
SELECT '=== UTILISATEUR À SUPPRIMER ===' as section;
SELECT id, email, nom, prenom, type_utilisateur, actif
FROM utilisateur
WHERE email = 'ismail.drissi@txapp.be';

-- 2. Lister TOUTES les tables et compter les références à cet utilisateur
SELECT '=== TABLES AYANT DES RÉFÉRENCES ===' as section;

-- Tables avec utilisateur_id
SELECT 'utilisateur_id references:' as info,
       COUNT(*) as count,
       string_agg(table_name, ', ') as tables
FROM (
    SELECT DISTINCT t.table_name
    FROM information_schema.columns c
    JOIN information_schema.tables t ON c.table_name = t.table_name
    WHERE c.column_name = 'utilisateur_id'
    AND t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
) tables_with_user_id
CROSS JOIN (
    SELECT COUNT(*) as count FROM utilisateur WHERE email = 'ismail.drissi@txapp.be'
) user_count;

-- 3. SUPPRESSION PROGRESSIVE (sécurisée)

-- Commencer une transaction
BEGIN;

-- Récupérer l'ID de l'utilisateur
CREATE TEMP TABLE temp_user AS
SELECT id FROM utilisateur WHERE email = 'ismail.drissi@txapp.be';

-- Supprimer de toutes les tables qui référencent utilisateur_id
-- (Cette requête générique va chercher toutes les tables avec utilisateur_id)
DO $$
DECLARE
    table_record RECORD;
    user_id_val INTEGER;
    delete_count INTEGER;
BEGIN
    -- Récupérer l'ID utilisateur
    SELECT id INTO user_id_val FROM temp_user;

    -- Vérifier que l'utilisateur existe
    IF user_id_val IS NULL THEN
        RAISE EXCEPTION 'Utilisateur avec email ismail.drissi@txapp.be introuvable';
    END IF;

    -- Pour chaque table qui a une colonne utilisateur_id
    FOR table_record IN
        SELECT DISTINCT t.table_name
        FROM information_schema.columns c
        JOIN information_schema.tables t ON c.table_name = t.table_name
        WHERE c.column_name = 'utilisateur_id'
        AND t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        AND t.table_name != 'utilisateur'  -- Ne pas supprimer de la table utilisateur elle-même
    LOOP
        -- Compter combien d'enregistrements seront supprimés
        EXECUTE format('SELECT COUNT(*) FROM %I WHERE utilisateur_id = %s', table_record.table_name, user_id_val)
        INTO delete_count;

        -- Supprimer les enregistrements
        EXECUTE format('DELETE FROM %I WHERE utilisateur_id = %s', table_record.table_name, user_id_val);
        RAISE NOTICE 'Supprimé % enregistrements de table %', delete_count, table_record.table_name;
    END LOOP;

    -- Supprimer l'utilisateur lui-même
    DELETE FROM utilisateur WHERE id = user_id_val;
    RAISE NOTICE 'Utilisateur supprimé: ID %', user_id_val;
END $$;

-- Nettoyer
DROP TABLE temp_user;

-- Valider la transaction
COMMIT;

-- 4. Vérification
SELECT '=== VÉRIFICATION SUPPRESSION ===' as section;
SELECT COUNT(*) as utilisateurs_restants_avec_cet_email
FROM utilisateur
WHERE email = 'ismail.drissi@txapp.be';

SELECT '=== UTILISATEURS ACTIFS ===' as section;
SELECT id, email, nom, prenom, type_utilisateur
FROM utilisateur
WHERE actif = true
ORDER BY id LIMIT 10;