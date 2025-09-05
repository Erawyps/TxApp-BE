import { useState } from 'react';
import { Page } from 'components/shared/Page';
import {
  ClockIcon,
  TruckIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  PlusIcon,
  PrinterIcon,
  StopIcon,
  ShieldCheckIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from 'hooks/useAuth';
import { NewShiftModal } from './components/NewShiftModal';
import { CourseModal } from './components/CourseModal';
import { ExpenseModal } from './components/ExpenseModal';
import { ExternalCourseModal } from './components/ExternalCourseModal';
import { EndShiftModal } from './components/EndShiftModal';
import { PrintModal } from './components/PrintModal';
import { HistoryModal } from './components/HistoryModal';
import { AdminOversightModal } from './components/AdminOversightModal';
import { FinancialSummary } from './components/FinancialSummary';
import { CourseList } from './components/CourseList';
import { ShiftInfo } from './components/ShiftInfo';
import { useDriverShift } from 'hooks/useDriverShift';
import { useCourses } from 'hooks/useCourses';
import { useExpenses } from 'hooks/useExpenses';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [activeModals, setActiveModals] = useState({
    newShift: false,
    newCourse: false,
    expense: false,
    externalCourse: false,
    endShift: false,
    print: false,
    history: false,
    adminOversight: false
  });

  // Correction: utiliser user?.chauffeur?.id au lieu de user?.chauffeur_id
  const chauffeurId = user?.chauffeur?.id;

  const {
    currentShift,
    isLoading: shiftLoading,
    createShift,
    endShift,
    updateShift
  } = useDriverShift(chauffeurId);

  const {
    courses,
    isLoading: coursesLoading,
    createCourse,
    updateCourse,
    deleteCourse
  } = useCourses(currentShift?.id);

  const {
    expenses,
    createExpense
  } = useExpenses(currentShift?.id);

  const openModal = (modalName) => {
    setActiveModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setActiveModals(prev => ({ ...prev, [modalName]: false }));
  };

  const handleShiftCreate = async (shiftData) => {
    await createShift(shiftData);
    closeModal('newShift');
  };

  const handleShiftEnd = async (endData) => {
    await endShift(endData);
    closeModal('endShift');
  };

  const handleCourseCreate = async (courseData) => {
    await createCourse(courseData);
    closeModal('newCourse');
  };

  const handleExpenseCreate = async (expenseData) => {
    await createExpense(expenseData);
    closeModal('expense');
  };

  const quickActions = [
    {
      id: 'nouvelle-feuille',
      label: 'Nouvelle feuille',
      icon: DocumentTextIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => openModal('newShift'),
      disabled: !!currentShift
    },
    {
      id: 'nouvelle-course',
      label: 'Nouvelle course',
      icon: PlusIcon,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => openModal('newCourse'),
      disabled: !currentShift
    },
    {
      id: 'fin-feuille',
      label: 'Fin de feuille',
      icon: StopIcon,
      color: 'bg-red-500 hover:bg-red-600',
      onClick: () => openModal('endShift'),
      disabled: !currentShift
    },
    {
      id: 'controle',
      label: 'Contrôle',
      icon: ShieldCheckIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => openModal('print'),
      disabled: !currentShift
    },
    {
      id: 'imprimer',
      label: 'Imprimer rapport',
      icon: PrinterIcon,
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: () => openModal('print'),
      disabled: !currentShift
    }
  ];

  const secondaryActions = [
    {
      id: 'historique',
      label: 'Historique',
      icon: EyeIcon,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => openModal('history'),
      disabled: false
    },
    {
      id: 'supervision',
      label: 'Supervision Admin',
      icon: ShieldCheckIcon,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      onClick: () => openModal('adminOversight'),
      disabled: false,
      adminOnly: true
    }
  ];

  // Check if user has admin privileges (you may need to adjust this logic)
  const isAdmin = user?.type_utilisateur === 'ADMIN' || user?.type_utilisateur === 'admin';

  // Vérifier si l'utilisateur est un chauffeur
  const isChauffeur = user?.type_utilisateur === 'CHAUFFEUR' || user?.type_utilisateur === 'chauffeur';

  if (shiftLoading) {
    return (
      <Page title="Tableau de bord chauffeur">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Page>
    );
  }

  // Si l'utilisateur n'est pas un chauffeur et n'a pas de données chauffeur
  if (!isChauffeur && !chauffeurId) {
    return (
      <Page title="Tableau de bord chauffeur">
        <div className="transition-content mt-5 px-(--margin-x) pb-8 lg:mt-6">
          <div className="bg-yellow-50 rounded-lg p-8 text-center">
            <ShieldCheckIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Accès limité
            </h3>
            <p className="text-gray-600 mb-6">
              Vous n&apos;avez pas les permissions nécessaires pour accéder au tableau de bord chauffeur.
              Veuillez contacter votre administrateur si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
            </p>
            <p className="text-sm text-gray-500">
              Type d&apos;utilisateur: {user?.type_utilisateur || 'Non défini'}
            </p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Tableau de bord chauffeur">
      <div className="transition-content mt-5 px-(--margin-x) pb-8 lg:mt-6">
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`
                    ${action.color} 
                    ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'}
                    flex flex-col items-center p-4 rounded-lg text-white transition-all duration-200
                  `}
                >
                  <action.icon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Autres actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {secondaryActions
                .filter(action => !action.adminOnly || isAdmin)
                .map((action) => (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`
                    ${action.color} 
                    ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'}
                    flex flex-col items-center p-4 rounded-lg text-white transition-all duration-200
                  `}
                >
                  <action.icon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Shift Information */}
          {currentShift && (
            <ShiftInfo
              shift={currentShift}
              onUpdate={updateShift}
            />
          )}

          {/* Financial Summary */}
          {currentShift && (
            <FinancialSummary
              courses={courses}
              expenses={expenses}
            />
          )}

          {/* Course Management */}
          {currentShift && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CourseList
                  courses={courses}
                  onUpdateCourse={updateCourse}
                  onDeleteCourse={deleteCourse}
                  isLoading={coursesLoading}
                />
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => openModal('expense')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  <CurrencyEuroIcon className="h-5 w-5 inline mr-2" />
                  Ajouter une charge
                </button>
                <button
                  onClick={() => openModal('externalCourse')}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  <TruckIcon className="h-5 w-5 inline mr-2" />
                  Course externe
                </button>
              </div>
            </div>
          )}

          {/* Welcome message if no active shift */}
          {!currentShift && (
            <div className="bg-blue-50 rounded-lg p-8 text-center">
              <ClockIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bienvenue sur votre tableau de bord
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez votre journée en créant une nouvelle feuille de route
              </p>
              <button
                onClick={() => openModal('newShift')}
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Créer une nouvelle feuille de route
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Core Modals */}
      <NewShiftModal
        isOpen={activeModals.newShift}
        onClose={() => closeModal('newShift')}
        onSubmit={handleShiftCreate}
      />

      <CourseModal
        isOpen={activeModals.newCourse}
        onClose={() => closeModal('newCourse')}
        onSubmit={handleCourseCreate}
        shiftId={currentShift?.id}
      />

      <ExpenseModal
        isOpen={activeModals.expense}
        onClose={() => closeModal('expense')}
        onSubmit={handleExpenseCreate}
        shiftId={currentShift?.id}
      />

      <ExternalCourseModal
        isOpen={activeModals.externalCourse}
        onClose={() => closeModal('externalCourse')}
        onSubmit={handleExpenseCreate}
        shiftId={currentShift?.id}
      />

      <EndShiftModal
        isOpen={activeModals.endShift}
        onClose={() => closeModal('endShift')}
        onSubmit={handleShiftEnd}
        currentShift={currentShift}
        courses={courses}
      />

      {/* Enhanced Feature Modals */}
      <PrintModal
        isOpen={activeModals.print}
        onClose={() => closeModal('print')}
        currentShift={currentShift}
        courses={courses}
        expenses={expenses}
      />

      <HistoryModal
        isOpen={activeModals.history}
        onClose={() => closeModal('history')}
      />

      {isAdmin && (
        <AdminOversightModal
          isOpen={activeModals.adminOversight}
          onClose={() => closeModal('adminOversight')}
        />
      )}
    </Page>
  );
}
