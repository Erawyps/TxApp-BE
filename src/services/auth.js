import { supabase } from "utils/supabase";
import bcrypt from "bcryptjs";

/**
 * Service d'authentification pour TxApp
 * Utilise Supabase avec PostgreSQL pour la gestion des utilisateurs
 */

/**
 * Connexion d'un utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe
 * @returns {Promise<{user: Object, session: Object}>}
 */
export const loginUser = async (email, password) => {
  try {
    // Récupérer l'utilisateur depuis la base de données
    const { data: userData, error: userError } = await supabase
      .from('utilisateur')
      .select('*')
      .eq('email', email)
      .eq('actif', true)
      .single();

    if (userError || !userData) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, userData.mot_de_passe);

    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Mettre à jour la dernière connexion
    await supabase
      .from('utilisateur')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id);

    // Retourner l'utilisateur sans le mot de passe
    // eslint-disable-next-line no-unused-vars
    const { mot_de_passe, reset_token, reset_token_expires, ...userWithoutPassword } = userData;

    return {
      user: userWithoutPassword,
      success: true
    };

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
};

/**
 * Récupérer le profil utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<Object>}
 */
export const getUserProfile = async (userId) => {
  try {
    // D'abord récupérer l'utilisateur de base
    const { data: userData, error: userError } = await supabase
      .from('utilisateur')
      .select('*')
      .eq('id', userId)
      .eq('actif', true)
      .single();

    if (userError) {
      console.error('Erreur Supabase lors de la récupération du profil utilisateur:', userError);

      // Si l'utilisateur n'existe pas ou n'est pas actif, nettoyer la session
      if (userError.code === 'PGRST116' || userError.details?.includes('0 rows')) {
        // Nettoyer le token invalide
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('authToken');
        }
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      throw new Error('Utilisateur non trouvé');
    }

    // Ensuite, essayer de récupérer les données chauffeur optionnellement
    let chauffeurData = null;
    try {
      const { data: chauffeur, error: chauffeurError } = await supabase
        .from('chauffeur')
        .select('id, numero_badge, date_embauche, type_contrat, taux_commission, salaire_base, actif')
        .eq('utilisateur_id', userId)
        .eq('actif', true)
        .maybeSingle(); // Utiliser maybeSingle au lieu de single pour éviter les erreurs si pas de résultat

      if (!chauffeurError && chauffeur) {
        chauffeurData = chauffeur;
      } else if (chauffeurError && chauffeurError.code !== 'PGRST116') {
        // Log seulement si ce n'est pas juste "pas de résultat"
        console.warn('Erreur lors de la récupération des données chauffeur:', chauffeurError);
      }
    } catch (chauffeurErr) {
      // Ignorer les erreurs de permissions pour la table chauffeur
      console.warn('Impossible de récupérer les données chauffeur (permissions):', chauffeurErr);
    }

    // Construire le profil utilisateur complet
    const userProfile = {
      ...userData,
      chauffeur: chauffeurData
    };

    // Retourner sans le mot de passe
    // eslint-disable-next-line no-unused-vars
    const { mot_de_passe: _, reset_token: __, reset_token_expires: ___, ...userWithoutPassword } = userProfile;

    return userWithoutPassword;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    throw error;
  }
};

/**
 * Créer un nouvel utilisateur
 * @param {Object} userData - Données de l'utilisateur
 * @returns {Promise<Object>}
 */
export const createUser = async (userData) => {
  try {
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const newUser = {
      type_utilisateur: userData.type_utilisateur || 'CHAUFFEUR', // Changé en majuscules
      nom: userData.nom,
      prenom: userData.prenom,
      telephone: userData.telephone,
      email: userData.email,
      mot_de_passe: hashedPassword,
      adresse: userData.adresse || null,
      ville: userData.ville || null,
      code_postal: userData.code_postal || null,
      pays: userData.pays || 'Belgique',
      num_bce: userData.num_bce || null,
      num_tva: userData.num_tva || null,
      tva_applicable: userData.tva_applicable ?? true,
      tva_percent: userData.tva_percent || 21.00,
      actif: true
      // Suppression de date_creation car il y a déjà created_at avec default
    };

    const { data, error } = await supabase
      .from('utilisateur')
      .insert([newUser])
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase détaillée:', error);
      if (error.code === '23505') { // Code d'erreur pour violation de contrainte unique
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
      if (error.code === '23514') { // Code d'erreur pour violation de contrainte check
        throw new Error('Type d\'utilisateur invalide. Valeurs autorisées: ADMIN, CHAUFFEUR, DISPATCHER, COMPTABLE');
      }
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    }

    // Retourner sans le mot de passe
    // eslint-disable-next-line no-unused-vars
    const { mot_de_passe: _, ...userWithoutPassword } = data;
    return userWithoutPassword;

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * Mettre à jour le profil utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>}
 */
export const updateUserProfile = async (userId, updateData) => {
  try {
    // Préparer les données de mise à jour
    const allowedFields = [
      'nom', 'prenom', 'telephone', 'adresse', 'ville',
      'code_postal', 'pays', 'num_bce', 'num_tva',
      'tva_applicable', 'tva_percent'
    ];

    const dataToUpdate = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        dataToUpdate[field] = updateData[field];
      }
    });

    dataToUpdate.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('utilisateur')
      .update(dataToUpdate)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error('Erreur lors de la mise à jour du profil');
    }

    // Retourner sans le mot de passe
    // eslint-disable-next-line no-unused-vars
    const { mot_de_passe: _, reset_token: __, reset_token_expires: ___, ...userWithoutPassword } = data;
    return userWithoutPassword;

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw error;
  }
};

/**
 * Changer le mot de passe
 * @param {number} userId - ID de l'utilisateur
 * @param {string} currentPassword - Mot de passe actuel
 * @param {string} newPassword - Nouveau mot de passe
 * @returns {Promise<boolean>}
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: userData, error: userError } = await supabase
      .from('utilisateur')
      .select('mot_de_passe')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.mot_de_passe);

    if (!isCurrentPasswordValid) {
      throw new Error('Mot de passe actuel incorrect');
    }

    // Hash du nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour le mot de passe
    const { error: updateError } = await supabase
      .from('utilisateur')
      .update({
        mot_de_passe: hashedNewPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Erreur lors de la mise à jour du mot de passe');
    }

    return true;

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    throw error;
  }
};
