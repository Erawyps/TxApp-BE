-- DIAGNOSTIC COMPLET des politiques RLS et accès chauffeur
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. État actuel des politiques RLS sur chauffeur
SELECT '=== POLITIQUES RLS ACTUELLES ===' as section;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'chauffeur' AND schemaname = 'public'
ORDER BY policyname;

-- 2. État RLS de la table chauffeur
SELECT '=== ÉTAT RLS TABLE CHAUFFEUR ===' as section;
SELECT schemaname, tablename, rowsecurity as rls_active
FROM pg_tables
WHERE tablename = 'chauffeur' AND schemaname = 'public';

-- 3. Permissions sur la table chauffeur
SELECT '=== PERMISSIONS TABLE CHAUFFEUR ===' as section;
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'chauffeur' AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 4. Contenu de la table chauffeur
SELECT '=== CONTENU TABLE CHAUFFEUR ===' as section;
SELECT c.id, c.utilisateur_id, c.numero_badge, c.actif,
       u.email, u.nom, u.prenom, u.type_utilisateur
FROM chauffeur c
LEFT JOIN utilisateur u ON c.utilisateur_id = u.id
ORDER BY c.id;

-- 5. Utilisateurs actifs
SELECT '=== UTILISATEURS ACTIFS ===' as section;
SELECT id, email, nom, prenom, type_utilisateur, actif, date_creation
FROM utilisateur
WHERE actif = true
ORDER BY id;

-- 6. Test d'accès direct (devrait fonctionner)
SELECT '=== TEST ACCÈS DIRECT ===' as section;
SELECT COUNT(*) as total_chauffeurs,
       COUNT(CASE WHEN actif = true THEN 1 END) as chauffeurs_actifs
FROM chauffeur;

-- 7. Vérifier l'utilisateur 244 spécifiquement
SELECT '=== UTILISATEUR 244 ===' as section;
SELECT id, email, nom, prenom, type_utilisateur, actif
FROM utilisateur
WHERE id = 244;

-- 8. Vérifier si l'utilisateur 244 a un chauffeur
SELECT '=== CHAUFFEUR UTILISATEUR 244 ===' as section;
SELECT c.*, u.email
FROM chauffeur c
LEFT JOIN utilisateur u ON c.utilisateur_id = u.id
WHERE c.utilisateur_id = 244;

-- 9. SI LES POLITIQUES SONT MANQUANTES, LES RECRÉER
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'chauffeur' AND schemaname = 'public';

    IF policy_count = 0 THEN
        RAISE NOTICE 'Aucune politique trouvée, recréation...';

        -- Supprimer tout et recréer
        ALTER TABLE chauffeur DISABLE ROW LEVEL SECURITY;
        ALTER TABLE chauffeur ENABLE ROW LEVEL SECURITY;

        -- Politique permissive pour le développement
        CREATE POLICY "dev_allow_all_chauffeur" ON chauffeur
        FOR ALL TO authenticated
        USING (true)
        WITH CHECK (true);

        RAISE NOTICE 'Politiques recréées avec succès';
    ELSE
        RAISE NOTICE 'Politiques déjà présentes: %', policy_count;
    END IF;
END $$;

-- 10. Test final d'accès
SELECT '=== TEST FINAL ===' as section,
       'Accès réussi à la table chauffeur' as status;