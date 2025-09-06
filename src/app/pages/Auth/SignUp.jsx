import { Link, useNavigate } from "react-router";
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";

import Logo from "assets/appLogo.svg?react";
import DashboardMeet from "assets/illustrations/dashboard-meet.svg?react";
import { Button, Input, InputErrorMsg } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";
import { useThemeContext } from "app/contexts/theme/context";
import { registerSchema } from "./schema";
import { Page } from "components/shared/Page";

export default function SignUp() {
  const { register: registerUser, errorMessage, isLoading, successMessage } = useAuthContext();
  const {
    primaryColorScheme: primary,
    lightColorScheme: light,
    darkColorScheme: dark,
    isDark,
  } = useThemeContext();
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const {
    register,
    handleSubmit,
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
      <main className="min-h-100vh flex">
        <div className="fixed top-0 hidden p-6 lg:block lg:px-12">
          <div className="flex items-center gap-2">
            <Logo className="size-12" />
            <p className="text-xl font-semibold uppercase text-gray-800 dark:text-dark-100">
              TxApp
            </p>
          </div>
        </div>
        <div className="hidden w-full place-items-center lg:grid">
          <div className="w-full max-w-lg p-6">
            <DashboardMeet
              style={{
                "--primary": primary[500],
                "--dark-600": isDark ? dark[600] : light[700],
                "--dark-450": dark[450],
              }}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex w-full flex-col items-center border-gray-150 bg-white dark:border-transparent dark:bg-dark-700 lg:max-w-md ltr:border-l rtl:border-r">
          <div className="flex w-full max-w-sm grow flex-col justify-center p-5">
            <div className="text-center">
              <Logo className="mx-auto size-16 lg:hidden" />
              <div className="mt-4 lg:mt-0">
                <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                  Bienvenue sur TxApp
                </h2>
                <p className="text-gray-400 dark:text-dark-300">
                  Créez votre compte pour commencer
                </p>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <Button className="h-10 flex-1 gap-3" variant="outlined">
                <img
                  className="size-5.5"
                  src="/images/logos/google.svg"
                  alt="logo"
                />
                <span>Google</span>
              </Button>
              <Button className="h-10 flex-1 gap-3" variant="outlined">
                <img
                  className="size-5.5"
                  src="/images/logos/github.svg"
                  alt="logo"
                />
                <span>Github</span>
              </Button>
            </div>

            <div className="my-7 flex items-center text-tiny-plus">
              <div className="h-px flex-1 bg-gray-200 dark:bg-dark-500"></div>
              <p className="mx-3">OU CRÉER AVEC EMAIL</p>
              <div className="h-px flex-1 bg-gray-200 dark:bg-dark-500"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    unstyled
                    placeholder="Votre nom"
                    type="text"
                    className="rounded-lg bg-gray-150 px-3 py-2 transition-colors placeholder:text-gray-400 focus:ring-3 focus:ring-primary-500/50 dark:bg-dark-900 dark:placeholder:text-dark-200/70"
                    prefix={
                      <UserIcon
                        className="size-5 transition-colors duration-200"
                        strokeWidth="1"
                      />
                    }
                    {...register("nom")}
                  />
                  <Input
                    unstyled
                    placeholder="Votre prénom"
                    type="text"
                    className="rounded-lg bg-gray-150 px-3 py-2 transition-colors placeholder:text-gray-400 focus:ring-3 focus:ring-primary-500/50 dark:bg-dark-900 dark:placeholder:text-dark-200/70"
                    prefix={
                      <UserIcon
                        className="size-5 transition-colors duration-200"
                        strokeWidth="1"
                      />
                    }
                    {...register("prenom")}
                  />
                </div>

                <Input
                  unstyled
                  placeholder="Entrez votre email"
                  type="email"
                  className="rounded-lg bg-gray-150 px-3 py-2 transition-colors placeholder:text-gray-400 focus:ring-3 focus:ring-primary-500/50 dark:bg-dark-900 dark:placeholder:text-dark-200/70"
                  prefix={
                    <EnvelopeIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("email")}
                />

                <Input
                  unstyled
                  placeholder="Votre numéro de téléphone"
                  type="tel"
                  className="rounded-lg bg-gray-150 px-3 py-2 transition-colors placeholder:text-gray-400 focus:ring-3 focus:ring-primary-500/50 dark:bg-dark-900 dark:placeholder:text-dark-200/70"
                  prefix={
                    <PhoneIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("telephone")}
                />

                <Input
                  unstyled
                  type="password"
                  placeholder="Créez un mot de passe"
                  className="rounded-lg bg-gray-150 px-3 py-2 transition-colors placeholder:text-gray-400 focus:ring-3 focus:ring-primary-500/50 dark:bg-dark-900 dark:placeholder:text-dark-200/70"
                  prefix={
                    <LockClosedIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("password")}
                />

                <Input
                  unstyled
                  type="password"
                  placeholder="Confirmez votre mot de passe"
                  className="rounded-lg bg-gray-150 px-3 py-2 transition-colors placeholder:text-gray-400 focus:ring-3 focus:ring-primary-500/50 dark:bg-dark-900 dark:placeholder:text-dark-200/70"
                  prefix={
                    <LockClosedIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("confirmPassword")}
                />
              </div>

              <InputErrorMsg
                when={errorMessage && errorMessage?.message !== ""}
                className="mt-2"
              >
                {errorMessage?.message}
              </InputErrorMsg>

              {/* Message de succès */}
              {successMessage && showSuccessMessage && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                  <p className="text-green-700 dark:text-green-400 text-sm font-medium">
                    ✓ {successMessage}
                  </p>
                  <p className="text-green-600 dark:text-green-300 text-xs mt-1">
                    Redirection vers la page de connexion...
                  </p>
                </div>
              )}

              <Button
                type="submit"
                color="primary"
                className="mt-8 h-10 w-full"
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
          </div>

          <div className="mb-3 flex justify-center text-xs text-gray-400 dark:text-dark-300">
            <a href="#">Politique de confidentialité</a>
            <div className="mx-2.5 my-0.5 w-px bg-gray-200 dark:bg-dark-500"></div>
            <a href="#">Conditions d&apos;utilisation</a>
          </div>
        </div>
      </main>
    </Page>
  );
}
