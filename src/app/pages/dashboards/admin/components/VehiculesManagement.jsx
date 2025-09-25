import { useState, useEffect } from 'react';
import { fetchVehicules, createVehicule, updateVehicule, deleteVehicule, getVehiculeRentabilite } from '../../../../services/adminService';

const VehiculesManagement = () => {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicule, setEditingVehicule] = useState(null);
  const [rentabiliteData, setRentabiliteData] = useState({});
  const [formData, setFormData] = useState({
    immatriculation: '',
    marque: '',
    modele: '',
    annee: '',
    couleur: '',
    statut: 'ACTIF',
    type_vehicule: 'TAXI',
    nombre_places: 4,
    proprietaire: '',
    cout_acquisition: 0,
    cout_maintenance_mensuel: 0,
    assurance_annuelle: 0
  });

  useEffect(() => {
    loadVehicules();
  }, []);

  const loadVehicules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVehicules();
      setVehicules(data);

      // Charger la rentabilité pour chaque véhicule
      const rentabilitePromises = data.map(vehicule =>
        getVehiculeRentabilite(vehicule.id).catch(() => null)
      );
      const rentabiliteResults = await Promise.all(rentabilitePromises);
      const rentabiliteMap = {};
      data.forEach((vehicule, index) => {
        rentabiliteMap[vehicule.id] = rentabiliteResults[index];
      });
      setRentabiliteData(rentabiliteMap);
    } catch (err) {
      console.error('Erreur lors du chargement des véhicules:', err);
      setError('Erreur lors du chargement des véhicules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const vehiculeData = {
        ...formData,
        annee: parseInt(formData.annee) || null,
        nombre_places: parseInt(formData.nombre_places) || 4,
        cout_acquisition: parseFloat(formData.cout_acquisition) || 0,
        cout_maintenance_mensuel: parseFloat(formData.cout_maintenance_mensuel) || 0,
        assurance_annuelle: parseFloat(formData.assurance_annuelle) || 0
      };

      if (editingVehicule) {
        await updateVehicule(editingVehicule.id, vehiculeData);
      } else {
        await createVehicule(vehiculeData);
      }

      await loadVehicules();
      closeModal();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Erreur lors de la sauvegarde du véhicule');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehiculeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteVehicule(vehiculeId);
      await loadVehicules();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression du véhicule');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (vehicule = null) => {
    if (vehicule) {
      setEditingVehicule(vehicule);
      setFormData({
        immatriculation: vehicule.immatriculation || '',
        marque: vehicule.marque || '',
        modele: vehicule.modele || '',
        annee: vehicule.annee || '',
        couleur: vehicule.couleur || '',
        statut: vehicule.statut || 'ACTIF',
        type_vehicule: vehicule.type_vehicule || 'TAXI',
        nombre_places: vehicule.nombre_places || 4,
        proprietaire: vehicule.proprietaire || '',
        cout_acquisition: vehicule.cout_acquisition || 0,
        cout_maintenance_mensuel: vehicule.cout_maintenance_mensuel || 0,
        assurance_annuelle: vehicule.assurance_annuelle || 0
      });
    } else {
      setEditingVehicule(null);
      setFormData({
        immatriculation: '',
        marque: '',
        modele: '',
        annee: '',
        couleur: '',
        statut: 'ACTIF',
        type_vehicule: 'TAXI',
        nombre_places: 4,
        proprietaire: '',
        cout_acquisition: 0,
        cout_maintenance_mensuel: 0,
        assurance_annuelle: 0
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVehicule(null);
    setFormData({
      immatriculation: '',
      marque: '',
      modele: '',
      annee: '',
      couleur: '',
      statut: 'ACTIF',
      type_vehicule: 'TAXI',
      nombre_places: 4,
      proprietaire: '',
      cout_acquisition: 0,
      cout_maintenance_mensuel: 0,
      assurance_annuelle: 0
    });
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'ACTIF': return 'bg-green-100 text-green-800';
      case 'INACTIF': return 'bg-red-100 text-red-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const getRentabiliteColor = (rentabilite) => {
    if (!rentabilite) return 'text-gray-500';
    const ratio = rentabilite.ratio_rentabilite;
    if (ratio >= 1.2) return 'text-green-600';
    if (ratio >= 1.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading && vehicules.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Véhicules
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez la flotte de véhicules et consultez leur rentabilité
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter Véhicule
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Liste des véhicules */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Flotte de Véhicules ({vehicules.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Immatriculation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marque & Modèle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenus (30j)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coûts (30j)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rentabilité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicules.map((vehicule) => {
                const rentabilite = rentabiliteData[vehicule.id];
                return (
                  <tr key={vehicule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {vehicule.immatriculation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vehicule.marque} {vehicule.modele}
                      </div>
                      <div className="text-xs text-gray-500">
                        {vehicule.annee} • {vehicule.nombre_places} places
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatutColor(vehicule.statut)}`}>
                        {vehicule.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vehicule.type_vehicule}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {rentabilite ? formatCurrency(rentabilite.revenus_30j) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {rentabilite ? formatCurrency(rentabilite.couts_30j) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getRentabiliteColor(rentabilite)}`}>
                        {rentabilite ? `${(rentabilite.ratio_rentabilite * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal(vehicule)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(vehicule.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {vehicules.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun véhicule enregistré
          </div>
        )}
      </div>

      {/* Modal d'ajout/modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingVehicule ? 'Modifier Véhicule' : 'Ajouter Véhicule'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Immatriculation *
                  </label>
                  <input
                    type="text"
                    value={formData.immatriculation}
                    onChange={(e) => setFormData({...formData, immatriculation: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="AA-123-BB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marque *
                  </label>
                  <input
                    type="text"
                    value={formData.marque}
                    onChange={(e) => setFormData({...formData, marque: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modèle *
                  </label>
                  <input
                    type="text"
                    value={formData.modele}
                    onChange={(e) => setFormData({...formData, modele: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Année
                  </label>
                  <input
                    type="number"
                    value={formData.annee}
                    onChange={(e) => setFormData({...formData, annee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2020"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur
                  </label>
                  <input
                    type="text"
                    value={formData.couleur}
                    onChange={(e) => setFormData({...formData, couleur: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Noir"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({...formData, statut: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ACTIF">Actif</option>
                    <option value="INACTIF">Inactif</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type_vehicule}
                    onChange={(e) => setFormData({...formData, type_vehicule: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TAXI">Taxi</option>
                    <option value="VOITURE_PARTICULIERE">Voiture Particulière</option>
                    <option value="UTILITAIRE">Utilitaire</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de places
                  </label>
                  <input
                    type="number"
                    value={formData.nombre_places}
                    onChange={(e) => setFormData({...formData, nombre_places: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="9"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Propriétaire
                  </label>
                  <input
                    type="text"
                    value={formData.proprietaire}
                    onChange={(e) => setFormData({...formData, proprietaire: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom du propriétaire"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informations Financières
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coût d&apos;acquisition (€)
                    </label>
                    <input
                      type="number"
                      value={formData.cout_acquisition}
                      onChange={(e) => setFormData({...formData, cout_acquisition: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maintenance mensuelle (€)
                    </label>
                    <input
                      type="number"
                      value={formData.cout_maintenance_mensuel}
                      onChange={(e) => setFormData({...formData, cout_maintenance_mensuel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assurance annuelle (€)
                    </label>
                    <input
                      type="number"
                      value={formData.assurance_annuelle}
                      onChange={(e) => setFormData({...formData, assurance_annuelle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sauvegarde...' : (editingVehicule ? 'Modifier' : 'Ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiculesManagement;