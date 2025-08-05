// Import Dependencies
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  ClockIcon, 
  BanknotesIcon 
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

// Local Imports
import { Card, Button, Badge } from "components/ui";

// ----------------------------------------------------------------------

export function CourseCard({ course, onEdit, onDelete, onView }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { variant: 'success', label: 'Terminée' };
      case 'in-progress':
        return { variant: 'warning', label: 'En cours' };
      case 'cancelled':
        return { variant: 'error', label: 'Annulée' };
      default:
        return { variant: 'neutral', label: 'Inconnue' };
    }
  };

  const statusBadge = getStatusBadge(course.status);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="neutral">
              #{course.numero_ordre.toString().padStart(3, '0')}
            </Badge>
            <Badge variant={statusBadge.variant}>
              {statusBadge.label}
            </Badge>
          </div>
          
          <div className="space-y-1 mb-3">
            <p className="font-medium text-gray-800 dark:text-dark-100">
              {course.lieu_embarquement} → {course.lieu_debarquement}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                {course.heure_embarquement} - {course.heure_debarquement || 'En cours'}
              </span>
              <span className="flex items-center gap-1">
                <BanknotesIcon className="h-4 w-4" />
                {course.sommes_percues.toFixed(2)} € ({course.mode_paiement})
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Index: {course.index_embarquement} → {course.index_debarquement}</span>
              <span>Taximètre: {course.prix_taximetre.toFixed(2)} €</span>
            </div>
            {course.notes && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                &quot;{course.notes}&quot;
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-4">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onView?.(course)}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(course)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 text-error hover:bg-error/10 dark:hover:bg-error-light/10"
            onClick={() => onDelete(course.id)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

CourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.number.isRequired,
    numero_ordre: PropTypes.number.isRequired,
    lieu_embarquement: PropTypes.string.isRequired,
    lieu_debarquement: PropTypes.string.isRequired,
    heure_embarquement: PropTypes.string.isRequired,
    heure_debarquement: PropTypes.string,
    index_embarquement: PropTypes.number.isRequired,
    index_debarquement: PropTypes.number.isRequired,
    prix_taximetre: PropTypes.number.isRequired,
    sommes_percues: PropTypes.number.isRequired,
    mode_paiement: PropTypes.string.isRequired,
    notes: PropTypes.string,
    status: PropTypes.string.isRequired
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func
};