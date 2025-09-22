import { createClient } from "@supabase/supabase-js";
import { readFileSync } from 'fs';
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

// Fonction pour exécuter une commande SQL
async function executeSQL(sql) {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.log(`❌ Erreur SQL: ${error.message}`);
      return false;
    }
    return true;
  } catch (err) {
    console.log(`❌ Exception SQL: ${err.message}`);
    return false;
  }
}

// Fonction pour diviser le script SQL en commandes individuelles
function splitSQLCommands(sqlContent) {
  // Supprimer les commentaires et diviser par les points-virgules
  const commands = sqlContent
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

  return commands;
}

async function applyProductionRLS() {
  try {
    console.log('🚀 Application des politiques RLS de production...\n');

    // Lire le fichier SQL
    const sqlContent = readFileSync('./production-rls-simple.sql', 'utf8');
    console.log('📄 Script SQL chargé');

    // Diviser en commandes individuelles
    const commands = splitSQLCommands(sqlContent);
    console.log(`📋 ${commands.length} commandes SQL à exécuter\n`);

    let successCount = 0;
    let errorCount = 0;

    // Exécuter chaque commande
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim().length === 0) continue;

      console.log(`⚡ Exécution commande ${i + 1}/${commands.length}...`);
      console.log(`   ${command.substring(0, 80)}${command.length > 80 ? '...' : ''}`);

      const success = await executeSQL(command);
      if (success) {
        successCount++;
        console.log('   ✅ Succès\n');
      } else {
        errorCount++;
        console.log('   ❌ Échec\n');
      }

      // Petite pause entre les commandes
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('📊 RÉSULTATS DE L\'APPLICATION RLS:');
    console.log('=====================================');
    console.log(`✅ Commandes réussies: ${successCount}`);
    console.log(`❌ Commandes échouées: ${errorCount}`);
    console.log(`📈 Taux de succès: ${Math.round((successCount / (successCount + errorCount)) * 100)}%`);

    if (errorCount === 0) {
      console.log('\n🎉 Toutes les politiques RLS ont été appliquées avec succès!');
      console.log('🔒 Votre base de données est maintenant sécurisée pour la production.');
    } else {
      console.log('\n⚠️ Certaines commandes ont échoué. Vérifiez les logs ci-dessus.');
      console.log('💡 Vous pouvez réessayer ou appliquer manuellement les commandes restantes.');
    }

    // Test final
    console.log('\n🧪 Test final des politiques RLS...');
    const { data, error } = await supabase
      .from('utilisateur')
      .select('id, nom')
      .limit(1);

    if (error) {
      console.log('❌ Test échoué:', error.message);
    } else {
      console.log('✅ Test réussi: RLS fonctionne correctement');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'application RLS:', error);
  }
}

applyProductionRLS();