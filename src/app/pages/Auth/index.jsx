import { Link, useNavigate, useSearchParams } from "react-router";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

import Logo from "assets/appLogo.svg?react";
import { Button, Card, Checkbox, Input, InputErrorMsg } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";
import { schema } from "./schema";
import { Page } from "components/shared/Page";
import { HOME_PATH, REDIRECT_URL_KEY } from "constants/app.constant";

export default function SignIn() {
  const { login, errorMessage, isLoading, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "admin@taxi.be",
      password: "password123",
    },
  });

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
      <main className="min-h-screen grid w-full grow grid-cols-1 place-items-center">
        <div className="w-full max-w-[26rem] p-4 sm:px-5">
          <div className="text-center">
            <Logo className="mx-auto size-16" />
            <div className="mt-4">
              <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                Bienvenue sur TxApp
              </h2>
              <p className="text-gray-400 dark:text-dark-300">
                Connectez-vous pour continuer
              </p>
            </div>
          </div>
          <Card className="mt-5 rounded-lg p-5 lg:p-7">
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div className="space-y-4">
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
                  {...register("username")}
                  error={errors?.username?.message}
                />
                <Input
                  label="Mot de passe"
                  placeholder="Entrez votre mot de passe"
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
              </div>

              <div className="mt-2">
                <InputErrorMsg
                  when={errorMessage && errorMessage?.message !== ""}
                >
                  {errorMessage?.message}
                </InputErrorMsg>
              </div>

              <div className="mt-4 flex items-center justify-between space-x-2">
                <Checkbox label="Se souvenir de moi" />
                <a
                  href="#"
                  className="text-xs text-gray-400 transition-colors hover:text-gray-800 focus:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100 dark:focus:text-dark-100"
                >
                  Mot de passe oublié ?
                </a>
              </div>

              <Button
                type="submit"
                className="mt-5 w-full"
                color="primary"
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