import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "i18n/config";
import "simplebar-react/dist/simplebar.min.css";
import "styles/index.css";
import { ClerkProvider } from "@clerk/clerk-react";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log("Clerk Public Key:", clerkPubKey ? "Présente" : "Manquante");

const RootTree = clerkPubKey ? (
  <ClerkProvider
    publishableKey={clerkPubKey}
    afterSignOutUrl="/login"
    // Ajout de configuration supplémentaire pour le debug
    debug={import.meta.env.DEV}
  >
    <App />
  </ClerkProvider>
) : (
  <App />
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {RootTree}
  </React.StrictMode>,
);
