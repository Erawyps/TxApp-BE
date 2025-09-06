import { Link, useNavigate, useSearchParams, useLocation } from "react-router";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import Logo from "assets/appLogo.svg?react";
import DashboardCheck from "assets/illustrations/dashboard-check.svg?react";
import { Button, Checkbox, Input, InputErrorMsg } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";
import { useThemeContext } from "app/contexts/theme/context";
import { schema } from "./schema";
import { Page } from "components/shared/Page";
import { HOME_PATH, REDIRECT_URL_KEY } from "constants/app.constant";

export default function SignIn() {
  const { login, errorMessage, isLoading, isAuthenticated } = useAuthContext();
  const {
    primaryColorScheme: primary,
    lightColorScheme: light,
    darkColorScheme: dark,
    isDark,
  } = useThemeContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [registrationMessage, setRegistrationMessage] = useState(null);

  const {
    register,
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Gérer le message de succès de l'inscription
  useEffect(() => {
    if (location.state?.fromRegistration && location.state?.message) {
      setRegistrationMessage(location.state.message);
      // Nettoyer l'état après 5 secondes
      const timer = setTimeout(() => {
        setRegistrationMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      const redirectUrl = searchParams.get(REDIRECT_URL_KEY);
      const targetUrl = redirectUrl ? decodeURIComponent(redirectUrl) : HOME_PATH;
      navigate(targetUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, searchParams]);

  const onSubmit = async (data) => {
    try {
      await login({
        username: data.username,
        password: data.password,
      });

      // La redirection sera gérée par l'useEffect après mise à jour de isAuthenticated
    } catch (error) {
      // L'erreur est déjà gérée par le context
      console.error("Erreur de connexion:", error);
    }
  };

  return (
    <Page title="Login">
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
            <DashboardCheck
              style={{
                "--primary": primary[500],
                "--dark-500": isDark ? dark[500] : light[200],
                "--dark-600": isDark ? dark[600] : light[100],
                "--dark-700": isDark ? dark[700] : light[300],
                "--dark-450": isDark ? dark[450] : light[400],
                "--dark-800": isDark ? dark[800] : light[400],
              }}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex w-full flex-col items-center ltr:border-l rtl:border-r border-gray-150 bg-white dark:border-transparent dark:bg-dark-700 lg:max-w-md">
          <div className="flex w-full max-w-sm grow flex-col justify-center p-5">
            <div className="text-center">
              <Logo className="mx-auto size-16 lg:hidden" />
              <div className="mt-4 lg:mt-0">
                <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                  Bienvenue sur TxApp
                </h2>
                <p className="text-gray-400 dark:text-dark-300">
                  Connectez-vous pour continuer
                </p>
              </div>
            </div>

            {/* Message de succès de l'inscription */}
            {registrationMessage && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                <p className="text-green-700 dark:text-green-400 text-sm font-medium">
                  ✓ {registrationMessage}
                </p>
                <p className="text-green-600 dark:text-green-300 text-xs mt-1">
                  Vous pouvez maintenant vous connecter avec vos identifiants.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-16">
              <div className="space-y-4">
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
                  {...register("username")}
                />
                <Input
                  unstyled
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  className="rounded-lg bg-gray-150 px-3 py-2 transition-colors placeholder:text-gray-400 focus:ring-3 focus:ring-primary-500/50 dark:bg-dark-900 dark:placeholder:text-dark-200/70"
                  prefix={
                    <LockClosedIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("password")}
                />
                <div className="flex items-center justify-between space-x-2">
                  <Checkbox label="Se souvenir de moi" />
                  <a
                    href="#"
                    className="text-xs text-gray-400 transition-colors hover:text-gray-800 focus:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100 dark:focus:text-dark-100"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>
              </div>

              <InputErrorMsg
                when={errorMessage && errorMessage?.message !== ""}
                className="mt-2"
              >
                {errorMessage?.message}
              </InputErrorMsg>

              <Button
                type="submit"
                color="primary"
                className="mt-10 h-10 w-full"
                disabled={isLoading}
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="mt-4 text-center text-xs-plus">
              <p className="line-clamp-1">
                <span>Pas de compte ?</span>{" "}
                <Link
                  className="text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-600"
                  to="/sign-up"
                >
                  Créer un compte
                </Link>
              </p>
            </div>

            <div className="my-7 flex items-center text-tiny-plus">
              <div className="h-px flex-1 bg-gray-200 dark:bg-dark-500"></div>
              <p className="mx-3">OU</p>
              <div className="h-px flex-1 bg-gray-200 dark:bg-dark-500"></div>
            </div>

            <div className="flex gap-4">
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
          </div>

          <div className="mb-3 mt-5 flex justify-center text-xs text-gray-400 dark:text-dark-300">
            <a href="#">Politique de confidentialité</a>
            <div className="mx-2.5 my-0.5 w-px bg-gray-200 dark:bg-dark-500"></div>
            <a href="#">Conditions d&apos;utilisation</a>
          </div>
        </div>
      </main>
    </Page>
  );
}