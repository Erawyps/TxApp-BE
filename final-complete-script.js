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

async function applyAllPoliciesAtOnce() {
  console.log('🚀 APPLICATION FINALE DE TOUTES LES POLITIQUES RLS\n');

  const allPoliciesSQL = `
-- APPLICATION FINALE DE TOUTES LES POLITIQUES RLS
-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "authenticated_users_access" ON utilisateur;
DROP POLICY IF EXISTS "authenticated_users_access" ON chauffeur;
DROP POLICY IF EXISTS "authenticated_users_access" ON vehicule;
DROP POLICY IF EXISTS "authenticated_users_access" ON client;
DROP POLICY IF EXISTS "authenticated_users_access" ON course;
DROP POLICY IF EXISTS "authenticated_users_access" ON facture;

-- Activer RLS sur toutes les tables
ALTER TABLE utilisateur ENABLE ROW LEVEL SECURITY;
ALTER TABLE chauffeur ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicule ENABLE ROW LEVEL SECURITY;
ALTER TABLE client ENABLE ROW LEVEL SECURITY;
ALTER TABLE course ENABLE ROW LEVEL SECURITY;
ALTER TABLE facture ENABLE ROW LEVEL SECURITY;

-- Créer les politiques pour tous les utilisateurs authentifiés
CREATE POLICY "authenticated_users_access" ON utilisateur FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_users_access" ON chauffeur FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_users_access" ON vehicule FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_users_access" ON client FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_users_access" ON course FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_users_access" ON facture FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Vérification finale
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('utilisateur', 'chauffeur', 'vehicule', 'client', 'course', 'facture')
ORDER BY tablename, policyname;
`;

  console.log('📋 SCRIPT COMPLET À COPIER DANS SUPABASE:');
  console.log('=========================================\n');

  console.log('```sql');
  console.log(allPoliciesSQL.trim());
  console.log('```\n');

  console.log('📝 INSTRUCTIONS FINALES:');
  console.log('========================');
  console.log('1. Ouvrez Supabase Dashboard > SQL Editor');
  console.log('2. Créez une nouvelle requête');
  console.log('3. Copiez TOUT le script ci-dessus');
  console.log('4. Cliquez sur "Run"');
  console.log('5. Vous devriez voir "Success"');
  console.log('6. La vérification finale devrait afficher 6 politiques');
  console.log('');
  console.log('🎯 APRÈS EXÉCUTION:');
  console.log('- Toutes les politiques seront créées en une fois');
  console.log('- Plus besoin de commandes individuelles');
  console.log('- Testez ensuite: node verify-policies-direct.js');
  console.log('');
  console.log('✅ CETTE FOIS ÇA MARCHERA !');

  // Tester immédiatement après
  console.log('\n🧪 TEST IMMÉDIAT APRÈS APPLICATION:');
  console.log('===================================');
  console.log('Après avoir appliqué le script dans Supabase, exécutez:');
  console.log('node verify-policies-direct.js');
  console.log('');
  console.log('Toutes les tables devraient afficher "SUCCÈS" !');
}

applyAllPoliciesAtOnce();