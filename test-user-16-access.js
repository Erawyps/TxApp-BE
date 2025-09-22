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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUser16Access() {
  console.log('🔐 TEST SPÉCIFIQUE UTILISATEUR ID 16\n');

  // Tester d'abord la connexion avec l'utilisateur test
  const testCredentials = [
    { email: "admin@taxi.be", password: "admin123" },
    { email: "admin@txapp.com", password: "password123" },
    { email: "pierre.martin@taxi.be", password: "chauffeur123" }
  ];

  let authData = null;
  let workingCredentials = null;

  console.log('📋 ÉTAPE 1: CONNEXION UTILISATEUR');
  console.log('==================================\n');

  for (const credentials of testCredentials) {
    try {
      console.log(`👤 Tentative de connexion avec: ${credentials.email}`);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (!error && data.user) {
        console.log(`✅ CONNEXION RÉUSSIE: ${data.user.email} (ID: ${data.user.id})`);
        authData = data;
        workingCredentials = credentials;
        break;
      } else {
        console.log(`❌ ÉCHEC: ${error?.message || 'Identifiants invalides'}`);
      }
    } catch (err) {
      console.log(`❌ ERREUR: ${err.message}`);
    }
    console.log('');
  }

  if (!authData) {
    console.log('❌ AUCUNE CONNEXION RÉUSSIE - IMPOSSIBLE DE TESTER');
    return;
  }

  console.log('📋 ÉTAPE 2: TEST ACCÈS CHAUFFEUR (comme dans l\'erreur)');
  console.log('=========================================================\n');

  // Tester la requête exacte qui cause l'erreur
  console.log('🔍 Test de la requête exacte de l\'erreur:');
  console.log('SELECT id, nom, prenom, numero_permis, taux_commission, salaire_base, actif');
  console.log('FROM chauffeur WHERE utilisateur_id = 16 AND actif = true\n');

  try {
    const { data, error } = await supabase
      .from('chauffeur')
      .select('id, nom, prenom, numero_permis, taux_commission, salaire_base, actif')
      .eq('utilisateur_id', 16)
      .eq('actif', true);

    if (error) {
      console.log(`❌ ÉCHEC: ${error.message}`);
      console.log(`💡 Code d'erreur: ${error.code}`);
      console.log(`💡 Détails: ${error.details}`);
      console.log(`💡 Hint: ${error.hint}`);
    } else {
      console.log(`✅ SUCCÈS: ${data?.length || 0} chauffeurs trouvés`);
      if (data && data.length > 0) {
        data.forEach((chauffeur, index) => {
          console.log(`   ${index + 1}. ${chauffeur.nom} ${chauffeur.prenom} (ID: ${chauffeur.id})`);
        });
      } else {
        console.log('   💡 Aucun chauffeur trouvé pour utilisateur_id = 16');
      }
    }
  } catch (err) {
    console.log(`❌ ERREUR INATTENDUE: ${err.message}`);
  }

  console.log('\n📋 ÉTAPE 3: VÉRIFICATION DES DONNÉES UTILISATEUR 16');
  console.log('=====================================================\n');

  // Vérifier si l'utilisateur 16 existe et ses données
  try {
    const { data: userData, error: userError } = await supabase
      .from('utilisateur')
      .select('id, email, nom, prenom, type_utilisateur, actif')
      .eq('id', 16)
      .single();

    if (userError) {
      console.log(`❌ Utilisateur 16 non trouvé: ${userError.message}`);
    } else {
      console.log(`✅ Utilisateur 16 trouvé:`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Nom: ${userData.nom} ${userData.prenom}`);
      console.log(`   Type: ${userData.type_utilisateur}`);
      console.log(`   Actif: ${userData.actif}`);
    }
  } catch (err) {
    console.log(`❌ Erreur lors de la vérification utilisateur: ${err.message}`);
  }

  console.log('\n📋 ÉTAPE 4: TEST GÉNÉRAL ACCÈS CHAUFFEUR');
  console.log('===========================================\n');

  // Tester un accès général aux chauffeurs
  try {
    const { data, error } = await supabase
      .from('chauffeur')
      .select('id, nom, prenom, utilisateur_id, actif')
      .limit(5);

    if (error) {
      console.log(`❌ ÉCHEC accès général: ${error.message}`);
    } else {
      console.log(`✅ SUCCÈS accès général: ${data?.length || 0} chauffeurs trouvés`);
      if (data && data.length > 0) {
        console.log('   Liste des chauffeurs:');
        data.forEach((chauffeur, index) => {
          console.log(`   ${index + 1}. ${chauffeur.nom} ${chauffeur.prenom} (User ID: ${chauffeur.utilisateur_id}, Actif: ${chauffeur.actif})`);
        });
      }
    }
  } catch (err) {
    console.log(`❌ ERREUR accès général: ${err.message}`);
  }

  // Déconnexion
  await supabase.auth.signOut();
  console.log('\n👋 Déconnexion effectuée');

  console.log('\n🎯 DIAGNOSTIC FINAL');
  console.log('===================\n');

  console.log('🔍 ANALYSE DE L\'ERREUR:');
  console.log('L\'application essaie de récupérer les chauffeurs pour utilisateur_id = 16');
  console.log('Mais l\'utilisateur connecté pourrait ne pas avoir les bonnes permissions');
  console.log('');

  console.log('🛠️ POSSIBLES CAUSES:');
  console.log('1. JWT expiré ou invalide');
  console.log('2. Utilisateur 16 n\'est pas un chauffeur');
  console.log('3. Problème de politique RLS');
  console.log('4. Données manquantes dans la table chauffeur');
  console.log('');

  console.log('💡 RECOMMANDATIONS:');
  console.log('1. Vérifier que l\'utilisateur 16 a un enregistrement dans la table chauffeur');
  console.log('2. Vérifier que le JWT est valide dans l\'application');
  console.log('3. Tester avec un utilisateur qui a effectivement des données chauffeur');
}

testUser16Access();