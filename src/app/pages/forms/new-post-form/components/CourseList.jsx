import { Badge, Button } from 'components/ui';
import { Card } from 'components/ui';

export function CourseList({ courses, onRemoveCourse }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center">
          <span className="mr-2">Courses enregistrées</span>
        </h3>
        <Badge>{courses.length}</Badge>
      </div>
      
      <div className="mt-4 space-y-3">
        {courses.map((course, index) => (
          <div key={course.id} className="p-3 border rounded-lg bg-gray-50 dark:bg-dark-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{course.depart.lieu} → {course.arrivee.lieu}</p>
                <p className="text-sm text-gray-500 dark:text-dark-300">
                  {course.prix} € • {course.mode_paiement}
                  {course.client && ` • ${course.client}`}
                </p>
                {course.depart.heure && (
                  <p className="text-xs mt-1 text-gray-400 dark:text-dark-400">
                    Heure: {course.depart.heure}
                  </p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onRemoveCourse(index)}
                className="text-red-500 dark:text-red-400"
              >
                Supprimer
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}