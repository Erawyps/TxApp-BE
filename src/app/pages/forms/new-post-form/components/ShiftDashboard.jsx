import { Card } from 'components/ui';
import { Button } from 'components/ui';
import { PlayIcon, TruckIcon, ClockIcon, EuroIcon } from '@heroicons/react/24/outline';

export default function ShiftDashboard({ currentShift, courses, isShiftActive, onStartNewShift }) {
  // Calculs des métriques
  const totalCourses = courses.length;
  const totalRevenue = courses.reduce((sum, course) => sum + (course.sommes_percues || 0), 0);
  const kmParcourus = currentShift ? 
    (currentShift.index_km_fin_tdb || 0) - (currentShift.index_km_debut_tdb || 0) : 0;

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-BE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Statut du shift */}
      <div className="text-center">
        {isShiftActive ? (
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Shift en cours - Mode {currentShift?.mode_encodage}
            </div>
            <div className="text-sm text-gray-600">
              Démarré à {formatTime(currentShift?.heure_debut)} • 
              Véhicule {currentShift?.vehicule?.plaque_immatriculation}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-full">
              <ClockIcon className="w-4 h-4 mr-2" />
              Aucun shift actif
            </div>
            <Button onClick={onStartNewShift} className="bg-blue-600 hover:bg-blue-700">
              <PlayIcon className="w-4 h-4 mr-2" />
              Démarrer un nouveau shift
            </Button>
          </div>
        )}
      </div>

      {/* Métriques du shift actuel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center">
            <TruckIcon className="w-8 h-8 text-blue-500 mr-4" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
              <p className="text-sm text-gray-600">Courses effectuées</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <EuroIcon className="w-8 h-8 text-green-500 mr-4" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-gray-600">Revenus perçus</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-purple-500 mr-4" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{kmParcourus}</p>
              <p className="text-sm text-gray-600">Km parcourus</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Dernières courses */}
      {isShiftActive && courses.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Dernières courses</h3>
          <div className="space-y-3">
            {courses.slice(-5).reverse().map((course) => (
              <div key={course.course_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">
                    {course.lieu_embarquement} → {course.lieu_debarquement}
                  </div>
                  <div className="text-sm text-gray-600">
                    Course #{course.num_ordre} • {formatTime(course.heure_embarquement)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(course.sommes_percues)}</div>
                  {course.prix_taximetre && (
                    <div className="text-sm text-gray-600">
                      Taximètre: {formatCurrency(course.prix_taximetre)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Informations du shift */}
      {isShiftActive && currentShift && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Détails du shift</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Date de service:</span>
              <div className="font-medium">{currentShift.date_service}</div>
            </div>
            <div>
              <span className="text-gray-600">Mode d&apos;encodage:</span>
              <div className="font-medium">{currentShift.mode_encodage}</div>
            </div>
            <div>
              <span className="text-gray-600">Heure de début:</span>
              <div className="font-medium">{formatTime(currentShift.heure_debut)}</div>
            </div>
            <div>
              <span className="text-gray-600">Km de début:</span>
              <div className="font-medium">{currentShift.index_km_debut_tdb}</div>
            </div>
            {currentShift.interruptions && (
              <div className="col-span-2">
                <span className="text-gray-600">Interruptions:</span>
                <div className="font-medium">{currentShift.interruptions}</div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}