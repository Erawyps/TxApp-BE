-- Disable RLS for feuille_route table to allow authenticated access
-- Since GRANT ALL ON ALL TABLES is given to authenticated users

ALTER TABLE public.feuille_route DISABLE ROW LEVEL SECURITY;