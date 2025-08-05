import { useState } from 'react';

// Icônes SVG simples
const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const MagnifyingGlassIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const PrinterIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const ArrowUpTrayIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5m-18 0h18" />
  </svg>
);

const TruckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m4.5 4.5V17.25m0 0L12 15.75M8.25 17.25L12 15.75m0 0L15.75 17.25M12 15.75V12m10.5 6.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.875a1.125 1.125 0 001.125-1.125V14.25m-4.5 4.5V17.25m0 0l3.75-1.5" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const ChartBarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-11.25zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BanknotesIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H4.5m-1.5 0H3c0 .621.504 1.125 1.125 1.125H4.5m-1.5 0V9h1.5V5.25m0 0H3c0 .621.504 1.125 1.125 1.125H4.5m-1.5 0V9h1.5V5.25" />
  </svg>
);

const PencilIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.639 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.639 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const XMarkIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const InformationCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Composants UI de base
const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "",
  onClick,
  disabled = false,
  icon,
  type = "button",
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300",
    outlined: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

const Input = ({ 
  label, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  className = "",
  required = false,
  icon,
  min,
  max,
  step,
  disabled = false,
  ...props 
}) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 ${icon ? 'pl-10' : ''}`}
        required={required}
        {...props}
      />
    </div>
  </div>
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Select = ({ label, options = [], value, onChange, className = "", required = false, ...props }) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      required={required}
      {...props}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
        <div className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${sizes[size]}`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Données simulées
const mockData = {
  courses: [
    {
      id: 1,
      numero_ordre: 1,
      index_embarquement: 152,
      lieu_embarquement: "Place Eugène Flagey",
      heure_embarquement: "08:30",
      index_debarquement: 158,
      lieu_debarquement: "Gare Centrale",
      heure_debarquement: "08:45",
      prix_taximetre: 12.50,
      sommes_percues: 15.00,
      mode_paiement: "CASH",
      notes: "Client très aimable",
      status: "completed"
    }
  ],
  vehicles: [
    {
      id: "VH001",
      plaque_immatriculation: "TX-AA-171",
      numero_identification: "10",
      marque: "Mercedes",
      modele: "Classe E",
      type_vehicule: "Berline"
    }
  ],
  driver: {
    nom: "Tehou",
    prenom: "Hasler",
    numero_badge: "TX-2023-001",
    type_contrat: "Indépendant"
  }
};

export default function TxAppInterface() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState(mockData.courses);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  // Calculs des totaux
  const totals = {
    recettes: courses.reduce((sum, course) => sum + (course.sommes_percues || 0), 0),
    coursesCount: courses.length,
    averagePerCourse: courses.length > 0 ? courses.reduce((sum, course) => sum + (course.sommes_percues || 0), 0) / courses.length : 0
  };

  // Filtrage des courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.lieu_embarquement.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.lieu_debarquement.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.numero_ordre.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Composant Dashboard
  const Dashboard = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {mockData.driver.prenom} {mockData.driver.nom}
            </h1>
            <p className="opacity-90">
              Badge: {mockData.driver.numero_badge} • {mockData.driver.type_contrat}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Véhicule actuel</p>
            <p className="font-semibold">{mockData.vehicles[0].plaque_immatriculation}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
              <BanknotesIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Recettes du jour</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totals.recettes.toFixed(2)} €
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
              <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Courses effectuées</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totals.coursesCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/20">
              <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Moyenne / course</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totals.averagePerCourse.toFixed(2)} €
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outlined" 
            className="h-20 flex-col"
            onClick={() => {setShowCourseModal(true); setEditingCourse(null);}}
          >
            <PlusIcon className="h-6 w-6 mb-1" />
            Nouvelle course
          </Button>
          <Button variant="outlined" className="h-20 flex-col">
            <PrinterIcon className="h-6 w-6 mb-1" />
            Imprimer rapport
          </Button>
          <Button variant="outlined" className="h-20 flex-col">
            <ArrowUpTrayIcon className="h-6 w-6 mb-1" />
            Exporter données
          </Button>
          <Button variant="outlined" className="h-20 flex-col">
            <CalendarIcon className="h-6 w-6 mb-1" />
            Historique
          </Button>
        </div>
      </Card>
    </div>
  );

  const ShiftForm = () => {
    const [shiftData, setShiftData] = useState({
      date: new Date().toISOString().split('T')[0],
      heure_debut: '',
      heure_fin_estimee: '',
      interruptions: '00:00',
      type_remuneration: 'Indépendant',
      vehicule_id: '',
      km_tableau_bord_debut: '',
      taximetre_prise_charge_debut: '',
      taximetre_index_km_debut: '',
      taximetre_km_charge_debut: '',
      taximetre_chutes_debut: ''
    });

    const calculateShiftDuration = () => {
      if (shiftData.heure_debut && shiftData.heure_fin_estimee) {
        const start = new Date(`2000-01-01T${shiftData.heure_debut}`);
        const end = new Date(`2000-01-01T${shiftData.heure_fin_estimee}`);
        const diff = end - start;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h${minutes.toString().padStart(2, '0')}`;
      }
      return '0h00';
    };

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Début du Shift</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              label="Date"
              type="date"
              value={shiftData.date}
              onChange={(e) => setShiftData({...shiftData, date: e.target.value})}
              required
            />
            <Input
              label="Heure de début"
              type="time"
              value={shiftData.heure_debut}
              onChange={(e) => setShiftData({...shiftData, heure_debut: e.target.value})}
              required
            />
            <Input
              label="Heure de fin estimée"
              type="time"
              value={shiftData.heure_fin_estimee}
              onChange={(e) => setShiftData({...shiftData, heure_fin_estimee: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              label="Interruptions"
              type="time"
              value={shiftData.interruptions}
              onChange={(e) => setShiftData({...shiftData, interruptions: e.target.value})}
            />
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Durée estimée du shift</p>
              <p className="font-semibold">{calculateShiftDuration()}</p>
            </div>
            <Select
              label="Type de rémunération"
              value={shiftData.type_remuneration}
              onChange={(e) => setShiftData({...shiftData, type_remuneration: e.target.value})}
              options={[
                { value: 'Indépendant', label: 'Indépendant' },
                { value: 'CDI', label: 'CDI' },
                { value: 'CDD', label: 'CDD' }
              ]}
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Véhicule <span className="text-red-500">*</span>
              </label>
              <button 
                onClick={() => setShowVehicleModal(true)}
                className="text-blue-500 hover:text-blue-700"
              >
                <InformationCircleIcon className="h-4 w-4" />
              </button>
            </div>
            <Select
              value={shiftData.vehicule_id}
              onChange={(e) => setShiftData({...shiftData, vehicule_id: e.target.value})}
              options={[
                { value: '', label: 'Sélectionner un véhicule' },
                ...mockData.vehicles.map(v => ({
                  value: v.id,
                  label: `${v.plaque_immatriculation} - ${v.marque} ${v.modele}`
                }))
              ]}
              required
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Mesures de début</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Km tableau de bord début"
                type="number"
                min="0"
                step="1"
                value={shiftData.km_tableau_bord_debut}
                onChange={(e) => setShiftData({...shiftData, km_tableau_bord_debut: e.target.value})}
                required
              />
              <Input
                label="Taximètre: Prise en charge"
                type="number"
                min="0"
                step="0.01"
                value={shiftData.taximetre_prise_charge_debut}
                onChange={(e) => setShiftData({...shiftData, taximetre_prise_charge_debut: e.target.value})}
              />
              <Input
                label="Taximètre: Index km (km totaux)"
                type="number"
                min="0"
                step="1"
                value={shiftData.taximetre_index_km_debut}
                onChange={(e) => setShiftData({...shiftData, taximetre_index_km_debut: e.target.value})}
              />
              <Input
                label="Taximètre: Km en charge"
                type="number"
                min="0"
                step="1"
                value={shiftData.taximetre_km_charge_debut}
                onChange={(e) => setShiftData({...shiftData, taximetre_km_charge_debut: e.target.value})}
              />
              <Input
                label="Taximètre: Chutes (€)"
                type="number"
                min="0"
                step="0.01"
                value={shiftData.taximetre_chutes_debut}
                onChange={(e) => setShiftData({...shiftData, taximetre_chutes_debut: e.target.value})}
                className="md:col-span-2"
              />
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={() => setActiveTab('courses')} className="w-full">
              Démarrer le shift
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  const CoursesList = () => (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Courses ({filteredCourses.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outlined"
              size="sm"
              icon={<ChartBarIcon className="h-4 w-4" />}
            >
              Résumé financier
            </Button>
            <Button
              variant="outlined"
              size="sm"
              icon={<ClockIcon className="h-4 w-4" />}
            >
              Historique
            </Button>
            <Button
              variant="outlined"
              size="sm"
              icon={<BanknotesIcon className="h-4 w-4" />}
            >
              Ajouter dépense
            </Button>
            <Button
              variant="outlined"
              size="sm"
              icon={<TruckIcon className="h-4 w-4" />}
            >
              Course externe
            </Button>
          </div>

          <Button
            icon={<PlusIcon className="h-4 w-4" />}
            onClick={() => {setShowCourseModal(true); setEditingCourse(null);}}
            className="w-full"
          >
            Ajouter une course
          </Button>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Rechercher par lieu, numéro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-4 w-4" />}
            className="flex-1"
          />
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Tous les statuts' },
              { value: 'completed', label: 'Terminées' },
              { value: 'in-progress', label: 'En cours' },
              { value: 'cancelled', label: 'Annulées' }
            ]}
            className="w-full sm:w-48"
          />
        </div>

        <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            {[
              { key: 'all', label: 'Toutes', count: courses.length },
              { key: 'completed', label: 'Terminées', count: courses.filter(c => c.status === 'completed').length },
              { key: 'in-progress', label: 'En cours', count: courses.filter(c => c.status === 'in-progress').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium ${
                  statusFilter === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
                <Badge variant={statusFilter === tab.key ? 'info' : 'default'}>
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {filteredCourses.length === 0 ? (
          <Card className="p-8 text-center">
            <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune course trouvée</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Commencez par ajouter une nouvelle course'}
            </p>
          </Card>
        ) : (
          filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onEdit={setEditingCourse}
              onDelete={(id) => setCourses(courses.filter(c => c.id !== id))}
            />
          ))
        )}
      </div>
    </div>
  );

  const CourseCard = ({ course, onEdit, onDelete }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="default">#{course.numero_ordre.toString().padStart(3, '0')}</Badge>
            <Badge variant={course.status === 'completed' ? 'success' : course.status === 'in-progress' ? 'warning' : 'default'}>
              {course.status === 'completed' ? 'Terminée' : course.status === 'in-progress' ? 'En cours' : 'Annulée'}
            </Badge>
          </div>
          
          <div className="space-y-1 mb-3">
            <p className="font-medium text-gray-900 dark:text-white">
              {course.lieu_embarquement} → {course.lieu_debarquement}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                {course.heure_embarquement} - {course.heure_debarquement || 'En cours'}
              </span>
              <span className="flex items-center gap-1">
                <BanknotesIcon className="h-4 w-4" />
                {course.sommes_percues.toFixed(2)} € ({course.mode_paiement})
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Index: {course.index_embarquement} → {course.index_debarquement}</span>
              <span>Taximètre: {course.prix_taximetre.toFixed(2)} €</span>
            </div>
            {course.notes && (
              <p className="text-sm text-gray-500 italic">&quot;{course.notes}&quot;</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<EyeIcon className="h-4 w-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<PencilIcon className="h-4 w-4" />}
            onClick={() => {onEdit(course); setShowCourseModal(true);}}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={() => onDelete(course.id)}
            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          />
        </div>
      </div>
    </Card>
  );

  const CourseForm = () => {
    const [formData, setFormData] = useState(
      editingCourse || {
        numero_ordre: courses.length + 1,
        index_depart: '',
        index_embarquement: '',
        lieu_embarquement: '',
        heure_embarquement: '',
        index_debarquement: '',
        lieu_debarquement: '',
        heure_debarquement: '',
        prix_taximetre: '',
        sommes_percues: '',
        mode_paiement: 'CASH',
        client: '',
        remuneration_chauffeur: 'Indépendant',
        notes: ''
      }
    );

    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (editingCourse) {
        setCourses(courses.map(c => c.id === editingCourse.id ? {...formData, id: editingCourse.id} : c));
      } else {
        setCourses([...courses, {...formData, id: Date.now(), status: 'completed'}]);
      }
      
      setShowCourseModal(false);
      setEditingCourse(null);
    };

    const requiresClient = formData.mode_paiement && formData.mode_paiement.startsWith('F-');

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="N° Ordre"
          value={formData.numero_ordre.toString().padStart(3, '0')}
          disabled
          className="bg-gray-100 dark:bg-gray-700"
        />

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-blue-800 dark:text-blue-200">📍 Embarquement</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Index de départ (facultatif)"
              type="number"
              min="0"
              step="1"
              value={formData.index_depart}
              onChange={(e) => setFormData({...formData, index_depart: e.target.value})}
            />
            <Input
              label="Index embarquement"
              type="number"
              min="0"
              step="1"
              value={formData.index_embarquement}
              onChange={(e) => setFormData({...formData, index_embarquement: e.target.value})}
              required
            />
            <Input
              label="Lieu embarquement"
              value={formData.lieu_embarquement}
              onChange={(e) => setFormData({...formData, lieu_embarquement: e.target.value})}
              required
              placeholder="ex: Place Eugène Flagey"
            />
            <Input
              label="Heure embarquement"
              type="time"
              value={formData.heure_embarquement}
              onChange={(e) => setFormData({...formData, heure_embarquement: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-green-800 dark:text-green-200">🏁 Débarquement</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Index débarquement"
              type="number"
              min="0"
              step="1"
              value={formData.index_debarquement}
              onChange={(e) => setFormData({...formData, index_debarquement: e.target.value})}
              required
            />
            <Input
              label="Lieu débarquement"
              value={formData.lieu_debarquement}
              onChange={(e) => setFormData({...formData, lieu_debarquement: e.target.value})}
              required
              placeholder="ex: Gare Centrale"
            />
            <Input
              label="Heure débarquement"
              type="time"
              value={formData.heure_debarquement}
              onChange={(e) => setFormData({...formData, heure_debarquement: e.target.value})}
              className="md:col-span-2"
            />
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-yellow-800 dark:text-yellow-200">💰 Tarification</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prix taximètre (€)"
              type="number"
              step="0.01"
              min="0"
              value={formData.prix_taximetre}
              onChange={(e) => setFormData({...formData, prix_taximetre: parseFloat(e.target.value) || 0})}
              required
            />
            <Input
              label="Sommes perçues (€)"
              type="number"
              step="0.01"
              min="0"
              value={formData.sommes_percues}
              onChange={(e) => setFormData({...formData, sommes_percues: parseFloat(e.target.value) || 0})}
              required
            />
            <Select
              label="Mode de paiement"
              value={formData.mode_paiement}
              onChange={(e) => setFormData({...formData, mode_paiement: e.target.value})}
              options={[
                { value: 'CASH', label: 'Espèces' },
                { value: 'BC', label: 'Bancontact' },
                { value: 'VIR', label: 'Virement' },
                { value: 'F-SNCB', label: 'Facture SNCB' },
                { value: 'F-WL', label: 'Facture Wallonie' },
                { value: 'F-TX', label: 'Facture Taxi' }
              ]}
            />
            {requiresClient && (
              <Input
                label="Client (requis pour facture)"
                value={formData.client}
                onChange={(e) => setFormData({...formData, client: e.target.value})}
                required
                placeholder="Nom du client à facturer"
              />
            )}
            <Select
              label="Rémunération chauffeur"
              value={formData.remuneration_chauffeur}
              onChange={(e) => setFormData({...formData, remuneration_chauffeur: e.target.value})}
              options={[
                { value: 'Indépendant', label: 'Indépendant' },
                { value: 'CDI', label: 'CDI' },
                { value: 'CDD', label: 'CDD' }
              ]}
              className={requiresClient ? "" : "md:col-span-2"}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Notes optionnelles sur la course..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows="2"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="outlined" 
            onClick={() => setShowCourseModal(false)}
          >
            Annuler
          </Button>
          <Button type="submit">
            {editingCourse ? 'Modifier' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    );
  };

  const EndShiftForm = () => {
    const [endData, setEndData] = useState({
      heure_fin: '',
      km_tableau_bord_fin: '',
      taximetre_prise_charge_fin: '',
      taximetre_index_km_fin: '',
      taximetre_chutes_fin: ''
    });

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Fin du Shift</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Heure de fin"
              type="time"
              value={endData.heure_fin}
              onChange={(e) => setEndData({...endData, heure_fin: e.target.value})}
              required
            />
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Durée réelle du shift</p>
              <p className="font-semibold">À calculer</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Mesures de fin</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Km tableau de bord fin"
                type="number"
                min="0"
                step="1"
                value={endData.km_tableau_bord_fin}
                onChange={(e) => setEndData({...endData, km_tableau_bord_fin: e.target.value})}
              />
              <Input
                label="Taximètre: Prise en charge fin"
                type="number"
                min="0"
                step="0.01"
                value={endData.taximetre_prise_charge_fin}
                onChange={(e) => setEndData({...endData, taximetre_prise_charge_fin: e.target.value})}
              />
              <Input
                label="Taximètre: Index km fin"
                type="number"
                min="0"
                step="1"
                value={endData.taximetre_index_km_fin}
                onChange={(e) => setEndData({...endData, taximetre_index_km_fin: e.target.value})}
              />
              <Input
                label="Taximètre: Chutes fin (€)"
                type="number"
                min="0"
                step="0.01"
                value={endData.taximetre_chutes_fin}
                onChange={(e) => setEndData({...endData, taximetre_chutes_fin: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
            <h4 className="font-medium mb-3 text-blue-800 dark:text-blue-200">Résumé de la journée</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total recettes</p>
                <p className="text-lg font-bold text-green-600">{totals.recettes.toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nombre de courses</p>
                <p className="text-lg font-bold text-blue-600">{totals.coursesCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Moyenne par course</p>
                <p className="text-lg font-bold text-purple-600">{totals.averagePerCourse.toFixed(2)} €</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">TxApp-BE</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outlined" size="sm">
                <UserIcon className="h-4 w-4 mr-2" />
                Profil
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex justify-center">
              <div className="flex space-x-8 md:space-x-16">
                {[
                  { key: 'dashboard', label: 'Tableau de bord', icon: ChartBarIcon },
                  { key: 'shift', label: 'Début Shift', icon: ClockIcon },
                  { key: 'courses', label: 'Courses', icon: TruckIcon },
                  { key: 'end', label: 'Fin Shift', icon: CheckIcon }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'shift' && <ShiftForm />}
        {activeTab === 'courses' && <CoursesList />}
        {activeTab === 'end' && <EndShiftForm />}
      </div>

      <Modal
        isOpen={showCourseModal}
        onClose={() => {setShowCourseModal(false); setEditingCourse(null);}}
        title={editingCourse ? "Modifier la course" : "Nouvelle course"}
        size="lg"
      >
        <CourseForm />
      </Modal>

      <Modal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        title="Informations du véhicule"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Plaque</p>
              <p className="font-medium">{mockData.vehicles[0].plaque_immatriculation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">N° Identification</p>
              <p className="font-medium">{mockData.vehicles[0].numero_identification}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Marque/Modèle</p>
              <p className="font-medium">{mockData.vehicles[0].marque} {mockData.vehicles[0].modele}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{mockData.vehicles[0].type_vehicule}</p>
            </div>
          </div>
        </div>
      </Modal>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden">
        <Button className="w-full">
          💾 Sauvegarder la feuille de route
        </Button>
      </div>
    </div>
  );
}