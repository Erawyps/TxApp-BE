// Import Dependencies
import PropTypes from "prop-types";

// Local Imports
import { Card } from "components/ui";
import { StatsCards } from "./StatsCards";
import { QuickActions } from "./QuickActions";

// ----------------------------------------------------------------------

export function Dashboard({ driver, vehicle, totals, onNewCourse }) {
  return (
    <div className="space-y-6">
      {/* Driver Info Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {driver.prenom} {driver.nom}
            </h1>
            <p className="opacity-90">
              Badge: {driver.numero_badge} • {driver.type_contrat}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Véhicule actuel</p>
            <p className="font-semibold">{vehicle.plaque_immatriculation}</p>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <StatsCards totals={totals} />

      {/* Quick Actions */}
      <QuickActions onNewCourse={onNewCourse} />
    </div>
  );
}

Dashboard.propTypes = {
  driver: PropTypes.shape({
    nom: PropTypes.string.isRequired,
    prenom: PropTypes.string.isRequired,
    numero_badge: PropTypes.string.isRequired,
    type_contrat: PropTypes.string.isRequired
  }).isRequired,
  vehicle: PropTypes.shape({
    plaque_immatriculation: PropTypes.string.isRequired
  }).isRequired,
  totals: PropTypes.shape({
    recettes: PropTypes.number.isRequired,
    coursesCount: PropTypes.number.isRequired,
    averagePerCourse: PropTypes.number.isRequired
  }).isRequired,
  onNewCourse: PropTypes.func.isRequired
};