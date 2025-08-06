// Import Dependencies
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  ChartBarIcon,
  ClockIcon,
  BanknotesIcon,
  TruckIcon
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

// Local Imports
import { Button, Input, Badge } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { statusOptions } from "../data";

// ----------------------------------------------------------------------

export function Toolbar({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange,
  courses,
  onNewCourse,
  onShowFinancialSummary,
  onShowHistory,
  onShowExpenseForm,
  onShowExternalCourseForm
}) {
  const filteredCounts = [
    { 
      key: 'all', 
      label: 'Toutes', 
      count: courses.length 
    },
    { 
      key: 'completed', 
      label: 'Terminées', 
      count: courses.filter(c => c.status === 'completed').length 
    },
    { 
      key: 'in-progress', 
      label: 'En cours', 
      count: courses.filter(c => c.status === 'in-progress').length 
    }
  ];

  const quickActions = [
    {
      label: "Résumé financier",
      icon: ChartBarIcon,
      onClick: onShowFinancialSummary,
      color: "text-green-600"
    },
    {
      label: "Historique",
      icon: ClockIcon,
      onClick: onShowHistory,
      color: "text-blue-600"
    },
    {
      label: "Ajouter dépense",
      icon: BanknotesIcon,
      onClick: onShowExpenseForm,
      color: "text-red-600"
    },
    {
      label: "Course externe",
      icon: TruckIcon,
      onClick: onShowExternalCourseForm,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header with title */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100">
          Courses ({courses.length})
        </h2>
      </div>
      
      {/* Quick actions - 4 boutons en haut */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="outlined"
              className={`h-12 flex-col space-y-1 ${action.color}`}
              onClick={action.onClick}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs text-center leading-tight">
                {action.label}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Add new course button */}
      <Button
        onClick={onNewCourse}
        className="w-full h-12 space-x-2"
        size="lg"
      >
        <PlusIcon className="h-5 w-5" />
        <span>Ajouter une course</span>
      </Button>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par lieu, numéro..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
            leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Listbox
            data={statusOptions}
            value={statusOptions.find(option => option.value === statusFilter) || statusOptions[0]}
            onChange={(val) => onStatusFilterChange(val.value)}
            displayField="label"
          />
        </div>
      </div>

      {/* Status tabs */}
      <div className="border-b border-gray-200 dark:border-dark-500">
        <div className="flex gap-4">
          {filteredCounts.map(tab => (
            <button
              key={tab.key}
              onClick={() => onStatusFilterChange(tab.key)}
              className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors ${
                statusFilter === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              <Badge variant={statusFilter === tab.key ? 'info' : 'neutral'}>
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Toolbar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onStatusFilterChange: PropTypes.func.isRequired,
  courses: PropTypes.array.isRequired,
  onNewCourse: PropTypes.func.isRequired,
  onShowFinancialSummary: PropTypes.func.isRequired,
  onShowHistory: PropTypes.func.isRequired,
  onShowExpenseForm: PropTypes.func.isRequired,
  onShowExternalCourseForm: PropTypes.func.isRequired
};