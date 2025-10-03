import { useState } from 'react';
import { Page } from 'components/shared/Page';
import ErrorBoundary from 'components/shared/ErrorBoundary';
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
import ChauffeurStats from './components/ChauffeurStats';
import InterventionsManager from './components/InterventionsManager';
import InterventionModal from './components/InterventionModal';
import { ControlAuthModal } from './components/ControlAuthModal';
import { ChangeVehicleModal } from './components/ChangeVehicleModal';
import { useDriverShift } from 'hooks/useDriverShift';
import { useCourses } from 'hooks/useCourses';
import { useExpenses } from 'hooks/useExpenses';
import { isAdmin, isControleur, isChauffeur } from 'utils/permissions';

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
    adminOversight: false,
    intervention: false,
    controlAuth: false, // Modal d'authentification pour les contrôleurs
    changeVehicle: false // Modal de changement de véhicule
  });

  // Vérification des permissions selon le rôle
  const isUserAdmin = isAdmin(user);
  const isUserControleur = isControleur(user);
  const isUserChauffeur = isChauffeur(user);

  // Déterminer l'ID du chauffeur à afficher selon le rôle
  let chauffeurIdToShow = null;
  let canViewData = false;

  if (isUserChauffeur) {
    // Chauffeur : ne voit que ses propres données
    chauffeurIdToShow = user?.chauffeur?.chauffeur_id;
    canViewData = !!chauffeurIdToShow;
  } else if (isUserAdmin) {
    // Admin : peut voir tous les chauffeurs (sera géré dans l'interface)
    canViewData = true;
    chauffeurIdToShow = user?.chauffeur?.chauffeur_id; // Par défaut ses propres données, mais peut changer
  } else if (isUserControleur) {
    // Contrôleur : doit s'authentifier pour voir les données
    canViewData = false; // Sera activé après authentification
  }

  const chauffeurId = chauffeurIdToShow;

  const {
    currentShift,
    createShift,
    endShift,
    updateShift
  } = useDriverShift(chauffeurId);

  const {
    courses,
    isLoading: coursesLoading,
    createCourse,
    updateCourse,
    autoSaveCourse,
    cancelCourse
  } = useCourses(currentShift?.id);

  const {
    expenses,
    createExpense
  } = useExpenses(currentShift?.id);

  // Vérifier les permissions d'accès au dashboard
  if (!user) {
    return (
      <Page title="Accès refusé">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Accès non autorisé
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Vous devez être connecté pour accéder à cette page.
            </p>
          </div>
        </div>
      </Page>
    );
  }

  // Vérifier si l'utilisateur a le droit d'accéder au dashboard chauffeur
  if (!isUserChauffeur && !isUserAdmin && !isUserControleur) {
    return (
      <Page title="Accès refusé">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Accès refusé
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Rôles autorisés : Chauffeur, Contrôleur, Administrateur
            </p>
          </div>
        </div>
      </Page>
    );
  }

  // Pour les contrôleurs, afficher un message demandant l'authentification
  if (isUserControleur && !canViewData) {
    return (
      <Page title="Authentification requise">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <ShieldCheckIcon className="mx-auto h-16 w-16 text-purple-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Authentification contrôleur requise
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              En tant que contrôleur, vous devez vous authentifier à nouveau pour accéder aux données des chauffeurs.
            </p>
            <button
              onClick={() => openModal('controlAuth')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              S&apos;authentifier
            </button>
          </div>
        </div>
      </Page>
    );
  }

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

  const handleVehicleChange = async (feuilleId, vehiculeId, raisonChangement) => {
    try {
      const response = await fetch(`/api/feuilles-route/${feuilleId}/vehicule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          vehicule_id: vehiculeId,
          raison_changement: raisonChangement
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du changement de véhicule');
      }

      const data = await response.json();

      // Rafraîchir les données du shift
      if (updateShift) {
        await updateShift({ vehicule_id: vehiculeId });
      }

      return data;
    } catch (error) {
      console.error('Erreur lors du changement de véhicule:', error);
      throw error;
    }
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
      id: 'changer-vehicule',
      label: 'Changer véhicule',
      icon: TruckIcon,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => openModal('changeVehicle'),
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
      onClick: () => openModal('intervention'),
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

  return (
    <ErrorBoundary>
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
                .filter(action => !action.adminOnly || isUserAdmin)
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
            <ErrorBoundary fallback={<div className="bg-red-50 p-4 rounded-lg">Erreur de chargement des informations de shift</div>}>
              <ShiftInfo
                shift={currentShift}
                onUpdate={updateShift}
              />
            </ErrorBoundary>
          )}

          {/* Financial Summary */}
          {currentShift && (
            <ErrorBoundary fallback={<div className="bg-red-50 p-4 rounded-lg">Erreur de chargement du résumé financier</div>}>
              <FinancialSummary
                courses={courses}
                expenses={expenses}
              />
            </ErrorBoundary>
          )}

          {/* Chauffeur Statistics */}
          {chauffeurId && (
            <ErrorBoundary fallback={<div className="bg-red-50 p-4 rounded-lg">Erreur de chargement des statistiques chauffeur</div>}>
              <ChauffeurStats
                chauffeurId={chauffeurId}
              />
            </ErrorBoundary>
          )}

          {/* Interventions Management */}
          {chauffeurId && (
            <ErrorBoundary fallback={<div className="bg-red-50 p-4 rounded-lg">Erreur de chargement de la gestion des interventions</div>}>
              <InterventionsManager
                chauffeurId={chauffeurId}
              />
            </ErrorBoundary>
          )}

          {/* Course Management */}
          {currentShift && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ErrorBoundary fallback={<div className="bg-red-50 p-4 rounded-lg">Erreur de chargement de la liste des courses</div>}>
                  <CourseList
                    courses={courses}
                    onUpdateCourse={updateCourse}
                    onCancelCourse={cancelCourse}
                    isLoading={coursesLoading}
                  />
                </ErrorBoundary>
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
        autoSaveCourse={autoSaveCourse}
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

      <InterventionModal
        isOpen={activeModals.intervention}
        onClose={() => closeModal('intervention')}
        chauffeurId={chauffeurId}
      />

      <ControlAuthModal
        isOpen={activeModals.controlAuth}
        onClose={() => closeModal('controlAuth')}
        onSuccess={(user) => {
          // Après authentification réussie du contrôleur, permettre l'accès aux données
          console.log('Contrôleur authentifié:', user);
          // Ici on pourrait mettre à jour l'état pour permettre l'accès
        }}
      />

      <ChangeVehicleModal
        isOpen={activeModals.changeVehicle}
        onClose={() => closeModal('changeVehicle')}
        currentShift={currentShift}
        onVehicleChanged={handleVehicleChange}
      />
    </Page>
    </ErrorBoundary>
  );
}
