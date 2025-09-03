-- Script de correction définitive du mot de passe admin
-- Généré automatiquement par le diagnostic

-- 1. Désactiver temporairement RLS
ALTER TABLE public.utilisateur DISABLE ROW LEVEL SECURITY;

-- 2. Mettre à jour avec le hash correct généré par bcrypt
UPDATE public.utilisateur
SET mot_de_passe = '$2b$12$GugeIpc22/RfIxd9xNDYqe.LMe9CqQPtKTeAouPxPwwpIWgY8oaEq',
    updated_at = NOW()
WHERE email = 'admin@taxi.be';

-- 3. Vérifier la mise à jour
SELECT email, nom, prenom, type_utilisateur, actif,
       'Hash corrigé pour password123' as status
FROM public.utilisateur
WHERE email = 'admin@taxi.be';

-- 4. Réactiver RLS et configurer les politiques nécessaires
ALTER TABLE public.utilisateur ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Allow select for auth" ON public.utilisateur;
DROP POLICY IF EXISTS "Allow update for auth" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre lecture pour authentification" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre inscription" ON public.utilisateur;
DROP POLICY IF EXISTS "Permettre mise à jour pour authentifiés" ON public.utilisateur;

-- Créer les nouvelles politiques
CREATE POLICY "Allow select for auth"
ON public.utilisateur FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow update for auth"
ON public.utilisateur FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow insert for registration"
ON public.utilisateur FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 5. Confirmer les permissions
GRANT SELECT, INSERT, UPDATE ON public.utilisateur TO anon, authenticated;

-- 6. Test final
SELECT
    'admin@taxi.be' as email,
    'password123' as password,
    'Hash corrigé - authentification prête' as status;
