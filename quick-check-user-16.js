import { createClient } from "@supabase/supabase-js";
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function quickCheck() {
  console.log('🔍 VÉRIFICATION RAPIDE - UTILISATEUR 16\n');

  // Vérifier l'utilisateur 16
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

    console.log(`✅ Utilisateur 16: ${userData.nom} ${userData.prenom} (${userData.email})`);
    console.log(`   Type: ${userData.type_utilisateur}, Actif: ${userData.actif}`);
    console.log('');

  } catch (err) {
    console.log(`❌ Erreur vérification utilisateur: ${err.message}`);
    return;
  }

  // Vérifier le chauffeur (avec jointure)
  console.log('🔍 VÉRIFICATION CHAUFFEUR:');
  let chauffeurExists = false;

  try {
    const { data: chauffeurData, error: chauffeurError } = await supabase
      .from('chauffeur')
      .select(`
        id,
        numero_badge,
        taux_commission,
        salaire_base,
        actif,
        utilisateur (
          nom,
          prenom,
          email
        )
      `)
      .eq('utilisateur_id', 16);

    if (chauffeurError) {
      console.log(`❌ Erreur chauffeur: ${chauffeurError.message}`);
      console.log('💡 Probablement RLS activé - test avec service_role nécessaire');
    } else if (!chauffeurData || chauffeurData.length === 0) {
      console.log(`❌ AUCUN CHAUFFEUR trouvé pour utilisateur 16`);
      console.log('💡 Il faut créer l\'enregistrement chauffeur');
    } else {
      chauffeurExists = true;
      console.log(`✅ CHAUFFEUR TROUVÉ:`);
      chauffeurData.forEach((ch, index) => {
        console.log(`   ${index + 1}. ${ch.utilisateur?.nom} ${ch.utilisateur?.prenom}`);
        console.log(`      Badge: ${ch.numero_badge}, Actif: ${ch.actif}`);
        console.log(`      Commission: ${ch.taux_commission}%, Salaire: ${ch.salaire_base}`);
      });
    }

  } catch (err) {
    console.log(`❌ Erreur vérification chauffeur: ${err.message}`);
  }

  console.log('\n🎯 CONCLUSION:');
  console.log('==============');

  if (chauffeurExists) {
    console.log('✅ L\'enregistrement chauffeur existe');
    console.log('💡 Si l\'erreur persiste, le problème est ailleurs (JWT, RLS, etc.)');
  } else {
    console.log('❌ L\'enregistrement chauffeur manque');
    console.log('💡 Exécutez le script SQL pour le créer');
  }
}

quickCheck();