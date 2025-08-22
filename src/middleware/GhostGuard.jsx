import { Navigate, useOutlet, useLocation } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";
import { HOME_PATH, REDIRECT_URL_KEY } from "constants/app.constant";
import { useSafeClerkAuth } from "auth/clerkSafe";

export default function GhostGuard() {
  const outlet = useOutlet();
  const { isAuthenticated } = useAuthContext();
  const { isSignedIn } = useSafeClerkAuth();
  const location = useLocation();

  console.log("GhostGuard - isSignedIn (Clerk):", isSignedIn);
  console.log("GhostGuard - isAuthenticated (JWT):", isAuthenticated);
  console.log("GhostGuard - Current path:", location.pathname);

  const params = new URLSearchParams(location.search);
  const redirectParam = params.get(REDIRECT_URL_KEY);

  // Si l'utilisateur est connecté (Clerk ou JWT)
  if (isSignedIn || isAuthenticated) {
    const redirectTarget = redirectParam ? decodeURIComponent(redirectParam) : HOME_PATH;

    console.log("GhostGuard - User authenticated, redirecting to:", redirectTarget);

    return <Navigate to={redirectTarget} replace />;
  }

  console.log("GhostGuard - User not authenticated, showing auth page");
  return <>{outlet}</>;
}
