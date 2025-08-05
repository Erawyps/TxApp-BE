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

// ----------------------------------------------------------------------

export function QuickActions({ onNewCourse }) {
  const actions = [
    {
      label: "Nouvelle course",
      icon: PlusIcon,
      onClick: onNewCourse,
      variant: "primary"
    },
    {
      label: "Imprimer rapport",
      icon: PrinterIcon,
      onClick: () => console.log("Print report"),
      variant: "outlined"
    },
    {
      label: "Exporter données",
      icon: ArrowUpTrayIcon,
      onClick: () => console.log("Export data"),
      variant: "outlined"
    },
    {
      label: "Historique",
      icon: CalendarIcon,
      onClick: () => console.log("Show history"),
      variant: "outlined"
    }
  ];

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-dark-100">
        Actions rapides
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant={action.variant}
              className="h-20 flex-col space-x-0 space-y-1"
              onClick={action.onClick}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs text-center leading-tight">
                {action.label}
              </span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}

QuickActions.propTypes = {
  onNewCourse: PropTypes.func.isRequired
};