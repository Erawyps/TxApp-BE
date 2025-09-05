import { Link, useNavigate } from "react-router";
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";

import Logo from "assets/appLogo.svg?react";
import { Button, Card, Input, InputErrorMsg } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";
import { registerSchema } from "./schema";
import { Page } from "components/shared/Page";

export default function SignUp() {
  const { register: registerUser, errorMessage, isLoading, successMessage } = useAuthContext();
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
    },
  });

  // Redirection automatique vers la page de connexion après inscription réussie
  useEffect(() => {
    if (successMessage) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => {
        navigate('/sign-in', {
          state: {
            message: successMessage,
            fromRegistration: true
          }
        });
      }, 2000); // Attendre 2 secondes pour que l'utilisateur puisse lire le message

      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  const onSubmit = async (data) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
      });
    } catch (error) {
      // L'erreur est déjà gérée par le contexte auth
      console.error('Erreur lors de l\'inscription:', error);
    }
  };

  return (
    <Page title="Créer un compte">
      <main className="min-h-screen grid w-full grow grid-cols-1 place-items-center">
        <div className="w-full max-w-[28rem] p-4 sm:px-5">
          <div className="text-center">
            <Logo className="mx-auto size-16" />
            <div className="mt-4">
              <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                Créer votre compte TxApp
              </h2>
              <p className="text-gray-400 dark:text-dark-300">
                Rejoignez-nous pour commencer
              </p>
            </div>
          </div>
          <Card className="mt-5 rounded-lg p-5 lg:p-7">
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Nom"
                    placeholder="Votre nom"
                    type="text"
                    prefix={
                      <UserIcon
                        className="size-5 transition-colors duration-200"
                        strokeWidth="1"
                      />
                    }
                    {...register("nom")}
                    error={errors?.nom?.message}
                  />
                  <Input
                    label="Prénom"
                    placeholder="Votre prénom"
                    type="text"
                    prefix={
                      <UserIcon
                        className="size-5 transition-colors duration-200"
                        strokeWidth="1"
                      />
                    }
                    {...register("prenom")}
                    error={errors?.prenom?.message}
                  />
                </div>

                <Input
                  label="Email"
                  placeholder="Entrez votre email"
                  type="email"
                  prefix={
                    <EnvelopeIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("email")}
                  error={errors?.email?.message}
                />

                <Input
                  label="Téléphone"
                  placeholder="Votre numéro de téléphone"
                  type="tel"
                  prefix={
                    <PhoneIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("telephone")}
                  error={errors?.telephone?.message}
                />

                <Input
                  label="Mot de passe"
                  placeholder="Créez un mot de passe"
                  type="password"
                  prefix={
                    <LockClosedIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("password")}
                  error={errors?.password?.message}
                />

                <Input
                  label="Confirmer le mot de passe"
                  placeholder="Confirmez votre mot de passe"
                  type="password"
                  prefix={
                    <LockClosedIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("confirmPassword")}
                  error={errors?.confirmPassword?.message}
                />
              </div>

              <div className="mt-2">
                <InputErrorMsg
                  when={errorMessage && errorMessage?.message !== ""}
                >
                  {errorMessage?.message}
                </InputErrorMsg>

                {/* Message de succès */}
                {successMessage && showSuccessMessage && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-sm font-medium">
                      ✓ {successMessage}
                    </p>
                    <p className="text-green-600 text-xs mt-1">
                      Redirection vers la page de connexion...
                    </p>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="mt-5 w-full"
                color="primary"
                disabled={isLoading}
              >
                {isLoading ? "Création..." : "Créer mon compte"}
              </Button>
            </form>

            <div className="mt-4 text-center text-xs-plus">
              <p className="line-clamp-1">
                <span>Déjà un compte ?</span>{" "}
                <Link
                  className="text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-600"
                  to="/sign-in"
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
