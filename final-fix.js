console.log('🔧 CORRECTION FINALE - UNE COMMANDE PAR TABLE');
console.log('==============================================\n');

console.log('📋 Appliquez UNE SEULE commande à la fois dans Supabase SQL Editor :\n');

const tables = ['chauffeur', 'vehicule', 'client', 'course', 'facture'];

tables.forEach((table, index) => {
  const commandNumber = index + 1;

  console.log(`🚀 COMMANDE ${commandNumber} - Table ${table.toUpperCase()}:`);
  console.log('```sql');
  console.log(`-- Supprimer si existe et recréer la politique pour ${table}`);
  console.log(`DROP POLICY IF EXISTS "authenticated_users_access" ON ${table};`);
  console.log(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
  console.log(`CREATE POLICY "authenticated_users_access" ON ${table} FOR ALL TO authenticated USING (true) WITH CHECK (true);`);
  console.log('```\n');

  console.log(`📝 INSTRUCTIONS pour la commande ${commandNumber}:`);
  console.log(`1. Copiez les 3 lignes ci-dessus`);
  console.log(`2. Collez dans Supabase SQL Editor`);
  console.log(`3. Cliquez sur "Run"`);
  console.log(`4. Vous devriez voir "Success"`);
  console.log(`5. Passez à la commande suivante\n`);
});

console.log('🔍 APRÈS TOUTES LES COMMANDES:');
console.log('==============================\n');

console.log('Vérification finale:');
console.log('```sql');
console.log("SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('chauffeur', 'vehicule', 'client', 'course', 'facture');");
console.log('```\n');

console.log('🎯 RÉSULTAT ATTENDU:');
console.log('===================');
console.log('- Après chaque commande: "Success" en vert');
console.log('- Après la vérification: 5 lignes avec les politiques');
console.log('- Après le diagnostic: Toutes les tables en "SUCCÈS"\n');

console.log('💡 SI UNE COMMANDE ÉCHoue:');
console.log('===========================');
console.log('- Notez le numéro de la commande');
console.log('- Copiez le message d\'erreur exact');
console.log('- Dites-moi lequel et pourquoi\n');

console.log('🚀 COMMENCEZ PAR LA COMMANDE 1 !');