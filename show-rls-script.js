import { readFileSync } from 'fs';

console.log('🔧 SCRIPT RLS DE PRODUCTION - À COPIER DANS SUPABASE DASHBOARD');
console.log('================================================================\n');

// Lire et afficher le script SQL
try {
  const sqlContent = readFileSync('./production-rls-simple.sql', 'utf8');
  console.log('📋 Copiez-collez ce script dans Supabase Dashboard > SQL Editor :\n');
  console.log('```sql');
  console.log(sqlContent);
  console.log('```\n');

  console.log('📝 INSTRUCTIONS :');
  console.log('================');
  console.log('1. Ouvrez https://supabase.com/dashboard/project/jfrhzwtkfotsrjkacrns');
  console.log('2. Allez dans "SQL Editor" dans le menu de gauche');
  console.log('3. Créez une nouvelle requête');
  console.log('4. Copiez-collez le script ci-dessus');
  console.log('5. Cliquez sur "Run" pour exécuter');
  console.log('');
  console.log('✅ Après exécution, vos politiques RLS seront actives !');

} catch (error) {
  console.error('❌ Erreur lors de la lecture du fichier SQL:', error.message);
}