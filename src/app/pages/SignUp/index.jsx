import { Link, useNavigate } from "react-router";
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import * as yup from "yup";

import Logo from "assets/appLogo.svg?react";
import { Button, Card, Input, Select } from "components/ui";
import { Page } from "components/shared/Page";
import { createUser } from "services/auth";
import { USER_TYPES } from "configs/auth.config";
import { toast } from "react-toastify";

// Schema de validation pour l'inscription
const registerSchema = yup.object({
  email: yup
    .string()
    .required("L'email est requis")
    .email("Format d'email invalide")
    .max(100, "Maximum 100 caractères"),
  password: yup
    .string()
    .required("Le mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: yup
    .string()
    .required("La confirmation est requise")
    .oneOf([yup.ref("password")], "Les mots de passe ne correspondent pas"),
  nom: yup
    .string()
    .required("Le nom est requis")
    .max(100, "Maximum 100 caractères"),
  prenom: yup
    .string()
    .max(100, "Maximum 100 caractères"),
  telephone: yup
    .string()
    .required("Le téléphone est requis")
    .max(20, "Maximum 20 caractères"),
  type_utilisateur: yup
    .string()
    .required("Le type d'utilisateur est requis")
    .oneOf(Object.values(USER_TYPES), "Type d'utilisateur invalide"),
  adresse: yup.string().max(255, "Maximum 255 caractères"),
  ville: yup.string().max(100, "Maximum 100 caractères"),
  code_postal: yup.string().max(20, "Maximum 20 caractères"),
  pays: yup.string().max(50, "Maximum 50 caractères"),
});

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      nom: "",
      prenom: "",
      telephone: "",
      type_utilisateur: USER_TYPES.CHAUFFEUR,
      adresse: "",
      ville: "",
      code_postal: "",
      pays: "Belgique",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      await createUser(data);
      toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      navigate("/auth");
    } catch (error) {
      toast.error(error.message || "Erreur lors de la création du compte");
    } finally {
      setIsLoading(false);
    }
  };

  const userTypeOptions = [
    { value: USER_TYPES.CHAUFFEUR, label: "Chauffeur" },
    { value: USER_TYPES.DISPATCHER, label: "Dispatcher" },
    { value: USER_TYPES.COMPTABLE, label: "Comptable" },
    { value: USER_TYPES.ADMIN, label: "Administrateur" },
  ];

  return (
    <Page title="Inscription">
      <main className="min-h-screen grid w-full grow grid-cols-1 place-items-center py-8">
        <div className="w-full max-w-2xl p-4 sm:px-5">
          <div className="text-center">
            <Logo className="mx-auto size-16" />
            <div className="mt-4">
              <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                Créer un compte TxApp
              </h2>
              <p className="text-gray-400 dark:text-dark-300">
                Rejoignez notre plateforme de gestion de taxi
              </p>
            </div>
          </div>

          <Card className="mt-5 rounded-lg p-5 lg:p-7">
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div className="space-y-4">
                {/* Type d'utilisateur */}
                <Select
                  label="Type d'utilisateur *"
                  options={userTypeOptions}
                  {...register("type_utilisateur")}
                  error={errors?.type_utilisateur?.message}
                />

                {/* Informations personnelles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nom *"
                    placeholder="Nom de famille"
                    prefix={<UserIcon className="size-5" strokeWidth="1" />}
                    {...register("nom")}
                    error={errors?.nom?.message}
                  />

                  <Input
                    label="Prénom"
                    placeholder="Prénom"
                    prefix={<UserIcon className="size-5" strokeWidth="1" />}
                    {...register("prenom")}
                    error={errors?.prenom?.message}
                  />
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email *"
                    placeholder="Entrez votre email"
                    type="email"
                    prefix={<EnvelopeIcon className="size-5" strokeWidth="1" />}
                    {...register("email")}
                    error={errors?.email?.message}
                  />

                  <Input
                    label="Téléphone *"
                    placeholder="Numéro de téléphone"
                    type="tel"
                    prefix={<PhoneIcon className="size-5" strokeWidth="1" />}
                    {...register("telephone")}
                    error={errors?.telephone?.message}
                  />
                </div>

                {/* Mots de passe */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Mot de passe *"
                    placeholder="Entrez votre mot de passe"
                    type="password"
                    prefix={<LockClosedIcon className="size-5" strokeWidth="1" />}
                    {...register("password")}
                    error={errors?.password?.message}
                  />

                  <Input
                    label="Confirmer le mot de passe *"
                    placeholder="Confirmez votre mot de passe"
                    type="password"
                    prefix={<LockClosedIcon className="size-5" strokeWidth="1" />}
                    {...register("confirmPassword")}
                    error={errors?.confirmPassword?.message}
                  />
                </div>

                {/* Adresse (optionnel) */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Informations d&#39;adresse (optionnel)
                  </h4>

                  <Input
                    label="Adresse"
                    placeholder="Adresse complète"
                    prefix={<BuildingOfficeIcon className="size-5" strokeWidth="1" />}
                    {...register("adresse")}
                    error={errors?.adresse?.message}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <Input
                      label="Ville"
                      placeholder="Ville"
                      {...register("ville")}
                      error={errors?.ville?.message}
                    />

                    <Input
                      label="Code postal"
                      placeholder="Code postal"
                      {...register("code_postal")}
                      error={errors?.code_postal?.message}
                    />

                    <Input
                      label="Pays"
                      placeholder="Pays"
                      {...register("pays")}
                      error={errors?.pays?.message}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="mt-6 w-full"
                color="primary"
                disabled={isLoading}
              >
                {isLoading ? "Création du compte..." : "Créer le compte"}
              </Button>
            </form>

            <div className="mt-4 text-center text-xs-plus">
              <p className="line-clamp-1">
                <span>Déjà un compte ?</span>{" "}
                <Link
                  className="text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-600"
                  to="/auth"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </Card>

          <div className="mt-8 flex justify-center text-xs text-gray-400 dark:text-dark-300">
            <a href="#">Politique de confidentialité</a>
            <div className="mx-2.5 my-0.5 w-px bg-gray-200 dark:bg-dark-500"></div>
            <a href="#">Conditions d&apos;utilisation</a>
          </div>
        </div>
      </main>
    </Page>
  );
}