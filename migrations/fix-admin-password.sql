-- Script pour corriger le mot de passe de l'utilisateur admin
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Désactiver temporairement RLS pour permettre la mise à jour
ALTER TABLE public.utilisateur DISABLE ROW LEVEL SECURITY;

-- 2. Mettre à jour le mot de passe de l'utilisateur admin avec le bon hash
-- Hash généré pour "password123" avec bcrypt rounds=12
UPDATE public.utilisateur
SET mot_de_passe = '$2b$12$LQv3c1yqBwEHFl.QX4K7Vee7NSJD.X9YcS4U.zKVJk1QeN1o3yYUa',
    updated_at = NOW()
WHERE email = 'admin@taxi.be';

-- 3. Vérifier que la mise à jour a fonctionné
SELECT
    id,
    email,
    nom,
    prenom,
    type_utilisateur,
    actif,
    'Mot de passe mis à jour pour password123' as status
FROM public.utilisateur
WHERE email = 'admin@taxi.be';

-- 4. Réactiver RLS avec les bonnes politiques
ALTER TABLE public.utilisateur ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Permettre lecture pour authentification" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre inscription" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre mise à jour pour authentifiés" ON public.utilisateur;

-- Recréer les politiques permissives
CREATE POLICY "Permettre lecture pour authentification"
ON public.utilisateur FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Permettre inscription"
ON public.utilisateur FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Permettre mise à jour pour authentifiés"
ON public.utilisateur FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Confirmer les permissions
GRANT SELECT, INSERT, UPDATE ON public.utilisateur TO anon, authenticated;

-- 6. Message de confirmation
SELECT
    'admin@taxi.be' as email,
    'password123' as password,
    'Utilisateur prêt pour la connexion' as status;
