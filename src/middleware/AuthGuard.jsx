import { Navigate, useLocation, useOutlet } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";
import { GHOST_ENTRY_PATH, REDIRECT_URL_KEY } from "../constants/app.constant";
import { useSafeClerkAuth } from "auth/clerkSafe";

export default function AuthGuard() {
  const outlet = useOutlet();
  const { isAuthenticated } = useAuthContext();
  const { isSignedIn } = useSafeClerkAuth();
  const location = useLocation();

  // Debug logs pour comprendre l'état d'authentification
  console.log("AuthGuard - isSignedIn (Clerk):", isSignedIn);
  console.log("AuthGuard - isAuthenticated (JWT):", isAuthenticated);
  console.log("AuthGuard - Current path:", location.pathname);

  // Si ni Clerk ni JWT ne sont authentifiés
  if (!isSignedIn && !isAuthenticated) {
    const fullPath = `${location.pathname}${location.search || ""}${location.hash || ""}`;
    const encoded = encodeURIComponent(fullPath || "/");

    console.log("AuthGuard - Redirecting to login with redirect:", fullPath);

    return (
      <Navigate
        to={`${GHOST_ENTRY_PATH}?${REDIRECT_URL_KEY}=${encoded}`}
        replace
      />
    );
  }

  return <>{outlet}</>;
}