import { Page } from "components/shared/Page";
import { SignIn, SignUp, SignedIn } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router";
import { HOME_PATH } from "constants/app.constant";

export default function ClerkAuth() {
  const location = useLocation();
  const isSignUp = location.pathname.includes("sign-up");

  return (
    <Page title={isSignUp ? "Sign Up" : "Login"}>
      <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center p-4">
        <SignedIn>
          <Navigate to={HOME_PATH} />
        </SignedIn>
        {isSignUp ? (
          <SignUp routing="path" signInUrl="/login" />
        ) : (
          <SignIn routing="path" signUpUrl="/sign-up" />
        )}
      </main>
    </Page>
  );
}
