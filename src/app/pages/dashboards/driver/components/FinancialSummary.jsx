import { useMemo } from 'react';
import { CurrencyEuroIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';

export function FinancialSummary({ courses = [], expenses = [] }) {
  const financialData = useMemo(() => {
    // Calculate totals from courses
    const courseData = courses.reduce((acc, course) => {
      const amount = parseFloat(course.somme_percue) || 0;
      const paymentMethod = course.mode_paiement?.code?.toLowerCase();

      acc.total += amount;

      if (paymentMethod === 'cash' || paymentMethod === 'especes') {
        acc.cash += amount;
      } else if (paymentMethod && paymentMethod !== 'cash' && paymentMethod !== 'especes') {
        acc.card += amount;
      }

      return acc;
    }, { total: 0, cash: 0, card: 0 });

    // Calculate total expenses
    const totalExpenses = expenses.reduce((acc, expense) => {
      return acc + (parseFloat(expense.montant) || 0);
    }, 0);

    // Calculate net totals
    const netCash = courseData.cash - totalExpenses;
    const netTotal = courseData.total - totalExpenses;

    return {
      totalRevenue: courseData.total,
      cashRevenue: courseData.cash,
      cardRevenue: courseData.card,
      totalExpenses,
      netCash,
      netTotal,
      numberOfCourses: courses.length,
      numberOfExpenses: expenses.length
    };
  }, [courses, expenses]);

  const StatCard = ({ icon: Icon, label, value, subtext, bgColor = 'bg-white' }) => (
    <div className={`${bgColor} rounded-lg shadow p-4 border border-gray-200`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-blue-600" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            €{typeof value === 'number' ? value.toFixed(2) : '0.00'}
          </p>
          {subtext && (
            <p className="text-xs text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Résumé financier</h2>
        <div className="text-sm text-gray-500">
          {financialData.numberOfCourses} courses • {financialData.numberOfExpenses} charges
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={CurrencyEuroIcon}
          label="Recettes totales"
          value={financialData.totalRevenue}
          subtext={`${financialData.numberOfCourses} courses`}
          bgColor="bg-blue-50"
        />

        <StatCard
          icon={BanknotesIcon}
          label="Espèces"
          value={financialData.cashRevenue}
          subtext="Paiements cash"
          bgColor="bg-green-50"
        />

        <StatCard
          icon={CreditCardIcon}
          label="Cartes"
          value={financialData.cardRevenue}
          subtext="Paiements électroniques"
          bgColor="bg-purple-50"
        />

        <StatCard
          icon={CurrencyEuroIcon}
          label="Charges"
          value={financialData.totalExpenses}
          subtext={`${financialData.numberOfExpenses} charges`}
          bgColor="bg-orange-50"
        />
      </div>

      {/* Net totals section */}
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Net espèces</span>
              <span className={`text-lg font-bold ${financialData.netCash >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                €{financialData.netCash.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Espèces - charges
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total net</span>
              <span className={`text-lg font-bold ${financialData.netTotal >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                €{financialData.netTotal.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recettes totales - charges
            </p>
          </div>
        </div>
      </div>

      {/* Performance indicators */}
      {financialData.numberOfCourses > 0 && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Recette moyenne</p>
              <p className="text-lg font-semibold text-gray-900">
                €{(financialData.totalRevenue / financialData.numberOfCourses).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">% Espèces</p>
              <p className="text-lg font-semibold text-gray-900">
                {financialData.totalRevenue > 0
                  ? ((financialData.cashRevenue / financialData.totalRevenue) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">% Cartes</p>
              <p className="text-lg font-semibold text-gray-900">
                {financialData.totalRevenue > 0
                  ? ((financialData.cardRevenue / financialData.totalRevenue) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warning for unusual amounts */}
      {courses.some(course =>
        parseFloat(course.somme_percue) > parseFloat(course.prix_taximetre)
      ) && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Attention:</strong> Une ou plusieurs courses ont un montant perçu supérieur au prix taximètre (pourboires?).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
