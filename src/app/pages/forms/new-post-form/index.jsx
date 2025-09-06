// Import Dependencies
import { useState, useMemo, useEffect } from "react";
import { 
  ChartBarIcon, 
  ClockIcon, 
  TruckIcon, 
  CheckIcon,
  PrinterIcon
} from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { generateAndDownloadReport } from "./utils/printUtils";

// Local Imports
import { Page } from "components/shared/Page";
import { Button } from "components/ui";
import { Dashboard } from "./components/Dashboard";
import { ShiftForm } from "./components/ShiftForm";
import { CoursesList } from "./components/CoursesList";
import { CourseForm } from "./components/CourseForm";
import { EndShiftForm } from "./components/EndShiftForm";
import { VehicleModal } from "./components/VehicleModal";
import { FinancialSummary } from "./components/FinancialSummary";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExternalCourseForm } from "./components/ExternalCourseForm";
import { HistoryModal } from "./components/HistoryModal";
import { ControlModal } from "./components/ControlModal";

// Services
import { fetchCourses, upsertCourse, deleteCourse as removeCourse } from "services/courses";
import { createFeuilleRoute, endFeuilleRoute, getActiveFeuilleRoute } from "services/feuillesRoute";
import { getChauffeurs } from "services/chauffeurs";
import { getVehicules } from "services/vehicules";
import { getClients } from "services/clients";
import { getModesPaiement } from "services/modesPaiement";
import { getCharges, createCharge } from "services/charges";

// ----------------------------------------------------------------------

const tabs = [
  { key: 'dashboard', label: 'Tableau de bord', icon: ChartBarIcon },
  { key: 'shift', label: 'Nouvelle feuille', icon: ClockIcon },
  { key: 'courses', label: 'Courses', icon: TruckIcon },
  { key: 'end', label: 'Fin de feuille', icon: CheckIcon }
];

export default function TxApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [externalCourses, setExternalCourses] = useState([]);
  const [shiftData, setShiftData] = useState(null);
  const [currentFeuilleRoute, setCurrentFeuilleRoute] = useState(null);

  // Données de référence
  const [vehicules, setVehicules] = useState([]);
  const [currentChauffeur, setCurrentChauffeur] = useState(null);

  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showExternalCourseModal, setShowExternalCourseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showControlModal, setShowControlModal] = useState(false);

  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Vérifier s'il y a un shift actif
  const hasActiveShift = Boolean(currentFeuilleRoute && currentFeuilleRoute.statut === 'En cours');

  // Chargement initial des données
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Charger les données de référence
        const [chauffeursList, vehiculesList] = await Promise.all([
          getChauffeurs(),
          getVehicules(),
          getClients(),
          getModesPaiement()
        ]);

        setVehicules(vehiculesList);

        // Pour le moment, on prend le premier chauffeur comme utilisateur actuel
        // À terme, ceci devrait venir de l'authentification
        if (chauffeursList.length > 0) {
          const chauffeur = chauffeursList[0];
          setCurrentChauffeur(chauffeur);

          // Vérifier s'il y a une feuille de route active
          const activeSheet = await getActiveFeuilleRoute(chauffeur.id);
          if (activeSheet) {
            setCurrentFeuilleRoute(activeSheet);
            setShiftData({
              id: activeSheet.id,
              chauffeur_id: activeSheet.chauffeur_id,
              vehicule_id: activeSheet.vehicule_id,
              date: activeSheet.date,
              heure_debut: activeSheet.heure_debut,
              heure_fin: activeSheet.heure_fin,
              km_debut: activeSheet.km_debut,
              km_fin: activeSheet.km_fin,
              prise_en_charge_debut: activeSheet.prise_en_charge_debut,
              prise_en_charge_fin: activeSheet.prise_en_charge_fin,
              chutes_debut: activeSheet.chutes_debut,
              chutes_fin: activeSheet.chutes_fin,
              statut: activeSheet.statut,
              notes: activeSheet.notes
            });

            // Charger les courses de cette feuille de route
            const coursesList = await fetchCourses(activeSheet.id);
            setCourses(coursesList);

            // Charger les charges/dépenses
            const chargesList = await getCharges(activeSheet.id);
            setExpenses(chargesList);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement initial:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleDownloadReport = () => {
    try {
      if (!currentFeuilleRoute || !currentChauffeur) {
        toast.error('Aucune feuille de route active');
        return;
      }

      const fileName = generateAndDownloadReport(
        shiftData,
        courses,
        {
          nom: currentChauffeur.utilisateur?.nom,
          prenom: currentChauffeur.utilisateur?.prenom,
          numero_badge: currentChauffeur.numero_badge
        },
        currentFeuilleRoute.vehicule
      );
      toast.success(`Feuille de route téléchargée : ${fileName}`);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement de la feuille de route');
    }
  };

  // Calculs des totaux - Ajout du calcul des km et ratio €/km
  const totals = useMemo(() => {
    const recettes = courses.reduce((sum, course) => sum + (course.sommes_percues || 0), 0);
    const coursesCount = courses.length;

    // Calcul des km parcourus basé sur les index de départ/arrivée
    const totalKm = courses.reduce((sum, course) => {
      const kmCourse = (course.index_debarquement || 0) - (course.index_embarquement || 0);
      return sum + Math.max(0, kmCourse); // S'assurer que les km sont positifs
    }, 0);

    return {
      recettes,
      coursesCount,
      totalKm,
      averagePerCourse: coursesCount > 0 ? recettes / coursesCount : 0,
      ratioEuroKm: totalKm > 0 ? recettes / totalKm : 0
    };
  }, [courses]);

  // Filtrage des courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.lieu_embarquement.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.lieu_debarquement.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.numero_ordre.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [courses, searchTerm, statusFilter]);

  // Handlers
  const handleNewCourse = () => {
    if (!hasActiveShift) {
      // Si pas de shift actif, rediriger vers la création de feuille
      setActiveTab('shift');
      toast.info("Veuillez d'abord créer une nouvelle feuille de route");
      return;
    }
    setEditingCourse(null);
    setShowCourseModal(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseModal(true);
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await removeCourse(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
      toast.success("Course supprimée");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleSubmitCourse = async (courseData) => {
    try {
      if (!currentFeuilleRoute) {
        toast.error("Aucune feuille de route active");
        return;
      }

      // Ajouter l'ID de la feuille de route et le numéro d'ordre
      const courseWithMeta = {
        ...courseData,
        feuille_route_id: currentFeuilleRoute.id,
        numero_ordre: editingCourse ? editingCourse.numero_ordre : courses.length + 1,
        id: editingCourse?.id
      };

      const saved = await upsertCourse(courseWithMeta);

      if (editingCourse) {
        setCourses(courses.map(c => c.id === editingCourse.id ? saved : c));
        toast.success("Course modifiée avec succès");
      } else {
        setCourses([...courses, saved]);
        toast.success("Course ajoutée avec succès");
      }

      setShowCourseModal(false);
      setEditingCourse(null);
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'enregistrement de la course");
    }
  };

  const handleStartShift = async (shiftFormData) => {
    try {
      if (!currentChauffeur) {
        toast.error("Aucun chauffeur sélectionné");
        return;
      }

      // Créer une nouvelle feuille de route
      const feuilleRouteData = {
        chauffeur_id: currentChauffeur.id,
        vehicule_id: shiftFormData.vehicule_id,
        date: shiftFormData.date,
        heure_debut: shiftFormData.heure_debut,
        km_debut: shiftFormData.km_debut,
        prise_en_charge_debut: shiftFormData.prise_en_charge_debut,
        chutes_debut: shiftFormData.chutes_debut,
        notes: shiftFormData.notes
      };

      const newFeuilleRoute = await createFeuilleRoute(feuilleRouteData);

      setCurrentFeuilleRoute(newFeuilleRoute);
      setShiftData({
        id: newFeuilleRoute.id,
        chauffeur_id: newFeuilleRoute.chauffeur_id,
        vehicule_id: newFeuilleRoute.vehicule_id,
        date: newFeuilleRoute.date,
        heure_debut: newFeuilleRoute.heure_debut,
        km_debut: newFeuilleRoute.km_debut,
        prise_en_charge_debut: newFeuilleRoute.prise_en_charge_debut,
        chutes_debut: newFeuilleRoute.chutes_debut,
        statut: newFeuilleRoute.statut,
        notes: newFeuilleRoute.notes
      });

      // Réinitialiser les courses pour la nouvelle feuille
      setCourses([]);
      setExpenses([]);

      setActiveTab('courses');
      toast.success("Nouvelle feuille de route créée");
    } catch (error) {
      console.error('Erreur lors de la création de la feuille de route:', error);
      toast.error("Erreur lors de la création de la feuille de route");
    }
  };

  const handleEndShift = async (endData) => {
    try {
      if (!currentFeuilleRoute) {
        toast.error("Aucune feuille de route active");
        return;
      }

      // Finaliser la feuille de route
      const updatedFeuilleRoute = await endFeuilleRoute(currentFeuilleRoute.id, {
        heure_fin: endData.heure_fin,
        km_fin: endData.km_fin,
        prise_en_charge_fin: endData.prise_en_charge_fin,
        chutes_fin: endData.chutes_fin,
        notes: endData.notes
      });

      setCurrentFeuilleRoute(updatedFeuilleRoute);
      setShiftData({
        ...shiftData,
        heure_fin: updatedFeuilleRoute.heure_fin,
        km_fin: updatedFeuilleRoute.km_fin,
        prise_en_charge_fin: updatedFeuilleRoute.prise_en_charge_fin,
        chutes_fin: updatedFeuilleRoute.chutes_fin,
        statut: updatedFeuilleRoute.statut,
        notes: updatedFeuilleRoute.notes
      });

      toast.success("Feuille de route terminée");
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Erreur lors de la finalisation de la feuille de route:', error);
      toast.error("Erreur lors de la finalisation de la feuille de route");
    }
  };

  const handleSubmitExpense = async (expenseData) => {
    try {
      if (!currentFeuilleRoute) {
        toast.error("Aucune feuille de route active");
        return;
      }

      const chargeData = {
        feuille_route_id: currentFeuilleRoute.id,
        type_charge: expenseData.type_charge || 'Autre',
        description: expenseData.description,
        montant: expenseData.montant,
        date: expenseData.date || new Date(),
        mode_paiement_id: expenseData.mode_paiement_id,
        notes: expenseData.notes
      };

      const newCharge = await createCharge(chargeData);
      setExpenses([...expenses, newCharge]);
      setShowExpenseModal(false);
      toast.success("Dépense ajoutée avec succès");
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la dépense:', error);
      toast.error("Erreur lors de l'ajout de la dépense");
    }
  };

  const handleCancelCourse = () => {
    setShowCourseModal(false);
    setEditingCourse(null);
  };

  const handleShowControl = () => {
    setShowControlModal(true);
  };

  const handleSubmitExternalCourse = (externalCourseData) => {
    setExternalCourses([...externalCourses, externalCourseData]);
    setShowExternalCourseModal(false);
    toast.success("Course externe ajoutée");
  };

  if (loading) {
    return (
      <Page title="TxApp - Gestion Taxi">
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des données...</p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="TxApp - Gestion Taxi">
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Navigation Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-dark-500">
              <nav className="flex justify-center">
                <div className="flex space-x-8 md:space-x-16">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                          activeTab === tab.key
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="transition-content">
            {activeTab === 'dashboard' && (
              <Dashboard
                driver={currentChauffeur ? {
                  nom: currentChauffeur.utilisateur?.nom,
                  prenom: currentChauffeur.utilisateur?.prenom,
                  numero_badge: currentChauffeur.numero_badge
                } : null}
                vehicle={currentFeuilleRoute?.vehicule || null}
                totals={totals}
                onNewCourse={handleNewCourse}
                onShowHistory={() => setShowHistoryModal(true)}
                onPrintReport={handleDownloadReport}
                onShowControl={handleShowControl}
                hasActiveShift={hasActiveShift}
              />
            )}

            {activeTab === 'shift' && (
              <ShiftForm
                vehicles={vehicules}
                chauffeur={currentChauffeur}
                onStartShift={handleStartShift}
                onShowVehicleInfo={() => setShowVehicleModal(true)}
              />
            )}

            {activeTab === 'courses' && (
              <CoursesList
                courses={courses}
                filteredCourses={filteredCourses}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onNewCourse={handleNewCourse}
                onEditCourse={handleEditCourse}
                onDeleteCourse={handleDeleteCourse}
                onShowFinancialSummary={() => setShowFinancialModal(true)}
                onShowHistory={() => setShowHistoryModal(true)}
                onShowExpenseForm={() => setShowExpenseModal(true)}
                onShowExternalCourseForm={() => setShowExternalCourseModal(true)}
              />
            )}

            {activeTab === 'end' && (
              <EndShiftForm 
                onEndShift={handleEndShift}
                shiftData={shiftData}
                driver={currentChauffeur ? {
                  nom: currentChauffeur.utilisateur?.nom,
                  prenom: currentChauffeur.utilisateur?.prenom,
                  numero_badge: currentChauffeur.numero_badge
                } : null}
                vehicle={currentFeuilleRoute?.vehicule || null}
                onPrintReport={handleDownloadReport}
              />
            )}
          </div>
        </div>

        {/* Course Modal */}
        <Transition show={showCourseModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={handleCancelCourse}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-dark-700 shadow-xl transition-all">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-500">
                      <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                        {editingCourse ? "Modifier la course" : "Nouvelle course"}
                      </DialogTitle>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={handleCancelCourse}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="p-6">
                      <CourseForm
                        editingCourse={editingCourse}
                        coursesCount={courses.length}
                        onSubmit={handleSubmitCourse}
                        onCancel={handleCancelCourse}
                      />
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Financial Summary Modal */}
        <Transition show={showFinancialModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowFinancialModal(false)}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white dark:bg-dark-700 shadow-xl transition-all">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-500">
                      <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                        Résumé Financier
                      </DialogTitle>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowFinancialModal(false)}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <FinancialSummary
                        courses={courses}
                        expenses={expenses}
                        externalCourses={externalCourses}
                      />
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Expense Modal */}
        <Transition show={showExpenseModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowExpenseModal(false)}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-dark-700 shadow-xl transition-all">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-500">
                      <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                        Ajouter une dépense
                      </DialogTitle>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowExpenseModal(false)}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="p-6">
                      <ExpenseForm
                        onSubmit={handleSubmitExpense}
                        onCancel={() => setShowExpenseModal(false)}
                      />
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* External Course Modal */}
        <Transition show={showExternalCourseModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowExternalCourseModal(false)}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-dark-700 shadow-xl transition-all">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-500">
                      <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                        Course externe
                      </DialogTitle>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowExternalCourseModal(false)}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="p-6">
                      <ExternalCourseForm
                        onSubmit={handleSubmitExternalCourse}
                        onCancel={() => setShowExternalCourseModal(false)}
                      />
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* History Modal */}
        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />

        {/* Vehicle Modal */}
        <VehicleModal
          isOpen={showVehicleModal}
          onClose={() => setShowVehicleModal(false)}
          vehicle={currentFeuilleRoute?.vehicule || null}
        />

        {/* Control Modal */}
        <ControlModal
          isOpen={showControlModal}
          onClose={() => setShowControlModal(false)}
          driver={currentChauffeur ? {
            nom: currentChauffeur.utilisateur?.nom,
            prenom: currentChauffeur.utilisateur?.prenom,
            numero_badge: currentChauffeur.numero_badge
          } : null}
          vehicle={currentFeuilleRoute?.vehicule || null}
          shiftData={shiftData}
          courses={courses}
        />

        {/* Mobile Bottom Action */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-dark-700 border-t border-gray-200 dark:border-dark-500 md:hidden">
          <Button
            onClick={handleDownloadReport}
            className="w-full space-x-2"
            variant="outlined"
          >
            <PrinterIcon className="h-5 w-5" />
            <span>Imprimer feuille de route</span>
          </Button>
        </div>
      </div>
    </Page>
  );
}
