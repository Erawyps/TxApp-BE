// Import Dependencies
import { 
  ChartBarIcon, 
  CurrencyEuroIcon, 
  TruckIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { forwardRef, useMemo } from "react";
import PropTypes from "prop-types";

// Local Imports
import { Card, Badge } from "components/ui";

// ----------------------------------------------------------------------

const Summary = forwardRef(({ watch, className = "" }, ref) => {
  const courses = watch("courses") || [];
  const serviceHours = watch("service") || {};
  const indexData = watch("index") || {};

  const summary = useMemo(() => {
    const totalRecettes = courses.reduce((sum, course) => {
      return sum + (parseFloat(course.sommes_percues) || 0);
    }, 0);

    const totalTaximetre = courses.reduce((sum, course) => {
      return sum + (parseFloat(course.prix_taximetre) || 0);
    }, 0);

    const totalCourses = courses.length;

    const moyenneParCourse = totalCourses > 0 ? totalRecettes / totalCourses : 0;

    const kmParcourus = (parseFloat(indexData.km_tableau_bord_fin) || 0) - 
                       (parseFloat(indexData.km_tableau_bord_debut) || 0);

    // Calculate payment method distribution
    const paymentMethods = courses.reduce((acc, course) => {
      const method = course.mode_paiement || 'CASH';
      acc[method] = (acc[method] || 0) + (parseFloat(course.sommes_percues) || 0);
      return acc;
    }, {});

    return {
      totalRecettes,
      totalTaximetre,
      totalCourses,
      moyenneParCourse,
      kmParcourus,
      paymentMethods,
      dureeService: serviceHours.total_heures || '00:00'
    };
  }, [courses, indexData, serviceHours]);

  const getPaymentMethodLabel = (method) => {
    const labels = {
      'CASH': 'Espèces',
      'BC': 'Bancontact',
      'VIR': 'Virement',
      'F-SNCB': 'F. SNCB',
      'F-WL': 'F. Wallonie',
      'F-TX': 'F. Taxi'
    };
    return labels[method] || method;
  };

  return (
    <Card className={`p-4 sm:px-5 ${className}`} ref={ref}>
      <div className="flex items-center gap-2 mb-4">
        <ChartBarIcon className="size-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
          Résumé de la journée
        </h3>
      </div>
      
      <div className="space-y-6">
        {/* Statistiques principales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
            <CurrencyEuroIcon className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {summary.totalRecettes.toFixed(2)}€
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Recettes totales
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
            <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {summary.totalCourses}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Courses
            </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
            <CurrencyEuroIcon className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {summary.moyenneParCourse.toFixed(2)}€
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Moyenne/course
            </p>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-center">
            <ClockIcon className="h-6 w-6 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {summary.dureeService}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Durée service
            </p>
          </div>
        </div>

        {/* Détails financiers */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
            Détails financiers
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Prix taximètre total</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {summary.totalTaximetre.toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kilomètres parcourus</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {summary.kmParcourus} km
              </p>
            </div>
          </div>
        </div>

        {/* Répartition des paiements */}
        {Object.keys(summary.paymentMethods).length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-3 text-blue-800 dark:text-blue-200">
              Répartition des paiements
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.paymentMethods).map(([method, amount]) => (
                <Badge key={method} variant="info" className="text-xs">
                  {getPaymentMethodLabel(method)}: {amount.toFixed(2)}€
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Messages d'alerte */}
        {summary.totalCourses === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              ⚠️ Aucune course enregistrée pour cette journée
            </p>
          </div>
        )}

        {summary.totalRecettes !== summary.totalTaximetre && summary.totalCourses > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              💡 Différence entre taximètre et recettes: {(summary.totalRecettes - summary.totalTaximetre).toFixed(2)}€
              {summary.totalRecettes > summary.totalTaximetre ? ' (pourboires inclus)' : ' (remises appliquées)'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
});

Summary.displayName = "Summary";

Summary.propTypes = {
  watch: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export { Summary };