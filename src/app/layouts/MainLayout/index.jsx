// Import Dependencies
import clsx from "clsx";
import { Outlet } from "react-router";

// Local Imports
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

// ----------------------------------------------------------------------

export default function MainLayout() {
  // En mode chauffeur, on n'affiche pas la sidebar pour une interface plus propre
  const isDriverMode = import.meta.env.VITE_DRIVER_MODE === 'true';

  return (
    <>
      <Header />
      <main
        className={clsx("main-content transition-content grid grid-cols-1")}
      >
        <Outlet />
      </main>
      {!isDriverMode && <Sidebar />}
    </>
  );
}
