import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import {
  XMarkIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { useShiftHistory } from 'hooks/useShiftHistory';
import { useAuth } from 'hooks/useAuth';

export function HistoryModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    searchTerm: ''
  });
  const [selectedShift, setSelectedShift] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    shifts,
    isLoading,
    pagination,
    fetchShifts,
    getShiftDetails,
    exportShiftData,
    setPagination
  } = useShiftHistory(user?.chauffeur_id);

  useEffect(() => {
    if (isOpen) {
      // Set default date range to last 30 days
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

      setFilters(prev => ({
        ...prev,
        dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
        dateTo: today.toISOString().split('T')[0]
      }));
    }
  }, [isOpen]);

  const handleSearch = () => {
    fetchShifts(filters);
  };

  const handleViewDetails = async (shiftId) => {
    try {
      const shiftDetails = await getShiftDetails(shiftId);
      setSelectedShift(shiftDetails);
    } catch (err) {
      console.error('Error fetching shift details:', err);
    }
  };

  const handleExport = async () => {
    try {
      const csvData = await exportShiftData([], 'csv');
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historique-feuilles-route-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Terminée': return 'bg-green-100 text-green-800';
      case 'En cours': return 'bg-yellow-100 text-yellow-800';
      case 'Annulée': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateShiftStats = () => {
    const totalShifts = shifts.length;
    const completedShifts = shifts.filter(s => s.statut === 'Terminée').length;
    const totalRevenue = shifts.reduce((sum, s) => {
      return sum + (s.courses?.reduce((courseSum, c) => courseSum + (parseFloat(c.somme_percue) || 0), 0) || 0);
    }, 0);
    const totalExpenses = shifts.reduce((sum, s) => {
      return sum + (s.expenses?.reduce((expenseSum, e) => expenseSum + (parseFloat(e.montant) || 0), 0) || 0);
    }, 0);

    return { totalShifts, completedShifts, totalRevenue, totalExpenses };
  };

  const stats = calculateShiftStats();

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-6xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 text-blue-500 mr-2" />
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  Historique des feuilles de route
                </Dialog.Title>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                  title="Filtres"
                >
                  <FunnelIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleExport}
                  className="text-gray-400 hover:text-gray-600 p-2"
                  title="Exporter"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Statistics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Total feuilles</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalShifts}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Terminées</p>
                  <p className="text-2xl font-bold text-green-900">{stats.completedShifts}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600">Recettes totales</p>
                  <p className="text-2xl font-bold text-purple-900">€{stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-600">Charges totales</p>
                  <p className="text-2xl font-bold text-orange-900">€{stats.totalExpenses.toFixed(2)}</p>
                </div>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date début
                      </label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date fin
                      </label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Statut
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Tous</option>
                        <option value="En cours">En cours</option>
                        <option value="Terminée">Terminée</option>
                        <option value="Annulée">Annulée</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleSearch}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                      >
                        <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                        Rechercher
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Shifts Table */}
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Véhicule
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Horaires
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Courses
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recettes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {shifts.map((shift) => {
                        const totalRevenue = shift.courses?.reduce((sum, c) => sum + (parseFloat(c.somme_percue) || 0), 0) || 0;
                        const courseCount = shift.courses?.length || 0;

                        return (
                          <tr key={shift.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-2" />
                                {formatDate(shift.date)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {shift.vehicule?.plaque_immatriculation}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div>{formatTime(shift.heure_debut)} - {formatTime(shift.heure_fin)}</div>
                                {shift.km_parcourus && (
                                  <div className="text-xs text-gray-500">{shift.km_parcourus} km</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="text-center">
                                <div className="font-medium">{courseCount}</div>
                                <div className="text-xs text-gray-500">courses</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="font-medium">€{totalRevenue.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shift.statut)}`}>
                                {shift.statut}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleViewDetails(shift.id)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <EyeIcon className="h-4 w-4 mr-1" />
                                Voir
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {shifts.length === 0 && (
                    <div className="text-center py-12">
                      <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Aucune feuille de route</h3>
                      <p className="text-sm text-gray-500">
                        Aucune feuille de route trouvée pour les critères sélectionnés
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Affichage de {((pagination.page - 1) * pagination.pageSize) + 1} à{' '}
                    {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} sur{' '}
                    {pagination.totalItems} résultats
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Précédent
                    </button>
                    <span className="px-3 py-1">
                      Page {pagination.page} sur {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Shift Details Modal */}
      {selectedShift && (
        <ShiftDetailsModal
          shift={selectedShift}
          isOpen={!!selectedShift}
          onClose={() => setSelectedShift(null)}
        />
      )}
    </>
  );
}

// Shift Details Modal Component
function ShiftDetailsModal({ shift, isOpen, onClose }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalRevenue = shift.courses?.reduce((sum, c) => sum + (parseFloat(c.somme_percue) || 0), 0) || 0;
  const totalExpenses = shift.expenses?.reduce((sum, e) => sum + (parseFloat(e.montant) || 0), 0) || 0;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-60">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Détails de la feuille de route - {formatDate(shift.date)}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Shift Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Informations générales</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Véhicule:</strong> {shift.vehicule?.plaque_immatriculation}</p>
                  <p><strong>Début:</strong> {formatTime(shift.heure_debut)}</p>
                  <p><strong>Fin:</strong> {formatTime(shift.heure_fin)}</p>
                  <p><strong>Statut:</strong> {shift.statut}</p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Kilométrage</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Début:</strong> {shift.km_debut?.toLocaleString()} km</p>
                  <p><strong>Fin:</strong> {shift.km_fin?.toLocaleString() || '-'} km</p>
                  <p><strong>Parcourus:</strong> {shift.km_parcourus?.toLocaleString() || '-'} km</p>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">Financier</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Recettes:</strong> €{totalRevenue.toFixed(2)}</p>
                  <p><strong>Charges:</strong> €{totalExpenses.toFixed(2)}</p>
                  <p><strong>Net:</strong> €{(totalRevenue - totalExpenses).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Courses */}
            {shift.courses && shift.courses.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Courses ({shift.courses.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Embarquement
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Débarquement
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Prix
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Perçu
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Mode
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {shift.courses.map((course) => (
                        <tr key={course.id}>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{course.lieu_embarquement}</div>
                              <div className="text-xs text-gray-500">
                                {formatTime(course.heure_embarquement)} - Index {course.index_depart}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{course.lieu_debarquement || '-'}</div>
                              <div className="text-xs text-gray-500">
                                {formatTime(course.heure_debarquement)} - Index {course.index_arrivee || '-'}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            €{parseFloat(course.prix_taximetre || 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            €{parseFloat(course.somme_percue || 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {course.mode_paiement?.libelle || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Expenses */}
            {shift.expenses && shift.expenses.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Charges ({shift.expenses.length})
                </h3>
                <div className="space-y-2">
                  {shift.expenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{expense.description}</div>
                        <div className="text-xs text-gray-500">{expense.type_charge}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">€{parseFloat(expense.montant).toFixed(2)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(expense.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {shift.notes && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                  {shift.notes}
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
