import { ClockIcon, CurrencyEuroIcon, MapPinIcon } from '@heroicons/react/24/outline';

export function CourseItem({ course }) {
  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-500">#{course.order}</span>
            <div className="flex items-center text-sm text-gray-500">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span>{course.depart.lieu} → {course.arrivee.lieu}</span>
            </div>
          </div>
          
          <div className="mt-2 flex items-center gap-4 text-sm">
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
              <span>{course.depart.heure}</span>
              {course.arrivee.heure && (
                <>
                  <span className="mx-1">→</span>
                  <span>{course.arrivee.heure}</span>
                </>
              )}
            </div>
            <div className="flex items-center">
              <CurrencyEuroIcon className="h-4 w-4 mr-1 text-gray-400" />
              <span>{course.somme_percue.toFixed(2)}€</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
          {course.mode_paiement === 'cash' ? 'Espèces' : 
           course.mode_paiement === 'bancontact' ? 'Bancontact' : 'Facture'}
        </div>
      </div>
      
      {course.notes && (
        <div className="mt-2 text-sm text-gray-500">
          📝 {course.notes}
        </div>
      )}
    </div>
  );
}