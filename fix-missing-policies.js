console.log('🔧 POLITIQUES RLS MANQUANTES À APPLIQUER');
console.log('==========================================\n');

console.log('📋 Script SQL à exécuter dans Supabase Dashboard > SQL Editor :\n');

const missingPolicies = `
-- Politiques manquantes pour les tables bloquées
CREATE POLICY "authenticated_users_access" ON chauffeur
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_users_access" ON vehicule
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_users_access" ON client
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_users_access" ON course
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_users_access" ON facture
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
`;

console.log('```sql');
console.log(missingPolicies.trim());
console.log('```\n');

console.log('📝 INSTRUCTIONS:');
console.log('================');
console.log('1. Copiez le script ci-dessus');
console.log('2. Ouvrez Supabase Dashboard > SQL Editor');
console.log('3. Collez et exécutez le script');
console.log('4. Vérifiez avec: node diagnose-rls.js');
console.log('');
console.log('✅ Après application, toutes les tables seront accessibles !');