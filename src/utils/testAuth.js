import { supabase } from "../utils/supabase.js";

/**
 * Script de test pour vérifier la connexion à la base de données
 * et le bon fonctionnement des services d'authentification
 */

// Test de connexion à Supabase
export const testSupabaseConnection = async () => {
  console.log("🔍 Test de connexion à Supabase...");

  try {
    if (!supabase) {
      throw new Error("Client Supabase non initialisé");
    }

    // Test simple de connexion
    const { error } = await supabase
      .from('utilisateur')
      .select('count')
      .limit(1);

    if (error) {
      console.error("❌ Erreur de connexion Supabase:", error);
      return false;
    }

    console.log("✅ Connexion Supabase réussie");
    return true;
  } catch (error) {
    console.error("❌ Erreur lors du test de connexion:", error);
    return false;
  }
};

// Test de structure de la table utilisateur
export const testUserTableStructure = async () => {
  console.log("🔍 Test de la structure de la table utilisateur...");

  try {
    // Essayer de récupérer la structure en faisant une requête avec limit 0
    const { error } = await supabase
      .from('utilisateur')
      .select('*')
      .limit(0);

    if (error) {
      console.error("❌ Erreur lors du test de structure:", error);
      return false;
    }

    console.log("✅ Structure de la table utilisateur accessible");
    return true;
  } catch (error) {
    console.error("❌ Erreur lors du test de structure:", error);
    return false;
  }
};

// Test de création d'un utilisateur de test
export const testCreateTestUser = async () => {
  console.log("🔍 Test de création d'utilisateur...");

  try {
    const testEmail = `test-${Date.now()}@txapp.test`;

    const { data, error } = await supabase
      .from('utilisateur')
      .insert([{
        type_utilisateur: 'administrateur',
        nom: 'Test',
        prenom: 'User',
        email: testEmail,
        telephone: '+32123456789',
        mot_de_passe: '$2a$12$test.hash.password', // Hash factice pour le test
        actif: true,
        date_creation: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error("❌ Erreur lors de la création d'utilisateur:", error);
      return false;
    }

    console.log("✅ Création d'utilisateur réussie:", data.email);

    // Nettoyer - supprimer l'utilisateur de test
    await supabase
      .from('utilisateur')
      .delete()
      .eq('id', data.id);

    console.log("🧹 Utilisateur de test supprimé");
    return true;
  } catch (error) {
    console.error("❌ Erreur lors du test de création:", error);
    return false;
  }
};

// Test de récupération d'utilisateurs
export const testGetUsers = async () => {
  console.log("🔍 Test de récupération d'utilisateurs...");

  try {
    const { data, error } = await supabase
      .from('utilisateur')
      .select('id, email, nom, prenom, type_utilisateur, actif')
      .eq('actif', true)
      .limit(5);

    if (error) {
      console.error("❌ Erreur lors de la récupération:", error);
      return false;
    }

    console.log(`✅ Récupération réussie: ${data.length} utilisateur(s) trouvé(s)`);
    return true;
  } catch (error) {
    console.error("❌ Erreur lors du test de récupération:", error);
    return false;
  }
};

// Test complet du système
export const runAllTests = async () => {
  console.log("🚀 Démarrage des tests du système d'authentification...\n");

  const tests = [
    { name: "Connexion Supabase", fn: testSupabaseConnection },
    { name: "Structure table utilisateur", fn: testUserTableStructure },
    { name: "Création utilisateur", fn: testCreateTestUser },
    { name: "Récupération utilisateurs", fn: testGetUsers }
  ];

  const results = [];

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, success: result });
    } catch (error) {
      console.error(`❌ Erreur dans le test ${test.name}:`, error);
      results.push({ name: test.name, success: false, error: error.message });
    }
    console.log(""); // Ligne vide pour la lisibilité
  }

  // Résumé des résultats
  console.log("📊 RÉSUMÉ DES TESTS:");
  console.log("==================");

  const passed = results.filter(r => r.success).length;
  const total = results.length;

  results.forEach(result => {
    const status = result.success ? "✅ PASSÉ" : "❌ ÉCHEC";
    console.log(`${status} - ${result.name}`);
    if (result.error) {
      console.log(`   Erreur: ${result.error}`);
    }
  });

  console.log(`\n🎯 Résultat global: ${passed}/${total} tests réussis`);

  if (passed === total) {
    console.log("🎉 Tous les tests sont passés ! Le système est opérationnel.");
  } else {
    console.log("⚠️ Certains tests ont échoué. Vérifiez la configuration.");
  }

  return { passed, total, results };
};
