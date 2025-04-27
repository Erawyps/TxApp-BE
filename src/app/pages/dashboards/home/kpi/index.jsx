import KpiCards from "./KpiCards";
import RevenuesChart from "./RevenuesChart";
import TripsCountChart from "./TripsCountChart";

export default function KPISection() {
  return (
    <div className="space-y-6">
      <KpiCards />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenuesChart />
        <TripsCountChart />
      </div>
    </div>
  );
}
