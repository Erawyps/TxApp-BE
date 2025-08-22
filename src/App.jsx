// Import Dependencies
import { RouterProvider } from "react-router";
import { ClerkProvider } from "@clerk/clerk-react";

// Local Imports
import { AuthProvider } from "app/contexts/auth/Provider";
import { BreakpointProvider } from "app/contexts/breakpoint/Provider";
import { LocaleProvider } from "app/contexts/locale/Provider";
import { SidebarProvider } from "app/contexts/sidebar/Provider";
import { ThemeProvider } from "app/contexts/theme/Provider";
import router from "app/router/router";

// ----------------------------------------------------------------------

function App() {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  console.log('Clerk Public Key:', clerkPubKey ? 'Set' : 'Not set');

  // Si Clerk n'est pas configuré, on continue sans
  const AppContent = (
    <AuthProvider>
      <ThemeProvider>
        <LocaleProvider>
          <BreakpointProvider>
            <SidebarProvider>
              <RouterProvider router={router} />
            </SidebarProvider>
          </BreakpointProvider>
        </LocaleProvider>
      </ThemeProvider>
    </AuthProvider>
  );

  // Envelopper avec ClerkProvider si configuré
  if (clerkPubKey) {
    return (
      <ClerkProvider publishableKey={clerkPubKey}>
        {AppContent}
      </ClerkProvider>
    );
  }

  return AppContent;
}

export default App;