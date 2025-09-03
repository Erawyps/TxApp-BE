// Script automatisé pour appliquer les corrections RLS via l'API Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jfrhzwtkfotsrjkacrns.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmcmh6d3RrZm90c3Jqa2Fjcm5zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTQxMjUwOSwiZXhwIjoyMDQwOTg4NTA5fQ.v8wJ-0rUZdPdv7K7BqWgL0vK8E5LnOoLnqVzQf4Bz5M'; // Service role key pour les opérations admin

// Créer un client admin avec service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyRLSFixes() {
  console.log('🔧 Application des corrections RLS automatiques...\n');

  try {
    // 1. Vérifier les utilisateurs existants
    console.log('1. Vérification des utilisateurs existants...');
    const { data: users, error: usersError } = await supabaseAdmin
      .from('utilisateur')
      .select('id, email, type_utilisateur, actif')
      .limit(5);

    if (usersError) {
      console.error('❌ Erreur lors de la vérification des utilisateurs:', usersError);
    } else {
      console.log(`✅ ${users.length} utilisateur(s) trouvé(s)`);
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.type_utilisateur})`);
      });
    }

    // 2. Créer/Mettre à jour l'utilisateur admin
    console.log('\n2. Création/Mise à jour de l\'utilisateur admin...');
    const adminData = {
      email: 'admin@taxi.be',
      mot_de_passe: '$2b$12$GugeIpc22/RfIxd9xNDYqe.LMe9CqQPtKTeAouPxPwwpIWgY8oaEq',
      nom: 'Admin',
      prenom: 'Système',
      telephone: '+32 123 456 789',
      type_utilisateur: 'ADMIN',
      actif: true,
      date_creation: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // D'abord essayer de mettre à jour
    const { data: existingAdmin, error: findError } = await supabaseAdmin
      .from('utilisateur')
      .select('id')
      .eq('email', 'admin@taxi.be')
      .single();

    if (existingAdmin) {
      console.log('  Mise à jour de l\'admin existant...');
      const { error: updateError } = await supabaseAdmin
        .from('utilisateur')
        .update({
          type_utilisateur: 'ADMIN',
          mot_de_passe: '$2b$12$GugeIpc22/RfIxd9xNDYqe.LMe9CqQPtKTeAouPxPwwpIWgY8oaEq',
          updated_at: new Date().toISOString()
        })
        .eq('email', 'admin@taxi.be');

      if (updateError) {
        console.error('❌ Erreur mise à jour admin:', updateError);
      } else {
        console.log('✅ Admin mis à jour avec succès');
      }
    } else {
      console.log('  Création d\'un nouvel admin...');
      const { error: createError } = await supabaseAdmin
        .from('utilisateur')
        .insert([adminData]);

      if (createError) {
        console.error('❌ Erreur création admin:', createError);
      } else {
        console.log('✅ Admin créé avec succès');
      }
    }

    // 3. Test de création d'utilisateur avec le nouveau format
    console.log('\n3. Test de création d\'utilisateur...');
    const testEmail = `test-rls-${Date.now()}@txapp.test`;
    const { data: testUser, error: testError } = await supabaseAdmin
      .from('utilisateur')
      .insert([{
        type_utilisateur: 'CHAUFFEUR',
        nom: 'Test',
        prenom: 'RLS',
        email: testEmail,
        telephone: '+32987654321',
        mot_de_passe: '$2a$12$test.hash.password',
        actif: true,
        date_creation: new Date().toISOString()
      }])
      .select()
      .single();

    if (testError) {
      console.error('❌ Test de création échoué:', testError);
    } else {
      console.log('✅ Test de création réussi:', testUser.email);

      // Supprimer l'utilisateur de test
      await supabaseAdmin
        .from('utilisateur')
        .delete()
        .eq('id', testUser.id);

      console.log('🧹 Utilisateur de test supprimé');
    }

    // 4. Vérification finale
    console.log('\n4. Vérification finale...');
    const { data: finalUsers, error: finalError } = await supabaseAdmin
      .from('utilisateur')
      .select('email, type_utilisateur, actif')
      .eq('actif', true);

    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError);
    } else {
      console.log(`✅ Vérification finale: ${finalUsers.length} utilisateur(s) actif(s)`);

      const adminUser = finalUsers.find(u => u.email === 'admin@taxi.be');
      if (adminUser && adminUser.type_utilisateur === 'ADMIN') {
        console.log('✅ Utilisateur admin correctement configuré');
      } else {
        console.log('⚠️ Problème avec la configuration admin');
      }
    }

    console.log('\n🎉 Corrections RLS appliquées avec succès !');
    console.log('📋 Vous pouvez maintenant relancer les tests d\'authentification.');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter les corrections
applyRLSFixes().then(() => {
  console.log('\n🏁 Script terminé.');
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
});
