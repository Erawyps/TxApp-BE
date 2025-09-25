import { useState, useEffect } from 'react';
import { fetchPartenaires, createPartenaire, updatePartenaire, deletePartenaire, fetchPartenaireTransactions, getPartenaireBalance } from '../../../../services/adminService';

const PartenairesManagement = () => {
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPartenaire, setEditingPartenaire] = useState(null);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [selectedPartenaireForTransactions, setSelectedPartenaireForTransactions] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState({});
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    entreprise: '',
    adresse: '',
    ville: '',
    code_postal: '',
    statut: 'ACTIF',
    type_partenaire: 'HOTEL',
    commission_pourcentage: 0,
    conditions_paiement: 'MENSUEL'
  });

  useEffect(() => {
    loadPartenaires();
  }, []);

  const loadPartenaires = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPartenaires();
      setPartenaires(data);

      // Charger les soldes pour chaque partenaire
      const balancePromises = data.map(partenaire =>
        getPartenaireBalance(partenaire.id).catch(() => ({ solde: 0, dernier_paiement: null }))
      );
      const balanceResults = await Promise.all(balancePromises);
      const balanceMap = {};
      data.forEach((partenaire, index) => {
        balanceMap[partenaire.id] = balanceResults[index];
      });
      setBalances(balanceMap);
    } catch (err) {
      console.error('Erreur lors du chargement des partenaires:', err);
      setError('Erreur lors du chargement des partenaires');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const partenaireData = {
        ...formData,
        commission_pourcentage: parseFloat(formData.commission_pourcentage) || 0,
        code_postal: formData.code_postal || null
      };

      if (editingPartenaire) {
        await updatePartenaire(editingPartenaire.id, partenaireData);
      } else {
        await createPartenaire(partenaireData);
      }

      await loadPartenaires();
      closeModal();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Erreur lors de la sauvegarde du partenaire');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (partenaireId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      return;
    }

    try {
      setLoading(true);
      await deletePartenaire(partenaireId);
      await loadPartenaires();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression du partenaire');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (partenaire = null) => {
    if (partenaire) {
      setEditingPartenaire(partenaire);
      setFormData({
        nom: partenaire.nom || '',
        email: partenaire.email || '',
        telephone: partenaire.telephone || '',
        entreprise: partenaire.entreprise || '',
        adresse: partenaire.adresse || '',
        ville: partenaire.ville || '',
        code_postal: partenaire.code_postal || '',
        statut: partenaire.statut || 'ACTIF',
        type_partenaire: partenaire.type_partenaire || 'HOTEL',
        commission_pourcentage: partenaire.commission_pourcentage || 0,
        conditions_paiement: partenaire.conditions_paiement || 'MENSUEL'
      });
    } else {
      setEditingPartenaire(null);
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        entreprise: '',
        adresse: '',
        ville: '',
        code_postal: '',
        statut: 'ACTIF',
        type_partenaire: 'HOTEL',
        commission_pourcentage: 0,
        conditions_paiement: 'MENSUEL'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPartenaire(null);
    setFormData({
      nom: '',
      email: '',
      telephone: '',
      entreprise: '',
      adresse: '',
      ville: '',
      code_postal: '',
      statut: 'ACTIF',
      type_partenaire: 'HOTEL',
      commission_pourcentage: 0,
      conditions_paiement: 'MENSUEL'
    });
  };

  const openTransactionsModal = async (partenaire) => {
    setSelectedPartenaireForTransactions(partenaire);
    try {
      const transactionsData = await fetchPartenaireTransactions(partenaire.id);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Erreur lors du chargement des transactions:', err);
      setTransactions([]);
    }
    setShowTransactionsModal(true);
  };

  const closeTransactionsModal = () => {
    setShowTransactionsModal(false);
    setSelectedPartenaireForTransactions(null);
    setTransactions([]);
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'ACTIF': return 'bg-green-100 text-green-800';
      case 'INACTIF': return 'bg-red-100 text-red-800';
      case 'SUSPENDU': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypePartenaireColor = (type) => {
    switch (type) {
      case 'HOTEL': return 'bg-blue-100 text-blue-800';
      case 'RESTAURANT': return 'bg-orange-100 text-orange-800';
      case 'AGENCE': return 'bg-purple-100 text-purple-800';
      case 'AUTRE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading && partenaires.length === 0) {
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
            Gestion des Partenaires
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les partenaires et consultez leurs soldes et transactions
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter Partenaire
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Liste des partenaires */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Liste des Partenaires ({partenaires.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom & Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernier paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partenaires.map((partenaire) => {
                const balance = balances[partenaire.id] || { solde: 0, dernier_paiement: null };
                return (
                  <tr key={partenaire.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {partenaire.nom}
                      </div>
                      <div className="text-sm text-gray-500">
                        {partenaire.entreprise}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {partenaire.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {partenaire.telephone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypePartenaireColor(partenaire.type_partenaire)}`}>
                        {partenaire.type_partenaire}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatutColor(partenaire.statut)}`}>
                        {partenaire.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {partenaire.commission_pourcentage}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${balance.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(balance.solde)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(balance.dernier_paiement)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal(partenaire)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => openTransactionsModal(partenaire)}
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        Transactions
                      </button>
                      <button
                        onClick={() => handleDelete(partenaire.id)}
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

        {partenaires.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun partenaire enregistré
          </div>
        )}
      </div>

      {/* Modal d'ajout/modification partenaire */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPartenaire ? 'Modifier Partenaire' : 'Ajouter Partenaire'}
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
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entreprise *
                  </label>
                  <input
                    type="text"
                    value={formData.entreprise}
                    onChange={(e) => setFormData({...formData, entreprise: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+33 6 XX XX XX XX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de partenaire
                  </label>
                  <select
                    value={formData.type_partenaire}
                    onChange={(e) => setFormData({...formData, type_partenaire: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HOTEL">Hôtel</option>
                    <option value="RESTAURANT">Restaurant</option>
                    <option value="AGENCE">Agence</option>
                    <option value="AUTRE">Autre</option>
                  </select>
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
                    <option value="SUSPENDU">Suspendu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission (%)
                  </label>
                  <input
                    type="number"
                    value={formData.commission_pourcentage}
                    onChange={(e) => setFormData({...formData, commission_pourcentage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conditions de paiement
                </label>
                <select
                  value={formData.conditions_paiement}
                  onChange={(e) => setFormData({...formData, conditions_paiement: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MENSUEL">Mensuel</option>
                  <option value="TRIMESTRIEL">Trimestriel</option>
                  <option value="ANNUEL">Annuel</option>
                  <option value="A_ECHEANCE">À échéance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 rue de la Paix"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.ville}
                    onChange={(e) => setFormData({...formData, ville: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.code_postal}
                    onChange={(e) => setFormData({...formData, code_postal: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="75001"
                  />
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
                  {loading ? 'Sauvegarde...' : (editingPartenaire ? 'Modifier' : 'Ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal des transactions */}
      {showTransactionsModal && selectedPartenaireForTransactions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Transactions - {selectedPartenaireForTransactions.nom} ({selectedPartenaireForTransactions.entreprise})
              </h2>
              <button
                onClick={closeTransactionsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  Solde actuel: <span className={`font-medium ${balances[selectedPartenaireForTransactions.id]?.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(balances[selectedPartenaireForTransactions.id]?.solde || 0)}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(transaction.date_transaction)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.type_transaction === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type_transaction}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {transaction.description || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            transaction.type_transaction === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type_transaction === 'CREDIT' ? '+' : '-'}{formatCurrency(transaction.montant)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.statut === 'PAYE' ? 'bg-green-100 text-green-800' :
                            transaction.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {transactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucune transaction trouvée
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartenairesManagement;