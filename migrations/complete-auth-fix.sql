-- Script final de résolution complète du problème d'authentification
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Désactiver RLS temporairement
ALTER TABLE public.utilisateur DISABLE ROW LEVEL SECURITY;

-- 2. Nettoyer les doublons éventuels de l'utilisateur admin
DELETE FROM public.utilisateur WHERE email = 'admin@taxi.be';

-- 3. Créer l'utilisateur admin avec le bon hash bcrypt et le bon type
INSERT INTO public.utilisateur (
    email,
    mot_de_passe,
    nom,
    prenom,
    telephone,
    type_utilisateur,
    actif,
    date_creation,
    updated_at
) VALUES (
    'admin@taxi.be',
    '$2b$12$5uwbtgleugv1sy/tlKR1Ruv8f6NCcOCZolsytgJOTQgZuQX6RxOQ.',
    'Admin',
    'Système',
    '+32 123 456 789',
    'ADMIN',
    true,
    NOW(),
    NOW()
);

-- 4. Vérifier la création
SELECT
    id,
    email,
    nom,
    prenom,
    type_utilisateur,
    actif,
    'Utilisateur admin créé avec type ADMIN' as status
FROM public.utilisateur
WHERE email = 'admin@taxi.be';

-- 5. Réactiver RLS avec les bonnes politiques
ALTER TABLE public.utilisateur ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Allow select for auth" ON public.utilisateur;
DROP POLICY IF EXISTS "Allow update for auth" ON public.utilisateur;
DROP POLICY IF EXISTS "Allow insert for registration" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre lecture pour authentification" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre inscription" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre mise à jour pour authentifiés" ON public.utilisateur;
DROP POLICY IF EXISTS "auth_select_policy" ON public.utilisateur;
DROP POLICY IF EXISTS "auth_insert_policy" ON public.utilisateur;
DROP POLICY IF EXISTS "auth_update_policy" ON public.utilisateur;

-- Créer les nouvelles politiques simples et efficaces
CREATE POLICY "auth_select_policy"
ON public.utilisateur FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "auth_insert_policy"
ON public.utilisateur FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "auth_update_policy"
ON public.utilisateur FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Garantir les permissions
GRANT SELECT, INSERT, UPDATE ON public.utilisateur TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE utilisateur_id_seq TO anon, authenticated;

-- 7. Confirmation finale
SELECT
    'admin@taxi.be' as email,
    'password123' as password,
    'Type ADMIN - Configuration terminée' as status;
