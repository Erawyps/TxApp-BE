// components/CourseItem.jsx
import { Button } from 'components/ui';
import { TrashIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import { ClockIcon, BanknotesIcon } from '@heroicons/react/24/outline';


export function CourseItem({ course, onEdit, onRemove }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              #{course.numero_ordre.toString().padStart(3, '0')}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              course.status === 'completed' ? 'bg-green-100 text-green-800' : 
              course.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {course.status === 'completed' ? 'Terminée' : course.status === 'in-progress' ? 'En cours' : 'Annulée'}
            </span>
          </div>
          
          <div className="space-y-1 mb-3">
            <p className="font-medium text-gray-900">
              {course.lieu_embarquement} → {course.lieu_debarquement}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                {course.heure_embarquement} - {course.heure_debarquement || 'En cours'}
              </span>
              <span className="flex items-center gap-1">
                <BanknotesIcon className="h-4 w-4" />
                {course.sommes_percues.toFixed(2)} € ({course.mode_paiement})
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Index: {course.index_embarquement} → {course.index_debarquement}</span>
              <span>Taximètre: {course.prix_taximetre.toFixed(2)} €</span>
            </div>
            {course.notes && (
              <p className="text-sm text-gray-500 italic">&quot;{course.notes}&quot;</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<EyeIcon className="h-4 w-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<PencilIcon className="h-4 w-4" />}
            onClick={() => onEdit(course)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={onRemove}
            className="text-red-500 hover:bg-red-50"
          />
        </div>
      </div>
    </div>
  );
}