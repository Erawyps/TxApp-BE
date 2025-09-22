console.log('📋 COMMANDES DÉTAILLÉES POUR CHAQUE TABLE');
console.log('==========================================\n');

const tableCommands = {
  vehicule: [
    {
      step: 4,
      title: "Supprimer les politiques vehicule",
      sql: "DROP POLICY IF EXISTS \"authenticated_users_access\" ON vehicule;"
    },
    {
      step: 5,
      title: "Activer RLS vehicule",
      sql: "ALTER TABLE vehicule ENABLE ROW LEVEL SECURITY;"
    },
    {
      step: 6,
      title: "Créer politique vehicule",
      sql: "CREATE POLICY \"authenticated_users_access\" ON vehicule FOR ALL TO authenticated USING (true) WITH CHECK (true);"
    }
  ],
  client: [
    {
      step: 7,
      title: "Supprimer les politiques client",
      sql: "DROP POLICY IF EXISTS \"authenticated_users_access\" ON client;"
    },
    {
      step: 8,
      title: "Activer RLS client",
      sql: "ALTER TABLE client ENABLE ROW LEVEL SECURITY;"
    },
    {
      step: 9,
      title: "Créer politique client",
      sql: "CREATE POLICY \"authenticated_users_access\" ON client FOR ALL TO authenticated USING (true) WITH CHECK (true);"
    }
  ],
  course: [
    {
      step: 10,
      title: "Supprimer les politiques course",
      sql: "DROP POLICY IF EXISTS \"authenticated_users_access\" ON course;"
    },
    {
      step: 11,
      title: "Activer RLS course",
      sql: "ALTER TABLE course ENABLE ROW LEVEL SECURITY;"
    },
    {
      step: 12,
      title: "Créer politique course",
      sql: "CREATE POLICY \"authenticated_users_access\" ON course FOR ALL TO authenticated USING (true) WITH CHECK (true);"
    }
  ],
  facture: [
    {
      step: 13,
      title: "Supprimer les politiques facture",
      sql: "DROP POLICY IF EXISTS \"authenticated_users_access\" ON facture;"
    },
    {
      step: 14,
      title: "Activer RLS facture",
      sql: "ALTER TABLE facture ENABLE ROW LEVEL SECURITY;"
    },
    {
      step: 15,
      title: "Créer politique facture",
      sql: "CREATE POLICY \"authenticated_users_access\" ON facture FOR ALL TO authenticated USING (true) WITH CHECK (true);"
    }
  ]
};

console.log('🚗 POUR LA TABLE VEHICULE:');
console.log('==========================\n');

tableCommands.vehicule.forEach(cmd => {
  console.log(`${cmd.step}. ${cmd.title}:`);
  console.log('```sql');
  console.log(cmd.sql);
  console.log('```\n');
});

console.log('👥 POUR LA TABLE CLIENT:');
console.log('========================\n');

tableCommands.client.forEach(cmd => {
  console.log(`${cmd.step}. ${cmd.title}:`);
  console.log('```sql');
  console.log(cmd.sql);
  console.log('```\n');
});

console.log('🚕 POUR LA TABLE COURSE:');
console.log('========================\n');

tableCommands.course.forEach(cmd => {
  console.log(`${cmd.step}. ${cmd.title}:`);
  console.log('```sql');
  console.log(cmd.sql);
  console.log('```\n');
});

console.log('💰 POUR LA TABLE FACTURE:');
console.log('=========================\n');

tableCommands.facture.forEach(cmd => {
  console.log(`${cmd.step}. ${cmd.title}:`);
  console.log('```sql');
  console.log(cmd.sql);
  console.log('```\n');
});

console.log('🔍 VÉRIFICATION FINALE:');
console.log('=======================\n');

console.log('16. VÉRIFICATION FINALE:');
console.log('```sql');
console.log("SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('chauffeur', 'vehicule', 'client', 'course', 'facture');");
console.log('```\n');

console.log('📝 RAPPEL DES INSTRUCTIONS:');
console.log('===========================');
console.log('1. Commencez par les commandes chauffeur (1-3) que vous avez déjà faites');
console.log('2. Continuez avec vehicule (4-6)');
console.log('3. Puis client (7-9)');
console.log('4. Puis course (10-12)');
console.log('5. Puis facture (13-15)');
console.log('6. Terminez par la vérification (16)');
console.log('7. À chaque commande, vérifiez que vous voyez "Success"');
console.log('8. Si une commande échoue, arrêtez-vous et dites-moi laquelle\n');

console.log('🎯 OBJECTIF: Après la commande 16, vous devriez voir 5 lignes avec les politiques créées!');