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

async function verifyPoliciesExist() {
  console.log('🔍 VÉRIFICATION DIRECTE DES POLITIQUES\n');

  const tables = ['chauffeur', 'vehicule', 'client', 'course', 'facture'];

  console.log('📋 VÉRIFICATION DES POLITIQUES CRÉÉES:');
  console.log('=====================================\n');

  // Tester chaque table individuellement
  for (const table of tables) {
    console.log(`🔍 Vérification table: ${table}`);

    try {
      // Test de lecture simple
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ❌ ÉCHEC: ${error.message}`);
        console.log(`   💡 La politique n'existe pas ou n'est pas active`);
      } else {
        console.log(`   ✅ SUCCÈS: Lecture autorisée (${data?.length || 0} résultats)`);
        console.log(`   🎉 La politique RLS fonctionne !`);
      }

    } catch (err) {
      console.log(`   ❌ ERREUR: ${err.message}`);
    }

    console.log('');
  }

  console.log('🎯 INTERPRÉTATION DES RÉSULTATS:');
  console.log('================================');

  console.log('Si vous voyez "SUCCÈS" pour une table:');
  console.log('   ✅ La politique RLS est active et fonctionne');
  console.log('');

  console.log('Si vous voyez "ÉCHEC":');
  console.log('   ❌ La politique RLS n\'existe pas ou ne fonctionne pas');
  console.log('   🔧 Il faut la créer manuellement');
  console.log('');

  console.log('📞 PROCHAINES ÉTAPES:');
  console.log('=====================');
  console.log('1. Si certaines tables échouent, dites-moi lesquelles');
  console.log('2. Je vous donnerai les commandes exactes pour les corriger');
  console.log('3. Testez ensuite la mise à jour du profil dans l\'application');
  console.log('');

  console.log('🚀 OBJECTIF FINAL: Toutes les tables doivent afficher "SUCCÈS" !');
}

verifyPoliciesExist();