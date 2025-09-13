// Import Dependencies
import { 
  PlusIcon, 
  PrinterIcon, 
  CalendarIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { useState } from "react";

// Local Imports
import { Card, Button, Select } from "components/ui";
import { StatsCards } from "./StatsCards";

// ----------------------------------------------------------------------

export function Dashboard({
  driver,
  vehicle,
  totals,
  onNewCourse,
  onShowHistory,
  onPrintReport,
  onShowControl,
  hasActiveShift
}) {
  const [periodFilter, setPeriodFilter] = useState('today');

  const periodOptions = [
    { value: 'today', label: 'Jour courant' },
    { value: 'yesterday', label: 'Dernier jour' },
    { value: 'current_week', label: 'Semaine courante' },
    { value: 'last_week', label: 'Dernière semaine' }
  ];

  if (!driver) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-600">
              Chargement des données...
            </h1>
            <p className="text-gray-500 mt-2">
              Veuillez patienter pendant que nous récupérons vos informations.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Driver Info Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Bienvenue, {driver.prenom || 'Non défini'} {driver.nom || 'Non défini'}
            </h1>
            <p className="opacity-90">
              Badge: {driver.numero_badge || 'N/A'} • {driver.type_contrat || 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Véhicule actuel</p>
            <p className="font-semibold">{vehicle?.plaque_immatriculation || 'Non défini'}</p>
          </div>
        </div>
      </Card>

      {/* Period Filter */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
            Résumé de l&apos;activité
          </h3>
          <div className="w-48">
            <Select
              value={periodFilter}
              onChange={setPeriodFilter}
              options={periodOptions}
            />
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <StatsCards totals={totals} />

      {/* Quick Actions - Réorganisées selon les exigences */}
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
              {hasActiveShift ? "Nouvelle course" : "Nouvelle feuille"}
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

          {/* Bouton Contrôle déplacé à droite selon les exigences */}
          <Button
            variant="outlined"
            className="h-20 flex-col space-x-0 space-y-1"
            onClick={onShowControl}
          >
            <ShieldCheckIcon className="h-6 w-6" />
            <span className="text-xs text-center leading-tight">
              Contrôle
            </span>
          </Button>

          {/* Historique renommé mais gardé pour compatibilité */}
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
        </div>
      </Card>
    </div>
  );
}

Dashboard.propTypes = {
  driver: PropTypes.shape({
    nom: PropTypes.string,
    prenom: PropTypes.string,
    numero_badge: PropTypes.string,
    type_contrat: PropTypes.string
  }),
  vehicle: PropTypes.shape({
    plaque_immatriculation: PropTypes.string
  }),
  totals: PropTypes.shape({
    recettes: PropTypes.number.isRequired,
    coursesCount: PropTypes.number.isRequired,
    averagePerCourse: PropTypes.number.isRequired,
    totalKm: PropTypes.number,
    ratioEuroKm: PropTypes.number
  }).isRequired,
  onNewCourse: PropTypes.func.isRequired,
  onShowHistory: PropTypes.func.isRequired,
  onPrintReport: PropTypes.func.isRequired,
  onShowControl: PropTypes.func.isRequired,
  hasActiveShift: PropTypes.bool
};