import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

import { Card, Input, Button, Avatar, Modal } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";
import { updateUserProfile, changePassword } from "services/auth";
import { USER_TYPES } from "configs/auth.config";
import { toast } from "react-toastify";

// Schema de validation pour le profil
const profileSchema = yup.object({
  nom: yup.string().required("Le nom est requis").max(100, "Maximum 100 caractères"),
  prenom: yup.string().max(100, "Maximum 100 caractères"),
  telephone: yup.string().required("Le téléphone est requis").max(20, "Maximum 20 caractères"),
  adresse: yup.string().max(255, "Maximum 255 caractères"),
  ville: yup.string().max(100, "Maximum 100 caractères"),
  code_postal: yup.string().max(20, "Maximum 20 caractères"),
  pays: yup.string().max(50, "Maximum 50 caractères"),
  num_bce: yup.string().max(20, "Maximum 20 caractères"),
  num_tva: yup.string().max(20, "Maximum 20 caractères"),
  tva_percent: yup.number().min(0, "Minimum 0%").max(100, "Maximum 100%"),
});

// Schema pour le changement de mot de passe
const passwordSchema = yup.object({
  currentPassword: yup.string().required("Le mot de passe actuel est requis"),
  newPassword: yup
    .string()
    .required("Le nouveau mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: yup
    .string()
    .required("La confirmation est requise")
    .oneOf([yup.ref("newPassword")], "Les mots de passe ne correspondent pas"),
});

export default function UserProfile() {
  const { user, updateProfile, refreshUserProfile, logout } = useAuthContext();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Form pour le profil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: user || {},
  });

  // Form pour le mot de passe
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      resetProfile(user);
      calculateProfileCompletion(user);
    }
  }, [user, resetProfile]);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (userData) => {
    const fields = [
      'nom', 'prenom', 'telephone', 'email', 'adresse',
      'ville', 'code_postal', 'pays', 'num_bce', 'num_tva'
    ];
    const completedFields = fields.filter(field => userData[field]).length;
    const completion = Math.round((completedFields / fields.length) * 100);
    setProfileCompletion(completion);
  };

  const handleProfileUpdate = async (data) => {
    setIsLoading(true);
    setSaveStatus(null);
    try {
      const updatedUser = await updateUserProfile(user.id, data);
      await updateProfile(updatedUser);
      await refreshUserProfile();
      setIsEditing(false);
      setSaveStatus('success');
      calculateProfileCompletion(updatedUser);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      setSaveStatus('error');
      toast.error(error.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (data) => {
    setIsLoading(true);
    try {
      await changePassword(user.id, data.currentPassword, data.newPassword);
      setIsChangingPassword(false);
      resetPassword();
      toast.success("Mot de passe modifié avec succès");
    } catch (error) {
      toast.error(error.message || "Erreur lors du changement de mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Déconnexion réussie");
      setShowLogoutModal(false);
      navigate("/login", {
        replace: true,
        state: {
          message: "Vous avez été déconnecté avec succès"
        }
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const getUserTypeLabel = (type) => {
    const labels = {
      [USER_TYPES.ADMIN]: "Administrateur",
      [USER_TYPES.GESTIONNAIRE]: "Gestionnaire",
      [USER_TYPES.CHAUFFEUR]: "Chauffeur",
      [USER_TYPES.CLIENT]: "Client",
    };
    return labels[type] || type;
  };

  const getUserTypeColor = (type) => {
    const colors = {
      [USER_TYPES.ADMIN]: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      [USER_TYPES.GESTIONNAIRE]: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      [USER_TYPES.CHAUFFEUR]: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      [USER_TYPES.CLIENT]: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête avec titre et navigation */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Mon Profil
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gérez vos informations personnelles et les paramètres de votre compte
              </p>
            </div>
            <Button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Section Profil - Vue d'ensemble */}
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <UserIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Vue d&apos;ensemble du profil
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Informations générales et statut de votre compte
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Avatar et informations principales */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-4">
                  <Avatar
                    size={16}
                    src="/images/100x100.png"
                    className="ring-4 ring-white dark:ring-gray-800"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.prenom && user.nom ? `${user.prenom} ${user.nom}` : user.email}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUserTypeColor(user.type_utilisateur)}`}>
                        {getUserTypeLabel(user.type_utilisateur)}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        user.actif
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {user.actif ? (
                          <>
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Actif
                          </>
                        ) : (
                          <>
                            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                            Inactif
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barre de progression du profil */}
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Profil complété
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300 ease-out"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {profileCompletion}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
          {/* Section Informations personnelles */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
                  <IdentificationIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Informations personnelles
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gérez vos informations personnelles et de contact
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {saveStatus === 'success' && (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircleIcon className="w-5 h-5 mr-1" />
                    <span className="text-sm">Sauvegardé</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-1" />
                    <span className="text-sm">Erreur</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setSaveStatus(null);
                  }}
                  disabled={isLoading}
                >
                  {isEditing ? "Annuler" : "Modifier"}
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmitProfile(handleProfileUpdate)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type d'utilisateur (lecture seule) */}
                <div className="md:col-span-2">
                  <Input
                    label="Type d'utilisateur"
                    value={getUserTypeLabel(user.type_utilisateur)}
                    disabled
                    prefix={<UserGroupIcon className="w-5 h-5" />}
                  />
                </div>

                {/* Nom */}
                <Input
                  label="Nom *"
                  placeholder="Nom de famille"
                  disabled={!isEditing}
                  prefix={<UserIcon className="w-5 h-5" />}
                  {...registerProfile("nom")}
                  error={profileErrors?.nom?.message}
                />

                {/* Prénom */}
                <Input
                  label="Prénom"
                  placeholder="Prénom"
                  disabled={!isEditing}
                  prefix={<UserIcon className="w-5 h-5" />}
                  {...registerProfile("prenom")}
                  error={profileErrors?.prenom?.message}
                />

                {/* Email (lecture seule) */}
                <Input
                  label="Email"
                  value={user.email}
                  disabled
                  prefix={<EnvelopeIcon className="w-5 h-5" />}
                />

                {/* Téléphone */}
                <Input
                  label="Téléphone *"
                  placeholder="Numéro de téléphone"
                  disabled={!isEditing}
                  prefix={<PhoneIcon className="w-5 h-5" />}
                  {...registerProfile("telephone")}
                  error={profileErrors?.telephone?.message}
                />

                {/* Adresse */}
                <Input
                  label="Adresse"
                  placeholder="Adresse complète"
                  disabled={!isEditing}
                  prefix={<MapPinIcon className="w-5 h-5" />}
                  {...registerProfile("adresse")}
                  error={profileErrors?.adresse?.message}
                />

                {/* Ville */}
                <Input
                  label="Ville"
                  placeholder="Ville"
                  disabled={!isEditing}
                  prefix={<BuildingOfficeIcon className="w-5 h-5" />}
                  {...registerProfile("ville")}
                  error={profileErrors?.ville?.message}
                />

                {/* Code postal */}
                <Input
                  label="Code postal"
                  placeholder="Code postal"
                  disabled={!isEditing}
                  {...registerProfile("code_postal")}
                  error={profileErrors?.code_postal?.message}
                />

                {/* Pays */}
                <Input
                  label="Pays"
                  placeholder="Pays"
                  disabled={!isEditing}
                  {...registerProfile("pays")}
                  error={profileErrors?.pays?.message}
                />

                {/* Numéro BCE */}
                <Input
                  label="Numéro BCE"
                  placeholder="Numéro d'entreprise BCE"
                  disabled={!isEditing}
                  {...registerProfile("num_bce")}
                  error={profileErrors?.num_bce?.message}
                />

                {/* Numéro TVA */}
                <Input
                  label="Numéro TVA"
                  placeholder="Numéro de TVA"
                  disabled={!isEditing}
                  {...registerProfile("num_tva")}
                  error={profileErrors?.num_tva?.message}
                />

                {/* Pourcentage TVA */}
                <Input
                  label="Pourcentage TVA (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  disabled={!isEditing}
                  prefix={<BanknotesIcon className="w-5 h-5" />}
                  {...registerProfile("tva_percent")}
                  error={profileErrors?.tva_percent?.message}
                />
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      resetProfile(user);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Sauvegarde..." : "Sauvegarder"}
                  </Button>
                </div>
              )}
            </form>
          </Card>

          {/* Informations spécifiques chauffeur */}
          {user.chauffeur && (
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                  <UserIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Informations Chauffeur
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Détails spécifiques à votre profil de chauffeur
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Numéro de badge"
                  value={user.chauffeur.numero_badge}
                  disabled
                />
                <Input
                  label="Date d'embauche"
                  value={new Date(user.chauffeur.date_embauche).toLocaleDateString()}
                  disabled
                />
                <Input
                  label="Type de contrat"
                  value={user.chauffeur.type_contrat || "Non spécifié"}
                  disabled
                />
                <Input
                  label="Taux de commission (%)"
                  value={user.chauffeur.taux_commission || "0"}
                  disabled
                />
                <Input
                  label="Salaire de base"
                  value={`${user.chauffeur.salaire_base || 0} €`}
                  disabled
                />
                <Input
                  label="Statut"
                  value={user.chauffeur.actif ? "Actif" : "Inactif"}
                  disabled
                />
              </div>
            </Card>
          )}

          {/* Section Sécurité */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sécurité
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gérez votre mot de passe et la sécurité de votre compte
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                disabled={isLoading}
              >
                {isChangingPassword ? "Annuler" : "Changer le mot de passe"}
              </Button>
            </div>

            {isChangingPassword && (
              <form onSubmit={handleSubmitPassword(handlePasswordChange)}>
                <div className="space-y-4">
                  <Input
                    label="Mot de passe actuel"
                    type="password"
                    placeholder="Entrez votre mot de passe actuel"
                    {...registerPassword("currentPassword")}
                    error={passwordErrors?.currentPassword?.message}
                  />
                  <Input
                    label="Nouveau mot de passe"
                    type="password"
                    placeholder="Entrez le nouveau mot de passe"
                    {...registerPassword("newPassword")}
                    error={passwordErrors?.newPassword?.message}
                  />
                  <Input
                    label="Confirmer le nouveau mot de passe"
                    type="password"
                    placeholder="Confirmez le nouveau mot de passe"
                    {...registerPassword("confirmPassword")}
                    error={passwordErrors?.confirmPassword?.message}
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      resetPassword();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Modification..." : "Modifier le mot de passe"}
                  </Button>
                </div>
              </form>
            )}

            {!isChangingPassword && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Dernière activité
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Dernière connexion : {user.last_login ? new Date(user.last_login).toLocaleString() : "Jamais"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Section Paramètres */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Cog6ToothIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Paramètres du compte
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Actions supplémentaires sur votre compte
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                    <ArrowRightOnRectangleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Déconnexion
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Se déconnecter de votre session actuelle
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogoutModal(true)}
                  className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                >
                  Déconnexion
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Modal de déconnexion */}
        {showLogoutModal && (
          <Modal
            isOpen={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            title="Confirmer la déconnexion"
          >
            <div className="space-y-6">
              {/* Informations de l'utilisateur */}
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {user?.prenom?.[0]?.toUpperCase() || user?.nom?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : user?.email}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUserTypeColor(user?.type_utilisateur)}`}>
                    {getUserTypeLabel(user?.type_utilisateur)}
                  </span>
                </div>
              </div>

              {/* Informations de session */}
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Session active
                    </p>
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      Dernière activité : {user?.last_login ? new Date(user.last_login).toLocaleString() : "Maintenant"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Se déconnecter
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
