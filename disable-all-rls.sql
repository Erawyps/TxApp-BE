-- Script pour désactiver RLS sur toutes les tables pour le développement
-- À exécuter dans Supabase Dashboard > SQL Editor

-- Désactiver RLS sur les tables principales
ALTER TABLE chauffeur DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicule DISABLE ROW LEVEL SECURITY;
ALTER TABLE client DISABLE ROW LEVEL SECURITY;
ALTER TABLE course DISABLE ROW LEVEL SECURITY;
ALTER TABLE facture DISABLE ROW LEVEL SECURITY;

-- Vérifier que RLS est désactivé
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('utilisateur', 'chauffeur', 'vehicule', 'client', 'course', 'facture')
ORDER BY tablename;