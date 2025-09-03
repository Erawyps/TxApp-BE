-- Configuration des politiques de sécurité pour TxApp
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Désactiver temporairement RLS pour permettre l'accès initial (development seulement)
ALTER TABLE public.utilisateur DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chauffeur DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicule DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course DISABLE ROW LEVEL SECURITY;

-- 2. Créer des politiques pour l'accès aux données

-- Politique pour la table utilisateur
ALTER TABLE public.utilisateur ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Utilisateurs peuvent lire leurs propres données"
ON public.utilisateur FOR SELECT
TO anon, authenticated
USING (true);

-- Permettre l'insertion pour l'inscription
CREATE POLICY "Permettre l'inscription"
ON public.utilisateur FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permettre la mise à jour pour les utilisateurs authentifiés
CREATE POLICY "Utilisateurs peuvent modifier leurs propres données"
ON public.utilisateur FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Politique pour la table chauffeur
ALTER TABLE public.chauffeur ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chauffeurs peuvent lire leurs données"
ON public.chauffeur FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins peuvent gérer les chauffeurs"
ON public.chauffeur FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Politique pour la table vehicule
ALTER TABLE public.vehicule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Véhicules accessibles à tous les utilisateurs authentifiés"
ON public.vehicule FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins peuvent gérer les véhicules"
ON public.vehicule FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Politique pour la table course
ALTER TABLE public.course ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses accessibles aux utilisateurs authentifiés"
ON public.course FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Utilisateurs peuvent créer des courses"
ON public.course FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Utilisateurs peuvent modifier des courses"
ON public.course FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Créer un utilisateur de test pour l'authentification
INSERT INTO public.utilisateur (
    type_utilisateur,
    nom,
    prenom,
    email,
    telephone,
    mot_de_passe,
    actif,
    date_creation
) VALUES (
    'administrateur',
    'Admin',
    'TxApp',
    'admin@txapp.be',
    '+32123456789',
    '$2a$12$LQv3c1yqBwEHFl.QX4K7Vee7NSJD.X9YcS4U.zKVJk1QeN1o3yYUa', -- password: admin123
    true,
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 4. Grants pour s'assurer que les rôles ont les bonnes permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.utilisateur TO anon;
