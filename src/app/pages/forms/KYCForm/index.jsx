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
  ArrowPathIcon,
  BuildingOfficeIcon,
  ReceiptRefundIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { generateAndDownloadReport } from 'app/pages/forms/new-post-form/utils/printUtils';
import { mockData as newPostMock } from 'app/pages/forms/new-post-form/data';
import { paymentMethods, statusOptions } from 'app/pages/forms/new-post-form/data';
import { DriverModal } from './components/DriverModal';
import { VehicleModal } from './components/VehicleModal';
import { CourseModal } from './components/CourseModal';
import { ChargeModal } from './components/ChargeModal';
import { NewShiftModal } from './components/NewShiftModal';
import { ClientModal } from './components/ClientModal';
import { FactureModal } from './components/FactureModal';
import { PartenaireModal } from './components/PartenaireModal';
import { InterventionModal } from './components/InterventionModal';
import { ReglesModal } from './components/ReglesModal';
import { SocieteModal } from './components/SocieteModal';
import { calcChargesTotal, buildShift, computeStats } from './utils/helpers';
import {
  chauffeurService,
  vehiculeService,
  courseService,
  chargeService,
  feuilleRouteService,
  clientService,
  factureService,
  partenaireService,
  interventionService,
  regleSalaireService,
  regleFacturationService,
  societeTaxiService
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
  const [clients, setClients] = useState([]);
  const [factures, setFactures] = useState([]);
  const [partenaires, setPartenaires] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [reglesSalaire, setReglesSalaire] = useState([]);
  const [reglesFacturation, setReglesFacturation] = useState([]);
  const [societeTaxi, setSocieteTaxi] = useState(null);

  // États de chargement
  const [loading, setLoading] = useState({
    drivers: false,
    vehicles: false,
    courses: false,
    charges: false,
    shifts: false,
    clients: false,
    modesPaiement: false,
    factures: false,
    partenaires: false,
    interventions: false,
    reglesSalaire: false,
    reglesFacturation: false,
    societeTaxi: false
  });

  // États d'erreur
  const [errors, setErrors] = useState({ // eslint-disable-line no-unused-vars
    drivers: null,
    vehicles: null,
    courses: null,
    charges: null,
    shifts: null,
    clients: null,
    modesPaiement: null,
    factures: null,
    partenaires: null,
    interventions: null,
    reglesSalaire: null,
    reglesFacturation: null,
    societeTaxi: null
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

  // New modals states
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showFactureModal, setShowFactureModal] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [showPartenaireModal, setShowPartenaireModal] = useState(false);
  const [selectedPartenaire, setSelectedPartenaire] = useState(null);
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [showReglesModal, setShowReglesModal] = useState(false);
  const [selectedRegle, setSelectedRegle] = useState(null);
  const [reglesType, setReglesType] = useState('salaire');
  const [showSocieteModal, setShowSocieteModal] = useState(false);

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

      // Charger les clients
      setLoading(prev => ({ ...prev, clients: true }));
      const clientsData = await clientService.getAll();
      setClients(clientsData);
      setLoading(prev => ({ ...prev, clients: false }));

      // Charger les factures
      setLoading(prev => ({ ...prev, factures: true }));
      setErrors(prev => ({ ...prev, factures: null }));
      const facturesData = await factureService.getAll();
      setFactures(facturesData);
      setLoading(prev => ({ ...prev, factures: false }));

      // Charger les partenaires
      setLoading(prev => ({ ...prev, partenaires: true }));
      setErrors(prev => ({ ...prev, partenaires: null }));
      const partenairesData = await partenaireService.getAll();
      setPartenaires(partenairesData);
      setLoading(prev => ({ ...prev, partenaires: false }));

      // Charger les interventions
      setLoading(prev => ({ ...prev, interventions: true }));
      setErrors(prev => ({ ...prev, interventions: null }));
      const interventionsData = await interventionService.getAll();
      setInterventions(interventionsData);
      setLoading(prev => ({ ...prev, interventions: false }));

      // Charger les règles de salaire
      setLoading(prev => ({ ...prev, reglesSalaire: true }));
      setErrors(prev => ({ ...prev, reglesSalaire: null }));
      const reglesSalaireData = await regleSalaireService.getAll();
      setReglesSalaire(reglesSalaireData);
      setLoading(prev => ({ ...prev, reglesSalaire: false }));

      // Charger les règles de facturation
      setLoading(prev => ({ ...prev, reglesFacturation: true }));
      setErrors(prev => ({ ...prev, reglesFacturation: null }));
      const reglesFacturationData = await regleFacturationService.getAll();
      setReglesFacturation(reglesFacturationData);
      setLoading(prev => ({ ...prev, reglesFacturation: false }));

      // Charger la société de taxi
      setLoading(prev => ({ ...prev, societeTaxi: true }));
      setErrors(prev => ({ ...prev, societeTaxi: null }));
      const societeTaxiData = await societeTaxiService.getCurrent();
      setSocieteTaxi(societeTaxiData);
      setLoading(prev => ({ ...prev, societeTaxi: false }));

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
        modesPaiement: false,
        factures: false,
        partenaires: false,
        interventions: false,
        reglesSalaire: false,
        reglesFacturation: false,
        societeTaxi: false
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

  const navigationSections = [
    {
      title: 'Vue d\'ensemble',
      items: [
        { key: 'dashboard', label: 'Tableau de bord', icon: ChartBarIcon }
      ]
    },
    {
      title: 'Opérations quotidiennes',
      items: [
        { key: 'drivers', label: 'Chauffeurs', icon: UsersIcon },
        { key: 'vehicles', label: 'Véhicules', icon: TruckIcon },
        { key: 'shifts', label: 'Feuilles de route', icon: DocumentTextIcon },
        { key: 'courses', label: 'Courses', icon: MapPinIcon },
        { key: 'charges', label: 'Charges', icon: CurrencyEuroIcon }
      ]
    },
    {
      title: 'Gestion commerciale',
      items: [
        { key: 'clients', label: 'Clients', icon: BuildingOfficeIcon },
        { key: 'factures', label: 'Factures', icon: ReceiptRefundIcon },
        { key: 'partenaires', label: 'Partenaires', icon: UserGroupIcon }
      ]
    },
    {
      title: 'Maintenance',
      items: [
        { key: 'interventions', label: 'Interventions', icon: WrenchScrewdriverIcon }
      ]
    },
    {
      title: 'Configuration',
      items: [
        { key: 'regles', label: 'Règles', icon: Cog6ToothIcon },
        { key: 'societe', label: 'Société', icon: BuildingStorefrontIcon }
      ]
    }
  ];

  // Flatten navigation items for backward compatibility
  const tabs = navigationSections.flatMap(section => section.items);

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
    const matchesSearch = driver.utilisateur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.utilisateur?.prenom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = computeStats(drivers, vehicles, shifts, clients, factures, partenaires, interventions);

  // Handlers: Clients
  const handleAddClient = () => {
    setSelectedClient(null);
    setShowClientModal(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const handleSaveClient = async (clientData) => {
    try {
      if (selectedClient) {
        await clientService.update(selectedClient.id, clientData);
        setClients(clients.map(c => c.id === selectedClient.id ? { ...clientData, id: selectedClient.id } : c));
      } else {
        const newClient = await clientService.create(clientData);
        setClients([...clients, newClient]);
      }
      setSelectedClient(null);
      setShowClientModal(false);
      await loadAllData();
    } catch (error) {
      console.error('Erreur sauvegarde client:', error);
      alert('Erreur lors de la sauvegarde du client: ' + error.message);
    }
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;

    try {
      await clientService.delete(id);
      setClients(clients.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erreur suppression client:', error);
      alert('Erreur lors de la suppression du client');
    }
  };

  // Handlers: Factures
  const handleAddFacture = () => {
    setSelectedFacture(null);
    setShowFactureModal(true);
  };

  const handleEditFacture = (facture) => {
    setSelectedFacture(facture);
    setShowFactureModal(true);
  };

  const handleSaveFacture = async (factureData) => {
    try {
      if (selectedFacture) {
        await factureService.update(selectedFacture.id, factureData);
        setFactures(factures.map(f => f.id === selectedFacture.id ? { ...factureData, id: selectedFacture.id } : f));
      } else {
        const newFacture = await factureService.create(factureData);
        setFactures([...factures, newFacture]);
      }
      setSelectedFacture(null);
      setShowFactureModal(false);
      await loadAllData();
    } catch (error) {
      console.error('Erreur sauvegarde facture:', error);
      alert('Erreur lors de la sauvegarde de la facture: ' + error.message);
    }
  };

  const handleDeleteFacture = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;

    try {
      await factureService.delete(id);
      setFactures(factures.filter(f => f.id !== id));
    } catch (error) {
      console.error('Erreur suppression facture:', error);
      alert('Erreur lors de la suppression de la facture');
    }
  };

  // Handlers: Partenaires
  const handleAddPartenaire = () => {
    setSelectedPartenaire(null);
    setShowPartenaireModal(true);
  };

  const handleEditPartenaire = (partenaire) => {
    setSelectedPartenaire(partenaire);
    setShowPartenaireModal(true);
  };

  const handleSavePartenaire = async (partenaireData) => {
    try {
      if (selectedPartenaire) {
        await partenaireService.update(selectedPartenaire.id, partenaireData);
        setPartenaires(partenaires.map(p => p.id === selectedPartenaire.id ? { ...partenaireData, id: selectedPartenaire.id } : p));
      } else {
        const newPartenaire = await partenaireService.create(partenaireData);
        setPartenaires([...partenaires, newPartenaire]);
      }
      setSelectedPartenaire(null);
      setShowPartenaireModal(false);
      await loadAllData();
    } catch (error) {
      console.error('Erreur sauvegarde partenaire:', error);
      alert('Erreur lors de la sauvegarde du partenaire: ' + error.message);
    }
  };

  const handleDeletePartenaire = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) return;

    try {
      await partenaireService.delete(id);
      setPartenaires(partenaires.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erreur suppression partenaire:', error);
      alert('Erreur lors de la suppression du partenaire');
    }
  };

  // Handlers: Interventions
  const handleAddIntervention = () => {
    setSelectedIntervention(null);
    setShowInterventionModal(true);
  };

  const handleEditIntervention = (intervention) => {
    setSelectedIntervention(intervention);
    setShowInterventionModal(true);
  };

  const handleSaveIntervention = async (interventionData) => {
    try {
      if (selectedIntervention) {
        await interventionService.update(selectedIntervention.id, interventionData);
        setInterventions(interventions.map(i => i.id === selectedIntervention.id ? { ...interventionData, id: selectedIntervention.id } : i));
      } else {
        const newIntervention = await interventionService.create(interventionData);
        setInterventions([...interventions, newIntervention]);
      }
      setSelectedIntervention(null);
      setShowInterventionModal(false);
      await loadAllData();
    } catch (error) {
      console.error('Erreur sauvegarde intervention:', error);
      alert('Erreur lors de la sauvegarde de l\'intervention: ' + error.message);
    }
  };

  const handleDeleteIntervention = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) return;

    try {
      await interventionService.delete(id);
      setInterventions(interventions.filter(i => i.id !== id));
    } catch (error) {
      console.error('Erreur suppression intervention:', error);
      alert('Erreur lors de la suppression de l\'intervention');
    }
  };

  // Handlers: Règles
  const handleAddRegleSalaire = () => {
    setSelectedRegle(null);
    setReglesType('salaire');
    setShowReglesModal(true);
  };

  const handleAddRegleFacturation = () => {
    setSelectedRegle(null);
    setReglesType('facturation');
    setShowReglesModal(true);
  };

  const handleEditRegle = (regle, type) => {
    setSelectedRegle(regle);
    setReglesType(type);
    setShowReglesModal(true);
  };

  const handleSaveRegle = async (regleData) => {
    try {
      const service = reglesType === 'salaire' ? regleSalaireService : regleFacturationService;
      const stateSetter = reglesType === 'salaire' ? setReglesSalaire : setReglesFacturation;
      const currentList = reglesType === 'salaire' ? reglesSalaire : reglesFacturation;

      if (selectedRegle) {
        await service.update(selectedRegle.id, regleData);
        stateSetter(currentList.map(r => r.id === selectedRegle.id ? { ...regleData, id: selectedRegle.id } : r));
      } else {
        const newRegle = await service.create(regleData);
        stateSetter([...currentList, newRegle]);
      }
      setSelectedRegle(null);
      setShowReglesModal(false);
      await loadAllData();
    } catch (error) {
      console.error('Erreur sauvegarde règle:', error);
      alert('Erreur lors de la sauvegarde de la règle: ' + error.message);
    }
  };

  const handleDeleteRegle = async (id, type) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette règle ?')) return;

    try {
      const service = type === 'salaire' ? regleSalaireService : regleFacturationService;
      await service.delete(id);

      if (type === 'salaire') {
        setReglesSalaire(reglesSalaire.filter(r => r.id !== id));
      } else {
        setReglesFacturation(reglesFacturation.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Erreur suppression règle:', error);
      alert('Erreur lors de la suppression de la règle');
    }
  };

  // Handlers: Société
  const handleEditSociete = () => {
    setShowSocieteModal(true);
  };

  const handleSaveSociete = async (societeData) => {
    try {
      if (societeTaxi) {
        await societeTaxiService.update(societeTaxi.id, societeData);
        setSocieteTaxi({ ...societeData, id: societeTaxi.id });
      } else {
        const newSociete = await societeTaxiService.create(societeData);
        setSocieteTaxi(newSociete);
      }
      setShowSocieteModal(false);
      await loadAllData();
    } catch (error) {
      console.error('Erreur sauvegarde société:', error);
      alert('Erreur lors de la sauvegarde de la société: ' + error.message);
    }
  };

  return (
    <Page title="TxApp - Administration">
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* En-tête - exactement comme new-post-form */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  TxApp - Administration
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

          {/* Navigation verticale organisée en sections */}
          <div className="mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Navigation latérale */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Administration
                  </h3>
                  <nav className="space-y-6">
                    {navigationSections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {section.title}
                        </h4>
                        <div className="space-y-1">
                          {section.items.map(item => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.key}
                                onClick={() => setActiveTab(item.key)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                  activeTab === item.key
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-r-2 border-blue-500'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-dark-700'
                                }`}
                              >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                <span className="truncate">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Contenu principal */}
              <div className="lg:col-span-3">
                <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 p-6">
                  {/* En-tête de la section active */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const activeItem = tabs.find(tab => tab.key === activeTab);
                        if (activeItem) {
                          const Icon = activeItem.icon;
                          return <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
                        }
                        return null;
                      })()}
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {tabs.find(tab => tab.key === activeTab)?.label || 'Section'}
                      </h2>
                    </div>
                  </div>

                  {/* Contenu de l'onglet */}
                  <div className="transition-content">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                        <BuildingOfficeIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Clients actifs
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.activeClients}/{stats.totalClients}
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

                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                        <ReceiptRefundIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Factures payées
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.paidFactures}/{stats.totalFactures}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
                        <UserGroupIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Partenaires actifs
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.activePartenaires}/{stats.totalPartenaires}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                        <WrenchScrewdriverIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Interventions
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.totalInterventions}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/20">
                        <MapPinIcon className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Courses du jour
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {courses.length}
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
                              {driver && driver.utilisateur?.prenom && driver.utilisateur?.nom ? `${driver.utilisateur.prenom} ${driver.utilisateur.nom}` : 'Chauffeur inconnu'}
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
                                  {driver.utilisateur?.prenom} {driver.utilisateur?.nom}
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
                            <td className="px-6 py-4 whitespace-nowrap">{c.mode_paiement?.libelle}</td>
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
                            <td className="px-6 py-4 whitespace-nowrap">{ch.mode_paiement?.libelle}</td>
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

            {activeTab === 'clients' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Gestion des Clients
                    </h2>
                    <Button
                      onClick={handleAddClient}
                      variant="primary"
                      className="flex items-center gap-2"
                    >
                      <PlusIcon className="h-5 w-5" />
                      Nouveau client
                    </Button>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Société</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N° TVA</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Téléphone</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {clients.map((client) => (
                          <tr key={client.client_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {client.nom_societe}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {client.num_tva || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {client.telephone || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {client.email || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                client.est_actif
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              }`}>
                                {client.est_actif ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleEditClient(client)}
                                  variant="ghost"
                                  size="sm"
                                  title="Modifier"
                                >
                                  <PencilSquareIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteClient(client.client_id)}
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

            {activeTab === 'factures' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Gestion des Factures
                    </h2>
                    <Button
                      onClick={handleAddFacture}
                      variant="primary"
                      className="flex items-center gap-2"
                    >
                      <PlusIcon className="h-5 w-5" />
                      Nouvelle facture
                    </Button>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N° Facture</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant TTC</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {factures.map((facture) => {
                          const client = clients.find(c => c.client_id === facture.client_id);
                          return (
                            <tr key={facture.facture_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {facture.numero_facture}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {client ? client.nom_societe : 'Client inconnu'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(facture.date_emission).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {Number(facture.montant_total || 0).toFixed(2)}€
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  facture.est_payee
                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                }`}>
                                  {facture.est_payee ? 'Payée' : 'En attente'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleEditFacture(facture)}
                                    variant="ghost"
                                    size="sm"
                                    title="Modifier"
                                  >
                                    <PencilSquareIcon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteFacture(facture.facture_id)}
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'partenaires' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Gestion des Partenaires
                    </h2>
                    <Button
                      onClick={handleAddPartenaire}
                      variant="primary"
                      className="flex items-center gap-2"
                    >
                      <PlusIcon className="h-5 w-5" />
                      Nouveau partenaire
                    </Button>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Société</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N° TVA</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Adresse</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {partenaires.map((partenaire) => (
                          <tr key={partenaire.partenaire_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {partenaire.nom_societe}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {partenaire.num_tva || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {partenaire.telephone || '-'}
                              <br />
                              <span className="text-xs text-gray-500 dark:text-gray-400">{partenaire.email || '-'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {partenaire.adresse || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                partenaire.est_actif
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              }`}>
                                {partenaire.est_actif ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleEditPartenaire(partenaire)}
                                  variant="ghost"
                                  size="sm"
                                  title="Modifier"
                                >
                                  <PencilSquareIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeletePartenaire(partenaire.partenaire_id)}
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

            {activeTab === 'interventions' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Gestion des Interventions
                    </h2>
                    <Button
                      onClick={handleAddIntervention}
                      variant="primary"
                      className="flex items-center gap-2"
                    >
                      <PlusIcon className="h-5 w-5" />
                      Nouvelle intervention
                    </Button>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Chauffeur</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lieu</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {interventions.map((intervention) => {
                          const chauffeur = drivers.find(d => d.chauffeur_id === intervention.chauffeur_id);
                          return (
                            <tr key={intervention.intervention_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {chauffeur ? `${chauffeur.utilisateur?.nom} ${chauffeur.utilisateur?.prenom}` : 'Chauffeur inconnu'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {intervention.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {new Date(intervention.date).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {intervention.location || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {intervention.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleEditIntervention(intervention)}
                                    variant="ghost"
                                    size="sm"
                                    title="Modifier"
                                  >
                                    <PencilSquareIcon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteIntervention(intervention.intervention_id)}
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
                        );
                      })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'regles' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Gestion des Règles
                    </h2>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddRegleSalaire}
                        variant="primary"
                        className="flex items-center gap-2"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Règle salaire
                      </Button>
                      <Button
                        onClick={handleAddRegleFacturation}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Règle facturation
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Règles de salaire */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Règles de salaire
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valeur</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {reglesSalaire.map((regle) => (
                          <tr key={regle.regle_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {regle.nom_regle}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {regle.est_variable ? 'Variable' : 'Fixe'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {regle.seuil_recette ? `${Number(regle.seuil_recette).toFixed(2)}€` : '-'}
                              {regle.pourcentage_base ? ` / ${Number(regle.pourcentage_base).toFixed(2)}%` : ''}
                              {regle.pourcentage_au_dela ? ` (${Number(regle.pourcentage_au_dela).toFixed(2)}%)` : ''}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {regle.description || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleEditRegle(regle, 'salaire')}
                                  variant="ghost"
                                  size="sm"
                                  title="Modifier"
                                >
                                  <PencilSquareIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteRegle(regle.regle_id, 'salaire')}
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

                {/* Règles de facturation */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Règles de facturation
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valeur</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Conditions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {reglesFacturation.map((regle) => (
                          <tr key={regle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {regle.nom}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {regle.type_regle}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {regle.type_regle === 'au_km' ? `${regle.valeur}€/km` : `${regle.valeur}€`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {regle.jour_semaine && `Le ${regle.jour_semaine}`}
                              {regle.heure_debut && regle.heure_fin && ` de ${regle.heure_debut} à ${regle.heure_fin}`}
                              {regle.type_course && ` - ${regle.type_course}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                regle.est_actif
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              }`}>
                                {regle.est_actif ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleEditRegle(regle, 'facturation')}
                                  variant="ghost"
                                  size="sm"
                                  title="Modifier"
                                >
                                  <PencilSquareIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteRegle(regle.id, 'facturation')}
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

            {activeTab === 'societe' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Configuration de la Société
                    </h2>
                    <Button
                      onClick={handleEditSociete}
                      variant="primary"
                      className="flex items-center gap-2"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                      {societeTaxi ? 'Modifier' : 'Configurer'}
                    </Button>
                  </div>
                </Card>

                {societeTaxi ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Informations générales
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom exploitant</label>
                          <p className="text-sm text-gray-900 dark:text-white">{societeTaxi.nom_exploitant}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Numéro TVA</label>
                          <p className="text-sm text-gray-900 dark:text-white">{societeTaxi.num_tva}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Taux TVA par défaut</label>
                          <p className="text-sm text-gray-900 dark:text-white">{societeTaxi.taux_tva_defaut ? `${Number(societeTaxi.taux_tva_defaut).toFixed(2)}%` : '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Montant inclut TVA</label>
                          <p className="text-sm text-gray-900 dark:text-white">{societeTaxi.montant_inclut_tva ? 'Oui' : 'Non'}</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Contact
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</label>
                          <p className="text-sm text-gray-900 dark:text-white">{societeTaxi.telephone}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                          <p className="text-sm text-gray-900 dark:text-white">{societeTaxi.email || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Site web</label>
                          <p className="text-sm text-gray-900 dark:text-white">{societeTaxi.site_web || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">N° licence taxi</label>
                          <p className="text-sm text-gray-900 dark:text-white">{societeTaxi.numero_licence || '-'}</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 lg:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Adresse
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Adresse</label>
                          <p className="text-sm text-gray-900 dark:text-white">{societeTaxi.adresse}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Code postal</label>
                            <p className="text-sm text-gray-900 dark:text-white">{societeTaxi.code_postal}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Ville</label>
                            <p className="text-sm text-gray-900 dark:text-white">{societeTaxi.ville}</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {societeTaxi.gérant_nom && (
                      <Card className="p-6 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Gérant
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</label>
                            <p className="text-sm text-gray-900 dark:text-white">{societeTaxi.gérant_nom} {societeTaxi.gérant_prenom}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</label>
                            <p className="text-sm text-gray-900 dark:text-white">{societeTaxi.gérant_telephone || '-'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                            <p className="text-sm text-gray-900 dark:text-white">{societeTaxi.gérant_email || '-'}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card className="p-6">
                    <div className="text-center py-8">
                      <BuildingStorefrontIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucune configuration trouvée
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Configurez les informations de votre société pour commencer.
                      </p>
                      <Button
                        onClick={handleEditSociete}
                        variant="primary"
                      >
                        Configurer la société
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}
                </div>
              </div>
            </div>
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

          <ClientModal
            isOpen={showClientModal}
            onClose={() => { setShowClientModal(false); setSelectedClient(null); }}
            client={selectedClient}
            onSave={handleSaveClient}
          />

          <FactureModal
            isOpen={showFactureModal}
            onClose={() => { setShowFactureModal(false); setSelectedFacture(null); }}
            facture={selectedFacture}
            onSave={handleSaveFacture}
            clients={clients}
          />

          <PartenaireModal
            isOpen={showPartenaireModal}
            onClose={() => { setShowPartenaireModal(false); setSelectedPartenaire(null); }}
            partenaire={selectedPartenaire}
            onSave={handleSavePartenaire}
          />

          <InterventionModal
            isOpen={showInterventionModal}
            onClose={() => { setShowInterventionModal(false); setSelectedIntervention(null); }}
            intervention={selectedIntervention}
            onSave={handleSaveIntervention}
            vehicules={vehicles}
          />

          <ReglesModal
            isOpen={showReglesModal}
            onClose={() => { setShowReglesModal(false); setSelectedRegle(null); }}
            regle={selectedRegle}
            onSave={handleSaveRegle}
            type={reglesType}
          />

          <SocieteModal
            isOpen={showSocieteModal}
            onClose={() => setShowSocieteModal(false)}
            societe={societeTaxi}
            onSave={handleSaveSociete}
          />
        </div>
      </div>
      </div>
    </Page>
  );
};

export default TxAppAdmin;