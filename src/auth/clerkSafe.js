import { useAuth as useClerkAuth, useClerk } from "@clerk/clerk-react";

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

// Detect if a ClerkProvider is present at runtime (without crashing the app)
export function useHasClerkProvider() {
  try {
    // If provider is missing, this hook throws
    useClerk();
    return true;
  } catch {
    return false;
  }
}
