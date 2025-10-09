// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "../../components/guards/AuthGuard";

// ----------------------------------------------------------------------

// Routes pour le mode chauffeur (simplifiées)
const driverRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/forms/new-post-form" replace />,
        },
        {
          path: "/forms",
          children: [
            {
              index: true,
              element: <Navigate to="/forms/new-post-form" replace />,
            },
            {
              path: "new-post-form",
              lazy: async () => ({
                Component: (await import("app/pages/forms/new-post-form")).default,
              }),
            },
          ],
        },
        // Redirection de toutes les autres routes vers le formulaire
        {
          path: "*",
          element: <Navigate to="/forms/new-post-form" replace />,
        },
      ],
    },
  ],
};

// Routes complètes pour le mode normal
const fullRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the main layout and the sideblock.
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards" />,
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/home")).default,
              }),
            },
            {
              path: "driver",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/driver")).default,
              }),
            },
          ],
        },
        {
          path: "/admin",
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (await import("app/pages/admin")).default,
              }),
            },
            {
              path: "oversight",
              lazy: async () => ({
                Component: (await import("app/pages/admin/oversight")).default,
              }),
            },
            {
              path: "courses",
              lazy: async () => ({
                Component: (await import("app/pages/admin/courses")).default,
              }),
            },
          ],
        },
        {
          path: "/forms",
          children: [
            {
              index: true,
              element: <Navigate to="/forms" />,
            },
            {
              path: "ekyc-form",
              lazy: async () => ({
                Component: (await import("app/pages/forms/KYCForm")).default,
              }),
            },
            {
              path: "new-post-form",
              lazy: async () => ({
                Component: (await import("app/pages/forms/new-post-form")).default,
              }),
            },
          ],
        },
        {
          path: "/profile",
          lazy: async () => ({
            Component: (await import("app/pages/Profile")).default,
          }),
        },
        {
          path: "/tables",
          children: [
            {
              index: true,
              element: <Navigate to="/tables/orders-datatable-1" />,
            },
            {
              path: "orders-datatable-2",
              lazy: async () => ({
                Component: (await import("app/pages/tables/orders-datatable-2"))
                  .default,
              }),
            },
          ],
        },
      ],
    },
    // The app layout supports only the main layout. Avoid using it for other layouts.
    {
      Component: AppLayout,
      children: [
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (await import("app/pages/settings/sections/General"))
                  .default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
          ],
        },
      ],
    },
  ],
};

// Sélection des routes selon le mode
const protectedRoutes = import.meta.env.VITE_DRIVER_MODE === 'true' ? driverRoutes : fullRoutes;

export { protectedRoutes };
console.log('VITE_DRIVER_MODE:', import.meta.env.VITE_DRIVER_MODE);
