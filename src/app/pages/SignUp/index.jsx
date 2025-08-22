import { Link } from "react-router";
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";

import Logo from "assets/appLogo.svg?react";
import { Button, Card, Input, InputErrorMsg, Select } from "components/ui";
import { registerSchema } from "../Auth/schema";
import { Page } from "components/shared/Page";

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

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
      type_utilisateur: "chauffeur",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          nom: data.nom,
          prenom: data.prenom,
          telephone: data.telephone,
          type_utilisateur: data.type_utilisateur,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'inscription");
      }

      // Stocker le token et rediriger
      localStorage.setItem("authToken", result.token);
      window.location.href = "/dashboards/home";

    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Options pour le select
  const userTypeOptions = [
    { label: "Chauffeur", value: "chauffeur" },
    { label: "Dispatcher", value: "dispatcher" },
    { label: "Administrateur", value: "administrateur" }
  ];

  return (
    <Page title="Inscription">
      <main className="min-h-screen grid w-full grow grid-cols-1 place-items-center">
        <div className="w-full max-w-[28rem] p-4 sm:px-5">
          <div className="text-center">
            <Logo className="mx-auto size-16" />
            <div className="mt-4">
              <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                Créer un compte
              </h2>
              <p className="text-gray-400 dark:text-dark-300">
                Rejoignez l&apos;équipe TxApp
              </p>
            </div>
          </div>
          <Card className="mt-5 rounded-lg p-5 lg:p-7">
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nom *"
                    placeholder="Votre nom"
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
                  label="Email *"
                  placeholder="votre@email.com"
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
                  placeholder="+32 123 456 789"
                  prefix={
                    <PhoneIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("telephone")}
                  error={errors?.telephone?.message}
                />

                <Select
                  label="Type d'utilisateur"
                  data={userTypeOptions}
                  {...register("type_utilisateur")}
                />

                <Input
                  label="Mot de passe *"
                  placeholder="Votre mot de passe"
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
                  label="Confirmer le mot de passe *"
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
                <InputErrorMsg when={errorMessage}>
                  {errorMessage}
                </InputErrorMsg>
              </div>

              <Button
                type="submit"
                className="mt-5 w-full"
                color="primary"
                disabled={isLoading}
              >
                {isLoading ? "Création en cours..." : "Créer le compte"}
              </Button>
            </form>

            <div className="mt-4 text-center text-xs-plus">
              <p className="line-clamp-1">
                <span>Déjà un compte ?</span>{" "}
                <Link
                  className="text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-600"
                  to="/login"
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