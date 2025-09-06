// Import Dependencies
import { BanknotesIcon, TruckIcon, ChartBarIcon, MapIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

// Local Imports
import { Card } from "components/ui";

// ----------------------------------------------------------------------

export function StatsCards({ totals }) {
  const stats = [
    {
      label: "Chiffre d'affaires total",
      value: `${totals.recettes.toFixed(2)} €`,
      icon: BanknotesIcon,
      color: "text-gray-700 dark:text-gray-300", // Couleur neutre
      bg: "bg-gray-100 dark:bg-gray-800"
    },
    {
      label: "Nombre total de courses",
      value: totals.coursesCount,
      icon: TruckIcon,
      color: "text-gray-700 dark:text-gray-300", // Couleur neutre
      bg: "bg-gray-100 dark:bg-gray-800"
    },
    {
      label: "Km parcourus",
      value: `${(totals.totalKm || 0).toFixed(1)} km`,
      icon: MapIcon,
      color: "text-gray-700 dark:text-gray-300", // Couleur neutre
      bg: "bg-gray-100 dark:bg-gray-800"
    },
    {
      label: "Ratio (€/km)",
      value: totals.totalKm > 0 ? `${(totals.recettes / totals.totalKm).toFixed(2)} €/km` : "0.00 €/km",
      icon: ChartBarIcon,
      color: "text-gray-700 dark:text-gray-300", // Couleur neutre
      bg: "bg-gray-100 dark:bg-gray-800"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

StatsCards.propTypes = {
  totals: PropTypes.shape({
    recettes: PropTypes.number.isRequired,
    coursesCount: PropTypes.number.isRequired,
    totalKm: PropTypes.number,
    averagePerCourse: PropTypes.number
  }).isRequired
};