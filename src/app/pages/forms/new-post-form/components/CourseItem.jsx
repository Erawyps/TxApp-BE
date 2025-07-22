import { Button } from 'components/ui';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export function CourseItem({ course, onEdit, onRemove }) {
  return (
    <div className="border rounded-lg p-3 mb-2 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium">
            #{course.order} • {course.departure_place} → {course.arrival_place}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {course.departure_time} - {course.arrival_time || 'En cours'}
          </div>
          <div className="text-sm font-semibold text-primary-600 mt-1">
            {course.amount_received} € ({course.payment_method})
          </div>
          {course.notes && (
            <div className="text-sm text-gray-500 mt-1">📝 {course.notes}</div>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<PencilIcon className="h-4 w-4" />}
            onClick={() => onEdit(course)}
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:bg-red-50"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={onRemove}
          />
        </div>
      </div>
    </div>
  );
}