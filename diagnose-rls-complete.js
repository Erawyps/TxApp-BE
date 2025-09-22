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

async function diagnoseRLSIssue() {
  console.log('🔍 DIAGNOSTIC COMPLET DES PROBLÈMES RLS\n');

  const tables = ['utilisateur', 'chauffeur', 'vehicule', 'client', 'course', 'facture'];

  console.log('📋 ÉTAPE 1: VÉRIFICATION DES POLITIQUES DANS LA BASE');
  console.log('==================================================\n');

  // Vérifier les politiques existantes dans pg_policies
  try {
    const { data: policies, error } = await supabaseAnon.rpc('get_policies_status');

    if (error) {
      console.log('❌ Impossible de vérifier les politiques via RPC');
      console.log('💡 Il faut utiliser la clé service_role ou Supabase Dashboard');
    } else {
      console.log('📊 POLITIQUES TROUVÉES:');
      policies.forEach(policy => {
        console.log(`   ${policy.tablename}: ${policy.policyname} (${policy.roles})`);
      });
    }
  } catch (err) {
    console.log('❌ Erreur lors de la vérification des politiques:', err.message);
  }

  console.log('\n📋 ÉTAPE 2: TEST SANS AUTHENTIFICATION (DEVRAIT ÉCHOUER)');
  console.log('=========================================================\n');

  // Tester l'accès sans authentification (devrait échouer avec RLS)
  for (const table of tables) {
    console.log(`🔍 Test table: ${table} (sans auth)`);

    try {
      const { data, error } = await supabaseAnon
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ✅ ATTENDU: ${error.message}`);
      } else {
        console.log(`   ⚠️  INATTENDU: Accès autorisé sans auth !`);
        console.log(`   💡 RLS n'est peut-être pas activé sur cette table`);
      }
    } catch (err) {
      console.log(`   ❌ ERREUR: ${err.message}`);
    }
    console.log('');
  }

  console.log('📋 ÉTAPE 3: VÉRIFICATION DES UTILISATEURS EXISTANTS');
  console.log('===================================================\n');

  // Vérifier s'il y a des utilisateurs dans la table utilisateur
  try {
    // Cette requête devrait fonctionner si la politique utilisateur est active
    const { data: users, error } = await supabaseAnon
      .from('utilisateur')
      .select('id, email, role')
      .limit(5);

    if (error) {
      console.log(`❌ Impossible d'accéder à la table utilisateur: ${error.message}`);
      console.log('💡 Les politiques RLS ne sont probablement pas appliquées');
    } else {
      console.log(`✅ Utilisateurs trouvés: ${users.length}`);
      users.forEach(user => {
        console.log(`   ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
      });

      if (users.length > 0) {
        console.log('\n🔐 ÉTAPE 4: TEST AVEC AUTHENTIFICATION UTILISATEUR');
        console.log('===================================================\n');

        // Tester la connexion avec le premier utilisateur trouvé
        const testUser = users[0];
        console.log(`👤 Test de connexion avec: ${testUser.email}`);

        // Note: Pour une vraie authentification, il faudrait le mot de passe
        // Ici on simule juste pour montrer la méthode
        console.log('💡 Pour tester avec auth, il faudrait:');
        console.log('   1. Se connecter avec un vrai utilisateur');
        console.log('   2. Utiliser le JWT obtenu');
        console.log('   3. Tester l\'accès aux autres tables');
      }
    }
  } catch (err) {
    console.log(`❌ Erreur lors de la vérification des utilisateurs: ${err.message}`);
  }

  console.log('\n🎯 DIAGNOSTIC FINAL');
  console.log('==================\n');

  console.log('🔍 PROBLÈME IDENTIFIÉ:');
  console.log('Les politiques RLS ne semblent pas appliquées malgré le "success" dans Supabase');
  console.log('');

  console.log('🛠️ SOLUTIONS POSSIBLES:');
  console.log('1. Vérifier dans Supabase Dashboard > Table Editor que RLS est activé');
  console.log('2. Vérifier dans SQL Editor que les politiques existent:');
  console.log('   SELECT * FROM pg_policies WHERE schemaname = \'public\';');
  console.log('3. Si les politiques n\'existent pas, réexécuter le script SQL');
  console.log('4. Vérifier que vous êtes dans la bonne base de données');
  console.log('');

  console.log('📞 PROCHAINES ÉTAPES:');
  console.log('1. Allez dans Supabase Dashboard > SQL Editor');
  console.log('2. Exécutez: SELECT * FROM pg_policies WHERE schemaname = \'public\';');
  console.log('3. Vérifiez que vous voyez 6 politiques "authenticated_users_access"');
  console.log('4. Si non, réexécutez le script complet');
  console.log('');

  console.log('🚀 OBJECTIF: Toutes les tables doivent avoir des politiques actives !');
}

// Fonction RPC pour vérifier les politiques (nécessite service_role)
async function createPolicyCheckFunction() {
  console.log('\n🛠️ CRÉATION D\'UNE FONCTION DE VÉRIFICATION (OPTIONNEL)');
  console.log('====================================================\n');

  const functionSQL = `
CREATE OR REPLACE FUNCTION get_policies_status()
RETURNS TABLE(schemaname text, tablename text, policyname text, permissive text, roles text[])
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
      schemaname,
      tablename,
      policyname,
      CASE WHEN permissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END as permissive,
      roles
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('utilisateur', 'chauffeur', 'vehicule', 'client', 'course', 'facture')
  ORDER BY tablename, policyname;
$$;
`;

  console.log('📋 FONCTION À CRÉER DANS SUPABASE (optionnel):');
  console.log('=============================================\n');
  console.log('```sql');
  console.log(functionSQL.trim());
  console.log('```\n');
  console.log('💡 Cette fonction permettrait de vérifier les politiques via RPC');
}

diagnoseRLSIssue().then(() => {
  createPolicyCheckFunction();
});