// Import Dependencies
import { Link } from "react-router";

// Local Imports
import Galaxy from "assets/illustrations/galaxy.svg?react";
import UFO from "assets/illustrations/ufo.svg?react";
import { Page } from "components/shared/Page";
import { Button } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";
import { useHover } from "hooks";

// ----------------------------------------------------------------------

export default function Error404V1() {
  const { primaryColorScheme: primary, darkColorScheme: dark } =
    useThemeContext();
  const [btnRef, btnHovered] = useHover();

  return (
    <Page title="Error 404 v1">
      <div className="absolute inset-0 flex h-full w-full justify-end overflow-x-clip">
        <Galaxy
          style={{
            minWidth: "60rem",
            "--primary": primary[500],
            "--primary-light": primary[300],
            "--dark": dark[500],
            "--dark-1": dark[300],
          }}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <main className="min-h-100vh relative grid w-full grow grid-cols-1 place-items-center p-4">
        <div className="w-full max-w-[26rem] text-center">
          <UFO
            className="w-full"
            style={{
              "--primary": primary[500],
              "--dark": dark[900],
              "--dark-1": dark[500],
            }}
          />
          <p className="pt-4 text-7xl font-bold text-primary-600 dark:text-primary-500">
            404
          </p>
          <p className="pt-4 text-xl font-semibold text-gray-800 dark:text-dark-50">
            Oops. This Page Not Found.
          </p>
          <p className="pt-2 text-gray-500 dark:text-dark-200">
            This page you are looking not available
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
      </main>
    </Page>
  );
}
