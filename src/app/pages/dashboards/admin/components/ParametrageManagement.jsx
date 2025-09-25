import { useState, useEffect } from 'react';
import { fetchParametrage, updateParametrage } from '../../../../services/adminService';

const ParametrageManagement = () => {
  const [parametrage, setParametrage] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadParametrage();
  }, []);

  const loadParametrage = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchParametrage();
      setParametrage(data);
    } catch (err) {
      console.error('Erreur lors du chargement du paramétrage:', err);
      setError('Erreur lors du chargement du paramétrage');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      await updateParametrage(parametrage);
      // Recharger pour confirmer la sauvegarde
      await loadParametrage();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Erreur lors de la sauvegarde du paramétrage');
    } finally {
      setSaving(false);
    }
  };

  const updateParametrageField = (field, value) => {
    setParametrage(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateRemunerationType = (index, field, value) => {
    const updatedTypes = [...(parametrage.types_remuneration || [])];
    updatedTypes[index] = {
      ...updatedTypes[index],
      [field]: value
    };
    updateParametrageField('types_remuneration', updatedTypes);
  };

  const addRemunerationType = () => {
    const newType = {
      nom: '',
      description: '',
      tarif_base: 0,
      tarif_km: 0,
      tarif_minute: 0,
      actif: true
    };
    const updatedTypes = [...(parametrage.types_remuneration || []), newType];
    updateParametrageField('types_remuneration', updatedTypes);
  };

  const removeRemunerationType = (index) => {
    const updatedTypes = (parametrage.types_remuneration || []).filter((_, i) => i !== index);
    updateParametrageField('types_remuneration', updatedTypes);
  };

  const updatePaymentMode = (index, field, value) => {
    const updatedModes = [...(parametrage.modes_paiement || [])];
    updatedModes[index] = {
      ...updatedModes[index],
      [field]: value
    };
    updateParametrageField('modes_paiement', updatedModes);
  };

  const addPaymentMode = () => {
    const newMode = {
      nom: '',
      description: '',
      frais_pourcentage: 0,
      actif: true
    };
    const updatedModes = [...(parametrage.modes_paiement || []), newMode];
    updateParametrageField('modes_paiement', updatedModes);
  };

  const removePaymentMode = (index) => {
    const updatedModes = (parametrage.modes_paiement || []).filter((_, i) => i !== index);
    updateParametrageField('modes_paiement', updatedModes);
  };

  if (loading) {
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Paramétrage Système
        </h1>
        <p className="text-gray-600 mt-1">
          Configurez les paramètres globaux du système de taxi
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Paramètres généraux */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Paramètres Généraux
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarif de base (€)
              </label>
              <input
                type="number"
                value={parametrage.tarif_base || 0}
                onChange={(e) => updateParametrageField('tarif_base', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarif kilométrique (€)
              </label>
              <input
                type="number"
                value={parametrage.tarif_km || 0}
                onChange={(e) => updateParametrageField('tarif_km', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarif minute (€)
              </label>
              <input
                type="number"
                value={parametrage.tarif_minute || 0}
                onChange={(e) => updateParametrageField('tarif_minute', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Majoration nuit (€)
              </label>
              <input
                type="number"
                value={parametrage.majoration_nuit || 0}
                onChange={(e) => updateParametrageField('majoration_nuit', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Majoration weekend (€)
              </label>
              <input
                type="number"
                value={parametrage.majoration_weekend || 0}
                onChange={(e) => updateParametrageField('majoration_weekend', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commission partenaire (%)
              </label>
              <input
                type="number"
                value={parametrage.commission_partenaire || 0}
                onChange={(e) => updateParametrageField('commission_partenaire', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Types de rémunération */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Types de Rémunération
            </h2>
            <button
              type="button"
              onClick={addRemunerationType}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Ajouter
            </button>
          </div>

          <div className="space-y-4">
            {(parametrage.types_remuneration || []).map((type, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={type.nom || ''}
                        onChange={(e) => updateRemunerationType(index, 'nom', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={type.description || ''}
                        onChange={(e) => updateRemunerationType(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tarif de base (€)
                      </label>
                      <input
                        type="number"
                        value={type.tarif_base || 0}
                        onChange={(e) => updateRemunerationType(index, 'tarif_base', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tarif km (€)
                      </label>
                      <input
                        type="number"
                        value={type.tarif_km || 0}
                        onChange={(e) => updateRemunerationType(index, 'tarif_km', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tarif minute (€)
                      </label>
                      <input
                        type="number"
                        value={type.tarif_minute || 0}
                        onChange={(e) => updateRemunerationType(index, 'tarif_minute', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={type.actif || false}
                        onChange={(e) => updateRemunerationType(index, 'actif', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Actif
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRemunerationType(index)}
                    className="ml-4 text-red-600 hover:text-red-900"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {(parametrage.types_remuneration || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun type de rémunération défini
              </div>
            )}
          </div>
        </div>

        {/* Modes de paiement */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Modes de Paiement
            </h2>
            <button
              type="button"
              onClick={addPaymentMode}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Ajouter
            </button>
          </div>

          <div className="space-y-4">
            {(parametrage.modes_paiement || []).map((mode, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={mode.nom || ''}
                        onChange={(e) => updatePaymentMode(index, 'nom', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={mode.description || ''}
                        onChange={(e) => updatePaymentMode(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frais (%)
                      </label>
                      <input
                        type="number"
                        value={mode.frais_pourcentage || 0}
                        onChange={(e) => updatePaymentMode(index, 'frais_pourcentage', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-center md:col-span-2">
                      <input
                        type="checkbox"
                        checked={mode.actif || false}
                        onChange={(e) => updatePaymentMode(index, 'actif', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Actif
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePaymentMode(index)}
                    className="ml-4 text-red-600 hover:text-red-900"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {(parametrage.modes_paiement || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun mode de paiement défini
              </div>
            )}
          </div>
        </div>

        {/* Boutons de sauvegarde */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={loadParametrage}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler les modifications
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder le paramétrage'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParametrageManagement;