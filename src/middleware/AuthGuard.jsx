import { Navigate, useLocation, useOutlet } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";
import { GHOST_ENTRY_PATH, REDIRECT_URL_KEY } from "../constants/app.constant";
import { SplashScreen } from "components/template/SplashScreen";

export default function AuthGuard() {
  const outlet = useOutlet();
  const { isAuthenticated, isInitialized, isLoading } = useAuthContext();
  const location = useLocation();

  // Afficher le splash screen pendant l'initialisation
  if (!isInitialized || isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
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