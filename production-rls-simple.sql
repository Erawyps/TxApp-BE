-- Politiques RLS de production simplifiées pour TxApp
-- Compatible avec l'authentification JWT locale
-- À exécuter dans Supabase Dashboard > SQL Editor

-- ===========================================
-- APPROCHE SIMPLIFIÉE : Permettre l'accès aux utilisateurs authentifiés
-- La sécurité réelle est gérée au niveau application
-- ===========================================

-- Activer RLS sur toutes les tables
ALTER TABLE utilisateur ENABLE ROW LEVEL SECURITY;
ALTER TABLE chauffeur ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicule ENABLE ROW LEVEL SECURITY;
ALTER TABLE client ENABLE ROW LEVEL SECURITY;
ALTER TABLE course ENABLE ROW LEVEL SECURITY;
ALTER TABLE facture ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Utilisateurs peuvent lire leurs propres données" ON utilisateur;
DROP POLICY IF EXISTS "Permettre l'inscription" ON utilisateur;
DROP POLICY IF EXISTS "Utilisateurs peuvent modifier leurs propres données" ON utilisateur;
DROP POLICY IF EXISTS "Admins peuvent tout faire" ON utilisateur;
DROP POLICY IF EXISTS "dev_access_policy" ON utilisateur;
DROP POLICY IF EXISTS "users_read_own_data" ON utilisateur;
DROP POLICY IF EXISTS "users_update_own_data" ON utilisateur;
DROP POLICY IF EXISTS "admins_full_access" ON utilisateur;

DROP POLICY IF EXISTS "dev_access_policy" ON chauffeur;
DROP POLICY IF EXISTS "chauffeurs_read_own_data" ON chauffeur;
DROP POLICY IF EXISTS "chauffeurs_update_own_data" ON chauffeur;

DROP POLICY IF EXISTS "dev_access_policy" ON vehicule;
DROP POLICY IF EXISTS "vehicules_read_active" ON vehicule;
DROP POLICY IF EXISTS "vehicules_admin_only" ON vehicule;

DROP POLICY IF EXISTS "dev_access_policy" ON client;
DROP POLICY IF EXISTS "clients_read_active" ON client;
DROP POLICY IF EXISTS "clients_admin_only" ON client;

DROP POLICY IF EXISTS "dev_access_policy" ON course;
DROP POLICY IF EXISTS "courses_read_own" ON course;
DROP POLICY IF EXISTS "courses_update_own" ON course;

DROP POLICY IF EXISTS "dev_access_policy" ON facture;
DROP POLICY IF EXISTS "factures_read_own" ON facture;
DROP POLICY IF EXISTS "factures_admin_only" ON facture;

-- ===========================================
-- POLITIQUES PERMISSIVES POUR PRODUCTION
-- ===========================================

-- Politique universelle : Permettre tous les accès aux utilisateurs authentifiés
-- La sécurité est gérée au niveau application via les contrôleurs et middlewares

CREATE POLICY "authenticated_users_access" ON utilisateur
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_users_access" ON chauffeur
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_users_access" ON vehicule
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_users_access" ON client
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_users_access" ON course
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_users_access" ON facture
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- ===========================================
-- POLITIQUES POUR UTILISATEURS ANONYMES (LECTURE SEULE)
-- ===========================================

-- Permettre la lecture anonyme des données publiques si nécessaire
-- (désactiver si vous voulez tout protéger)

-- CREATE POLICY "anonymous_read_public_data" ON vehicule
-- FOR SELECT TO anon
-- USING (actif = true);

-- CREATE POLICY "anonymous_read_public_data" ON client
-- FOR SELECT TO anon
-- USING (actif = true);

-- ===========================================
-- VÉRIFICATION
-- ===========================================

-- Lister toutes les politiques RLS actives
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
ORDER BY tablename, policyname;

-- Vérifier l'état RLS des tables
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('utilisateur', 'chauffeur', 'vehicule', 'client', 'course', 'facture')
ORDER BY tablename;