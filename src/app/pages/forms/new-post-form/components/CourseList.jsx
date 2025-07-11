import { Button, ScrollShadow, Badge } from 'components/ui';
import { Card } from 'components/ui';
import { TrashIcon } from '@heroicons/react/24/outline';

export function CourseList({ courses, onRemoveCourse }) {
  const formatTime = (timeString) => {
    if (!timeString) return 'Non renseignée';
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}h${minutes}`;
  };

  if (courses.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-semibold text-gray-800 dark:text-dark-100">
          Courses
        </h3>
        <Badge variant="primary">{courses.length}</Badge>
      </div>
      
      <ScrollShadow className="h-[200px] hide-scrollbar" visibility="both">
        <div className="space-y-2 pr-2">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="p-3 border rounded-md bg-white dark:bg-dark-700 border-gray-200 dark:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 dark:text-dark-100 truncate">
                      {course.lieu_embarquement} → {course.lieu_debarquement}
                    </span>
                    {course.est_facture && (
                      <Badge size="xs" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        Facturé
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                      {course.prix_taximetre?.toFixed(2)} €
                    </span>
                    <span className="text-xs text-gray-500 dark:text-dark-400">
                      (Perçu: {course.somme_percue?.toFixed(2)} €)
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-dark-400">
                    <span>E: {formatTime(course.heure_embarquement)}</span>
                    <span>•</span>
                    <span>D: {formatTime(course.heure_debarquement)}</span>
                  </div>

                  {course.notes && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-dark-400 line-clamp-1">
                      📝 {course.notes}
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="xs"
                  onClick={() => onRemoveCourse(course.id)}
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                  icon={<TrashIcon className="h-3.5 w-3.5" />}
                />
              </div>
            </div>
          ))}
        </div>
      </ScrollShadow>
    </Card>
  );
}