-- Configuration complète des politiques de sécurité pour TxApp
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Désactiver temporairement RLS pour configuration initiale
ALTER TABLE IF EXISTS public.utilisateur DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chauffeur DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vehicule DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Utilisateurs peuvent lire leurs propres données" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre l'inscription" ON public.utilisateur;
DROP POLICY IF EXISTS "Utilisateurs peuvent modifier leurs propres données" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre insertion pour anon" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre lecture pour anon" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre lecture pour authentification" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre mise à jour pour authentifiés" ON public.utilisateur;
DROP POLICY IF EXISTS "Chauffeurs accessibles aux authentifiés" ON public.chauffeur;
DROP POLICY IF EXISTS "Véhicules accessibles aux authentifiés" ON public.vehicule;
DROP POLICY IF EXISTS "Courses accessibles aux authentifiés" ON public.course;

-- 3. Créer un utilisateur de test admin si il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.utilisateur WHERE email = 'admin@taxi.be') THEN
        INSERT INTO public.utilisateur (
            type_utilisateur,
            nom,
            prenom,
            email,
            telephone,
            mot_de_passe,
            actif,
            date_creation,
            updated_at
        ) VALUES (
            'administrateur',
            'Admin',
            'Système',
            'admin@taxi.be',
            '+32 123 456 789',
            '$2a$12$LQv3c1yqBwEHFl.QX4K7Vee7NSJD.X9YcS4U.zKVJk1QeN1o3yYUa', -- password: password123
            true,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Utilisateur admin créé avec succès';
    ELSE
        RAISE NOTICE 'Utilisateur admin existe déjà';
    END IF;
END $$;

-- 4. Configurer les permissions pour les rôles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.utilisateur TO anon;

-- 5. Réactiver RLS avec des politiques permissives pour l'authentification
ALTER TABLE public.utilisateur ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture lors de l'authentification
CREATE POLICY "Permettre lecture pour authentification"
ON public.utilisateur FOR SELECT
TO anon, authenticated
USING (true);

-- Politique pour permettre l'inscription
CREATE POLICY "Permettre inscription"
ON public.utilisateur FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Politique pour permettre la mise à jour pour les utilisateurs authentifiés
CREATE POLICY "Permettre mise à jour pour authentifiés"
ON public.utilisateur FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Politiques pour les autres tables
-- Table chauffeur
ALTER TABLE IF EXISTS public.chauffeur ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chauffeurs accessibles aux authentifiés"
ON public.chauffeur FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Table vehicule
ALTER TABLE IF EXISTS public.vehicule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Véhicules accessibles aux authentifiés"
ON public.vehicule FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Table course
ALTER TABLE IF EXISTS public.course ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses accessibles aux authentifiés"
ON public.course FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Afficher les informations de l'utilisateur créé
SELECT
    'admin@taxi.be' as email,
    'password123' as password,
    'Utilisateur créé et prêt pour la connexion' as status;
