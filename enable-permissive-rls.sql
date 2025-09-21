-- Politique RLS permissive pour le développement
-- À exécuter dans Supabase Dashboard > SQL Editor

-- D'abord, s'assurer que RLS est activé
ALTER TABLE utilisateur ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Utilisateurs peuvent lire leurs propres données" ON utilisateur;
DROP POLICY IF EXISTS "Permettre l'inscription" ON utilisateur;
DROP POLICY IF EXISTS "Utilisateurs peuvent modifier leurs propres données" ON utilisateur;
DROP POLICY IF EXISTS "Permettre tous les accès en développement" ON utilisateur;

-- Créer une politique permissive pour le développement
CREATE POLICY "Permettre tous les accès en développement" ON utilisateur
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Vérifier que la politique a été créée
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'utilisateur';