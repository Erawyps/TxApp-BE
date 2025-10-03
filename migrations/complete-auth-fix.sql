-- Script final de résolution complète du problème d'authentification
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Désactiver RLS temporairement
ALTER TABLE public.utilisateur DISABLE ROW LEVEL SECURITY;

-- 2. Nettoyer les utilisateurs existants
DELETE FROM public.utilisateur WHERE email IN ('admin@taxi.be', 'chauffeur@taxi.be');

-- 3. Créer l'utilisateur admin avec le bon hash bcrypt et le bon type
INSERT INTO public.utilisateur (
    societe_id,
    email,
    mot_de_passe_hashe,
    nom,
    prenom,
    role,
    created_at,
    updated_at
) VALUES (
    1, -- societe_id par défaut
    'admin@taxi.be',
    '$2b$12$5uwbtgleugv1sy/tlKR1Ruv8f6NCcOCZolsytgJOTQgZuQX6RxOQ.',
    'Admin',
    'Système',
    'Admin',
    NOW(),
    NOW()
);

-- 4. Créer un utilisateur chauffeur de test
INSERT INTO public.utilisateur (
    societe_id,
    email,
    mot_de_passe_hashe,
    nom,
    prenom,
    role,
    created_at,
    updated_at
) VALUES (
    1, -- societe_id par défaut
    'chauffeur@taxi.be',
    '$2b$12$5uwbtgleugv1sy/tlKR1Ruv8f6NCcOCZolsytgJOTQgZuQX6RxOQ.', -- Même mot de passe que admin
    'Dupont',
    'Jean',
    'Chauffeur',
    NOW(),
    NOW()
);

-- 5. Créer l'entrée chauffeur correspondante
INSERT INTO public.chauffeur (
    chauffeur_id,
    societe_id,
    statut,
    created_at
) VALUES (
    (SELECT user_id FROM public.utilisateur WHERE email = 'chauffeur@taxi.be'),
    1,
    'Actif',
    NOW()
);

-- 6. Vérifier la création
SELECT
    u.user_id,
    u.email,
    u.nom,
    u.prenom,
    u.role,
    c.chauffeur_id,
    'Utilisateur créé avec succès' as status
FROM public.utilisateur u
LEFT JOIN public.chauffeur c ON u.user_id = c.chauffeur_id
WHERE u.email IN ('admin@taxi.be', 'chauffeur@taxi.be');

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
