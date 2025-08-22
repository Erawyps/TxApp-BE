// Import Dependencies
import { Navigate, useLocation, useOutlet } from "react-router";

// Local Imports
import { useAuthContext } from "app/contexts/auth/context";
import { GHOST_ENTRY_PATH, REDIRECT_URL_KEY } from "../constants/app.constant";
import { useSafeClerkAuth } from "auth/clerkSafe";

// ----------------------------------------------------------------------

export default function AuthGuard() {
  const outlet = useOutlet();
  const { isAuthenticated } = useAuthContext();
  const { isSignedIn } = useSafeClerkAuth();

  const location = useLocation();

  if (!isSignedIn && !isAuthenticated) {
    const fullPath = `${location.pathname}${location.search || ""}${location.hash || ""}`;
    const encoded = encodeURIComponent(fullPath || "/");
    return (
      <Navigate
        to={`${GHOST_ENTRY_PATH}?${REDIRECT_URL_KEY}=${encoded}`}
        replace
      />
    );
  }

  return <>{outlet}</>;
}