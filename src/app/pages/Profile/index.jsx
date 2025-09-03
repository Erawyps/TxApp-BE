import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

import { Card, Input, Button } from "components/ui";
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
  const { user, updateProfile, refreshUserProfile } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    }
  }, [user, resetProfile]);

  const handleProfileUpdate = async (data) => {
    setIsLoading(true);
    try {
      const updatedUser = await updateUserProfile(user.id, data);
      await updateProfile(updatedUser);
      await refreshUserProfile();
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
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

  const getUserTypeLabel = (type) => {
    const labels = {
      [USER_TYPES.ADMIN]: "Administrateur",
      [USER_TYPES.GESTIONNAIRE]: "Gestionnaire",
      [USER_TYPES.CHAUFFEUR]: "Chauffeur",
      [USER_TYPES.CLIENT]: "Client",
    };
    return labels[type] || type;
  };

  if (!user) {
    return <div>Chargement du profil...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Informations du profil
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Annuler" : "Modifier"}
          </Button>
        </div>

        <form onSubmit={handleSubmitProfile(handleProfileUpdate)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type d'utilisateur (lecture seule) */}
            <div className="md:col-span-2">
              <Input
                label="Type d'utilisateur"
                value={getUserTypeLabel(user.type_utilisateur)}
                disabled
                prefix={<IdentificationIcon className="w-5 h-5" />}
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informations Chauffeur
          </h3>
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

      {/* Changement de mot de passe */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sécurité
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsChangingPassword(!isChangingPassword)}
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
          <p className="text-gray-600 dark:text-gray-400">
            Dernière connexion : {user.last_login ? new Date(user.last_login).toLocaleString() : "Jamais"}
          </p>
        )}
      </Card>
    </div>
  );
}
