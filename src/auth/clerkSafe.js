import { useAuth as useClerkAuth } from "@clerk/clerk-react";

// Returns a safe auth object even if ClerkProvider is not configured.
export function useSafeClerkAuth() {
  try {
    // This will throw if ClerkProvider is missing or misconfigured
    return useClerkAuth();
  } catch {
    // Fallback: behave as signed out; expose minimal shape used by our guards
    return { isSignedIn: false };
  }
}
