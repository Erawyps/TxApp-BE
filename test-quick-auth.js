// Test simplifié pour vérifier les corrections RLS
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jfrhzwtkfotsrjkacrns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmcmh6d3RrZm90c3Jqa2Fjcm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MTI1MDksImV4cCI6MjA0MDk4ODUwOX0.rKcnNJbacyLF3TQd0ZzGhAhk1fS_-UX8D-o3zO_pBT8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuickAuth() {
  console.log('🧪 Test rapide des corrections d\'authentification...\n');

  try {
    // Test 1: Récupération des utilisateurs existants
    console.log('1. Test de lecture des utilisateurs...');
    const { data: users, error: readError } = await supabase
      .from('utilisateur')
      .select('email, type_utilisateur, actif')
      .eq('actif', true)
      .limit(3);

    if (readError) {
      console.error('❌ Erreur de lecture:', readError.message);
    } else {
      console.log(`✅ Lecture réussie: ${users.length} utilisateur(s)`);
      users.forEach(user => console.log(`  - ${user.email} (${user.type_utilisateur})`));
    }

    // Test 2: Test de création avec différents types
    console.log('\n2. Test de création d\'utilisateur...');
    const testTypes = ['ADMIN', 'CHAUFFEUR', 'GESTIONNAIRE', 'CLIENT'];

    for (const typeTest of testTypes) {
      const testEmail = `test-${typeTest.toLowerCase()}-${Date.now()}@test.com`;

      const { data: newUser, error: createError } = await supabase
        .from('utilisateur')
        .insert([{
          type_utilisateur: typeTest,
          nom: 'Test',
          prenom: typeTest,
          email: testEmail,
          telephone: '+32123456789',
          mot_de_passe: '$2a$12$test.hash.password',
          actif: true,
          date_creation: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.log(`❌ ${typeTest}: ${createError.message}`);
      } else {
        console.log(`✅ ${typeTest}: Création réussie`);

        // Nettoyage immédiat
        await supabase
          .from('utilisateur')
          .delete()
          .eq('id', newUser.id);
      }
    }

    // Test 3: Vérification de l'admin
    console.log('\n3. Vérification de l\'utilisateur admin...');
    const { data: admin, error: adminError } = await supabase
      .from('utilisateur')
      .select('email, type_utilisateur, actif')
      .eq('email', 'admin@taxi.be')
      .single();

    if (adminError) {
      console.error('❌ Admin non trouvé:', adminError.message);
    } else {
      console.log(`✅ Admin trouvé: ${admin.email} (${admin.type_utilisateur})`);
    }

    console.log('\n📊 Résumé:');
    console.log(readError ? '❌' : '✅', 'Lecture des utilisateurs');
    console.log(adminError ? '❌' : '✅', 'Utilisateur admin');
    console.log('\n🎯 Les corrections semblent', (!readError && !adminError) ? 'fonctionner !' : 'nécessiter des ajustements.');

  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

testQuickAuth();
