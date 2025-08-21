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
    return (
      <Navigate
        to={`${GHOST_ENTRY_PATH}?${REDIRECT_URL_KEY}=${location.pathname}`}
        replace
      />
    );
  }

  return <>{outlet}</>;
}
