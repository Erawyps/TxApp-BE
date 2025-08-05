import React, { useState, useEffect } from 'react';

// Icônes SVG simples (remplaçant @heroicons/react)
const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TruckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ChartBarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BanknotesIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ArrowUpTrayIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const PrinterIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

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

const EyeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const PencilIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const XMarkIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MapPinIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const InformationCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Composants utilitaires
const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
  );
};

const StatusBadge = ({ status, children }) => {
  const variants = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status] || variants.default}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = "", hover = false }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''} ${className}`}>
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
  loading = false,
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
    outlined: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow"
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
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

const Input = ({ label, type = "text", icon, error, className = "", required = false, value, onChange, placeholder, ...props }) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${icon ? 'pl-10' : ''} ${error ? 'border-red-300 focus:ring-red-500' : ''}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const Select = ({ label, options = [], error, className = "", required = false, value, onChange, ...props }) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${error ? 'border-red-300 focus:ring-red-500' : ''}`}
      {...props}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
        <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full ${sizes[size]} transform transition-all`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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

// Navigation améliorée
const Navigation = ({ currentUser }) => (
  <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <TruckIcon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TxApp-BE
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {currentUser?.prenom} {currentUser?.nom}
              </p>
              <p className="text-xs text-gray-500">Badge: {currentUser?.numero_badge}</p>
            </div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

// Carte de bienvenue améliorée
const WelcomeCard = ({ driver, vehicle }) => (
  <Card className="p-6 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white relative overflow-hidden">
    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-white/10 rounded-full"></div>
    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-16 w-16 bg-white/10 rounded-full"></div>
    <div className="relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Bonjour {driver?.prenom} !
          </h2>
          <p className="text-blue-100 mb-2">
            Badge: {driver?.numero_badge} • {driver?.type_contrat}
          </p>
          <div className="flex items-center text-sm text-blue-100">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-100 mb-1">Véhicule actuel</p>
          <p className="font-semibold text-lg">{vehicle?.plaque_immatriculation}</p>
          <p className="text-sm text-blue-100">{vehicle?.marque} {vehicle?.modele}</p>
        </div>
      </div>
    </div>
  </Card>
);

// Statistiques du tableau de bord
const DashboardStats = ({ totals }) => {
  const stats = [
    {
      title: "Recettes du jour",
      value: `${totals.recettes.toFixed(2)} €`,
      icon: BanknotesIcon,
      color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/10"
    },
    {
      title: "Courses effectuées",
      value: totals.coursesCount,
      icon: TruckIcon,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/10"
    },
    {
      title: "Moyenne par course",
      value: `${totals.averagePerCourse.toFixed(2)} €`,
      icon: ChartBarIcon,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`p-6 ${stat.bgColor} border-0`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Actions rapides
const QuickActions = ({ onNewCourse, onPrintReport, onExportData, onViewHistory }) => {
  const actions = [
    { label: "Nouvelle course", icon: PlusIcon, onClick: onNewCourse, color: "primary" },
    { label: "Imprimer rapport", icon: PrinterIcon, onClick: onPrintReport, color: "outlined" },
    { label: "Exporter données", icon: ArrowUpTrayIcon, onClick: onExportData, color: "outlined" },
    { label: "Historique", icon: CalendarIcon, onClick: onViewHistory, color: "outlined" }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Actions rapides</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.color}
            className="h-20 flex-col space-y-2 text-center"
            onClick={action.onClick}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};

// Navigation par onglets améliorée
const TabNavigation = ({ activeTab, onTabChange, coursesCount }) => {
  const tabs = [
    { key: 'dashboard', label: 'Tableau de bord', icon: ChartBarIcon },
    { key: 'shift', label: 'Début Shift', icon: ClockIcon },
    { key: 'courses', label: `Courses (${coursesCount})`, icon: TruckIcon },
    { key: 'end', label: 'Fin Shift', icon: CheckIcon }
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="flex justify-center">
        <div className="flex space-x-8 md:space-x-16">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
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
  );
};

// Formulaire de course simple (remplaçant react-hook-form)
const CourseFormModal = ({ isOpen, onClose, onSubmit, course = null }) => {
  const [formData, setFormData] = useState({
    lieu_embarquement: '',
    lieu_debarquement: '',
    heure_embarquement: '',
    heure_debarquement: '',
    prix_taximetre: '',
    sommes_percues: '',
    mode_paiement: 'CASH',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (course) {
      setFormData(course);
    } else {
      setFormData({
        lieu_embarquement: '',
        lieu_debarquement: '',
        heure_embarquement: '',
        heure_debarquement: '',
        prix_taximetre: '',
        sommes_percues: '',
        mode_paiement: 'CASH',
        notes: ''
      });
    }
  }, [course, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.lieu_embarquement) newErrors.lieu_embarquement = 'Lieu d\'embarquement requis';
    if (!formData.lieu_debarquement) newErrors.lieu_debarquement = 'Lieu de débarquement requis';
    if (!formData.heure_embarquement) newErrors.heure_embarquement = 'Heure d\'embarquement requise';
    if (!formData.prix_taximetre) newErrors.prix_taximetre = 'Prix taximètre requis';
    if (!formData.sommes_percues) newErrors.sommes_percues = 'Somme perçue requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        prix_taximetre: parseFloat(formData.prix_taximetre) || 0,
        sommes_percues: parseFloat(formData.sommes_percues) || 0
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={course ? "Modifier la course" : "Nouvelle course"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-blue-800 dark:text-blue-200">📍 Embarquement</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Lieu d'embarquement"
              value={formData.lieu_embarquement}
              onChange={(e) => handleChange('lieu_embarquement', e.target.value)}
              error={errors.lieu_embarquement}
              placeholder="ex: Place Eugène Flagey"
              required
            />
            <Input
              label="Heure d'embarquement"
              type="time"
              value={formData.heure_embarquement}
              onChange={(e) => handleChange('heure_embarquement', e.target.value)}
              error={errors.heure_embarquement}
              required
            />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-green-800 dark:text-green-200">🏁 Débarquement</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Lieu de débarquement"
              value={formData.lieu_debarquement}
              onChange={(e) => handleChange('lieu_debarquement', e.target.value)}
              error={errors.lieu_debarquement}
              placeholder="ex: Gare Centrale"
              required
            />
            <Input
              label="Heure de débarquement"
              type="time"
              value={formData.heure_debarquement}
              onChange={(e) => handleChange('heure_debarquement', e.target.value)}
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
              onChange={(e) => handleChange('prix_taximetre', e.target.value)}
              error={errors.prix_taximetre}
              required
            />
            <Input
              label="Somme perçue (€)"
              type="number"
              step="0.01"
              min="0"
              value={formData.sommes_percues}
              onChange={(e) => handleChange('sommes_percues', e.target.value)}
              error={errors.sommes_percues}
              required
            />
            <Select
              label="Mode de paiement"
              value={formData.mode_paiement}
              onChange={(e) => handleChange('mode_paiement', e.target.value)}
              options={[
                { value: 'CASH', label: 'Espèces' },
                { value: 'BC', label: 'Bancontact' },
                { value: 'VIR', label: 'Virement' },
                { value: 'F-SNCB', label: 'Facture SNCB' },
                { value: 'F-WL', label: 'Facture Wallonie' },
                { value: 'F-TX', label: 'Facture Taxi' }
              ]}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Notes optionnelles sur la course..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows="2"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="outlined" 
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button type="submit">
            {course ? 'Modifier' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Composant principal
export default function TxAppImproved() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Données mockées
  const currentUser = {
    prenom: "Hasler",
    nom: "Tehou", 
    numero_badge: "TX-2023-001",
    type_contrat: "Indépendant"
  };

  const currentVehicle = {
    plaque_immatriculation: "TX-AA-171",
    marque: "Mercedes",
    modele: "Classe E"
  };

  // Calculs des totaux
  const totals = {
    recettes: courses.reduce((sum, course) => sum + (course.sommes_percues || 0), 0),
    coursesCount: courses.length,
    averagePerCourse: courses.length > 0 ? courses.reduce((sum, course) => sum + (course.sommes_percues || 0), 0) / courses.length : 0
  };

  // Gestionnaires d'événements
  const handleNewCourse = () => {
    setEditingCourse(null);
    setShowCourseModal(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseModal(true);
  };

  const handleSubmitCourse = (courseData) => {
    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? { ...courseData, id: editingCourse.id } : c));
    } else {
      const newCourse = {
        ...courseData,
        id: Date.now(),
        numero_ordre: courses.length + 1,
        status: 'completed'
      };
      setCourses([...courses, newCourse]);
    }
  };

  const handleDeleteCourse = (courseId) => {
    setCourses(courses.filter(c => c.id !== courseId));
  };

  // Cours mockés pour la démonstration
  const mockCourses = [
    {
      id: 1,
      numero_ordre: 1,
      lieu_embarquement: "Place Eugène Flagey",
      lieu_debarquement: "Gare Centrale",
      heure_embarquement: "08:30",
      heure_debarquement: "08:45",
      prix_taximetre: 12.50,
      sommes_percues: 15.00,
      mode_paiement: "CASH",
      notes: "Client très aimable",
      status: "completed"
    },
    {
      id: 2,
      numero_ordre: 2,
      lieu_embarquement: "Gare du Midi",
      lieu_debarquement: "Aéroport de Bruxelles",
      heure_embarquement: "09:15",
      heure_debarquement: "09:45",
      prix_taximetre: 45.00,
      sommes_percues: 50.00,
      mode_paiement: "BC",
      notes: "Course vers l'aéroport",
      status: "completed"
    }
  ];

  React.useEffect(() => {
    setCourses(mockCourses);
  }, []);

  // Filtrage des courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.lieu_embarquement.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.lieu_debarquement.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.numero_ordre.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Rendu du tableau de bord
  const renderDashboard = () => (
    <div className="space-y-6">
      <WelcomeCard driver={currentUser} vehicle={currentVehicle} />
      <DashboardStats totals={totals} />
      <QuickActions 
        onNewCourse={handleNewCourse}
        onPrintReport={() => console.log('Print report')}
        onExportData={() => console.log('Export data')}
        onViewHistory={() => console.log('View history')}
      />
    </div>
  );

  // Rendu de la liste des courses
  const renderCourses = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Courses ({filteredCourses.length})
            </h2>
          </div>
          
          <Button
            icon={<PlusIcon className="h-4 w-4" />}
            onClick={handleNewCourse}
            className="w-full"
          >
            Ajouter une course
          </Button>

          <div className="flex flex-col sm:flex-row gap-4">
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
                { value: 'in-progress', label: 'En cours' }
              ]}
              className="w-full sm:w-48"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <Card className="p-12 text-center">
            <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune course trouvée</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Commencez par ajouter une nouvelle course'}
            </p>
          </Card>
        ) : (
          filteredCourses.map((course) => (
            <Card key={course.id} className="p-6" hover>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <StatusBadge status="default">
                      #{course.numero_ordre.toString().padStart(3, '0')}
                    </StatusBadge>
                    <StatusBadge status={course.status}>
                      {course.status === 'completed' ? 'Terminée' : 'En cours'}
                    </StatusBadge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPinIcon className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-lg text-gray-900 dark:text-white">
                        {course.lieu_embarquement}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 ml-7">
                      <div className="w-px h-4 bg-gray-300"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="h-5 w-5 text-red-600" />
                      <span className="font-semibold text-lg text-gray-900 dark:text-white">
                        {course.lieu_debarquement}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mt-3">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {course.heure_embarquement} - {course.heure_debarquement}
                      </span>
                      <span className="flex items-center gap-1">
                        <BanknotesIcon className="h-4 w-4" />
                        {course.sommes_percues.toFixed(2)} € ({course.mode_paiement})
                      </span>
                    </div>
                    
                    {course.notes && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-l-blue-400">
                        <div className="flex items-start gap-2">
                          <InformationCircleIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-800 dark:text-blue-200 italic">
                            &quot;{course.notes}&quot;
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={<EyeIcon className="h-4 w-4" />} 
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={<PencilIcon className="h-4 w-4" />}
                    onClick={() => handleEditCourse(course)}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={<TrashIcon className="h-4 w-4" />} 
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteCourse(course.id)}
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation currentUser={currentUser} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          coursesCount={courses.length}
        />

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'courses' && renderCourses()}
        
        {activeTab === 'shift' && (
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <ClockIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold">Début du Shift</h3>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200">
                Configuration du shift en cours de développement...
              </p>
              <Button 
                className="mt-4" 
                onClick={() => setActiveTab('courses')}
              >
                Démarrer le shift
              </Button>
            </div>
          </Card>
        )}
        
        {activeTab === 'end' && (
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <CheckIcon className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold">Fin du Shift</h3>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-green-800 dark:text-green-200">
                Résumé de la journée
              </h4>
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
        )}
      </div>

      {/* Barre d'actions mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden">
        <Button className="w-full" size="lg">
          💾 Sauvegarder la feuille de route
        </Button>
      </div>

      {/* Modal de cours */}
      <CourseFormModal
        isOpen={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          setEditingCourse(null);
        }}
        onSubmit={handleSubmitCourse}
        course={editingCourse}
      />
    </div>
  );
}