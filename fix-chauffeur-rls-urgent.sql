-- Correction urgente des politiques RLS pour la table chauffeur
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer toutes les politiques existantes sur chauffeur
DROP POLICY IF EXISTS "Chauffeurs peuvent lire leurs données" ON chauffeur;
DROP POLICY IF EXISTS "Admins peuvent gérer les chauffeurs" ON chauffeur;
DROP POLICY IF EXISTS "chauffeur_select_policy" ON chauffeur;
DROP POLICY IF EXISTS "chauffeur_insert_policy" ON chauffeur;
DROP POLICY IF EXISTS "chauffeur_update_policy" ON chauffeur;
DROP POLICY IF EXISTS "chauffeur_delete_policy" ON chauffeur;

-- Désactiver puis réactiver RLS pour s'assurer qu'il est actif
ALTER TABLE chauffeur DISABLE ROW LEVEL SECURITY;
ALTER TABLE chauffeur ENABLE ROW LEVEL SECURITY;

-- Créer des politiques TRÈS permissives pour le développement
-- Permettre TOUTES les opérations SELECT pour tous les utilisateurs authentifiés
CREATE POLICY "allow_all_select_chauffeur" ON chauffeur
FOR SELECT TO authenticated
USING (true);

-- Permettre TOUTES les opérations INSERT pour tous les utilisateurs authentifiés
CREATE POLICY "allow_all_insert_chauffeur" ON chauffeur
FOR INSERT TO authenticated
WITH CHECK (true);

-- Permettre TOUTES les opérations UPDATE pour tous les utilisateurs authentifiés
CREATE POLICY "allow_all_update_chauffeur" ON chauffeur
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- Permettre TOUTES les opérations DELETE pour tous les utilisateurs authentifiés
CREATE POLICY "allow_all_delete_chauffeur" ON chauffeur
FOR DELETE TO authenticated
USING (true);

-- Vérifier que les politiques ont été créées
SELECT 'Politiques RLS chauffeur corrigées' as status,
       COUNT(*) as nombre_politiques
FROM pg_policies
WHERE tablename = 'chauffeur';

-- Tester l'accès (devrait retourner un résultat sans erreur)
SELECT COUNT(*) as test_acces_chauffeur FROM chauffeur;