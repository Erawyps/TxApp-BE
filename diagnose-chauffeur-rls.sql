-- Diagnostic des politiques RLS pour la table chauffeur
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier si RLS est activé sur la table chauffeur
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'chauffeur' AND schemaname = 'public';

-- 2. Lister toutes les politiques actuelles sur la table chauffeur
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'chauffeur' AND schemaname = 'public';

-- 3. Vérifier les permissions sur la table chauffeur
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'chauffeur' AND table_schema = 'public';

-- 4. Tester l'accès direct à la table chauffeur (devrait fonctionner si politiques correctes)
SELECT COUNT(*) as nombre_chauffeurs FROM public.chauffeur;

-- 5. Vérifier si l'utilisateur 16 existe et ses données
SELECT id, email, nom, prenom, type_utilisateur, actif
FROM public.utilisateur
WHERE id = 16;

-- 6. Vérifier si l'utilisateur 16 a un enregistrement chauffeur
SELECT c.*, u.email, u.nom, u.prenom
FROM public.chauffeur c
LEFT JOIN public.utilisateur u ON c.utilisateur_id = u.id
WHERE c.utilisateur_id = 16;

-- 7. SI les politiques sont manquantes, les recréer
-- Supprimer les anciennes politiques s'il y en a
DROP POLICY IF EXISTS "Chauffeurs peuvent lire leurs données" ON public.chauffeur;
DROP POLICY IF EXISTS "Admins peuvent gérer les chauffeurs" ON public.chauffeur;

-- Recréer les politiques permissives
CREATE POLICY "Chauffeurs peuvent lire leurs données"
ON public.chauffeur FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins peuvent gérer les chauffeurs"
ON public.chauffeur FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 8. Vérifier que les politiques ont été créées
SELECT 'Politiques RLS recréées pour chauffeur' as status,
       COUNT(*) as nombre_politiques
FROM pg_policies
WHERE tablename = 'chauffeur' AND schemaname = 'public';