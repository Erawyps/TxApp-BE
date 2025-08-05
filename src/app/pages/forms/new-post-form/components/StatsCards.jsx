// Import Dependencies
import { BanknotesIcon, TruckIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

// Local Imports
import { Card } from "components/ui";

// ----------------------------------------------------------------------

export function StatsCards({ totals }) {
  const stats = [
    {
      label: "Recettes du jour",
      value: `${totals.recettes.toFixed(2)} €`,
      icon: BanknotesIcon,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/20"
    },
    {
      label: "Courses effectuées",
      value: totals.coursesCount,
      icon: TruckIcon,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      label: "Moyenne / course",
      value: `${totals.averagePerCourse.toFixed(2)} €`,
      icon: ChartBarIcon,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
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
    averagePerCourse: PropTypes.number.isRequired
  }).isRequired
};