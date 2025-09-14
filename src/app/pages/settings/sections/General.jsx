// Import Dependencies
import { useState } from "react";
import { PhoneIcon, XMarkIcon, UserIcon, EnvelopeIcon, MapPinIcon, BuildingOfficeIcon } from "@heroicons/react/20/solid";
import { IdentificationIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";

// Local Imports
import { PreviewImg } from "components/shared/PreviewImg";
import { Avatar, Button, Input, Upload } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";

// ----------------------------------------------------------------------

// Schema de validation pour les informations générales
const generalSchema = yup.object({
  nom: yup.string().required("Le nom est requis").max(100, "Maximum 100 caractères"),
  prenom: yup.string().max(100, "Maximum 100 caractères"),
  telephone: yup.string().required("Le téléphone est requis").max(20, "Maximum 20 caractères"),
  email: yup.string().email("Email invalide").required("L'email est requis"),
  adresse: yup.string().max(255, "Maximum 255 caractères"),
  ville: yup.string().max(100, "Maximum 100 caractères"),
  code_postal: yup.string().max(20, "Maximum 20 caractères"),
  pays: yup.string().max(50, "Maximum 50 caractères"),
  num_bce: yup.string().max(20, "Maximum 20 caractères"),
  num_tva: yup.string().max(20, "Maximum 20 caractères"),
  tva_percent: yup.number().min(0, "Minimum 0%").max(100, "Maximum 100%"),
});

export default function General() {
  const { user, updateProfile } = useAuthContext();
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(generalSchema),
    defaultValues: user || {},
  });

  const handleUpdateProfile = async (data) => {
    setIsLoading(true);
    try {
      // TODO: Implement profile update logic
      await updateProfile(data);
      setIsEditing(false);
      toast.success("Informations mises à jour avec succès");
    } catch {
      toast.error("Erreur lors de la mise à jour des informations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset(user);
    setIsEditing(false);
  };

  const getUserTypeLabel = (type) => {
    const labels = {
      admin: "Administrateur",
      gestionnaire: "Gestionnaire",
      chauffeur: "Chauffeur",
      client: "Client",
    };
    return labels[type] || type;
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div>
        <h5 className="text-lg font-medium text-gray-800 dark:text-dark-50">
          Informations générales
        </h5>
        <p className="mt-0.5 text-balance text-sm text-gray-500 dark:text-dark-200">
          Gérez vos informations personnelles et professionnelles.
        </p>
      </div>

      <div className="h-px bg-gray-200 dark:bg-dark-500" />

      {/* Avatar et informations de base */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section Avatar */}
        <div className="lg:col-span-1">
          <div className="flex flex-col items-center space-y-4">
            <Avatar
              size={24}
              imgComponent={PreviewImg}
              imgProps={{ file: avatar }}
              src="/images/100x100.png"
              classNames={{
                root: "rounded-xl ring-primary-600 ring-offset-[3px] ring-offset-white transition-all hover:ring-3 dark:ring-primary-500 dark:ring-offset-dark-700",
                display: "rounded-xl",
              }}
              indicator={
                <div className="absolute bottom-0 right-0 -m-1 flex items-center justify-center rounded-full bg-white dark:bg-dark-700">
                  {avatar ? (
                    <Button
                      onClick={() => setAvatar(null)}
                      isIcon
                      className="size-6 rounded-full"
                    >
                      <XMarkIcon className="size-4" />
                    </Button>
                  ) : (
                    <Upload name="avatar" onChange={setAvatar} accept="image/*">
                      {({ ...props }) => (
                        <Button
                          {...props}
                          isIcon
                          className="size-6 rounded-full"
                        >
                          <UserIcon className="size-4" />
                        </Button>
                      )}
                    </Upload>
                  )}
                </div>
              }
            />
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Photo de profil
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG jusqu&apos;à 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Informations du compte */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Informations du compte
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Annuler" : "Modifier"}
            </Button>
          </div>

          <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-4">
            {/* Type d'utilisateur (lecture seule) */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Type d&apos;utilisateur
              </label>
              <Input
                value={getUserTypeLabel(user?.type_utilisateur)}
                disabled
                prefix={<IdentificationIcon className="w-5 h-5" />}
                className="mt-1"
              />
            </div>

            {/* Nom et prénom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom *"
                placeholder="Nom de famille"
                disabled={!isEditing}
                prefix={<UserIcon className="w-5 h-5" />}
                {...register("nom")}
                error={errors?.nom?.message}
              />
              <Input
                label="Prénom"
                placeholder="Prénom"
                disabled={!isEditing}
                prefix={<UserIcon className="w-5 h-5" />}
                {...register("prenom")}
                error={errors?.prenom?.message}
              />
            </div>

            {/* Email et téléphone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email *"
                placeholder="votre.email@exemple.com"
                disabled={!isEditing}
                prefix={<EnvelopeIcon className="w-5 h-5" />}
                {...register("email")}
                error={errors?.email?.message}
              />
              <Input
                label="Téléphone *"
                placeholder="+32 123 456 789"
                disabled={!isEditing}
                prefix={<PhoneIcon className="w-5 h-5" />}
                {...register("telephone")}
                error={errors?.telephone?.message}
              />
            </div>

            {/* Adresse */}
            <Input
              label="Adresse"
              placeholder="Adresse complète"
              disabled={!isEditing}
              prefix={<MapPinIcon className="w-5 h-5" />}
              {...register("adresse")}
              error={errors?.adresse?.message}
            />

            {/* Ville, Code postal, Pays */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Ville"
                placeholder="Ville"
                disabled={!isEditing}
                prefix={<BuildingOfficeIcon className="w-5 h-5" />}
                {...register("ville")}
                error={errors?.ville?.message}
              />
              <Input
                label="Code postal"
                placeholder="1234"
                disabled={!isEditing}
                {...register("code_postal")}
                error={errors?.code_postal?.message}
              />
              <Input
                label="Pays"
                placeholder="Belgique"
                disabled={!isEditing}
                {...register("pays")}
                error={errors?.pays?.message}
              />
            </div>

            {/* Informations professionnelles */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Informations professionnelles
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Numéro BCE"
                  placeholder="0123456789"
                  disabled={!isEditing}
                  {...register("num_bce")}
                  error={errors?.num_bce?.message}
                />
                <Input
                  label="Numéro TVA"
                  placeholder="BE0123456789"
                  disabled={!isEditing}
                  {...register("num_tva")}
                  error={errors?.num_tva?.message}
                />
              </div>

              <div className="mt-4">
                <Input
                  label="Pourcentage TVA (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  disabled={!isEditing}
                  prefix={<BanknotesIcon className="w-5 h-5" />}
                  {...register("tva_percent")}
                  error={errors?.tva_percent?.message}
                />
              </div>
            </div>

            {/* Boutons d'action */}
            {isEditing && (
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Métadonnées du compte */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Métadonnées du compte
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Date de création</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.date_creation ? new Date(user.date_creation).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Dernière connexion</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.last_login ? new Date(user.last_login).toLocaleDateString() : "Jamais"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Statut</p>
            <p className={`font-medium ${user?.actif ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {user?.actif ? "Actif" : "Inactif"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}