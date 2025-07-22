import { Card, Button, ScrollShadow } from 'components/ui';
import { 
  PlusIcon, 
  ReceiptPercentIcon,
  BanknotesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { CourseItem } from './CourseItem';

export function CourseList({ courses, onAddCourse, onRemoveCourse }) {
  return (
    <Card className="p-4">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Courses</h3>
        <div className="flex gap-2">
          <Button 
            variant="outlined" 
            size="sm"
            icon={<BanknotesIcon className="h-4 w-4" />}
            onClick={() => {/* Ouvrir FinancialSummaryModal */}}
          />
          <Button 
            variant="outlined" 
            size="sm"
            icon={<ClockIcon className="h-4 w-4" />}
            onClick={() => {/* Ouvrir historique */}}
          />
          <Button 
            variant="outlined" 
            size="sm"
            icon={<ReceiptPercentIcon className="h-4 w-4" />}
            onClick={() => {/* Ouvrir ExpenseFormModal */}}
          />
          <Button 
            variant="primary" 
            size="sm"
            icon={<PlusIcon className="h-4 w-4" />}
            onClick={() => {/* Ouvrir CourseFormModal */}}
          >
            Ajouter
          </Button>
        </div>
      </div>

      <ScrollShadow className="max-h-[60vh]">
        {courses.map((course, index) => (
          <CourseItem 
            key={course.id} 
            course={course}
            onRemove={() => onRemoveCourse(index)}
          />
        ))}
      </ScrollShadow>
    </Card>
  );
}