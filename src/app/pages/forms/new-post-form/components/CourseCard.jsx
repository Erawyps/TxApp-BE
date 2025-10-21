// Import Dependencies
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  ClockIcon, 
  BanknotesIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

// Local Imports
import { Card, Button, Badge } from "components/ui";

// ----------------------------------------------------------------------

export function CourseCard({ course, onEdit, onDelete, onView, onComplete }) {
  console.log('CourseCard - course data:', course);
  console.log('CourseCard - Index data:', {
    embarquement: course.index_embarquement,
    debarquement: course.index_debarquement,
    difference: course.index_debarquement - course.index_embarquement
  });
  console.log('CourseCard - course data:', course);
  console.log('CourseCard - Index data:', {
    embarquement: course.index_embarquement,
    debarquement: course.index_debarquement,
    difference: course.index_debarquement - course.index_embarquement
  });
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'Active':
        return { variant: 'success', label: 'Terminée' };
      case 'in-progress':
        return { variant: 'warning', label: 'En cours' };
      case 'cancelled':
      case 'Annulé':
      case 'Annulée':
        return { variant: 'error', label: 'Annulée' };
      default:
        return { variant: 'neutral', label: 'Inconnue' };
    }
  };

  const statusBadge = getStatusBadge(course.status);

  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="neutral" className="text-xs">
              #{course.numero_ordre.toString().padStart(3, '0')}
            </Badge>
            <Badge variant={statusBadge.variant} className="text-xs">
              {statusBadge.label}
            </Badge>
          </div>
          
          <div className="space-y-0.5 mb-2">
            <p className="font-medium text-sm text-gray-800 dark:text-dark-100 truncate">
              {course.lieu_embarquement} → {course.lieu_debarquement}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                {course.heure_embarquement} - {course.heure_debarquement || 'En cours'}
              </span>
              <span className="flex items-center gap-1">
                <BanknotesIcon className="h-3 w-3" />
                {(course.sommes_percues || 0).toFixed(2)} €
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium text-blue-600 dark:text-blue-400">
                📍 {course.index_embarquement} → {course.index_debarquement}
                {course.index_debarquement > course.index_embarquement &&
                  <span className="ml-1 text-green-600 dark:text-green-400">
                    (+{course.index_debarquement - course.index_embarquement} km)
                  </span>
                }
              </span>
              <span>Taximètre: {(course.prix_taximetre || 0).toFixed(2)} €</span>
            </div>
            {course.notes && (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic truncate">
                &quot;{course.notes}&quot;
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          {course.status === 'in-progress' && onComplete && (
            <Button
              variant="ghost"
              className="h-6 w-6 p-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={() => onComplete(course)}
              title="Compléter la course"
            >
              <CheckCircleIcon className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => onView?.(course)}
            title="Voir les détails"
          >
            <EyeIcon className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => onEdit(course)}
            title="Modifier"
          >
            <PencilIcon className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 text-error hover:bg-error/10 dark:hover:bg-error-light/10"
            onClick={() => onDelete(course.id)}
            title="Annuler"
          >
            <TrashIcon className="h-3 w-3" />
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
  onView: PropTypes.func,
  onComplete: PropTypes.func
};