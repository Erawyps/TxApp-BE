// Import Dependencies
import { Navigate, useOutlet } from "react-router";

// Local Imports
import { useAuthContext } from "app/contexts/auth/context";
import { HOME_PATH, REDIRECT_URL_KEY } from "constants/app.constant";
import { useSafeClerkAuth } from "auth/clerkSafe";

// ----------------------------------------------------------------------

export default function GhostGuard() {
  const outlet = useOutlet();
  const { isAuthenticated } = useAuthContext();
  const { isSignedIn } = useSafeClerkAuth();

  const url = `${new URLSearchParams(window.location.search).get(
    REDIRECT_URL_KEY,
  )}`;

  if (isSignedIn || isAuthenticated) {
    if (url && url !== "" && url !== "null") {
      return <Navigate to={decodeURIComponent(url)} />;
    }
    return <Navigate to={HOME_PATH} />;
  }

  return <>{outlet}</>;
}