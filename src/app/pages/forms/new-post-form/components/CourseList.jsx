import { Button } from 'components/ui';
import { Card } from 'components/ui';
import { TrashIcon } from '@heroicons/react/24/outline';

export function CourseList({ courses, onRemoveCourse }) {
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}h${minutes}`;
  };

  const getPaymentMethodLabel = (code) => {
    const methods = {
      'CASH': 'Espèces',
      'BC': 'Bancontact',
      'F-SNCB': 'Facture SNCB',
      'F-TX': 'Facture Taxi'
    };
    return methods[code] || code;
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Courses ({courses.length})</h3>
      </div>
      
      <div className="space-y-3">
        {courses.map((course) => (
          <div key={course.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">
                  {course.lieu_embarquement} → {course.lieu_debarquement}
                </div>
                <div className="mt-1 text-sm">
                  <span>{course.prix_taximetre.toFixed(2)} € (Perçu: {course.somme_percue.toFixed(2)} €)</span>
                  <span className="mx-2">•</span>
                  <span>{getPaymentMethodLabel(course.mode_paiement_id)}</span>
                  {course.est_facture && (
                    <span className="ml-2 text-blue-500">Facturé</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {formatTime(course.heure_embarquement)} → {formatTime(course.heure_debarquement)}
                </div>
              </div>
              <Button 
                onClick={() => onRemoveCourse(course.id)}
                icon={<TrashIcon className="h-4 w-4" />}
                variant="ghost"
              />
            </div>
            {course.notes && (
              <div className="mt-2 text-sm text-gray-500">
                📝 {course.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}