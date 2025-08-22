import { Page } from "components/shared/Page";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router";
import { HOME_PATH } from "constants/app.constant";
import { useSafeClerkAuth, useHasClerkProvider } from "auth/clerkSafe";

export default function ClerkAuth() {
  const location = useLocation();
  const isSignUp = location.pathname.includes("sign-up");
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const hasClerk = !!clerkPubKey;
  const hasProvider = useHasClerkProvider();
  const { isSignedIn } = useSafeClerkAuth();

  // Debug logs
  console.log("ClerkAuth - hasClerk:", hasClerk);
  console.log("ClerkAuth - hasProvider:", hasProvider);
  console.log("ClerkAuth - isSignedIn:", isSignedIn);
  console.log("ClerkAuth - Current path:", location.pathname);
  console.log("ClerkAuth - Clerk Public Key:", clerkPubKey ? "Présente" : "Manquante");

  // Lecture de la destination de redirection depuis les paramètres d'URL
  const params = new URLSearchParams(location.search);
  const redirectParam = params.get("redirect");
  const redirectTarget = redirectParam ? decodeURIComponent(redirectParam) : HOME_PATH;

  // Cas 1: Clerk n'est pas configuré (clé manquante)
  if (!hasClerk) {
    return (
      <Page title={isSignUp ? "Sign Up" : "Login"}>
        <main className="min-h-screen grid w-full grow grid-cols-1 place-items-center p-4">
          <div className="max-w-xl text-center space-y-3">
            <h2 className="text-xl font-semibold">Authentification non configurée</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Configurez Clerk pour activer la connexion. Ajoutez VITE_CLERK_PUBLISHABLE_KEY
              dans votre fichier .env côté Vite, puis relancez le serveur.
            </p>
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-left">
              <p className="text-sm">Valeur actuelle: {clerkPubKey || "Non définie"}</p>
            </div>
            <a className="inline-block mt-4 text-blue-600 hover:underline" href="/">
              Retour à l&apos;accueil
            </a>
          </div>
        </main>
      </Page>
    );
  }

  // Cas 2: Clerk configuré mais provider non initialisé
  if (hasClerk && !hasProvider) {
    return (
      <Page title={isSignUp ? "Sign Up" : "Login"}>
        <main className="min-h-screen grid w-full grow grid-cols-1 place-items-center p-4">
          <div className="max-w-xl text-center space-y-3">
            <h2 className="text-xl font-semibold">Problème d&apos;initialisation</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Le composant Clerk n&apos;est pas initialisé. Vérifiez que VITE_CLERK_PUBLISHABLE_KEY
              est bien défini et que l&apos;app est enveloppée dans &lt;ClerkProvider&gt;.
            </p>
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
              <p className="text-sm">Clé publique: {clerkPubKey}</p>
              <p className="text-sm">Provider détecté: {hasProvider ? "Oui" : "Non"}</p>
            </div>
            <a className="inline-block mt-4 text-blue-600 hover:underline" href="/">
              Retour à l&apos;accueil
            </a>
          </div>
        </main>
      </Page>
    );
  }

  // Cas 3: Utilisateur déjà connecté
  if (isSignedIn) {
    console.log("ClerkAuth - User already signed in, redirecting to:", redirectTarget);
    return <Navigate to={redirectTarget} replace />;
  }

  // Cas 4: Affichage du formulaire d'authentification
  const redirectQS = redirectParam ? `?redirect=${encodeURIComponent(redirectTarget)}` : "";
  const signInUrl = `/login${redirectQS}`;
  const signUpUrl = `/sign-up${redirectQS}`;

  console.log("ClerkAuth - Rendering auth form:", { isSignUp, signInUrl, signUpUrl });

  return (
    <Page title={isSignUp ? "Sign Up" : "Login"}>
      <main className="min-h-screen grid w-full grow grid-cols-1 place-items-center p-4">
        <div className="w-full max-w-md">
          {isSignUp ? (
            <SignUp
              routing="path"
              signInUrl={signInUrl}
              afterSignUpUrl={redirectTarget}
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-lg"
                }
              }}
            />
          ) : (
            <SignIn
              routing="path"
              signUpUrl={signUpUrl}
              afterSignInUrl={redirectTarget}
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-lg"
                }
              }}
            />
          )}
        </div>
      </main>
    </Page>
  );
}