// Import Dependencies
import { Link } from "react-router";

// Local Imports
import Penguin from "assets/illustrations/penguin.svg?react";
import { Page } from "components/shared/Page";
import { Button } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";
import { useHover } from "hooks";

// ----------------------------------------------------------------------

export default function Error404V2() {
  const {
    darkColorScheme: dark,
    lightColorScheme: light,
    isDark,
  } = useThemeContext();
  const [btnRef, btnHovered] = useHover();

  return (
    <Page title="Error 404 v2">
      <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center">
        <div className="grid max-w-(--breakpoint-lg) grid-cols-1 place-items-center gap-12 p-6 lg:grid-cols-2 lg:gap-24">
          <div className="absolute p-6 opacity-20 lg:static lg:opacity-100">
            <Penguin
              width="440"
              className="w-full"
              style={{
                "--dark-100": isDark ? dark[100] : light[400],
                "--dark-500": isDark ? dark[500] : light[700],
              }}
            />
          </div>
          <div className="z-2 text-center lg:text-start">
            <p className="mt-4 text-7xl font-bold text-primary-600 dark:text-primary-500 lg:mt-0">
              404
            </p>
            <p className="mt-6 text-xl font-semibold text-gray-800 dark:text-dark-50 lg:mt-10 lg:text-3xl">
              Oops. This Page Not Found.
            </p>
            <p className="pt-2 lg:text-base">
              This page you are looking not available
            </p>
            <div className="mt-12">
              <Button
                component={Link}
                to="/"
                ref={btnRef}
                isGlow={btnHovered}
                color="primary"
                className="h-11 text-base"
              >
                Back To Home
              </Button>
            </div>
          </div>
        </div>
      </main>
    </Page>
  );
}
