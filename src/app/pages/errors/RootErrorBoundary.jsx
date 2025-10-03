// Import Depndencies
import { isRouteErrorResponse, useRouteError } from "react-router";
import { lazy } from "react";

// Local Imports
import { Loadable } from "components/shared/Loadable";

// ----------------------------------------------------------------------

const app = {
  401: lazy(() => import("./401")),
  404: lazy(() => import("./404")),
  429: lazy(() => import("./429")),
  500: lazy(() => import("./500")),
};

function RootErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    const Component = Loadable(app[error.status] || app[500]);
    return <Component />;
  }

  // Log the error for diagnostics
   
  console.error('Route error:', error);

  // Friendly fallback with basic actions
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-xl w-full text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Une erreur s&apos;est produite
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {error?.message || 'Veuillez réessayer. Si le problème persiste, contactez le support.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Recharger</button>
          <a href="/login" className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Aller à la connexion</a>
        </div>
      </div>
    </div>
  );
}

export default RootErrorBoundary;
