// Import Dependencies
import clsx from "clsx";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";

// Local Imports
import { SidebarToggleBtn } from "components/shared/SidebarToggleBtn";
import { LanguageSelector } from "components/template/LaguageSelector";
import { useThemeContext } from "app/contexts/theme/context";

// ----------------------------------------------------------------------

export function Header() {
  const { cardSkin } = useThemeContext();
  const hasClerk = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  return (
    <header
      className={clsx(
        "app-header transition-content sticky top-0 z-20 flex h-[65px] shrink-0 items-center justify-between border-b border-gray-200 bg-white/80 px-(--margin-x) backdrop-blur-sm backdrop-saturate-150 dark:border-dark-600",
        cardSkin === "shadow-sm" ? "dark:bg-dark-750/80" : "dark:bg-dark-900/80",
      )}
    >
      <SidebarToggleBtn />

      <div className="flex items-center gap-2 ltr:-mr-1.5 rtl:-ml-1.5">
        <LanguageSelector />
        {hasClerk && (
          <>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm">Se connecter</button>
              </SignInButton>
            </SignedOut>
          </>
        )}
      </div>
    </header>
  );
}
