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

async function checkRLSStatus() {
  console.log('🔍 DIAGNOSTIC DÉTAILLÉ DES POLITIQUES RLS\n');

  const tables = ['utilisateur', 'chauffeur', 'vehicule', 'client', 'course', 'facture'];

  console.log('📊 ÉTAT ACTUEL DES TABLES:');
  console.log('==========================\n');

  for (const table of tables) {
    console.log(`🔍 Test de ${table}:`);

    try {
      // Test de lecture
      const { data: readData, error: readError } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (readError) {
        console.log(`   ❌ Lecture: ${readError.message}`);
      } else {
        console.log(`   ✅ Lecture: OK (${readData?.length || 0} enregistrements)`);
      }

      // Test d'écriture (sur une ligne existante si possible)
      let testCondition = {};
      if (table === 'utilisateur') testCondition = { id: 244 };
      else if (table === 'chauffeur') testCondition = { utilisateur_id: 244 };
      else testCondition = {}; // Pour les autres tables, on ne teste pas l'écriture

      if (Object.keys(testCondition).length > 0) {
        const { error: writeError } = await supabase
          .from(table)
          .update({ updated_at: new Date().toISOString() })
          .match(testCondition);

        if (writeError) {
          console.log(`   ❌ Écriture: ${writeError.message}`);
        } else {
          console.log(`   ✅ Écriture: OK`);
        }
      } else {
        console.log(`   ⏭️ Écriture: Non testée`);
      }

    } catch (err) {
      console.log(`   ❌ Exception: ${err.message}`);
    }

    console.log('');
  }

  console.log('💡 DIAGNOSTIC:');
  console.log('==============');

  const readResults = await Promise.all(tables.map(async table => {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      return { table, canRead: !error };
    } catch {
      return { table, canRead: false };
    }
  }));

  const readableTables = readResults.filter(r => r.canRead).map(r => r.table);
  const blockedTables = readResults.filter(r => !r.canRead).map(r => r.table);

  if (blockedTables.length === 0) {
    console.log('✅ Toutes les tables sont accessibles !');
    console.log('🎉 RLS de production correctement configuré.');
  } else {
    console.log(`❌ ${blockedTables.length} tables sont bloquées: ${blockedTables.join(', ')}`);
    console.log(`✅ ${readableTables.length} tables sont OK: ${readableTables.join(', ')}`);

    console.log('\n🔧 ACTION REQUISE:');
    console.log('==================');
    console.log('Vous devez appliquer le script SQL complet dans Supabase Dashboard.');
    console.log('Assurez-vous que TOUTES les commandes ont été exécutées, notamment :');

    for (const table of blockedTables) {
      console.log(`- CREATE POLICY "authenticated_users_access" ON ${table} FOR ALL TO authenticated USING (true) WITH CHECK (true);`);
    }

    console.log('\n📋 INSTRUCTIONS:');
    console.log('1. Ouvrez Supabase Dashboard > SQL Editor');
    console.log('2. Copiez-collez TOUT le script (pas seulement la partie utilisateur)');
    console.log('3. Cliquez sur "Run"');
    console.log('4. Réexécutez ce diagnostic');
  }
}

checkRLSStatus();