import { useState, useEffect } from 'react';
import { Page } from 'components/shared/Page';
import { Card, Button } from 'components/ui';
import {
  UsersIcon,
  TruckIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { generateAndDownloadReport } from 'app/pages/forms/new-post-form/utils/printUtils';
import { mockData as newPostMock } from 'app/pages/forms/new-post-form/data';
import { paymentMethods, statusOptions } from 'app/pages/forms/new-post-form/data';
import { DriverModal } from './components/DriverModal';
import { VehicleModal } from './components/VehicleModal';
import { CourseModal } from './components/CourseModal';
import { ChargeModal } from './components/ChargeModal';
import { NewShiftModal } from './components/NewShiftModal';
import { calcChargesTotal, buildShift, computeStats } from './utils/helpers';
import {
  chauffeurService,
  vehiculeService,
  courseService,
  chargeService,
  feuilleRouteService,
  clientService,
  modePaiementService
} from './services/adminServices';

// Données mock pour l'administration (maintenant chargées depuis l'API)






const TxAppAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // États de données avec chargement
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [charges, setCharges] = useState([]);
  const [clients, setClients] = useState([]); // eslint-disable-line no-unused-vars
  const [modesPaiement, setModesPaiement] = useState([]); // eslint-disable-line no-unused-vars

  // États de chargement
  const [loading, setLoading] = useState({
    drivers: false,
    vehicles: false,
    courses: false,
    charges: false,
    shifts: false,
    clients: false,
    modesPaiement: false
  });

  // États d'erreur
  const [errors, setErrors] = useState({ // eslint-disable-line no-unused-vars
    drivers: null,
    vehicles: null,
    courses: null,
    charges: null,
    shifts: null,
    clients: null,
    modesPaiement: null
  });
  
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Vehicles state
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleSearch, setVehicleSearch] = useState('');

  // Courses state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [courseStatusFilter, setCourseStatusFilter] = useState('all');
  const [savingCourse, setSavingCourse] = useState(false);

  // Charges state (maintenant géré au niveau supérieur)
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [editingCharge, setEditingCharge] = useState(null);

  // Shifts modal
  const [showNewShiftModal, setShowNewShiftModal] = useState(false);

  // Charger les courses comme dans new-post-form pour la génération identique
  useEffect(() => {
    loadAllData();
  }, []);

  // Fonction pour charger toutes les données depuis les APIs
  const loadAllData = async () => {
    try {
      // Charger les chauffeurs
      setLoading(prev => ({ ...prev, drivers: true }));
      setErrors(prev => ({ ...prev, drivers: null }));
      const driversData = await chauffeurService.getAll();
      setDrivers(driversData);
      setLoading(prev => ({ ...prev, drivers: false }));

      // Charger les véhicules
      setLoading(prev => ({ ...prev, vehicles: true }));
      setErrors(prev => ({ ...prev, vehicles: null }));
      const vehiclesData = await vehiculeService.getAll();
      setVehicles(vehiclesData);
      setLoading(prev => ({ ...prev, vehicles: false }));

      // Charger les courses
      setLoading(prev => ({ ...prev, courses: true }));
      setErrors(prev => ({ ...prev, courses: null }));
      const coursesData = await courseService.getAll();
      setCourses(coursesData);
      setLoading(prev => ({ ...prev, courses: false }));

      // Charger les charges
      setLoading(prev => ({ ...prev, charges: true }));
      setErrors(prev => ({ ...prev, charges: null }));
      const chargesData = await chargeService.getAll();
      setCharges(chargesData);
      setLoading(prev => ({ ...prev, charges: false }));

      // Charger les feuilles de route
      setLoading(prev => ({ ...prev, shifts: true }));
      setErrors(prev => ({ ...prev, shifts: null }));
      const shiftsData = await feuilleRouteService.getAll();
      setShifts(shiftsData);
      setLoading(prev => ({ ...prev, shifts: false }));

      // Charger les clients et modes de paiement
      setLoading(prev => ({ ...prev, clients: true, modesPaiement: true }));
      const [clientsData, modesPaiementData] = await Promise.all([
        clientService.getAll(),
        modePaiementService.getAll()
      ]);
      setClients(clientsData);
      setModesPaiement(modesPaiementData);
      setLoading(prev => ({ ...prev, clients: false, modesPaiement: false }));

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // En cas d'erreur, utiliser les données mockées comme fallback
      setCourses(newPostMock.courses);
      setLoading({
        drivers: false,
        vehicles: false,
        courses: false,
        charges: false,
        shifts: false,
        clients: false,
        modesPaiement: false
      });
    }
  };

  const handleDownloadReport = () => {
    try {
      const shiftForReport = shifts && shifts.length ? shifts[shifts.length - 1] : { date: new Date().toISOString().slice(0,10) };
      generateAndDownloadReport(
        shiftForReport,
        courses,
        newPostMock.driver,
        newPostMock.vehicles[0]
      );
    } catch (error) {
      console.error('Erreur lors du téléchargement de la feuille de route:', error);
    }
  };

  const handleRefreshData = async () => {
    try {
      await loadAllData();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données:', error);
    }
  };

  // Fonction de validation des données
  const validateDriverData = (data) => {
    const errors = [];
    if (!data.prenom?.trim()) errors.push('Le prénom est requis');
    if (!data.nom?.trim()) errors.push('Le nom est requis');
    if (!data.telephone?.trim()) errors.push('Le téléphone est requis');
    if (!data.email?.trim()) errors.push('L\'email est requis');
    if (!data.numero_badge?.trim()) errors.push('Le numéro de badge est requis');
    if (!data.date_embauche) errors.push('La date d\'embauche est requise');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.push('L\'email n\'est pas valide');
    }

    return errors;
  };

  const validateVehicleData = (data) => {
    const errors = [];
    if (!data.plaque_immatriculation?.trim()) errors.push('La plaque d\'immatriculation est requise');
    if (!data.numero_identification?.trim()) errors.push('Le numéro d\'identification est requis');
    if (!data.marque?.trim()) errors.push('La marque est requise');
    if (!data.modele?.trim()) errors.push('Le modèle est requis');
    if (!data.annee) errors.push('L\'année est requise');
    if (data.annee && (data.annee < 1900 || data.annee > new Date().getFullYear() + 1)) {
      errors.push('L\'année n\'est pas valide');
    }

    return errors;
  };

  const validateCourseData = (data) => {
    const errors = [];
    if (!data.numero_ordre) errors.push('Le numéro d\'ordre est requis');
    if (!data.lieu_embarquement?.trim()) errors.push('Le lieu d\'embarquement est requis');
    if (!data.lieu_debarquement?.trim()) errors.push('Le lieu de débarquement est requis');
    if (!data.prix_taximetre) errors.push('Le prix du taximètre est requis');
    if (data.prix_taximetre <= 0) errors.push('Le prix doit être positif');

    return errors;
  };

  const validateChargeData = (data) => {
    const errors = [];
    if (!data.type?.trim()) errors.push('Le type de charge est requis');
    if (!data.montant) errors.push('Le montant est requis');
    if (data.montant <= 0) errors.push('Le montant doit être positif');
    if (!data.date) errors.push('La date est requise');

    return errors;
  };

  const tabs = [
    { key: 'dashboard', label: 'Tableau de bord', icon: ChartBarIcon },
    { key: 'drivers', label: 'Chauffeurs', icon: UsersIcon },
    { key: 'vehicles', label: 'Véhicules', icon: TruckIcon },
    { key: 'shifts', label: 'Feuilles de route', icon: DocumentTextIcon },
    { key: 'courses', label: 'Courses', icon: MapPinIcon },
    { key: 'charges', label: 'Charges', icon: CurrencyEuroIcon }
  ];

  const handleSaveDriver = async (driverData) => {
    try {
      // Validation des données
      const validationErrors = validateDriverData(driverData);
      if (validationErrors.length > 0) {
        alert('Erreurs de validation:\n' + validationErrors.join('\n'));
        return;
      }

      if (selectedDriver) {
        // Mise à jour
        await chauffeurService.update(selectedDriver.id, driverData);
        setDrivers(drivers.map(d => d.id === selectedDriver.id ? { ...driverData, id: selectedDriver.id } : d));
      } else {
        // Création
        const newDriver = await chauffeurService.create(driverData);
        setDrivers([...drivers, newDriver]);
      }
      setSelectedDriver(null);
      setShowDriverModal(false);
      // Recharger les données pour synchroniser
      await loadAllData();
    } catch (error) {
      console.error('Erreur sauvegarde chauffeur:', error);
      alert('Erreur lors de la sauvegarde du chauffeur: ' + error.message);
    }
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setShowDriverModal(true);
  };

  const handleDeleteDriver = async (driverId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) return;

    try {
      await chauffeurService.delete(driverId);
      setDrivers(drivers.filter(d => d.id !== driverId));
    } catch (error) {
      console.error('Erreur suppression chauffeur:', error);
      alert('Erreur lors de la suppression du chauffeur');
    }
  };

  // Handlers: Véhicules
  const handleSaveVehicle = async (vehicleData) => {
    try {
      // Validation des données
      const validationErrors = validateVehicleData(vehicleData);
      if (validationErrors.length > 0) {
        alert('Erreurs de validation:\n' + validationErrors.join('\n'));
        return;
      }

      if (editingVehicle) {
        // Mise à jour
        await vehiculeService.update(editingVehicle.id, vehicleData);
        setVehicles((prev) => prev.map((v) => (v.id === editingVehicle.id ? { ...vehicleData, id: editingVehicle.id } : v)));
      } else {
        // Création
        const newVehicle = await vehiculeService.create(vehicleData);
        setVehicles((prev) => [...prev, newVehicle]);
      }
      setEditingVehicle(null);
      setShowVehicleModal(false);
      // Recharger les données pour synchroniser
      await loadAllData();
    } catch (error) {
      console.error('Erreur sauvegarde véhicule:', error);
      alert('Erreur lors de la sauvegarde du véhicule: ' + error.message);
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;

    try {
      await vehiculeService.delete(vehicleId);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    } catch (error) {
      console.error('Erreur suppression véhicule:', error);
      alert('Erreur lors de la suppression du véhicule');
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const s = vehicleSearch.toLowerCase();
    return (
      (v.plaque_immatriculation || '').toLowerCase().includes(s) ||
      (v.marque || '').toLowerCase().includes(s) ||
      (v.modele || '').toLowerCase().includes(s)
    );
  });

  // Handlers: Courses (API)
  const handleAddCourse = () => {
    setEditingCourse(null);
    setShowCourseModal(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (courseData) => {
    setSavingCourse(true);
    try {
      // Validation des données
      const validationErrors = validateCourseData(courseData);
      if (validationErrors.length > 0) {
        alert('Erreurs de validation:\n' + validationErrors.join('\n'));
        setSavingCourse(false);
        return;
      }

      if (editingCourse) {
        // Mise à jour
        await courseService.update(editingCourse.id, courseData);
        setCourses(courses.map(c => c.id === editingCourse.id ? { ...courseData, id: editingCourse.id } : c));
      } else {
        // Création
        const newCourse = await courseService.create(courseData);
        setCourses([...courses, newCourse]);
      }
      setEditingCourse(null);
      setShowCourseModal(false);
      // Recharger les données pour synchroniser
      await loadAllData();
    } catch (error) {
      console.error('Erreur sauvegarde course:', error);
      alert('Erreur lors de la sauvegarde de la course: ' + error.message);
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette course ?')) return;

    try {
      await courseService.delete(id);
      setCourses(courses.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erreur suppression course:', error);
      alert('Erreur lors de la suppression de la course');
    }
  };

  const filteredCourses = courses.filter((course) => {
    const term = courseSearchTerm.toLowerCase();
    const matchesSearch =
      (course.lieu_embarquement || '').toLowerCase().includes(term) ||
      (course.lieu_debarquement || '').toLowerCase().includes(term) ||
      String(course.numero_ordre || '').includes(term);
    const matchesStatus = courseStatusFilter === 'all' || course.status === courseStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers: Charges (API)
  const handleAddCharge = () => {
    setEditingCharge(null);
    setShowChargeModal(true);
  };

  const handleSaveCharge = async (chargeData) => {
    try {
      // Validation des données
      const validationErrors = validateChargeData(chargeData);
      if (validationErrors.length > 0) {
        alert('Erreurs de validation:\n' + validationErrors.join('\n'));
        return;
      }

      if (editingCharge) {
        // Mise à jour
        await chargeService.update(editingCharge.id, chargeData);
        setCharges(charges.map(c => c.id === editingCharge.id ? { ...chargeData, id: editingCharge.id } : c));
      } else {
        // Création
        const newCharge = await chargeService.create(chargeData);
        setCharges([...charges, newCharge]);
      }
      setEditingCharge(null);
      setShowChargeModal(false);
      // Recharger les données pour synchroniser
      await loadAllData();
    } catch (error) {
      console.error('Erreur sauvegarde charge:', error);
      alert('Erreur lors de la sauvegarde de la charge: ' + error.message);
    }
  };

  const handleEditCharge = (charge) => {
    setEditingCharge(charge);
    setShowChargeModal(true);
  };

  const handleDeleteCharge = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette charge ?')) return;

    try {
      await chargeService.delete(id);
      setCharges(charges.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erreur suppression charge:', error);
      alert('Erreur lors de la suppression de la charge');
    }
  };
  const chargesTotal = calcChargesTotal(charges);

  // Créer une nouvelle feuille de route (administration)
  const handleCreateShift = (data) => {
    const newShift = buildShift(data, courses, chargesTotal);
    setShifts((prev) => [...prev, newShift]);
    setShowNewShiftModal(false);
  };

  // Filtre: Chauffeurs
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.prenom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.actif === (statusFilter === 'Actif');
    return matchesSearch && matchesStatus;
  });

  const stats = computeStats(drivers, vehicles, shifts);

  return (
    <Page title="TxApp - Administration">
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* En-tête - exactement comme new-post-form */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  🚕 TxApp - Administration
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Gestion complète de votre flotte de taxis
                </p>
              </div>
              <Button
                onClick={handleRefreshData}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                disabled={Object.values(loading).some(l => l)}
              >
                <ArrowPathIcon className={`h-4 w-4 ${Object.values(loading).some(l => l) ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Navigation Tabs - exactement comme new-post-form */}
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

          {/* Tab Content - exactement comme new-post-form */}
          <div className="transition-content">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                        <UsersIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Chauffeurs actifs
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.activeDrivers}/{stats.totalDrivers}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                        <TruckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Véhicules en service
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.activeVehicles}/{stats.totalVehicles}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <CurrencyEuroIcon className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Recettes totales
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.todayRevenue ? stats.todayRevenue.toFixed(2) : '0.00'}€
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Activité récente
                  </h3>
                  <div className="space-y-4">
                    {shifts.map(shift => {
                      const driver = drivers.find(d => d.id === shift.chauffeur_id);
                      const vehicle = vehicles.find(v => v.id === shift.vehicule_id);
                      return (
                        <div key={shift.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {driver ? `${driver.prenom} ${driver.nom}` : 'Chauffeur inconnu'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {vehicle?.plaque_immatriculation} • {shift.date} • {shift.nb_courses} courses
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {shift.recettes ? shift.recettes.toFixed(2) : '0.00'}€
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {shift.statut}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'drivers' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Gestion des Chauffeurs
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                      <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher un chauffeur..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="all">Tous les statuts</option>
                        <option value="Actif">Actif</option>
                        <option value="Inactif">Inactif</option>
                      </select>
                      
                      <Button
                        onClick={() => {
                          setSelectedDriver(null);
                          setShowDriverModal(true);
                        }}
                        className="flex items-center gap-2"
                        variant="primary"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Nouveau chauffeur
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Chauffeur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Badge
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Contrat
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredDrivers.map(driver => (
                          <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {driver.prenom} {driver.nom}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Embauché le {new Date(driver.date_embauche).toLocaleDateString('fr-FR')}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{driver.telephone}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{driver.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-mono text-gray-900 dark:text-white">
                                {driver.numero_badge}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                {driver.type_contrat}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                driver.statut === 'Actif'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              }`}>
                                {driver.statut}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleEditDriver(driver)}
                                  variant="ghost"
                                  size="sm"
                                  title="Modifier"
                                >
                                  <PencilSquareIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteDriver(driver.id)}
                                  variant="ghost"
                                  size="sm"
                                  title="Supprimer"
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'vehicles' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gestion des Véhicules</h2>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                      <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher un véhicule..."
                          value={vehicleSearch}
                          onChange={(e) => setVehicleSearch(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <Button
                        onClick={() => { setEditingVehicle(null); setShowVehicleModal(true); }}
                        className="flex items-center gap-2"
                        variant="primary"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Nouveau véhicule
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plaque</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Véhicule</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Identifiant</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredVehicles.map((v) => (
                          <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap font-mono">{v.plaque_immatriculation}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{v.marque} {v.modele}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{v.numero_identification}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${v.statut === 'En service' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'}`}>{v.statut}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <Button onClick={() => handleEditVehicle(v)} variant="ghost" size="sm" title="Modifier">
                                  <PencilSquareIcon className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => handleDeleteVehicle(v.id)} variant="ghost" size="sm" title="Supprimer" className="text-red-600 hover:text-red-900 dark:text-red-400">
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'shifts' && (
              <Card className="p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Feuilles de Route
                  </h2>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setShowNewShiftModal(true)}
                      variant="primary"
                      className="inline-flex items-center gap-2"
                      title="Créer une nouvelle feuille de route"
                    >
                      <PlusIcon className="h-5 w-5" />
                      Nouvelle feuille
                    </Button>
                    <Button
                      onClick={handleDownloadReport}
                      variant="outlined"
                      className="inline-flex items-center gap-2"
                      title="Télécharger la feuille de route"
                    >
                      <PrinterIcon className="h-5 w-5" />
                      Télécharger
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Chauffeur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Véhicule</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Heures</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Courses</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Recettes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Charges</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {shifts.map((s) => {
                        const d = drivers.find((x) => x.id === s.chauffeur_id);
                        const v = vehicles.find((x) => x.id === s.vehicule_id);
                        return (
                          <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(s.date).toLocaleDateString('fr-FR')}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{d ? `${d.prenom} ${d.nom}` : '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{v ? v.plaque_immatriculation : '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{s.heure_debut} → {s.heure_fin}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{s.nb_courses}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{s.recettes ? s.recettes.toFixed(2) : '0.00'}€</td>
                            <td className="px-6 py-4 whitespace-nowrap">{s.charges ? s.charges.toFixed(2) : '0.00'}€</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">{s.statut}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === 'courses' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gestion des Courses</h2>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                      <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher une course..."
                          value={courseSearchTerm}
                          onChange={(e) => setCourseSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <select
                        value={courseStatusFilter}
                        onChange={(e) => setCourseStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <Button
                        onClick={handleAddCourse}
                        variant="primary"
                        className="flex items-center gap-2"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Nouvelle course
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Embarquement</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Débarquement</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Heures</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Somme perçue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Paiement</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCourses.map((c) => (
                          <tr key={c.id || `${c.numero_ordre}-${c.lieu_embarquement}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">{c.numero_ordre}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{c.lieu_embarquement}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Index: {c.index_embarquement ?? c.index_depart} • {c.heure_embarquement}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{c.lieu_debarquement}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Index: {c.index_debarquement ?? c.index_arrivee} • {c.heure_debarquement}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{c.heure_embarquement} → {c.heure_debarquement}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{Number(c.sommes_percues || 0).toFixed(2)}€</td>
                            <td className="px-6 py-4 whitespace-nowrap">{c.mode_paiement}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">{c.status}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <Button onClick={() => handleEditCourse(c)} variant="ghost" size="sm" title="Modifier">
                                  <PencilSquareIcon className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => handleDeleteCourse(c.id)} variant="ghost" size="sm" title="Supprimer" className="text-red-600 hover:text-red-900 dark:text-red-400">
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'charges' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gestion des Charges</h2>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-700 dark:text-gray-200">Total: <span className="font-semibold">{chargesTotal ? chargesTotal.toFixed(2) : '0.00'}€</span></div>
                      <Button
                        onClick={handleAddCharge}
                        variant="primary"
                        className="flex items-center gap-2"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Nouvelle charge
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Paiement</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {charges.map((ch) => (
                          <tr key={ch.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(ch.date).toLocaleDateString('fr-FR')}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{ch.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{ch.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{Number(ch.montant || 0).toFixed(2)}€</td>
                            <td className="px-6 py-4 whitespace-nowrap">{ch.mode_paiement}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <Button onClick={() => handleEditCharge(ch)} variant="ghost" size="sm" title="Modifier">
                                  <PencilSquareIcon className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => handleDeleteCharge(ch.id)} variant="ghost" size="sm" title="Supprimer" className="text-red-600 hover:text-red-900 dark:text-red-400">
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </div>

          <DriverModal
            isOpen={showDriverModal}
            onClose={() => {
              setShowDriverModal(false);
              setSelectedDriver(null);
            }}
            driver={selectedDriver}
            onSave={handleSaveDriver}
          />

          <VehicleModal
            isOpen={showVehicleModal}
            onClose={() => { setShowVehicleModal(false); setEditingVehicle(null); }}
            vehicle={editingVehicle}
            onSave={handleSaveVehicle}
          />

          <CourseModal
            isOpen={showCourseModal}
            onClose={() => { setShowCourseModal(false); setEditingCourse(null); }}
            course={editingCourse}
            onSave={handleSaveCourse}
            saving={savingCourse}
            paymentMethods={paymentMethods}
          />

          <ChargeModal
            isOpen={showChargeModal}
            onClose={() => { setShowChargeModal(false); setEditingCharge(null); }}
            charge={editingCharge}
            onSave={handleSaveCharge}
          />

          <NewShiftModal
            isOpen={showNewShiftModal}
            onClose={() => setShowNewShiftModal(false)}
            drivers={drivers}
            vehicles={vehicles}
            onSave={handleCreateShift}
          />
        </div>
      </div>
    </Page>
  );
};

export default TxAppAdmin;