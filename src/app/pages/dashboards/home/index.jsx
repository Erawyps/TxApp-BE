// Import Dependencies
import clsx from "clsx";

// Local Imports
import { Page } from "components/shared/Page";
import KPISection from "./kpi";                // Les indicateurs clés de performance
import TripsTable from "./trips";              // Le tableau principal des courses

export default function HomeDashboard() {
  return (
  <Page title="Dashboard - Vue d'ensemble" className="h-full">
    <div className="transition-content mt-5 px-(--margin-x) pb-8 lg:mt-6">
      <div className="space-y-8">
      {/* Section KPIs */}
      <KPISection />

      {/* Section Table des Courses */}
      <div className="col-span-12">
        <div className={clsx("flex flex-col")}>
          <TripsTable />
        </div>
      </div>
    </div>
  </div>
  </Page>
  );
}
