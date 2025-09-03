import { Suspense, lazy } from 'react';
import clsx from "clsx";
import { Page } from "components/shared/Page";
import ErrorBoundary from "components/shared/ErrorBoundary";
import LoadingSpinner from "components/ui/LoadingSpinner";
import AuthTestComponent from "components/shared/AuthTestComponent";

// Chargement différé des composants lourds
const KPISection = lazy(() => import("./kpi"));
const TripsTable = lazy(() => import("./trips"));

export default function Dashboard() {
  return (
    <Page title="Dashboard - Vue d'ensemble">
      <div className="transition-content mt-5 px-(--margin-x) pb-8 lg:mt-6">
        <div className="space-y-8">
          {/* Section de test d'authentification (temporaire pour vérification) */}
          <div className="col-span-12">
            <ErrorBoundary fallback={<div>Erreur de chargement des tests auth</div>}>
              <AuthTestComponent />
            </ErrorBoundary>
          </div>

          {/* Section KPIs avec Error Boundary et Suspense */}
          <ErrorBoundary fallback={<div>Erreur de chargement des KPI</div>}>
            <Suspense fallback={<LoadingSpinner className="h-64" />}>
              <KPISection />
            </Suspense>
          </ErrorBoundary>

          {/* Section Table des Courses */}
          <div className="col-span-12">
            <div className={clsx("flex flex-col")}>
              <ErrorBoundary fallback={<div>Erreur de chargement du tableau</div>}>
                <Suspense fallback={<LoadingSpinner className="h-96" />}>
                  <TripsTable />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}