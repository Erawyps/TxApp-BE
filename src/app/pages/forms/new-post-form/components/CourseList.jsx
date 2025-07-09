import { Badge, Button } from 'components/ui';
import { Card } from 'components/ui';
import { TrashIcon } from '@heroicons/react/24/outline';

export function CourseList({ courses, onRemoveCourse }) {
  if (courses.length === 0) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
          Liste des Courses
        </h3>
        <Badge variant="primary">{courses.length}</Badge>
      </div>
      
      <div className="space-y-3">
        {courses.map((course, index) => (
          <div 
            key={course.id} 
            className="p-4 border rounded-lg bg-white dark:bg-dark-700 border-gray-200 dark:border-dark-500"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-800 dark:text-dark-100">
                    {course.depart.lieu} → {course.arrivee.lieu}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-600 dark:text-dark-300">
                  <span className="font-medium">{course.prix.toFixed(2)} €</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{course.mode_paiement}</span>
                  {course.client && (
                    <>
                      <span className="mx-2">•</span>
                      <span>Client: {course.client}</span>
                    </>
                  )}
                </div>
                {course.depart.heure && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-dark-400">
                    Heure: {course.depart.heure}
                  </div>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onRemoveCourse(index)}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                icon={<TrashIcon className="h-4 w-4" />}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}