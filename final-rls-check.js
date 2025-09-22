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

async function checkExistingPolicies() {
  console.log('🔍 VÉRIFICATION DES POLITIQUES EXISTANTES\n');

  const tables = ['chauffeur', 'vehicule', 'client', 'course', 'facture'];

  console.log('📋 POLITIQUES À VÉRIFIER:');
  console.log('=========================\n');

  for (const table of tables) {
    console.log(`🔍 Table: ${table}`);

    try {
      // Tester si on peut lire (politique SELECT)
      const { error: readError } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (readError) {
        console.log(`   ❌ Aucune politique de lecture active`);
        console.log(`   📝 Il faut créer: CREATE POLICY "authenticated_users_access" ON ${table} FOR SELECT TO authenticated USING (true);`);
      } else {
        console.log(`   ✅ Politique de lecture OK`);
      }

      // Tester si on peut écrire (politique INSERT/UPDATE/DELETE)
      let writeTestCondition = {};
      if (table === 'chauffeur') writeTestCondition = { utilisateur_id: 244 };

      if (Object.keys(writeTestCondition).length > 0) {
        const { error: writeError } = await supabase
          .from(table)
          .update({ updated_at: new Date().toISOString() })
          .match(writeTestCondition);

        if (writeError) {
          console.log(`   ❌ Aucune politique d'écriture active`);
          console.log(`   📝 Il faut créer: CREATE POLICY "authenticated_users_access" ON ${table} FOR ALL TO authenticated USING (true) WITH CHECK (true);`);
        } else {
          console.log(`   ✅ Politique d'écriture OK`);
        }
      }

    } catch (err) {
      console.log(`   ❌ Erreur: ${err.message}`);
    }

    console.log('');
  }

  console.log('🔧 SCRIPT DE CORRECTION FINAL:');
  console.log('==============================\n');

  const finalScript = `-- CORRECTION FINALE RLS - Script complet
-- À exécuter dans Supabase Dashboard > SQL Editor

-- 1. Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "authenticated_users_access" ON chauffeur;
DROP POLICY IF EXISTS "authenticated_users_access" ON vehicule;
DROP POLICY IF EXISTS "authenticated_users_access" ON client;
DROP POLICY IF EXISTS "authenticated_users_access" ON course;
DROP POLICY IF EXISTS "authenticated_users_access" ON facture;

-- 2. S'assurer que RLS est activé
ALTER TABLE chauffeur ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicule ENABLE ROW LEVEL SECURITY;
ALTER TABLE client ENABLE ROW LEVEL SECURITY;
ALTER TABLE course ENABLE ROW LEVEL SECURITY;
ALTER TABLE facture ENABLE ROW LEVEL SECURITY;

-- 3. Créer les politiques UNE PAR UNE
CREATE POLICY "authenticated_users_access" ON chauffeur FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_users_access" ON vehicule FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_users_access" ON client FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_users_access" ON course FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_users_access" ON facture FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Vérification finale
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('chauffeur', 'vehicule', 'client', 'course', 'facture');`;

  console.log('```sql');
  console.log(finalScript);
  console.log('```\n');

  console.log('📞 SUPPORT TECHNIQUE:');
  console.log('=====================');
  console.log('Si ça ne marche toujours pas, contactez-moi avec:');
  console.log('1. Le message d\'erreur exact de Supabase');
  console.log('2. Une capture d\'écran du SQL Editor');
  console.log('3. Le résultat de ce diagnostic\n');

  console.log('🎯 OBJECTIF: Toutes les tables doivent afficher "Politique OK"');
}

checkExistingPolicies();