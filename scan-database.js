import { createClient } from "@supabase/supabase-js";
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;

// Essayer d'utiliser la clé service_role si elle existe, sinon utiliser anon
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function scanDatabase() {
  console.log('🔍 SCAN COMPLET DE LA BASE DE DONNÉES\n');

  console.log('📋 VÉRIFICATION UTILISATEUR 16:');
  console.log('===============================\n');

  try {
    const { data: userData, error: userError } = await supabase
      .from('utilisateur')
      .select('*')
      .eq('id', 16)
      .single();

    if (userError) {
      console.log(`❌ Utilisateur 16 non trouvé: ${userError.message}`);
      return;
    }

    console.log(`✅ Utilisateur trouvé:`);
    Object.entries(userData).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    console.log('');

  } catch (err) {
    console.log(`❌ Erreur vérification utilisateur: ${err.message}`);
    return;
  }

  console.log('📋 SCAN DE TOUS LES CHAUFFEURS:');
  console.log('===============================\n');

  let allError = null;
  let allChauffeurs = null;

  try {
    const result = await supabase
      .from('chauffeur')
      .select(`
        *,
        utilisateur (
          id,
          nom,
          prenom,
          email,
          type_utilisateur
        )
      `)
      .limit(50);

    allError = result.error;
    allChauffeurs = result.data;

    if (allError) {
      console.log(`❌ Erreur récupération chauffeurs: ${allError.message}`);
      console.log('💡 Impossible d\'accéder sans clé service_role');
    } else {
      console.log(`✅ ${allChauffeurs?.length || 0} chauffeurs trouvés dans la base:`);
      console.log('');

      let foundUser16 = false;
      allChauffeurs?.forEach((chauffeur, index) => {
        const isUser16 = chauffeur.utilisateur_id === 16;
        if (isUser16) foundUser16 = true;

        console.log(`${index + 1}. ${isUser16 ? '🎯 ' : '   '}CHAUFFEUR ID: ${chauffeur.id}`);
        console.log(`   Utilisateur ID: ${chauffeur.utilisateur_id}`);
        console.log(`   Badge: ${chauffeur.numero_badge}`);
        console.log(`   Actif: ${chauffeur.actif}`);
        console.log(`   Commission: ${chauffeur.taux_commission}%`);
        console.log(`   Salaire: ${chauffeur.salaire_base}`);
        if (chauffeur.utilisateur) {
          console.log(`   👤 Associé à: ${chauffeur.utilisateur.nom} ${chauffeur.utilisateur.prenom} (${chauffeur.utilisateur.email})`);
        }
        console.log('');
      });

      if (foundUser16) {
        console.log('🎉 TROUVÉ: L\'utilisateur 16 A un enregistrement chauffeur !');
      } else {
        console.log('❌ NON TROUVÉ: L\'utilisateur 16 N\'A PAS d\'enregistrement chauffeur');
      }
    }

  } catch (err) {
    console.log(`❌ Erreur scan chauffeurs: ${err.message}`);
  }

  console.log('📋 VÉRIFICATION SPÉCIFIQUE UTILISATEUR_ID = 16:');
  console.log('================================================\n');

  try {
    const { data: chauffeur16, error: chauffeur16Error } = await supabase
      .from('chauffeur')
      .select(`
        *,
        utilisateur (
          id,
          nom,
          prenom,
          email,
          type_utilisateur
        )
      `)
      .eq('utilisateur_id', 16);

    if (chauffeur16Error) {
      console.log(`❌ Erreur requête spécifique: ${chauffeur16Error.message}`);
    } else if (!chauffeur16 || chauffeur16.length === 0) {
      console.log('❌ AUCUN enregistrement chauffeur trouvé pour utilisateur_id = 16');
      console.log('💡 L\'enregistrement chauffeur manque effectivement');
    } else {
      console.log('✅ ENREGISTREMENT CHAUFFEUR TROUVÉ:');
      chauffeur16.forEach((ch, index) => {
        console.log(`   ${index + 1}. ID: ${ch.id}, Badge: ${ch.numero_badge}, Actif: ${ch.actif}`);
        console.log(`      Commission: ${ch.taux_commission}%, Salaire: ${ch.salaire_base}`);
      });
    }

  } catch (err) {
    console.log(`❌ Erreur vérification spécifique: ${err.message}`);
  }

  console.log('\n🎯 CONCLUSION FINALE:');
  console.log('=====================\n');

  console.log('🔍 RÉSULTATS DU SCAN:');
  console.log('=====================');

  if (allError) {
    console.log('❌ Impossible d\'accéder aux données chauffeur (probablement RLS)');
    console.log('💡 Utilisez la clé service_role ou exécutez le script SQL dans Supabase Dashboard');
  } else {
    console.log('✅ Accès aux données réussi');
    console.log('📊 Base de données scannée complètement');
  }

  console.log('\n💡 PROCHAINES ÉTAPES:');
  console.log('=====================');
  console.log('1. Si chauffeur manquant: Exécutez le script SQL dans Supabase Dashboard');
  console.log('2. Rechargez l\'application et testez à nouveau');
  console.log('3. L\'erreur 401 devrait disparaître');
}

scanDatabase();