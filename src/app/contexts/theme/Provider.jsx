// Import Dependencies
import PropTypes from "prop-types";

// Local Imports
import { defaultTheme } from "configs/theme.config";
import { colors } from "constants/colors.constant";
import { useIsomorphicEffect, useLocalStorage, useMediaQuery } from "hooks";
import { ThemeContext } from "./context";
import { validateAndMigrateThemeSettings, THEME_CONFIG_VERSION } from "utils/themeUtils";

// ----------------------------------------------------------------------

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

const _html = document?.documentElement;

export function ThemeProvider({ children }) {
  const isDarkOS = useMediaQuery(COLOR_SCHEME_QUERY);

  const [settings, setSettings] = useLocalStorage("settings", () => {
    return {
      ...defaultTheme,
      _version: THEME_CONFIG_VERSION,
    };
  });

  // Migration automatique des paramètres au chargement
  useIsomorphicEffect(() => {
    const migratedSettings = validateAndMigrateThemeSettings(settings);

    // Si les paramètres ont été migrés, les sauvegarder
    if (JSON.stringify(migratedSettings) !== JSON.stringify(settings)) {
      console.info("Theme settings migrated, applying new defaults");
      setSettings(migratedSettings);
    }
  }, []);

  // S'assurer que le layout est toujours valide
  const safeSettings = {
    ...settings,
    themeLayout: ["main-layout", "sideblock"].includes(settings.themeLayout)
      ? settings.themeLayout
      : defaultTheme.themeLayout,
  };

  const isDark =
    (safeSettings.themeMode === "system" && isDarkOS) ||
    safeSettings.themeMode === "dark";

  const setThemeMode = (val) => {
    setSettings((settings) => {
      return {
        ...settings,
        themeMode: val,
        _version: THEME_CONFIG_VERSION,
      };
    });
  };

  const setThemeLayout = (val) => {
    setSettings((settings) => ({
      ...settings,
      themeLayout: val,
      _version: THEME_CONFIG_VERSION,
    }));
  };

  const setMonochromeMode = (val) => {
    setSettings({
      ...settings,
      isMonochrome: val,
    });
  };

  const setDarkColorScheme = (val) => {
    setSettings({
      ...settings,
      darkColorScheme: {
        name: val,
        ...colors[val],
      },
    });
  };

  const setLightColorScheme = (val) => {
    setSettings({
      ...settings,
      lightColorScheme: {
        name: val,
        ...colors[val],
      },
    });
  };

  const setPrimaryColorScheme = (val) => {
    setSettings((settings) => {
      return {
        ...settings,
        primaryColorScheme: {
          name: val,
          ...colors[val],
        },
      };
    });
  };

  const setNotificationPosition = (val) => {
    setSettings({
      ...settings,
      notification: {
        ...settings.notification,
        position: val,
      },
    });
  };

  const setNotificationExpand = (val) => {
    setSettings({
      ...settings,
      notification: {
        ...settings.notification,
        isExpanded: val,
      },
    });
  };

  const setNotificationMaxCount = (val) => {
    setSettings({
      ...settings,
      notification: {
        ...settings.notification,
        visibleToasts: val,
      },
    });
  };

  const setCardSkin = (val) => {
    setSettings((settings) => {
      return { ...settings, cardSkin: val };
    });
  };

  const resetTheme = () => {
    setSettings({
      ...defaultTheme,
      _version: THEME_CONFIG_VERSION,
    });
  };

  // Application des effets avec les paramètres sécurisés
  useIsomorphicEffect(() => {
    isDark ? _html.classList.add("dark") : _html.classList.remove("dark");
  }, [isDark]);

  useIsomorphicEffect(() => {
    safeSettings.isMonochrome
      ? document.body.classList.add("is-monochrome")
      : document.body.classList.remove("is-monochrome");
  }, [safeSettings.isMonochrome]);

  useIsomorphicEffect(() => {
    _html.dataset.themeLight = safeSettings.lightColorScheme?.name || defaultTheme.lightColorScheme.name;
  }, [safeSettings.lightColorScheme]);

  useIsomorphicEffect(() => {
    _html.dataset.themeDark = safeSettings.darkColorScheme?.name || defaultTheme.darkColorScheme.name;
  }, [safeSettings.darkColorScheme]);

  useIsomorphicEffect(() => {
    _html.dataset.themePrimary = safeSettings.primaryColorScheme?.name || defaultTheme.primaryColorScheme.name;
  }, [safeSettings.primaryColorScheme]);

  useIsomorphicEffect(() => {
    _html.dataset.cardSkin = safeSettings.cardSkin || defaultTheme.cardSkin;
  }, [safeSettings.cardSkin]);

  useIsomorphicEffect(() => {
    if (document) {
      document.body.dataset.layout = safeSettings.themeLayout;
      console.debug("Applied theme layout:", safeSettings.themeLayout);
    }
  }, [safeSettings.themeLayout]);

  if (!children) {
    return null;
  }

  return (
    <ThemeContext
      value={{
        ...safeSettings,
        isDark,
        setMonochromeMode,
        setThemeMode,
        setThemeLayout,
        setLightColorScheme,
        setDarkColorScheme,
        setPrimaryColorScheme,
        setNotificationPosition,
        setNotificationExpand,
        setNotificationMaxCount,
        setCardSkin,
        setSettings,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node,
};
