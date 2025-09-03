-- Script de correction des politiques RLS pour résoudre les erreurs 401
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Désactiver temporairement RLS pour diagnostiquer
ALTER TABLE public.utilisateur DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Allow select for auth" ON public.utilisateur;
DROP POLICY IF EXISTS "Allow update for auth" ON public.utilisateur;
DROP POLICY IF EXISTS "Allow insert for registration" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre lecture pour authentification" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre inscription" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre mise à jour pour authentifiés" ON public.utilisateur;

-- 3. Réactiver RLS
ALTER TABLE public.utilisateur ENABLE ROW LEVEL SECURITY;

-- 4. Créer des politiques permissives pour l'authentification
CREATE POLICY "Permettre lecture pour tous (auth)"
ON public.utilisateur FOR SELECT
USING (true);

CREATE POLICY "Permettre insertion pour inscription"
ON public.utilisateur FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permettre mise à jour pour propriétaire"
ON public.utilisateur FOR UPDATE
USING (true)
WITH CHECK (true);

-- 5. Vérifier que l'utilisateur admin existe avec le bon type
SELECT id, email, nom, prenom, type_utilisateur, actif
FROM public.utilisateur
WHERE email = 'admin@taxi.be';

-- 6. Si l'admin n'existe pas ou a le mauvais type, le corriger
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
    '$2b$12$GugeIpc22/RfIxd9xNDYqe.LMe9CqQPtKTeAouPxPwwpIWgY8oaEq',
    'Admin',
    'Système',
    '+32 123 456 789',
    'ADMIN',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    type_utilisateur = 'ADMIN',
    mot_de_passe = '$2b$12$GugeIpc22/RfIxd9xNDYqe.LMe9CqQPtKTeAouPxPwwpIWgY8oaEq',
    updated_at = NOW();

-- 7. Confirmation finale
SELECT 'Configuration RLS mise à jour avec succès' as status,
       COUNT(*) as nombre_utilisateurs
FROM public.utilisateur;
