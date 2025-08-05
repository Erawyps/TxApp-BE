import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  ChartBarIcon, 
  DocumentTextIcon,
  CurrencyEuroIcon,
  ClockIcon,
  ListBulletIcon,
  PlusIcon,
  MinusIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge } from 'components/ui';
import { shiftSchema } from './schema';

// Navigation par onglets
const TabNavigation = ({ activeTab, onTabChange, shiftData }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'start', label: 'Début Shift', icon: ClockIcon },
    { id: 'courses', label: 'Courses', icon: DocumentTextIcon },
    { id: 'end', label: 'Fin Shift', icon: ClockIcon },
    { id: 'summary', label: 'Résumé', icon: CurrencyEuroIcon }
  ];

  const getTabStatus = (tabId) => {
    switch (tabId) {
      case 'start':
        return shiftData.startTime ? 'completed' : 'pending';
      case 'courses':
        return shiftData.courses?.length > 0 ? 'completed' : 'pending';
      case 'end':
        return shiftData.endTime ? 'completed' : 'pending';
      case 'summary':
        return shiftData.signature ? 'completed' : 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <div className="w-full border-b-2 border-gray-150 dark:border-dark-500 bg-white dark:bg-dark-900" 
         style={{ fontFamily: 'Times New Roman, serif' }}>
      <div className="flex justify-center overflow-x-auto">
        <div className="flex gap-1 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const status = getTabStatus(tab.id);
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex flex-col items-center gap-1 px-4 py-3 min-w-[90px] border-b-2 transition-all
                  ${isActive 
                    ? 'border-blue-600 text-blue-600 bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:bg-blue-900/20' 
                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-dark-800'
                  }
                `}
                unstyled
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {status === 'completed' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-900" />
                  )}
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Actions rapides
const QuickActions = ({ onAction }) => {
  const actions = [
    { id: 'financial', icon: CurrencyEuroIcon, label: 'Résumé Financier', color: 'bg-green-100 text-green-600' },
    { id: 'history', icon: ListBulletIcon, label: 'Historique', color: 'bg-blue-100 text-blue-600' },
    { id: 'expense', icon: MinusIcon, label: 'Dépense', color: 'bg-red-100 text-red-600' },
    { id: 'external', icon: PlusIcon, label: 'Course Externe', color: 'bg-purple-100 text-purple-600' }
  ];

  return (
    <div className="flex justify-center gap-2 p-4 bg-gray-50 dark:bg-dark-800">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            onClick={() => onAction(action.id)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all hover:scale-105 ${action.color}`}
            variant="ghost"
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

// Dashboard Tab
const Dashboard = ({ shiftData }) => {
  const totalCourses = shiftData.courses?.length || 0;
  const totalRecettes = shiftData.courses?.reduce((sum, course) => sum + (parseFloat(course.sommes_percues) || 0), 0) || 0;
  const totalExpenses = shiftData.expenses?.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0) || 0;

  return (
    <div className="p-4 space-y-4" style={{ fontFamily: 'Times New Roman, serif' }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-100">Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {shiftData.date && new Date(shiftData.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold text-blue-600">{totalCourses}</div>
          <div className="text-sm text-blue-600">Courses</div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CurrencyEuroIcon className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold text-green-600">{totalRecettes.toFixed(2)}€</div>
          <div className="text-sm text-green-600">Recettes</div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <MinusIcon className="w-8 h-8 mx-auto mb-2 text-red-600" />
          <div className="text-2xl font-bold text-red-600">{totalExpenses.toFixed(2)}€</div>
          <div className="text-sm text-red-600">Dépenses</div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <ChartBarIcon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
          <div className="text-2xl font-bold text-purple-600">{(totalRecettes - totalExpenses).toFixed(2)}€</div>
          <div className="text-sm text-purple-600">Net</div>
        </Card>
      </div>

      {shiftData.startTime && (
        <Card className="p-4">
          <h3 className="font-bold mb-2">Statut du Shift</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Début:</span>
              <span className="font-medium">{shiftData.startTime}</span>
            </div>
            {shiftData.endTime && (
              <div className="flex justify-between">
                <span>Fin:</span>
                <span className="font-medium">{shiftData.endTime}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Durée:</span>
              <span className="font-medium">{shiftData.totalHours || '00:00'}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// Début Shift Tab
const ShiftStart = ({ register, errors }) => {
  const vehicles = [
    { id: 1, plaque: 'TX-AA-171', numero: '10', type: 'Mercedes Vito' },
    { id: 2, plaque: 'TX-BB-282', numero: '11', type: 'Ford Transit' },
    { id: 3, plaque: 'TX-CC-393', numero: '12', type: 'Volkswagen Crafter' }
  ];

  const remunerationTypes = [
    { value: 'percentage', label: '60% Commission' },
    { value: 'fixed', label: 'Fixe Journalier' },
    { value: 'hybrid', label: 'Mixte' }
  ];

  return (
    <div className="p-4 space-y-6" style={{ fontFamily: 'Times New Roman, serif' }}>
      <Card className="p-4">
        <h3 className="text-lg font-bold mb-4 text-center">Début de Shift</h3>
        
        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
            {errors?.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
          </div>

          {/* Heures */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Heure début</label>
              <input
                type="time"
                {...register('startTime')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Heure fin estimée</label>
              <input
                type="time"
                {...register('estimatedEndTime')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Interruptions</label>
              <input
                type="time"
                {...register('interruptions')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="00:00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nb heures shift</label>
              <input
                type="text"
                {...register('totalHours')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                readOnly
                placeholder="Calculé auto"
              />
            </div>
          </div>

          {/* Type rémunération */}
          <div>
            <label className="block text-sm font-medium mb-1">Type de rémunération</label>
            <select
              {...register('remunerationType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {remunerationTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Véhicule */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Véhicule</label>
              <Button
                type="button"
                variant="ghost"
                className="p-1"
              >
                <InformationCircleIcon className="w-4 h-4" />
              </Button>
            </div>
            <select
              {...register('vehicleId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionnez un véhicule</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plaque} - N°{vehicle.numero}
                </option>
              ))}
            </select>
          </div>

          {/* Kilométrage */}
          <div>
            <label className="block text-sm font-medium mb-1">Kilométrage Tableau de Bord début</label>
            <input
              type="number"
              {...register('startKm')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>

          {/* Taximètre */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-3 text-blue-800 dark:text-blue-200">Taximètre Début</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Prise en charge</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('startTaximeter.priseEnCharge')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Index km (km totaux)</label>
                <input
                  type="number"
                  {...register('startTaximeter.indexKm')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Km en charge</label>
                <input
                  type="number"
                  {...register('startTaximeter.kmEnCharge')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Chutes (€)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('startTaximeter.chutes')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Courses Tab
const Courses = ({ courses, onAddCourse, onEditCourse, onDeleteCourse }) => {
  return (
    <div className="p-4 space-y-4" style={{ fontFamily: 'Times New Roman, serif' }}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Courses</h3>
        <Button onClick={onAddCourse} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Nouvelle Course
        </Button>
      </div>

      {courses?.length === 0 ? (
        <Card className="p-8 text-center">
          <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Aucune course enregistrée</p>
          <Button onClick={onAddCourse} className="mt-4">
            Ajouter la première course
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {courses?.map((course, index) => (
            <Card key={index} className="p-4 border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Badge variant="primary" className="text-xs">
                    Course #{course.numeroOrdre?.toString().padStart(3, '0')}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    {course.embarquement?.lieu} → {course.debarquement?.lieu}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{course.sommes_percues}€</p>
                  <p className="text-xs text-gray-500">{course.mode_paiement}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {course.embarquement?.heure} - {course.debarquement?.heure}
                </span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onEditCourse(index)}
                  >
                    Modifier
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-500"
                    onClick={() => onDeleteCourse(index)}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Composant principal
const TxAppFeuilleRoute = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(null);

  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(shiftSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      courses: [],
      expenses: [],
      externalRides: []
    },
    mode: "onChange"
  });

  const shiftData = watch();

  const handleQuickAction = useCallback((actionId) => {
    setShowModal(actionId);
  }, []);

  const handleAddCourse = useCallback(() => {
    // Logic to add new course
    console.log('Add course');
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard shiftData={shiftData} />;
      case 'start':
        return <ShiftStart register={register} errors={errors} watch={watch} setValue={setValue} />;
      case 'courses':
        return (
          <Courses 
            courses={shiftData.courses}
            onAddCourse={handleAddCourse}
            onEditCourse={(index) => console.log('Edit course', index)}
            onDeleteCourse={(index) => console.log('Delete course', index)}
          />
        );
      case 'end':
        return <div className="p-4">Fin de Shift (à implémenter)</div>;
      case 'summary':
        return <div className="p-4">Résumé (à implémenter)</div>;
      default:
        return <Dashboard shiftData={shiftData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Header */}
      <div className="bg-white dark:bg-dark-900 shadow-sm border-b border-gray-200 dark:border-dark-500">
        <div className="px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
              <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800 dark:text-dark-100">
                TxApp - Feuille de Route
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestion numérique des courses
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <TabNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        shiftData={shiftData}
      />

      {/* Actions rapides - Seulement sur l'onglet courses */}
      {activeTab === 'courses' && (
        <QuickActions onAction={handleQuickAction} />
      )}

      {/* Contenu */}
      <div className="flex-1">
        {renderTabContent()}
      </div>

      {/* Modales */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-dark-500">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">
                  {showModal === 'financial' && 'Résumé Financier'}
                  {showModal === 'history' && 'Historique des Courses'}
                  {showModal === 'expense' && 'Ajouter une Dépense'}
                  {showModal === 'external' && 'Course Externe'}
                </h3>
                <Button onClick={() => setShowModal(null)} variant="ghost">×</Button>
              </div>
            </div>
            <div className="p-4">
              <p>Contenu de la modale {showModal}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TxAppFeuilleRoute;