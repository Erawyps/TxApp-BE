import { useState, useEffect } from 'react';
import { Page } from 'components/shared/Page';
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
  PrinterIcon
} from '@heroicons/react/24/outline';
import { generateAndDownloadReport } from 'app/pages/forms/new-post-form/utils/printUtils';
import { mockData as newPostMock } from 'app/pages/forms/new-post-form/data';
import { fetchCourses, upsertCourse, deleteCourse as removeCourse } from 'services/courses';
import { paymentMethods, statusOptions } from 'app/pages/forms/new-post-form/data';

// Données mock pour l'administration
const mockDrivers = [
  { 
    id: 1, 
    prenom: 'Jean', 
    nom: 'Dupont', 
    telephone: '+32 478 12 34 56',
    email: 'jean.dupont@email.com',
    numero_badge: 'TX-2024-001',
    type_contrat: 'CDI',
    date_embauche: '2024-01-15',
    statut: 'Actif'
  },
  { 
    id: 2, 
    prenom: 'Marie', 
    nom: 'Martin', 
    telephone: '+32 478 65 43 21',
    email: 'marie.martin@email.com',
    numero_badge: 'TX-2024-002',
    type_contrat: 'Indépendant',
    date_embauche: '2024-02-01',
    statut: 'Actif'
  }
];

const mockVehicles = [
  {
    id: 1,
    plaque_immatriculation: 'TX-AA-171',
    numero_identification: '10',
    marque: 'Mercedes',
    modele: 'Classe E',
    type_vehicule: 'Berline',
    annee: 2022,
    couleur: 'Noir',
    statut: 'En service',
    kilometrage: 85420,
    derniere_revision: '2024-07-15',
    assurance_expiration: '2024-12-31'
  }
];

const mockShifts = [
  {
    id: 1,
    date: '2024-08-08',
    chauffeur_id: 1,
    vehicule_id: 1,
    heure_debut: '08:00',
    heure_fin: '16:00',
    nb_courses: 12,
    recettes: 285.50,
    charges: 45.20,
    statut: 'Terminé'
  }
];

// const mockCharges = [
//   { id: 1, type: 'Carburant', montant: 25.50, date: '2024-08-08', chauffeur_id: 1 },
//   { id: 2, type: 'Péage', montant: 12.20, date: '2024-08-08', chauffeur_id: 1 }
// ];

const DriverModal = ({ isOpen, onClose, driver, onSave }) => {
  const [formData, setFormData] = useState(driver || {
    prenom: '', nom: '', telephone: '', email: '', numero_badge: '', 
    type_contrat: 'CDI', date_embauche: '', statut: 'Actif'
  });

  useEffect(() => {
    if (driver) setFormData(driver);
  }, [driver]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {driver ? 'Modifier le chauffeur' : 'Nouveau chauffeur'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Prénom"
              value={formData.prenom}
              onChange={(e) => setFormData({...formData, prenom: e.target.value})}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            <input
              type="text"
              placeholder="Nom"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          
          <input
            type="tel"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={(e) => setFormData({...formData, telephone: e.target.value})}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          
          <input
            type="text"
            placeholder="Numéro de badge"
            value={formData.numero_badge}
            onChange={(e) => setFormData({...formData, numero_badge: e.target.value})}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {driver ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal: Vehicle create/update
const VehicleModal = ({ isOpen, onClose, vehicle, onSave }) => {
  const [formData, setFormData] = useState(
    vehicle || {
      plaque_immatriculation: '',
      numero_identification: '',
      marque: '',
      modele: '',
      type_vehicule: 'Berline',
      annee: '',
      couleur: '',
      statut: 'En service',
      kilometrage: '',
      derniere_revision: '',
      assurance_expiration: ''
    }
  );

  useEffect(() => {
    if (vehicle) setFormData(vehicle);
  }, [vehicle]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {vehicle ? 'Modifier le véhicule' : 'Nouveau véhicule'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Plaque" value={formData.plaque_immatriculation} onChange={(e)=>setFormData({...formData, plaque_immatriculation:e.target.value})} required />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="n° identification" value={formData.numero_identification} onChange={(e)=>setFormData({...formData, numero_identification:e.target.value})} required />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Marque" value={formData.marque} onChange={(e)=>setFormData({...formData, marque:e.target.value})} />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Modèle" value={formData.modele} onChange={(e)=>setFormData({...formData, modele:e.target.value})} />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Année" type="number" value={formData.annee} onChange={(e)=>setFormData({...formData, annee:e.target.value})} />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Couleur" value={formData.couleur} onChange={(e)=>setFormData({...formData, couleur:e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.statut} onChange={(e)=>setFormData({...formData, statut:e.target.value})}>
              <option>En service</option>
              <option>Maintenance</option>
              <option>Hors service</option>
            </select>
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Kilométrage" type="number" value={formData.kilometrage} onChange={(e)=>setFormData({...formData, kilometrage:e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Dernière révision (YYYY-MM-DD)" value={formData.derniere_revision} onChange={(e)=>setFormData({...formData, derniere_revision:e.target.value})} />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Assurance expiration (YYYY-MM-DD)" value={formData.assurance_expiration} onChange={(e)=>setFormData({...formData, assurance_expiration:e.target.value})} />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Annuler</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{vehicle ? 'Modifier' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal: Course create/update
const CourseModal = ({ isOpen, onClose, course, onSave, saving, paymentMethods }) => {
  const [formData, setFormData] = useState(
    course || {
      numero_ordre: '',
      index_embarquement: '',
      lieu_embarquement: '',
      heure_embarquement: '',
      index_debarquement: '',
      lieu_debarquement: '',
      heure_debarquement: '',
      prix_taximetre: '',
      sommes_percues: '',
      mode_paiement: 'CASH',
      notes: '',
      status: 'completed'
    }
  );

  useEffect(() => {
    if (course) setFormData(course);
  }, [course]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{course ? 'Modifier la course' : 'Nouvelle course'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="number" placeholder="# ordre" value={formData.numero_ordre} onChange={(e)=>setFormData({...formData, numero_ordre:Number(e.target.value)})} required />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="number" placeholder="Index départ" value={formData.index_embarquement} onChange={(e)=>setFormData({...formData, index_embarquement:Number(e.target.value)})} />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="number" placeholder="Index arrivée" value={formData.index_debarquement} onChange={(e)=>setFormData({...formData, index_debarquement:Number(e.target.value)})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Lieu embarquement" value={formData.lieu_embarquement} onChange={(e)=>setFormData({...formData, lieu_embarquement:e.target.value})} />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Lieu débarquement" value={formData.lieu_debarquement} onChange={(e)=>setFormData({...formData, lieu_debarquement:e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Heure embarquement (HH:MM)" value={formData.heure_embarquement} onChange={(e)=>setFormData({...formData, heure_embarquement:e.target.value})} />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Heure débarquement (HH:MM)" value={formData.heure_debarquement} onChange={(e)=>setFormData({...formData, heure_debarquement:e.target.value})} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="number" step="0.01" placeholder="Prix taximètre" value={formData.prix_taximetre} onChange={(e)=>setFormData({...formData, prix_taximetre:Number(e.target.value)})} required />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="number" step="0.01" placeholder="Somme perçue" value={formData.sommes_percues} onChange={(e)=>setFormData({...formData, sommes_percues:Number(e.target.value)})} required />
            <select className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.mode_paiement} onChange={(e)=>setFormData({...formData, mode_paiement:e.target.value})}>
              {paymentMethods.map(pm => (
                <option key={pm.value} value={pm.value}>{pm.label || pm.value}</option>
              ))}
            </select>
          </div>
          <textarea className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Notes" value={formData.notes} onChange={(e)=>setFormData({...formData, notes:e.target.value})} />
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Annuler</button>
            <button type="submit" disabled={!!saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{saving ? 'Enregistrement...' : (course ? 'Modifier' : 'Créer')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal: Charge create/update (local only)
const ChargeModal = ({ isOpen, onClose, charge, onSave }) => {
  const [formData, setFormData] = useState(
    charge || {
      type: '',
      description: '',
      montant: '',
      mode_paiement: 'cash',
      date: new Date().toISOString().slice(0,10)
    }
  );

  useEffect(() => {
    if (charge) setFormData(charge);
  }, [charge]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, montant: Number(formData.montant) });
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{charge ? 'Modifier la charge' : 'Nouvelle charge'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Type" value={formData.type} onChange={(e)=>setFormData({...formData, type:e.target.value})} required />
          <textarea className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Description" value={formData.description} onChange={(e)=>setFormData({...formData, description:e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="number" step="0.01" placeholder="Montant" value={formData.montant} onChange={(e)=>setFormData({...formData, montant:e.target.value})} required />
            <select className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.mode_paiement} onChange={(e)=>setFormData({...formData, mode_paiement:e.target.value})}>
              <option value="cash">Cash</option>
              <option value="bancontact">Bancontact</option>
            </select>
          </div>
          <input className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="date" value={formData.date} onChange={(e)=>setFormData({...formData, date:e.target.value})} />
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Annuler</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{charge ? 'Modifier' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal: New Shift create
const NewShiftModal = ({ isOpen, onClose, drivers, vehicles, onSave }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0,10),
    chauffeur_id: drivers && drivers.length ? drivers[0].id : '',
    vehicule_id: vehicles && vehicles.length ? vehicles[0].id : '',
    heure_debut: '',
    heure_fin: '',
    skipCharges: true
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      chauffeur_id: drivers && drivers.length ? drivers[0].id : '',
      vehicule_id: vehicles && vehicles.length ? vehicles[0].id : ''
    }));
  }, [drivers, vehicles]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Nouvelle feuille de route</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="date" value={formData.date} onChange={(e)=>setFormData({...formData, date:e.target.value})} required />
            <input className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Heure début (HH:MM)" value={formData.heure_debut} onChange={(e)=>setFormData({...formData, heure_debut:e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.chauffeur_id} onChange={(e)=>setFormData({...formData, chauffeur_id:Number(e.target.value)})}>
              {drivers.map((d)=> (
                <option key={d.id} value={d.id}>{d.prenom} {d.nom}</option>
              ))}
            </select>
            <select className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.vehicule_id} onChange={(e)=>setFormData({...formData, vehicule_id:Number(e.target.value)})}>
              {vehicles.map((v)=> (
                <option key={v.id} value={v.id}>{v.plaque_immatriculation}</option>
              ))}
            </select>
          </div>
          <input className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Heure fin (HH:MM)" value={formData.heure_fin} onChange={(e)=>setFormData({...formData, heure_fin:e.target.value})} />
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input type="checkbox" className="h-4 w-4" checked={formData.skipCharges} onChange={(e)=>setFormData({...formData, skipCharges:e.target.checked})} />
            Passer l’étape charges (charges = 0)
          </label>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Annuler</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Créer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TxAppAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [drivers, setDrivers] = useState(mockDrivers);
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [shifts, setShifts] = useState(mockShifts);
  const [courses, setCourses] = useState([]);
  
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

  // Charges state (local)
  const [charges, setCharges] = useState([]);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [editingCharge, setEditingCharge] = useState(null);

  // Shifts modal
  const [showNewShiftModal, setShowNewShiftModal] = useState(false);

  // Charger les courses comme dans new-post-form pour la génération identique
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchCourses();
        setCourses(list && list.length ? list : newPostMock.courses);
      } catch (e) {
        console.error('Erreur chargement courses:', e);
        setCourses(newPostMock.courses);
      }
    })();
  }, []);

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

  const tabs = [
    { key: 'dashboard', label: 'Tableau de bord', icon: ChartBarIcon },
    { key: 'drivers', label: 'Chauffeurs', icon: UsersIcon },
    { key: 'vehicles', label: 'Véhicules', icon: TruckIcon },
    { key: 'shifts', label: 'Feuilles de route', icon: DocumentTextIcon },
    { key: 'courses', label: 'Courses', icon: MapPinIcon },
    { key: 'charges', label: 'Charges', icon: CurrencyEuroIcon }
  ];

  const handleSaveDriver = (driverData) => {
    if (selectedDriver) {
      setDrivers(drivers.map(d => d.id === selectedDriver.id ? { ...driverData, id: selectedDriver.id } : d));
    } else {
      setDrivers([...drivers, { ...driverData, id: Date.now() }]);
    }
    setSelectedDriver(null);
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setShowDriverModal(true);
  };

  const handleDeleteDriver = (driverId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
      setDrivers(drivers.filter(d => d.id !== driverId));
    }
  };

  // Handlers: Véhicules
  const handleSaveVehicle = (vehicleData) => {
    if (editingVehicle) {
      setVehicles((prev) => prev.map((v) => (v.id === editingVehicle.id ? { ...vehicleData, id: editingVehicle.id } : v)));
    } else {
      setVehicles((prev) => [...prev, { ...vehicleData, id: Date.now() }]);
    }
    setEditingVehicle(null);
    setShowVehicleModal(false);
  };
  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowVehicleModal(true);
  };
  const handleDeleteVehicle = (vehicleId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
  };
  const filteredVehicles = vehicles.filter((v) => {
    const s = vehicleSearch.toLowerCase();
    return (
      (v.plaque_immatriculation || '').toLowerCase().includes(s) ||
      (v.marque || '').toLowerCase().includes(s) ||
      (v.modele || '').toLowerCase().includes(s)
    );
  });

  // Handlers: Courses (Supabase/local fallback)
  const handleAddCourse = () => {
    setEditingCourse(null);
    setShowCourseModal(true);
  };
  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseModal(true);
  };
  const handleSaveCourse = async (courseData) => {
    try {
      setSavingCourse(true);
      const saved = await upsertCourse(courseData);
      setCourses((prev) => {
        const idx = prev.findIndex((c) => c.id === saved.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        }
        return [...prev, saved];
      });
      setEditingCourse(null);
      setShowCourseModal(false);
    } catch (e) {
      console.error('Erreur enregistrement course:', e);
    } finally {
      setSavingCourse(false);
    }
  };
  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Supprimer cette course ?')) return;
    try {
      await removeCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error('Erreur suppression course:', e);
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

  // Handlers: Charges (local)
  const handleAddCharge = () => {
    setEditingCharge(null);
    setShowChargeModal(true);
  };
  const handleSaveCharge = (chargeData) => {
    if (editingCharge) {
      setCharges((prev) => prev.map((ch) => (ch.id === editingCharge.id ? { ...chargeData, id: editingCharge.id } : ch)));
    } else {
      setCharges((prev) => [...prev, { ...chargeData, id: Date.now() }]);
    }
    setEditingCharge(null);
    setShowChargeModal(false);
  };
  const handleEditCharge = (charge) => {
    setEditingCharge(charge);
    setShowChargeModal(true);
  };
  const handleDeleteCharge = (id) => {
    if (!window.confirm('Supprimer cette charge ?')) return;
    setCharges((prev) => prev.filter((ch) => ch.id !== id));
  };
  const chargesTotal = charges.reduce((sum, ch) => sum + (Number(ch.montant) || 0), 0);

  // Créer une nouvelle feuille de route (administration)
  const handleCreateShift = (data) => {
    const recettes = courses.reduce((sum, c) => sum + (Number(c.sommes_percues) || 0), 0);
    const chargesAmount = data.skipCharges ? 0 : chargesTotal;
    const newShift = {
      id: Date.now(),
      date: data.date,
      chauffeur_id: Number(data.chauffeur_id) || data.chauffeur_id,
      vehicule_id: Number(data.vehicule_id) || data.vehicule_id,
      heure_debut: data.heure_debut,
      heure_fin: data.heure_fin || '',
      nb_courses: courses.length,
      recettes: Number(recettes),
      charges: Number(chargesAmount),
      statut: 'Planifiée'
    };
    setShifts((prev) => [...prev, newShift]);
    setShowNewShiftModal(false);
  };

  // Filtre: Chauffeurs
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalDrivers: drivers.length,
    activeDrivers: drivers.filter(d => d.statut === 'Actif').length,
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.statut === 'En service').length,
    todayRevenue: shifts.reduce((sum, s) => sum + s.recettes, 0)
  };

  return (
    <Page title="TxApp - Administration">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🚕 TxApp - Administration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestion complète de votre flotte de taxis
            </p>
          </div>

          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="transition-all duration-300">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <UsersIcon className="h-12 w-12 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Chauffeurs actifs
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.activeDrivers}/{stats.totalDrivers}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <TruckIcon className="h-12 w-12 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Véhicules en service
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.activeVehicles}/{stats.totalVehicles}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <CurrencyEuroIcon className="h-12 w-12 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Recettes totales
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.todayRevenue.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Activité récente
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {shifts.map(shift => {
                        const driver = drivers.find(d => d.id === shift.chauffeur_id);
                        const vehicle = vehicles.find(v => v.id === shift.vehicule_id);
                        return (
                          <div key={shift.id} className="flex items-center justify-between py-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {driver ? `${driver.prenom} ${driver.nom}` : 'Chauffeur inconnu'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {vehicle?.plaque_immatriculation} • {shift.date} • {shift.nb_courses} courses
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-green-600">
                                {shift.recettes.toFixed(2)}€
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {shift.statut}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'drivers' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
                      
                      <button
                        onClick={() => {
                          setSelectedDriver(null);
                          setShowDriverModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Nouveau chauffeur
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
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
                                <button
                                  onClick={() => handleEditDriver(driver)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Modifier"
                                >
                                  <PencilSquareIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDriver(driver.id)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  title="Supprimer"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vehicles' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
                      <button
                        onClick={() => { setEditingVehicle(null); setShowVehicleModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Nouveau véhicule
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
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
                                <button onClick={() => handleEditVehicle(v)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400" title="Modifier">
                                  <PencilSquareIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => handleDeleteVehicle(v.id)} className="text-red-600 hover:text-red-900 dark:text-red-400" title="Supprimer">
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shifts' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Feuilles de Route
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowNewShiftModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                      title="Créer une nouvelle feuille de route"
                    >
                      <PlusIcon className="h-5 w-5" />
                      Nouvelle feuille
                    </button>
                    <button
                      onClick={handleDownloadReport}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      title="Télécharger la feuille de route"
                    >
                      <PrinterIcon className="h-5 w-5" />
                      Télécharger
                    </button>
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
                            <td className="px-6 py-4 whitespace-nowrap">{s.recettes.toFixed(2)}€</td>
                            <td className="px-6 py-4 whitespace-nowrap">{s.charges.toFixed(2)}€</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">{s.statut}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
                      <button
                        onClick={handleAddCourse}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Nouvelle course
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
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
                                <button onClick={() => handleEditCourse(c)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400" title="Modifier">
                                  <PencilSquareIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => handleDeleteCourse(c.id)} className="text-red-600 hover:text-red-900 dark:text-red-400" title="Supprimer">
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'charges' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gestion des Charges</h2>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-700 dark:text-gray-200">Total: <span className="font-semibold">{chargesTotal.toFixed(2)}€</span></div>
                      <button
                        onClick={handleAddCharge}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Nouvelle charge
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
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
                                <button onClick={() => handleEditCharge(ch)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400" title="Modifier">
                                  <PencilSquareIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => handleDeleteCharge(ch.id)} className="text-red-600 hover:text-red-900 dark:text-red-400" title="Supprimer">
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
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