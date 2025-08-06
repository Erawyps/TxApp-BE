// Import Dependencies
import { 
  PlusIcon, 
  PrinterIcon, 
  ArrowUpTrayIcon, 
  CalendarIcon 
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

// Local Imports
import { Card, Button } from "components/ui";
import { StatsCards } from "./StatsCards";

// ----------------------------------------------------------------------

export function Dashboard({ driver, vehicle, totals, onNewCourse, onShowHistory, onPrintReport }) {
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

      {/* Quick Actions - Modifié pour inclure historique et impression */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-dark-100">
          Actions rapides
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="primary"
            className="h-20 flex-col space-x-0 space-y-1"
            onClick={onNewCourse}
          >
            <PlusIcon className="h-6 w-6" />
            <span className="text-xs text-center leading-tight">
              Nouvelle course
            </span>
          </Button>
          <Button
            variant="outlined"
            className="h-20 flex-col space-x-0 space-y-1"
            onClick={onShowHistory}
          >
            <CalendarIcon className="h-6 w-6" />
            <span className="text-xs text-center leading-tight">
              Historique
            </span>
          </Button>
          <Button
            variant="outlined"
            className="h-20 flex-col space-x-0 space-y-1"
            onClick={onPrintReport}
          >
            <PrinterIcon className="h-6 w-6" />
            <span className="text-xs text-center leading-tight">
              Imprimer rapport
            </span>
          </Button>
          <Button
            variant="outlined"
            className="h-20 flex-col space-x-0 space-y-1"
            onClick={() => console.log("Export data")}
          >
            <ArrowUpTrayIcon className="h-6 w-6" />
            <span className="text-xs text-center leading-tight">
              Exporter données
            </span>
          </Button>
        </div>
      </Card>
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
  onNewCourse: PropTypes.func.isRequired,
  onShowHistory: PropTypes.func.isRequired,
  onPrintReport: PropTypes.func.isRequired
};