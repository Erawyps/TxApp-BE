-- DIAGNOSTIC UTILISATEUR 16 ET DONNÉES CHAUFFEUR
-- À exécuter dans Supabase Dashboard > SQL Editor

-- 1. Vérifier si l'utilisateur 16 existe
SELECT id, email, nom, prenom, type_utilisateur, actif
FROM utilisateur
WHERE id = 16;

-- 2. Vérifier si l'utilisateur 16 a un chauffeur associé
SELECT c.id, c.nom, c.prenom, c.utilisateur_id, c.actif, u.email, u.type_utilisateur
FROM chauffeur c
LEFT JOIN utilisateur u ON c.utilisateur_id = u.id
WHERE c.utilisateur_id = 16;

-- 3. Vérifier tous les chauffeurs actifs
SELECT c.id, c.nom, c.prenom, c.utilisateur_id, c.actif, u.email
FROM chauffeur c
LEFT JOIN utilisateur u ON c.utilisateur_id = u.id
WHERE c.actif = true
ORDER BY c.id;

-- 4. Vérifier les politiques RLS actuelles
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('utilisateur', 'chauffeur')
ORDER BY tablename, policyname;

-- 5. Tester la requête exacte qui échoue dans l'application
-- (Simulation de ce que fait l'app)
SELECT id, nom, prenom, numero_permis, taux_commission, salaire_base, actif
FROM chauffeur
WHERE utilisateur_id = 16 AND actif = true;