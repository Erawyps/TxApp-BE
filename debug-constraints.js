// Script pour diagnostiquer les contraintes de type_utilisateur
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jfrhzwtkfotsrjkacrns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmcmh6d3RrZm90c3Jqa2Fjcm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MTI1MDksImV4cCI6MjA0MDk4ODUwOX0.rKcnNJbacyLF3TQd0ZzGhAhk1fS_-UX8D-o3zO_pBT8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugConstraints() {
  console.log('🔍 Diagnostic des contraintes de la base de données...\n');

  try {
    // 1. Vérifier les types existants
    console.log('1. Récupération des types d\'utilisateurs existants...');
    const { data: existingUsers, error: fetchError } = await supabase
      .from('utilisateur')
      .select('type_utilisateur')
      .limit(10);

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération:', fetchError);
    } else {
      const uniqueTypes = [...new Set(existingUsers.map(u => u.type_utilisateur))];
      console.log('✅ Types existants dans la DB:', uniqueTypes);
    }

    console.log('\n2. Test des différents types d\'utilisateurs...');

    // Types potentiels à tester
    const typesToTest = [
      'admin',
      'chauffeur',
      'gestionnaire',
      'client',
      'superviseur',
      'dispatcher',
      'comptable'
    ];

    for (const typeToTest of typesToTest) {
      try {
        const testUser = {
          type_utilisateur: typeToTest,
          nom: 'Test',
          telephone: '+32123456789',
          email: `test-${typeToTest}-${Date.now()}@test.com`,
          mot_de_passe: 'test123',
          actif: true
        };

        // Test d'insertion (sera supprimé immédiatement)
        const { data, error } = await supabase
          .from('utilisateur')
          .insert([testUser])
          .select()
          .single();

        if (error) {
          console.log(`❌ "${typeToTest}": ${error.message}`);
        } else {
          console.log(`✅ "${typeToTest}": Accepté`);
          // Supprimer immédiatement l'utilisateur de test
          await supabase
            .from('utilisateur')
            .delete()
            .eq('id', data.id);
        }
      } catch (err) {
        console.log(`❌ "${typeToTest}": ${err.message}`);
      }
    }

    console.log('\n3. Vérification directe des contraintes SQL...');
    // Requête pour obtenir les contraintes CHECK
    const { data: constraints, error: constraintError } = await supabase
      .rpc('get_check_constraints', { table_name: 'utilisateur' })
      .single();

    if (constraintError) {
      console.log('⚠️ Impossible de récupérer les contraintes via RPC');
    } else {
      console.log('📋 Contraintes trouvées:', constraints);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

debugConstraints();
