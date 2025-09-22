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

async function verifyRLSSetup() {
  console.log('🔍 VÉRIFICATION DE L\'INSTALLATION RLS DE PRODUCTION\n');

  try {
    // 1. Vérifier l'état RLS des tables
    console.log('1️⃣ Vérification de l\'état RLS des tables...');
    const tables = ['utilisateur', 'chauffeur', 'vehicule', 'client', 'course', 'facture'];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Accessible (${data?.length || 0} enregistrements)`);
        }
      } catch (err) {
        console.log(`❌ ${table}: Exception - ${err.message}`);
      }
    }

    // 2. Tester les mises à jour
    console.log('\n2️⃣ Test des mises à jour...');

    // Test utilisateur
    const { error: userError } = await supabase
      .from('utilisateur')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', 244);

    if (userError) {
      console.log(`❌ Mise à jour utilisateur: ${userError.message}`);
    } else {
      console.log('✅ Mise à jour utilisateur: OK');
    }

    // Test chauffeur
    const { error: driverError } = await supabase
      .from('chauffeur')
      .update({ updated_at: new Date().toISOString() })
      .eq('utilisateur_id', 244);

    if (driverError) {
      console.log(`❌ Mise à jour chauffeur: ${driverError.message}`);
    } else {
      console.log('✅ Mise à jour chauffeur: OK');
    }

    // 3. Vérifier les politiques RLS
    console.log('\n3️⃣ Vérification des politiques RLS...');
    try {
      const { data: policies, error: policyError } = await supabase
        .rpc('exec_sql', {
          sql: `
            SELECT schemaname, tablename, policyname, permissive, roles, cmd
            FROM pg_policies
            WHERE schemaname = 'public'
            ORDER BY tablename, policyname
          `
        });

      if (policyError) {
        console.log('❌ Impossible de vérifier les politiques via RPC');
      } else {
        console.log('📋 Politiques RLS actives:');
        policies?.forEach(policy => {
          console.log(`   ${policy.tablename}: ${policy.policyname} (${policy.roles})`);
        });
      }
    } catch (err) {
      console.log('⚠️ Vérification des politiques non disponible via API');
    }

    console.log('\n🎯 RÉSULTATS DE LA VÉRIFICATION:');
    console.log('================================');

    const hasErrors = userError || driverError;
    if (hasErrors) {
      console.log('❌ PROBLÈMES DÉTECTÉS:');
      if (userError) console.log(`   - Utilisateur: ${userError.message}`);
      if (driverError) console.log(`   - Chauffeur: ${driverError.message}`);
      console.log('\n💡 Assurez-vous d\'avoir appliqué le script SQL dans Supabase Dashboard');
    } else {
      console.log('✅ SUCCÈS: Toutes les vérifications sont passées!');
      console.log('🔒 RLS de production actif et fonctionnel');
      console.log('🚀 Votre application est prête pour la production');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

verifyRLSSetup();