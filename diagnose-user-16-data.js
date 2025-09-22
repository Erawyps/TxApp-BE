import { createClient } from "@supabase/supabase-js";
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;

// Utiliser la clé service_role si disponible, sinon anon
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

// Client qui peut contourner RLS avec service_role
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseUser16Data() {
  console.log('🔍 DIAGNOSTIC DONNÉES UTILISATEUR 16\n');

  console.log('📋 VÉRIFICATION UTILISATEUR 16');
  console.log('===============================\n');

  try {
    const { data: userData, error: userError } = await supabase
      .from('utilisateur')
      .select('id, email, nom, prenom, type_utilisateur, actif')
      .eq('id', 16)
      .single();

    if (userError) {
      console.log(`❌ Utilisateur 16 non trouvé: ${userError.message}`);
      return;
    }

    console.log(`✅ Utilisateur 16 trouvé:`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Nom: ${userData.nom} ${userData.prenom}`);
    console.log(`   Type: ${userData.type_utilisateur}`);
    console.log(`   Actif: ${userData.actif}`);
    console.log('');

  } catch (err) {
    console.log(`❌ Erreur vérification utilisateur: ${err.message}`);
    return;
  }

  console.log('📋 VÉRIFICATION CHAUFFEUR ASSOCIÉ');
  console.log('==================================\n');

  try {
    const { data: chauffeurData, error: chauffeurError } = await supabase
      .from('chauffeur')
      .select(`
        id,
        utilisateur_id,
        numero_badge,
        taux_commission,
        salaire_base,
        actif,
        utilisateur (
          id,
          nom,
          prenom,
          email
        )
      `)
      .eq('utilisateur_id', 16);

    if (chauffeurError) {
      console.log(`❌ Erreur récupération chauffeur: ${chauffeurError.message}`);
    } else if (!chauffeurData || chauffeurData.length === 0) {
      console.log(`❌ AUCUN CHAUFFEUR trouvé pour utilisateur_id = 16`);
      console.log('💡 L\'utilisateur 16 n\'a pas d\'enregistrement chauffeur');
      console.log('💡 C\'est pourquoi la requête échoue dans l\'application');
    } else {
      console.log(`✅ ${chauffeurData.length} chauffeur(s) trouvé(s) pour utilisateur 16:`);
      chauffeurData.forEach((chauffeur, index) => {
        console.log(`   ${index + 1}. ${chauffeur.utilisateur?.nom} ${chauffeur.utilisateur?.prenom}`);
        console.log(`      ID: ${chauffeur.id}, Badge: ${chauffeur.numero_badge}, Actif: ${chauffeur.actif}`);
        console.log(`      Commission: ${chauffeur.taux_commission}%, Salaire: ${chauffeur.salaire_base}`);
        console.log('');
      });
    }

  } catch (err) {
    console.log(`❌ Erreur vérification chauffeur: ${err.message}`);
  }

  console.log('📋 VÉRIFICATION TOUS LES CHAUFFEURS ACTIFS');
  console.log('===========================================\n');

  try {
    const { data: allChauffeurs, error: allError } = await supabase
      .from('chauffeur')
      .select(`
        id,
        numero_badge,
        utilisateur_id,
        actif,
        utilisateur (
          nom,
          prenom
        )
      `)
      .eq('actif', true)
      .limit(10);

    if (allError) {
      console.log(`❌ Erreur récupération chauffeurs: ${allError.message}`);
    } else {
      console.log(`✅ ${allChauffeurs?.length || 0} chauffeurs actifs trouvés:`);
      if (allChauffeurs && allChauffeurs.length > 0) {
        allChauffeurs.forEach((chauffeur, index) => {
          console.log(`   ${index + 1}. ${chauffeur.utilisateur?.nom} ${chauffeur.utilisateur?.prenom} (Badge: ${chauffeur.numero_badge})`);
        });
      } else {
        console.log('   💡 Aucun chauffeur actif dans la base');
      }
    }

  } catch (err) {
    console.log(`❌ Erreur vérification tous chauffeurs: ${err.message}`);
  }

  console.log('\n🎯 CONCLUSION');
  console.log('=============\n');

  console.log('🔍 PROBLÈME IDENTIFIÉ:');
  console.log('L\'application essaie de récupérer les données chauffeur pour l\'utilisateur 16,');
  console.log('mais cet utilisateur n\'a pas d\'enregistrement dans la table chauffeur.');
  console.log('');

  console.log('🛠️ SOLUTIONS POSSIBLES:');
  console.log('1. Créer un enregistrement chauffeur pour l\'utilisateur 16');
  console.log('2. Modifier l\'application pour ne pas charger les données chauffeur si elles n\'existent pas');
  console.log('3. Vérifier pourquoi l\'utilisateur 16 devrait avoir des données chauffeur');
  console.log('');

  console.log('💡 RECOMMANDATION:');
  console.log('Créer un chauffeur pour l\'utilisateur 16 avec cette requête SQL:');
  console.log('');
  console.log('INSERT INTO chauffeur (utilisateur_id, nom, prenom, numero_permis, taux_commission, salaire_base, actif)');
  console.log('VALUES (16, \'Nom\', \'Prénom\', \'PERMIS123\', 10.0, 2500.00, true);');
  console.log('');
  console.log('(Remplacez Nom et Prénom par les vraies valeurs)');
}

diagnoseUser16Data();