// Import Dependencies
import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

// Local Imports
import { Card, Badge } from "components/ui";

// ----------------------------------------------------------------------

export function FinancialSummary({ courses, expenses = [], externalCourses = [] }) {
  const [expandedSections, setExpandedSections] = useState({
    courses: false,
    expenses: false,
    external: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculs des totaux
  const coursesTotal = courses.reduce((sum, course) => sum + (course.sommes_percues || 0), 0);
  const expensesTotal = expenses.reduce((sum, expense) => sum + (expense.montant || 0), 0);
  const externalTotal = externalCourses.reduce((sum, course) => sum + (course.commission || 0), 0);
  
  const totalRecettes = coursesTotal + externalTotal;
  const beneficeNet = totalRecettes - expensesTotal;

  // Répartition par mode de paiement
  const paymentMethods = courses.reduce((acc, course) => {
    const method = course.mode_paiement || 'CASH';
    acc[method] = (acc[method] || 0) + (course.sommes_percues || 0);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Résumé global */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Recettes</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {totalRecettes.toFixed(2)} €
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Dépenses</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {expensesTotal.toFixed(2)} €
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Bénéfice Net</p>
            <p className={`text-xl font-bold ${beneficeNet >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {beneficeNet.toFixed(2)} €
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Nb Courses</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {courses.length}
            </p>
          </div>
        </div>
      </Card>

      {/* Courses directes */}
      <Card className="p-4">
        <button
          onClick={() => toggleSection('courses')}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
              Courses Directes
            </h3>
            <Badge variant="info">{courses.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-green-600 dark:text-green-400">
              {coursesTotal.toFixed(2)} €
            </span>
            {expandedSections.courses ? (
              <ChevronDownIcon className="h-5 w-5" />
            ) : (
              <ChevronRightIcon className="h-5 w-5" />
            )}
          </div>
        </button>

        {expandedSections.courses && (
          <div className="mt-4 space-y-3">
            {/* Répartition par mode de paiement */}
            <div className="bg-gray-50 dark:bg-dark-600/50 p-3 rounded-lg">
              <h4 className="font-medium mb-2 text-gray-800 dark:text-dark-100">
                Répartition par mode de paiement
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(paymentMethods).map(([method, amount]) => (
                  <div key={method} className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {method}:
                    </span>
                    <span className="font-medium">
                      {amount.toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Liste détaillée */}
            <div className="space-y-2">
              {courses.map((course) => (
                <div key={course.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-500">
                  <div>
                    <span className="font-medium">#{course.numero_ordre.toString().padStart(3, '0')}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {course.lieu_embarquement} → {course.lieu_debarquement}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{(course.sommes_percues || 0).toFixed(2)} €</div>
                    <div className="text-xs text-gray-500">{course.mode_paiement?.libelle || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Courses externes */}
      {externalCourses.length > 0 && (
        <Card className="p-4">
          <button
            onClick={() => toggleSection('external')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                Courses Externes
              </h3>
              <Badge variant="warning">{externalCourses.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {externalTotal.toFixed(2)} €
              </span>
              {expandedSections.external ? (
                <ChevronDownIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )}
            </div>
          </button>

          {expandedSections.external && (
            <div className="mt-4 space-y-2">
              {externalCourses.map((course, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-500">
                  <div>
                    <span className="font-medium">{course.prestataire}</span>
                    <div className="text-sm text-gray-500">
                      {course.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{course.commission.toFixed(2)} €</div>
                    <div className="text-xs text-gray-500">Commission</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Dépenses */}
      {expenses.length > 0 && (
        <Card className="p-4">
          <button
            onClick={() => toggleSection('expenses')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                Dépenses
              </h3>
              <Badge variant="error">{expenses.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-red-600 dark:text-red-400">
                -{expensesTotal.toFixed(2)} €
              </span>
              {expandedSections.expenses ? (
                <ChevronDownIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )}
            </div>
          </button>

          {expandedSections.expenses && (
            <div className="mt-4 space-y-2">
              {expenses.map((expense, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-500">
                  <div>
                    <span className="font-medium">{expense.categorie}</span>
                    <div className="text-sm text-gray-500">
                      {expense.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600 dark:text-red-400">
                      -{expense.montant.toFixed(2)} €
                    </div>
                    <div className="text-xs text-gray-500">{expense.heure}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

FinancialSummary.propTypes = {
  courses: PropTypes.array.isRequired,
  expenses: PropTypes.array,
  externalCourses: PropTypes.array
};