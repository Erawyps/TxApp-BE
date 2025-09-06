// Import Dependencies
import { lazy, useMemo } from "react";

// Local Imports
import { useThemeContext } from "app/contexts/theme/context";
import { Loadable } from "components/shared/Loadable";
import { SplashScreen } from "components/template/SplashScreen";
import { defaultTheme } from "configs/theme.config";

// ----------------------------------------------------------------------

const themeLayouts = {
  "main-layout": lazy(() => import("./MainLayout")),
  sideblock: lazy(() => import("./Sideblock")),
};

export function DynamicLayout() {
  const { themeLayout } = useThemeContext();

  // Fallback vers le layout par défaut si le layout actuel n'existe pas
  const activeLayout = themeLayouts[themeLayout] ? themeLayout : defaultTheme.themeLayout;

  const CurrentLayout = useMemo(
    () => Loadable(themeLayouts[activeLayout] || themeLayouts[defaultTheme.themeLayout], SplashScreen),
    [activeLayout],
  );

  return <CurrentLayout />;
}
