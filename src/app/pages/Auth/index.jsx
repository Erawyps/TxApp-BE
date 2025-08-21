import { Page } from "components/shared/Page";
import { SignIn, SignUp, SignedIn } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router";
import { HOME_PATH } from "constants/app.constant";

export default function ClerkAuth() {
  const location = useLocation();
  const isSignUp = location.pathname.includes("sign-up");
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const hasClerk = !!clerkPubKey;

  // read redirect target from query string, default to HOME_PATH
  const params = new URLSearchParams(location.search);
  const redirectParam = params.get("redirect");
  const redirectTarget = redirectParam ? decodeURIComponent(redirectParam) : HOME_PATH;

  if (!hasClerk) {
    return (
      <Page title={isSignUp ? "Sign Up" : "Login"}>
        <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center p-4">
          <div className="max-w-xl text-center space-y-3">
            <h2 className="text-xl font-semibold">Authentification non configurée</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Configurez Clerk pour activer la connexion. Ajoutez VITE_CLERK_PUBLISHABLE_KEY dans votre fichier .env côté Vite,
              puis relancez le serveur. En attendant, l&apos;application reste accessible sans authentification Clerk.
            </p>
            <a className="text-blue-600 hover:underline" href="/">Retour à l&apos;accueil</a>
          </div>
        </main>
      </Page>
    );
  }

  // Preserve redirect between SignIn/SignUp URLs
  const redirectQS = redirectParam ? `?redirect=${encodeURIComponent(redirectTarget)}` : "";
  const signInUrl = `/login${redirectQS}`;
  const signUpUrl = `/sign-up${redirectQS}`;

  return (
    <Page title={isSignUp ? "Sign Up" : "Login"}>
      <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center p-4">
        <SignedIn>
          <Navigate to={redirectTarget || HOME_PATH} />
        </SignedIn>
        {isSignUp ? (
          <SignUp routing="path" signInUrl={signInUrl} afterSignUpUrl={redirectTarget} />
        ) : (
          <SignIn routing="path" signUpUrl={signUpUrl} afterSignInUrl={redirectTarget} />
        )}
      </main>
    </Page>
  );
}