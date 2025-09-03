import { Navigate, useOutlet, useLocation } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";
import { HOME_PATH, REDIRECT_URL_KEY } from "constants/app.constant";
import { SplashScreen } from "components/template/SplashScreen";

export default function GhostGuard() {
  const outlet = useOutlet();
  const { isAuthenticated, isInitialized, isLoading } = useAuthContext();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirectParam = params.get(REDIRECT_URL_KEY);

  // Afficher le splash screen pendant l'initialisation
  if (!isInitialized || isLoading) {
    return <SplashScreen />;
  }

  if (isAuthenticated) {
    const redirectTarget = redirectParam ? decodeURIComponent(redirectParam) : HOME_PATH;
    return <Navigate to={redirectTarget} replace />;
  }

  return <>{outlet}</>;
}