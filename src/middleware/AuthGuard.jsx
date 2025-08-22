import { Navigate, useLocation, useOutlet } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";
import { GHOST_ENTRY_PATH, REDIRECT_URL_KEY } from "../constants/app.constant";

export default function AuthGuard() {
  const outlet = useOutlet();
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();

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