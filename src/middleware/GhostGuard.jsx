import { Navigate, useOutlet, useLocation } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";
import { HOME_PATH, REDIRECT_URL_KEY } from "constants/app.constant";

export default function GhostGuard() {
  const outlet = useOutlet();
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirectParam = params.get(REDIRECT_URL_KEY);

  if (isAuthenticated) {
    const redirectTarget = redirectParam ? decodeURIComponent(redirectParam) : HOME_PATH;
    return <Navigate to={redirectTarget} replace />;
  }

  return <>{outlet}</>;
}