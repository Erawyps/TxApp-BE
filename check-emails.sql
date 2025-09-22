-- Vérifier les emails existants dans la base de données
-- À exécuter dans l'éditeur SQL de Supabase

-- Lister tous les emails existants
SELECT '=== EMAILS EXISTANTS ===' as section;
SELECT id, email, nom, prenom, type_utilisateur, actif
FROM utilisateur
WHERE email IS NOT NULL AND email != ''
ORDER BY email;

-- Vérifier si l'utilisateur 244 existe et son email actuel
SELECT '=== UTILISATEUR 244 ===' as section;
SELECT id, email, nom, prenom, type_utilisateur, actif
FROM utilisateur
WHERE id = 244;

-- Compter les utilisateurs par domaine d'email
SELECT '=== STATISTIQUES EMAILS ===' as section;
SELECT
    COUNT(*) as total_utilisateurs,
    COUNT(DISTINCT email) as emails_uniques,
    COUNT(CASE WHEN email LIKE '%@gmail.com' THEN 1 END) as emails_gmail,
    COUNT(CASE WHEN email LIKE '%@hotmail.com' THEN 1 END) as emails_hotmail,
    COUNT(CASE WHEN email LIKE '%@outlook.com' THEN 1 END) as emails_outlook
FROM utilisateur
WHERE email IS NOT NULL AND email != '';

-- Suggérer des emails disponibles (pour test)
SELECT '=== SUGGESTIONS D\'EMAILS DISPONIBLES ===' as section;
SELECT 'test@example.com' as suggestion_1,
       'demo@example.com' as suggestion_2,
       'user@example.com' as suggestion_3,
       'admin@example.com' as suggestion_4;