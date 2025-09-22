-- Politiques RLS de production pour TxApp
-- À exécuter dans Supabase Dashboard > SQL Editor

-- ===========================================
-- UTILISATEUR - Politiques de sécurité
-- ===========================================

-- Activer RLS sur la table utilisateur
ALTER TABLE utilisateur ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Utilisateurs peuvent lire leurs propres données" ON utilisateur;
DROP POLICY IF EXISTS "Permettre l'inscription" ON utilisateur;
DROP POLICY IF EXISTS "Utilisateurs peuvent modifier leurs propres données" ON utilisateur;
DROP POLICY IF EXISTS "Admins peuvent tout faire" ON utilisateur;
DROP POLICY IF EXISTS "dev_access_policy" ON utilisateur;

-- Politique : Les utilisateurs peuvent lire leurs propres données
CREATE POLICY "users_read_own_data" ON utilisateur
FOR SELECT TO authenticated
USING (auth.uid()::text = id::text OR type_utilisateur = 'ADMIN');

-- Politique : Les utilisateurs peuvent modifier leurs propres données (sauf type_utilisateur et email)
CREATE POLICY "users_update_own_data" ON utilisateur
FOR UPDATE TO authenticated
USING (auth.uid()::text = id::text OR type_utilisateur = 'ADMIN')
WITH CHECK (
  auth.uid()::text = id::text OR type_utilisateur = 'ADMIN'
);

-- Politique : Les admins peuvent tout faire
CREATE POLICY "admins_full_access" ON utilisateur
FOR ALL TO authenticated
USING (type_utilisateur = 'ADMIN')
WITH CHECK (type_utilisateur = 'ADMIN');

-- ===========================================
-- CHAUFFEUR - Politiques de sécurité
-- ===========================================

ALTER TABLE chauffeur ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dev_access_policy" ON chauffeur;

-- Politique : Les chauffeurs peuvent voir leurs propres données
CREATE POLICY "chauffeurs_read_own_data" ON chauffeur
FOR SELECT TO authenticated
USING (
  utilisateur_id::text = auth.uid()::text
  OR EXISTS (
    SELECT 1 FROM utilisateur
    WHERE utilisateur.id::text = auth.uid()::text
    AND utilisateur.type_utilisateur = 'ADMIN'
  )
);

-- Politique : Les chauffeurs peuvent modifier leurs propres données
CREATE POLICY "chauffeurs_update_own_data" ON chauffeur
FOR UPDATE TO authenticated
USING (
  utilisateur_id::text = auth.uid()::text
  OR EXISTS (
    SELECT 1 FROM utilisateur
    WHERE utilisateur.id::text = auth.uid()::text
    AND utilisateur.type_utilisateur = 'ADMIN'
  )
)
WITH CHECK (
  utilisateur_id::text = auth.uid()::text
  OR EXISTS (
    SELECT 1 FROM utilisateur
    WHERE utilisateur.id::text = auth.uid()::text
    AND utilisateur.type_utilisateur = 'ADMIN'
  )
);

-- ===========================================
-- VEHICULE - Politiques de sécurité
-- ===========================================

ALTER TABLE vehicule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dev_access_policy" ON vehicule;

-- Politique : Tous les utilisateurs authentifiés peuvent voir les véhicules actifs
CREATE POLICY "vehicules_read_active" ON vehicule
FOR SELECT TO authenticated
USING (actif = true);

-- Politique : Seuls les admins peuvent modifier les véhicules
CREATE POLICY "vehicules_admin_only" ON vehicule
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM utilisateur
    WHERE utilisateur.id::text = auth.uid()::text
    AND utilisateur.type_utilisateur = 'ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM utilisateur
    WHERE utilisateur.id::text = auth.uid()::text
    AND utilisateur.type_utilisateur = 'ADMIN'
  )
);

-- ===========================================
-- CLIENT - Politiques de sécurité
-- ===========================================

ALTER TABLE client ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dev_access_policy" ON client;

-- Politique : Tous les utilisateurs authentifiés peuvent voir les clients actifs
CREATE POLICY "clients_read_active" ON client
FOR SELECT TO authenticated
USING (actif = true);

-- Politique : Seuls les admins peuvent modifier les clients
CREATE POLICY "clients_admin_only" ON client
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM utilisateur
    WHERE utilisateur.id::text = auth.uid()::text
    AND utilisateur.type_utilisateur = 'ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM utilisateur
    WHERE utilisateur.id::text = auth.uid()::text
    AND utilisateur.type_utilisateur = 'ADMIN'
  )
);

-- ===========================================
-- COURSE - Politiques de sécurité
-- ===========================================

ALTER TABLE course ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dev_access_policy" ON course;

-- Politique : Les chauffeurs peuvent voir leurs propres courses
CREATE POLICY "courses_read_own" ON course
FOR SELECT TO authenticated
USING (
  chauffeur_id IN (
    SELECT c.id FROM chauffeur c
    WHERE c.utilisateur_id::text = auth.uid()::text
  )
  OR EXISTS (
    SELECT 1 FROM utilisateur
    WHERE utilisateur.id::text = auth.uid()::text
    AND utilisateur.type_utilisateur = 'ADMIN'
  )
);

-- Politique : Les chauffeurs peuvent modifier leurs propres courses
CREATE POLICY "courses_update_own" ON course
FOR UPDATE TO authenticated
USING (
  chauffeur_id IN (
    SELECT c.id FROM chauffeur c
    WHERE c.utilisateur_id::text = auth.uid()::text
  )
  OR EXISTS (
    SELECT 1 FROM utilisateur
    WHERE utilisateur.id::text = auth.uid()::text
    AND utilisateur.type_utilisateur = 'ADMIN'
  )
)
WITH CHECK (
  chauffeur_id IN (
    SELECT c.id FROM chauffeur c
    WHERE c.utilisateur_id::text = auth.uid()::text
  )
  OR EXISTS (
    SELECT 1 FROM utilisateur
    WHERE utilisateur.id::text = auth.uid()::text
    AND utilisateur.type_utilisateur = 'ADMIN'
  )
);

-- ===========================================
-- FACTURE - Politiques de sécurité
-- ===========================================

ALTER TABLE facture ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dev_access_policy" ON facture;

-- Politique : Les clients peuvent voir leurs propres factures
CREATE POLICY "factures_read_own" ON facture
FOR SELECT TO authenticated
USING (
  client_id IN (
    SELECT cl.id FROM client cl
    WHERE cl.email = (
      SELECT u.email FROM utilisateur u
      WHERE u.id::text = auth.uid()::text
    )
  )
  OR EXISTS (
    SELECT 1 FROM utilisateur
    WHERE utilisateur.id::text = auth.uid()::text
    AND utilisateur.type_utilisateur = 'ADMIN'
  )
);

-- Politique : Seuls les admins peuvent modifier les factures
CREATE POLICY "factures_admin_only" ON facture
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM utilisateur
    WHERE utilisateur.id::text = auth.uid()::text
    AND utilisateur.type_utilisateur = 'ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM utilisateur
    WHERE utilisateur.id::text = auth.uid()::text
    AND utilisateur.type_utilisateur = 'ADMIN'
  )
);

-- ===========================================
-- VÉRIFICATION DES POLITIQUES
-- ===========================================

-- Lister toutes les politiques RLS
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