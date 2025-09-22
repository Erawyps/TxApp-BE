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

async function checkAllTablesRLS() {
  try {
    console.log('🔍 Vérification des politiques RLS sur toutes les tables...');

    // Liste des tables principales de l'application
    const tables = [
      'utilisateur',
      'chauffeur',
      'vehicule',
      'client',
      'course',
      'facture',
      'tarif',
      'parametre'
    ];

    for (const table of tables) {
      try {
        console.log(`\n📋 Test de la table: ${table}`);

        // Test de lecture
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Erreur sur ${table}:`, error.message);
          if (error.code === '42501') {
            console.log(`🔧 RLS bloque l'accès à ${table} - nécessite correction`);
          }
        } else {
          console.log(`✅ Accès OK à ${table} (${data?.length || 0} enregistrements)`);
        }
      } catch (err) {
        console.log(`❌ Exception sur ${table}:`, err.message);
      }
    }

    console.log('\n💡 Pour corriger les tables avec RLS restrictif, exécutez le script SQL suivant dans Supabase Dashboard > SQL Editor:');

    const sqlScript = `
-- Désactiver RLS sur toutes les tables pour le développement
-- ATTENTION: À ne faire qu'en développement !

ALTER TABLE utilisateur DISABLE ROW LEVEL SECURITY;
ALTER TABLE chauffeur DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicule DISABLE ROW LEVEL SECURITY;
ALTER TABLE client DISABLE ROW LEVEL SECURITY;
ALTER TABLE course DISABLE ROW LEVEL SECURITY;
ALTER TABLE facture DISABLE ROW LEVEL SECURITY;
ALTER TABLE tarif DISABLE ROW LEVEL SECURITY;
ALTER TABLE parametre DISABLE ROW LEVEL SECURITY;

-- Ou alternativement, créer des politiques permissives:
/*
-- Pour chaque table, créer une politique permissive
CREATE POLICY "dev_access_policy" ON utilisateur FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_policy" ON chauffeur FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_policy" ON vehicule FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_policy" ON client FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_policy" ON course FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_policy" ON facture FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_policy" ON tarif FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_policy" ON parametre FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
*/
    `;

    console.log(sqlScript);

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

checkAllTablesRLS();