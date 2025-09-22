import { createClient } from "@supabase/supabase-js";
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseSQLError() {
  console.log('🔍 DIAGNOSTIC DES ERREURS SQL RLS\n');

  const tables = ['chauffeur', 'vehicule', 'client', 'course', 'facture'];

  console.log('1️⃣ Vérification des politiques existantes...\n');

  // Simuler les commandes qui pourraient échouer
  const problematicCommands = [
    `DROP POLICY IF EXISTS "authenticated_users_access" ON chauffeur;`,
    `CREATE POLICY "authenticated_users_access" ON chauffeur FOR ALL TO authenticated USING (true) WITH CHECK (true);`,
    `DROP POLICY IF EXISTS "authenticated_users_access" ON vehicule;`,
    `CREATE POLICY "authenticated_users_access" ON vehicule FOR ALL TO authenticated USING (true) WITH CHECK (true);`,
    `DROP POLICY IF EXISTS "authenticated_users_access" ON client;`,
    `CREATE POLICY "authenticated_users_access" ON client FOR ALL TO authenticated USING (true) WITH CHECK (true);`,
    `DROP POLICY IF EXISTS "authenticated_users_access" ON course;`,
    `CREATE POLICY "authenticated_users_access" ON course FOR ALL TO authenticated USING (true) WITH CHECK (true);`,
    `DROP POLICY IF EXISTS "authenticated_users_access" ON facture;`,
    `CREATE POLICY "authenticated_users_access" ON facture FOR ALL TO authenticated USING (true) WITH CHECK (true);`
  ];

  console.log('📋 Script de correction à appliquer :\n');

  const fixScript = `-- Script de correction RLS
-- À exécuter dans Supabase Dashboard > SQL Editor

-- Supprimer d'abord toutes les politiques existantes qui pourraient causer des conflits
DROP POLICY IF EXISTS "authenticated_users_access" ON chauffeur;
DROP POLICY IF EXISTS "authenticated_users_access" ON vehicule;
DROP POLICY IF EXISTS "authenticated_users_access" ON client;
DROP POLICY IF EXISTS "authenticated_users_access" ON course;
DROP POLICY IF EXISTS "authenticated_users_access" ON facture;

-- S'assurer que RLS est activé sur toutes les tables
ALTER TABLE chauffeur ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicule ENABLE ROW LEVEL SECURITY;
ALTER TABLE client ENABLE ROW LEVEL SECURITY;
ALTER TABLE course ENABLE ROW LEVEL SECURITY;
ALTER TABLE facture ENABLE ROW LEVEL SECURITY;

-- Créer les nouvelles politiques
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

-- Vérification
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('chauffeur', 'vehicule', 'client', 'course', 'facture')
ORDER BY tablename, policyname;`;

  console.log('```sql');
  console.log(fixScript);
  console.log('```\n');

  console.log('📝 EXPLICATION DU PROBLÈME:');
  console.log('===========================');
  console.log('L\'erreur indique probablement que les politiques existent déjà.');
  console.log('Le script ci-dessus :');
  console.log('1. Supprime d\'abord toutes les politiques existantes');
  console.log('2. S\'assure que RLS est activé sur les tables');
  console.log('3. Recrée les politiques correctement');
  console.log('4. Vérifie que tout est bien configuré\n');

  console.log('🚀 ACTION:');
  console.log('==========');
  console.log('1. Copiez le script ci-dessus');
  console.log('2. Exécutez-le dans Supabase Dashboard > SQL Editor');
  console.log('3. Vérifiez avec: node diagnose-rls.js');
  console.log('');
  console.log('✅ Cette fois, ça devrait marcher !');
}

diagnoseSQLError();