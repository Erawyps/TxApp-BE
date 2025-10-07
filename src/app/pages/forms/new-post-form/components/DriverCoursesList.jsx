import { Card, Button } from 'components/ui';
import { PencilIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function DriverCoursesList({ courses, onEditCourse, modeEncodage }) {
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

  const getStatusBadge = (course) => {
    if (!course.heure_debarquement) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          En cours
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Terminée
      </span>
    );
  };

  if (courses.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune course</h3>
        <p className="text-gray-600">
          {modeEncodage === 'LIVE' 
            ? 'Commencez à encoder vos courses en temps réel'
            : 'Ajoutez vos courses effectuées pendant le shift'
          }
        </p>
      </Card>
    );
  }

  const totalRevenue = courses.reduce((sum, course) => sum + (course.sommes_percues || 0), 0);

  return (
    <div className="space-y-4">
      {/* Résumé */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {courses.length} course{courses.length > 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-gray-600">
              Total des revenus: {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Mode {modeEncodage}</div>
            {modeEncodage === 'LIVE' && (
              <div className="text-xs text-green-600">Auto-sauvegarde activée</div>
            )}
          </div>
        </div>
      </Card>

      {/* Liste des courses */}
      <div className="space-y-3">
        {courses.map((course) => (
          <Card key={course.course_id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-medium text-gray-900">
                    Course #{course.num_ordre}
                  </span>
                  {getStatusBadge(course)}
                  {course.est_hors_heures && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Hors heures
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {/* Trajet */}
                  <div>
                    <div className="text-gray-600 mb-1">Trajet</div>
                    <div className="font-medium">
                      {course.lieu_embarquement}
                    </div>
                    <div className="text-gray-500 text-xs">
                      → {course.lieu_debarquement}
                    </div>
                  </div>

                  {/* Horaires et distance */}
                  <div>
                    <div className="text-gray-600 mb-1">Horaires</div>
                    <div className="font-medium">
                      {formatTime(course.heure_embarquement)}
                      {course.heure_debarquement && (
                        <> - {formatTime(course.heure_debarquement)}</>
                      )}
                    </div>
                    <div className="text-gray-500 text-xs">
                      Index: {course.index_embarquement} → {course.index_debarquement || '---'}
                    </div>
                  </div>

                  {/* Paiement */}
                  <div>
                    <div className="text-gray-600 mb-1">Paiement</div>
                    <div className="font-medium text-green-600">
                      {formatCurrency(course.sommes_percues)}
                    </div>
                    {course.prix_taximetre && (
                      <div className="text-gray-500 text-xs">
                        Taximètre: {formatCurrency(course.prix_taximetre)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                  {course.mode_paiement && (
                    <span>💳 {course.mode_paiement.nom_mode}</span>
                  )}
                  {course.client && (
                    <span>👤 {course.client.nom_client}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="ml-4 flex flex-col space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditCourse(course)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 border-gray-200 hover:bg-gray-50"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  Détails
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Statistiques en bas */}
      <Card className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
            <div className="text-sm text-gray-600">Courses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">Total revenus</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {courses.length > 0 ? 
                Math.max(...courses.map(c => c.index_debarquement || 0)) - 
                Math.min(...courses.map(c => c.index_embarquement || 0))
                : 0
              }
            </div>
            <div className="text-sm text-gray-600">Km parcourus</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(courses.length > 0 ? totalRevenue / courses.length : 0)}
            </div>
            <div className="text-sm text-gray-600">Moyenne/course</div>
          </div>
        </div>
      </Card>
    </div>
  );
}