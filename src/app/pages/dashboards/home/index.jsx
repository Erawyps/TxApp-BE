// Import Dependencies
import clsx from "clsx";

// Local Imports
import KPISection from "./kpi";                // Les indicateurs clés de performance
import TripsTable from "./trips";              // Le tableau principal des courses

export default function HomeDashboard() {
  return (
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
  );
}
