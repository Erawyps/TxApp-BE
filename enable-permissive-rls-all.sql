-- Script pour réactiver RLS avec politiques permissives pour le développement
-- À exécuter dans Supabase Dashboard > SQL Editor

-- Réactiver RLS sur toutes les tables
ALTER TABLE chauffeur ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicule ENABLE ROW LEVEL SECURITY;
ALTER TABLE client ENABLE ROW LEVEL SECURITY;
ALTER TABLE course ENABLE ROW LEVEL SECURITY;
ALTER TABLE facture ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "dev_access_policy" ON chauffeur;
DROP POLICY IF EXISTS "dev_access_policy" ON vehicule;
DROP POLICY IF EXISTS "dev_access_policy" ON client;
DROP POLICY IF EXISTS "dev_access_policy" ON course;
DROP POLICY IF EXISTS "dev_access_policy" ON facture;

-- Créer des politiques permissives pour le développement
CREATE POLICY "dev_access_policy" ON chauffeur FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_policy" ON vehicule FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_policy" ON client FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_policy" ON course FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_policy" ON facture FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Vérifier les politiques créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('chauffeur', 'vehicule', 'client', 'course', 'facture')
ORDER BY tablename, policyname;