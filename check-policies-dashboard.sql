-- VÉRIFICATION COMPLÈTE DES POLITIQUES RLS
-- À exécuter dans Supabase Dashboard > SQL Editor

-- 1. Vérifier l'état RLS des tables
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('utilisateur', 'chauffeur', 'vehicule', 'client', 'course', 'facture')
ORDER BY tablename;

-- 2. Vérifier les politiques existantes
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('utilisateur', 'chauffeur', 'vehicule', 'client', 'course', 'facture')
ORDER BY tablename, policyname;

-- 3. Vérifier la structure de la table utilisateur
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'utilisateur'
ORDER BY ordinal_position;