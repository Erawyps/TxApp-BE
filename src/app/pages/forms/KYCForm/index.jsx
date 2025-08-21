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
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

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

const TxAppAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [drivers, setDrivers] = useState(mockDrivers);
  const [vehicles] = useState(mockVehicles);
  const [shifts] = useState(mockShifts);
  
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Gestion des Véhicules
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Interface de gestion des véhicules à venir...
                </p>
              </div>
            )}

            {activeTab === 'shifts' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Feuilles de Route
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Interface de gestion des feuilles de route à venir...
                </p>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Gestion des Courses
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Interface d’analyse des courses à venir...
                </p>
              </div>
            )}

            {activeTab === 'charges' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Gestion des Charges
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Interface de gestion des charges à venir...
                </p>
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
        </div>
      </div>
    </Page>
  );
};

export default TxAppAdmin;