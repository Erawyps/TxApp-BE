import { useState, useEffect } from 'react';
import { encodeFeuilleRouteAdmin, fetchFeuillesRouteForAdmin } from '../../../../services/adminService';

const FeuilleRouteEncoding = () => {
  const [pendingFeuilles, setPendingFeuilles] = useState([]);
  const [selectedFeuille, setSelectedFeuille] = useState(null);
  const [courses, setCourses] = useState([]);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPendingFeuilles();
  }, []);

  const loadPendingFeuilles = async () => {
    try {
      setLoading(true);
      const feuilles = await fetchFeuillesRouteForAdmin();
      setPendingFeuilles(feuilles);
    } catch (err) {
      console.error('Erreur lors du chargement des feuilles:', err);
      setError('Erreur lors du chargement des feuilles de route');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFeuille = (feuille) => {
    setSelectedFeuille(feuille);
    // Initialiser avec des courses vides pour l'encodage rapide
    setCourses([{
      id: 'temp-1',
      numero_ordre: 1,
      index_embarquement: '',
      index_debarquement: '',
      somme_percue: '',
      mode_paiement: 'CASH',
      obligatoire: true
    }]);
    setCharges([]);
  };

  const addCourse = () => {
    const newCourse = {
      id: `temp-${courses.length + 1}`,
      numero_ordre: courses.length + 1,
      index_embarquement: '',
      index_debarquement: '',
      somme_percue: '',
      mode_paiement: 'CASH',
      obligatoire: false
    };
    setCourses([...courses, newCourse]);
  };

  const updateCourse = (index, field, value) => {
    const updatedCourses = [...courses];
    updatedCourses[index][field] = value;
    setCourses(updatedCourses);
  };

  const removeCourse = (index) => {
    if (courses.length > 1) {
      const updatedCourses = courses.filter((_, i) => i !== index);
      // Réorganiser les numéros d'ordre
      updatedCourses.forEach((course, i) => {
        course.numero_ordre = i + 1;
      });
      setCourses(updatedCourses);
    }
  };

  const addCharge = () => {
    const newCharge = {
      id: `charge-${charges.length + 1}`,
      description: '',
      montant: '',
      obligatoire: false
    };
    setCharges([...charges, newCharge]);
  };

  const updateCharge = (index, field, value) => {
    const updatedCharges = [...charges];
    updatedCharges[index][field] = value;
    setCharges(updatedCharges);
  };

  const removeCharge = (index) => {
    const updatedCharges = charges.filter((_, i) => i !== index);
    setCharges(updatedCharges);
  };

  const validateForm = () => {
    // Validation des champs obligatoires
    const requiredCourses = courses.filter(course => course.obligatoire);
    for (const course of requiredCourses) {
      if (!course.index_embarquement || !course.index_debarquement || !course.somme_percue) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const feuilleData = {
        feuille_route_id: selectedFeuille.id,
        courses: courses.filter(course => !course.id.startsWith('temp-')).map(course => ({
          ...course,
          index_depart: course.index_embarquement, // Mapping pour compatibilité
          index_arrivee: course.index_debarquement
        })),
        charges: charges
      };

      await encodeFeuilleRouteAdmin(feuilleData);

      // Recharger la liste
      await loadPendingFeuilles();
      setSelectedFeuille(null);
      setCourses([]);
      setCharges([]);

      alert('Feuille de route encodée avec succès !');
    } catch (err) {
      console.error('Erreur lors de l\'encodage:', err);
      setError('Erreur lors de l\'encodage de la feuille de route');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !selectedFeuille) {
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
          Encodage Feuille de Route (Administration)
        </h1>
        <p className="text-gray-600 mt-1">
          Encodez rapidement les feuilles de route avec validation simplifiée
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!selectedFeuille ? (
        // Liste des feuilles en attente
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Feuilles de route en attente d&apos;encodage
            </h2>
          </div>
          <div className="p-6">
            {pendingFeuilles.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucune feuille de route en attente
              </p>
            ) : (
              <div className="space-y-4">
                {pendingFeuilles.map((feuille) => (
                  <div key={feuille.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Feuille #{feuille.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Chauffeur: {feuille.chauffeur?.nom} {feuille.chauffeur?.prenom}
                        </p>
                        <p className="text-sm text-gray-600">
                          Date: {new Date(feuille.date_creation).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectFeuille(feuille)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Encoder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Formulaire d'encodage
        <div className="space-y-6">
          {/* En-tête */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Encodage - Feuille #{selectedFeuille.id}
                </h2>
                <p className="text-gray-600">
                  Chauffeur: {selectedFeuille.chauffeur?.nom} {selectedFeuille.chauffeur?.prenom}
                </p>
              </div>
              <button
                onClick={() => setSelectedFeuille(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Retour à la liste
              </button>
            </div>
          </div>

          {/* Courses - Tableau rapide */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Liste des courses
                </h3>
                <button
                  onClick={addCourse}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  + Ajouter course
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        N°
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Index Embarquement *
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Index Débarquement *
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Sommes Percues *
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Mode Paiement
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course, index) => (
                      <tr key={course.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {course.numero_ordre}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={course.index_embarquement}
                            onChange={(e) => updateCourse(index, 'index_embarquement', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              course.obligatoire && !course.index_embarquement ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Index embarquement"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={course.index_debarquement}
                            onChange={(e) => updateCourse(index, 'index_debarquement', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              course.obligatoire && !course.index_debarquement ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Index débarquement"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={course.somme_percue}
                            onChange={(e) => updateCourse(index, 'somme_percue', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              course.obligatoire && !course.somme_percue ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Montant perçu"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={course.mode_paiement}
                            onChange={(e) => updateCourse(index, 'mode_paiement', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="CASH">Espèces</option>
                            <option value="CARD">Carte</option>
                            <option value="FACTURE">Facture</option>
                            <option value="VIREMENT">Virement</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {courses.length > 1 && (
                            <button
                              onClick={() => removeCourse(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Supprimer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Champs obligatoires pour l&apos;encodage admin
              </p>
            </div>
          </div>

          {/* Charges - Optionnelles */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Charges (Optionnelles)
                </h3>
                <button
                  onClick={addCharge}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                >
                  + Ajouter charge
                </button>
              </div>
            </div>
            <div className="p-6">
              {charges.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucune charge ajoutée (optionnel)
                </p>
              ) : (
                <div className="space-y-4">
                  {charges.map((charge, index) => (
                    <div key={charge.id} className="flex items-center space-x-4">
                      <input
                        type="text"
                        value={charge.description}
                        onChange={(e) => updateCharge(index, 'description', e.target.value)}
                        placeholder="Description de la charge"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={charge.montant}
                        onChange={(e) => updateCharge(index, 'montant', e.target.value)}
                        placeholder="Montant"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeCharge(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bouton de validation */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Encodage en cours...' : 'Valider l\'encodage'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeuilleRouteEncoding;