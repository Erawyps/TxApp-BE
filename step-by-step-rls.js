console.log('🔧 APPROCHE ALTERNATIVE - Politiques UNE PAR UNE');
console.log('==================================================\n');

console.log('📋 Appliquez CES COMMANDES UNE PAR UNE dans Supabase SQL Editor :\n');

// Commandes individuelles pour diagnostiquer où ça bloque
const individualCommands = [
  {
    title: "1. Supprimer les politiques chauffeur",
    sql: "DROP POLICY IF EXISTS \"authenticated_users_access\" ON chauffeur;"
  },
  {
    title: "2. Activer RLS chauffeur",
    sql: "ALTER TABLE chauffeur ENABLE ROW LEVEL SECURITY;"
  },
  {
    title: "3. Créer politique chauffeur",
    sql: "CREATE POLICY \"authenticated_users_access\" ON chauffeur FOR ALL TO authenticated USING (true) WITH CHECK (true);"
  },
  {
    title: "4. Supprimer les politiques vehicule",
    sql: "DROP POLICY IF EXISTS \"authenticated_users_access\" ON vehicule;"
  },
  {
    title: "5. Activer RLS vehicule",
    sql: "ALTER TABLE vehicule ENABLE ROW LEVEL SECURITY;"
  },
  {
    title: "6. Créer politique vehicule",
    sql: "CREATE POLICY \"authenticated_users_access\" ON vehicule FOR ALL TO authenticated USING (true) WITH CHECK (true);"
  },
  {
    title: "7. Supprimer les politiques client",
    sql: "DROP POLICY IF EXISTS \"authenticated_users_access\" ON client;"
  },
  {
    title: "8. Activer RLS client",
    sql: "ALTER TABLE client ENABLE ROW LEVEL SECURITY;"
  },
  {
    title: "9. Créer politique client",
    sql: "CREATE POLICY \"authenticated_users_access\" ON client FOR ALL TO authenticated USING (true) WITH CHECK (true);"
  },
  {
    title: "10. Supprimer les politiques course",
    sql: "DROP POLICY IF EXISTS \"authenticated_users_access\" ON course;"
  },
  {
    title: "11. Activer RLS course",
    sql: "ALTER TABLE course ENABLE ROW LEVEL SECURITY;"
  },
  {
    title: "12. Créer politique course",
    sql: "CREATE POLICY \"authenticated_users_access\" ON course FOR ALL TO authenticated USING (true) WITH CHECK (true);"
  },
  {
    title: "13. Supprimer les politiques facture",
    sql: "DROP POLICY IF EXISTS \"authenticated_users_access\" ON facture;"
  },
  {
    title: "14. Activer RLS facture",
    sql: "ALTER TABLE facture ENABLE ROW LEVEL SECURITY;"
  },
  {
    title: "15. Créer politique facture",
    sql: "CREATE POLICY \"authenticated_users_access\" ON facture FOR ALL TO authenticated USING (true) WITH CHECK (true);"
  },
  {
    title: "16. VÉRIFICATION FINALE",
    sql: "SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('chauffeur', 'vehicule', 'client', 'course', 'facture');"
  }
];

individualCommands.forEach((cmd, index) => {
  console.log(`${cmd.title}:`);
  console.log(`\`\`\`sql`);
  console.log(cmd.sql);
  console.log(`\`\`\`\n`);
});

console.log('📝 INSTRUCTIONS DÉTAILLÉES:');
console.log('===========================');
console.log('1. Ouvrez Supabase Dashboard > SQL Editor');
console.log('2. Créez une nouvelle requête');
console.log('3. Copiez-collez la commande 1 et exécutez-la');
console.log('4. Si ça marche, passez à la commande 2');
console.log('5. Continuez jusqu\'à la commande 15');
console.log('6. Exécutez la commande 16 pour vérifier');
console.log('7. Arrêtez-vous à la première commande qui échoue');
console.log('8. Dites-moi quelle commande a échoué et pourquoi\n');

console.log('🎯 AVANTAGE: Si une commande échoue, on saura exactement laquelle!');
console.log('🔍 Après chaque commande, vous devriez voir "Success" en vert.\n');

console.log('💡 ASTUCE: Si vous voyez une erreur, c\'est probablement parce que:');
console.log('   - La politique existe déjà (c\'est normal)');
console.log('   - RLS est déjà activé (c\'est normal)');
console.log('   - Il y a une faute de frappe (revérifiez)');