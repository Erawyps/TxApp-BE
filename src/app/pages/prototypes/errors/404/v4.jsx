// Import Dependencies
import { Link } from "react-router";

// Local Imports
import Error404Magnify from "assets/illustrations/error-404-magnify.svg?react";
import { Page } from "components/shared/Page";
import { Button } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";
import { useHover } from "hooks";

// ----------------------------------------------------------------------

export default function Error404V4() {
  const { primaryColorScheme: primary, isDark } = useThemeContext();
  const [btnRef, btnHovered] = useHover();

  return (
    <Page title="Error 404 V4">
      <div className="transition-content grid w-full grid-cols-1 place-content-center px-[var(--margin-x)]">
        <div className="flex flex-col items-center p-6 text-center">
          <div className="w-full max-w-xs">
            <Error404Magnify
              className="w-full"
              style={{
                "--primary": isDark ? primary[500] : primary[600],
                "--primary-light": primary[300],
              }}
            />
          </div>
          <p className="pt-4 text-xl font-semibold text-gray-800 dark:text-dark-50">
            Oops. This Page Not Found.
          </p>
          <p className="pt-2 text-gray-600 dark:text-dark-200">
            This page you are looking not available. Please back to home
          </p>
          <div className="mt-8">
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
    </Page>
  );
}
