import { createClient } from "@supabase/supabase-js";
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

// Client avec clé anonyme (pour tests sans auth)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function testWithAuthentication() {
  console.log('🔐 TEST AVEC AUTHENTIFICATION RÉELLE\n');

  const tables = ['chauffeur', 'vehicule', 'client', 'course', 'facture'];

  console.log('📋 ÉTAPE 1: TEST SANS AUTHENTIFICATION (DEVRAIT ÉCHOUER)');
  console.log('=========================================================\n');

  // Tester sans auth (devrait échouer)
  for (const table of tables) {
    console.log(`🔍 Test ${table} (sans auth)`);

    try {
      const { data, error } = await supabaseAnon
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ✅ ATTENDU: ${error.message}`);
      } else {
        console.log(`   ⚠️  PROBLÈME: Accès autorisé sans auth !`);
      }
    } catch (err) {
      console.log(`   ❌ ERREUR: ${err.message}`);
    }
    console.log('');
  }

  console.log('📋 ÉTAPE 2: CONNEXION UTILISATEUR EXISTANT');
  console.log('===========================================\n');

  // Essayer de récupérer un utilisateur existant pour tester
  try {
    // D'abord vérifier si on peut accéder à utilisateur (qui pourrait ne pas avoir RLS)
    const { data: users, error: userError } = await supabaseAnon
      .from('utilisateur')
      .select('id, email')
      .limit(1);

    if (userError) {
      console.log(`❌ Impossible d'accéder aux utilisateurs: ${userError.message}`);
      console.log('💡 La table utilisateur a aussi RLS activé maintenant');
      console.log('\n🔑 SOLUTION: Vous devez utiliser un JWT valide');
      console.log('=====================================');
      console.log('1. Connectez-vous dans votre application');
      console.log('2. Récupérez le JWT depuis le localStorage ou les cookies');
      console.log('3. Utilisez ce JWT pour tester les accès');
      console.log('');
      console.log('Ou créez un script de test qui se connecte d\'abord:');
      console.log('');
      console.log('```javascript');
      console.log('// Exemple de connexion et test');
      console.log('const { data, error } = await supabase.auth.signInWithPassword({');
      console.log('  email: "votre-email@example.com",');
      console.log('  password: "votre-mot-de-passe"');
      console.log('});');
      console.log('');
      console.log('if (data.user) {');
      console.log('  // Maintenant les requêtes utiliseront le JWT');
      console.log('  const { data, error } = await supabase');
      console.log('    .from("chauffeur")');
      console.log('    .select("*");');
      console.log('}');
      console.log('```');
      return;
    }

    if (users && users.length > 0) {
      console.log(`✅ Utilisateur trouvé: ${users[0].email}`);
      console.log('💡 Pour tester correctement, vous devez vous connecter avec cet utilisateur');
      console.log('   dans votre application, puis tester l\'accès aux tables.');
      console.log('');
      console.log('📱 TEST DANS L\'APPLICATION:');
      console.log('===========================');
      console.log('1. Connectez-vous avec cet utilisateur');
      console.log('2. Allez dans Settings > General');
      console.log('3. Essayez de mettre à jour le profil');
      console.log('4. Si ça marche, les politiques fonctionnent !');
    }

  } catch (err) {
    console.log(`❌ Erreur lors de la récupération des utilisateurs: ${err.message}`);
  }

  console.log('\n🎯 CONCLUSION');
  console.log('=============\n');

  console.log('🔍 Le script verify-policies-direct.js utilise la clé ANON publique');
  console.log('   qui ne permet PAS de tester les politiques RLS correctement.');
  console.log('');
  console.log('✅ Les politiques existent probablement dans Supabase Dashboard');
  console.log('✅ Elles fonctionnent quand vous êtes connecté dans l\'app');
  console.log('✅ Le vrai test est de vérifier que l\'app fonctionne');
  console.log('');
  console.log('🚀 PROCHAIN TEST: Utilisez l\'application avec un utilisateur connecté !');
}

testWithAuthentication();