import { Card } from "components/ui";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export function CourseList({ courses, onEdit, onRemove }) {
  // Fonction pour formater le prix
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2).replace('.', ',') + '€';
  };

  // Fonction pour obtenir l'icône du mode de paiement
  const getPaymentIcon = (mode) => {
    switch(mode) {
      case 'cash': return '💰';
      case 'bancontact': return '💳'; 
      case 'facture': return '📄';
      default: return '';
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <h3 className="font-medium text-lg">
        Courses ({courses.length})
      </h3>

      {courses.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Aucune course enregistrée
        </p>
      ) : (
        <div className="space-y-2">
          {courses.map((course, index) => (
            <Card key={course.id} className="p-3 relative">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-500">{index + 1}.</span>
                    <div>
                      <p className="font-medium">
                        {course.depart.lieu} → {course.arrivee.lieu}
                      </p>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span>{course.depart.heure}</span>
                        {course.arrivee.heure && (
                          <span>→ {course.arrivee.heure}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="font-bold">
                    {formatPrice(course.prix)}
                  </span>
                  <span className="text-lg">
                    {getPaymentIcon(course.mode_paiement)}
                  </span>
                </div>
              </div>

              {course.notes && (
                <p className="mt-1 text-sm text-gray-600">
                  📝 {course.notes}
                </p>
              )}

              <div className="absolute top-2 right-2 flex space-x-1">
                <button 
                  onClick={() => onEdit(course.id)}
                  className="p-1 text-blue-500 hover:text-blue-700"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => onRemove(course.id)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Résumé des recettes */}
      {courses.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex justify-between font-medium">
            <span>Total recettes:</span>
            <span>
              {formatPrice(
                courses.reduce((sum, course) => sum + parseFloat(course.prix), 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}