// Import Dependencies
import { useState, useMemo, useRef } from "react";
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
import { useReactToPrint } from 'react-to-print';

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
import { PrintReport } from "./components/PrintReport";
import { mockData } from "./data";

// ----------------------------------------------------------------------

const tabs = [
  { key: 'dashboard', label: 'Tableau de bord', icon: ChartBarIcon },
  { key: 'shift', label: 'Début Shift', icon: ClockIcon },
  { key: 'courses', label: 'Courses', icon: TruckIcon },
  { key: 'end', label: 'Fin Shift', icon: CheckIcon }
];

export default function TxApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState(mockData.courses);
  const [expenses, setExpenses] = useState([]);
  const [externalCourses, setExternalCourses] = useState([]);
  const [shiftData, setShiftData] = useState(null);
  
  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showExternalCourseModal, setShowExternalCourseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dans votre fichier index.jsx, remplacez la configuration handlePrint par ceci :

// Print functionality
const printComponentRef = useRef();
const handlePrint = useReactToPrint({
  content: () => printComponentRef.current,
  documentTitle: `Feuille_de_route_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}`,
  pageStyle: `
    @page {
      size: A4;
      margin: 15mm;
    }
    
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      body {
        margin: 0 !important;
        padding: 0 !important;
        font-size: 12px !important;
      }
      
      .print-container {
        background: white !important;
        color: black !important;
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      table {
        border-collapse: collapse !important;
        width: 100% !important;
      }
      
      th, td {
        border: 1px solid black !important;
        padding: 2px !important;
        font-size: 10px !important;
      }
      
      .page-break-before {
        page-break-before: always !important;
      }
    }
  `,
  onBeforeGetContent: () => {
    // Optionnel: préparer les données avant impression
    console.log('Préparation de l\'impression...');
  },
  onAfterPrint: () => {
    console.log('Impression terminée');
  }
});

  // Calculs des totaux - Seules les courses directes comptent pour le chauffeur
  const totals = useMemo(() => ({
    recettes: courses.reduce((sum, course) => sum + (course.sommes_percues || 0), 0),
    coursesCount: courses.length,
    averagePerCourse: courses.length > 0 
      ? courses.reduce((sum, course) => sum + (course.sommes_percues || 0), 0) / courses.length 
      : 0
  }), [courses]);

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
    setEditingCourse(null);
    setShowCourseModal(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseModal(true);
  };

  const handleDeleteCourse = (courseId) => {
    setCourses(courses.filter(c => c.id !== courseId));
  };

  const handleSubmitCourse = (courseData) => {
    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? courseData : c));
    } else {
      setCourses([...courses, courseData]);
    }
    setShowCourseModal(false);
    setEditingCourse(null);
  };

  const handleCancelCourse = () => {
    setShowCourseModal(false);
    setEditingCourse(null);
  };

  const handleStartShift = (shiftFormData) => {
    setShiftData(shiftFormData);
    setActiveTab('courses');
  };

  const handleEndShift = (endData) => {
    const completeShiftData = {
      ...shiftData,
      ...endData
    };
    console.log('Complete shift data:', completeShiftData);
    // Mettre à jour shiftData avec les informations de fin
    setShiftData(completeShiftData);
    // Optionnel: afficher un message de succès ou rediriger
  };

  const handleShowVehicleInfo = () => {
    setShowVehicleModal(true);
  };

  const handleSubmitExpense = (expenseData) => {
    setExpenses([...expenses, expenseData]);
    setShowExpenseModal(false);
  };

  const handleSubmitExternalCourse = (externalCourseData) => {
    setExternalCourses([...externalCourses, externalCourseData]);
    setShowExternalCourseModal(false);
  };

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
                driver={mockData.driver}
                vehicle={mockData.vehicles[0]}
                totals={totals}
                onNewCourse={handleNewCourse}
                onShowHistory={() => setShowHistoryModal(true)}
                onPrintReport={handlePrint}
              />
            )}

            {activeTab === 'shift' && (
              <ShiftForm
                vehicles={mockData.vehicles}
                onStartShift={handleStartShift}
                onShowVehicleInfo={handleShowVehicleInfo}
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
                driver={mockData.driver}
                onPrintReport={handlePrint}
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
                        💰 Résumé Financier
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
                        💸 Ajouter une dépense
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
                        🚖 Course externe
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
          vehicle={mockData.vehicles[0]}
        />

        {/* Hidden Print Component */}
        <div style={{ display: 'none' }}>
          <PrintReport
            ref={printComponentRef}
            shiftData={shiftData}
            courses={courses}
            driver={mockData.driver}
            vehicle={mockData.vehicles[0]}
          />
        </div>

        {/* Mobile Bottom Action */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-dark-700 border-t border-gray-200 dark:border-dark-500 md:hidden">
          <Button
            onClick={handlePrint}
            className="w-full space-x-2"
            variant="outlined"
          >
            <PrinterIcon className="h-5 w-5" />
            <span>🖨️ Imprimer feuille de route</span>
          </Button>
        </div>
      </div>
    </Page>
  );
}