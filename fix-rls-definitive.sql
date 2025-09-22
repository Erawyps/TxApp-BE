-- CORRECTION DÉFINITIVE DES POLITIQUES RLS
-- À exécuter dans Supabase Dashboard > SQL Editor

-- NETTOYAGE COMPLET
DROP POLICY IF EXISTS "authenticated_users_access" ON utilisateur;
DROP POLICY IF EXISTS "authenticated_users_access" ON chauffeur;
DROP POLICY IF EXISTS "authenticated_users_access" ON vehicule;
DROP POLICY IF EXISTS "authenticated_users_access" ON client;
DROP POLICY IF EXISTS "authenticated_users_access" ON course;
DROP POLICY IF EXISTS "authenticated_users_access" ON facture;

-- DÉSACTIVER RLS TEMPORAIREMENT POUR DIAGNOSTIC
ALTER TABLE utilisateur DISABLE ROW LEVEL SECURITY;
ALTER TABLE chauffeur DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicule DISABLE ROW LEVEL SECURITY;
ALTER TABLE client DISABLE ROW LEVEL SECURITY;
ALTER TABLE course DISABLE ROW LEVEL SECURITY;
ALTER TABLE facture DISABLE ROW LEVEL SECURITY;

-- RÉACTIVER RLS SUR TOUTES LES TABLES
ALTER TABLE utilisateur ENABLE ROW LEVEL SECURITY;
ALTER TABLE chauffeur ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicule ENABLE ROW LEVEL SECURITY;
ALTER TABLE client ENABLE ROW LEVEL SECURITY;
ALTER TABLE course ENABLE ROW LEVEL SECURITY;
ALTER TABLE facture ENABLE ROW LEVEL SECURITY;

-- CRÉER LES POLITIQUES PERMISSIVES POUR LES UTILISATEURS AUTHENTIFIÉS
-- Politique permissive pour utilisateur (cohérente avec les autres tables)
CREATE POLICY "authenticated_users_access" ON utilisateur FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Politiques permissives pour les autres tables
CREATE POLICY "authenticated_users_access" ON chauffeur FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_users_access" ON vehicule FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_users_access" ON client FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_users_access" ON course FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_users_access" ON facture FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- VÉRIFICATION FINALE
SELECT
    'Table: ' || tablename || ' - RLS: ' || CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('utilisateur', 'chauffeur', 'vehicule', 'client', 'course', 'facture')
ORDER BY tablename;

SELECT
    tablename,
    policyname,
    roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('utilisateur', 'chauffeur', 'vehicule', 'client', 'course', 'facture')
ORDER BY tablename, policyname;