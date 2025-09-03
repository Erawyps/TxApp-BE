import { createContext, useContext } from "react";

// Create the AuthContext
export const AuthContext = createContext(null);

// Optional: Create a custom hook to use the context
export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};
