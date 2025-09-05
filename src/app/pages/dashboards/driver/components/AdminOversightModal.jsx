import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import {
  XMarkIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyEuroIcon,
  TruckIcon,
  ArrowDownTrayIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useAdminOversight } from 'hooks/useAdminOversight';

// eslint-disable-next-line react-refresh/only-export-components
export function AdminOversightModal({ isOpen, onClose }) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedShift, setSelectedShift] = useState(null);

  const oversightData = useAdminOversight();
  const {
    activeShifts,
    realtimeUpdates,
    alerts,
    isLoading,
    resolveAlert,
    getShiftPerformanceMetrics,
    exportLiveData
  } = oversightData || {};

  const metrics = (getShiftPerformanceMetrics && getShiftPerformanceMetrics()) || {
    activeShiftsCount: 0,
    totalRevenue: 0,
    totalCourses: 0,
    alertsCount: 0,
    averageRevenuePerShift: 0,
    averageCoursesPerShift: 0,
    netRevenue: 0
  };

  const handleExportData = async () => {
    try {
      const csvData = await exportLiveData('csv');
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `supervision-temps-reel-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getAlertSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUpdateTypeIcon = (type) => {
    switch (type) {
      case 'shift': return TruckIcon;
      case 'course': return ClockIcon;
      case 'expense': return CurrencyEuroIcon;
      default: return BellIcon;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: EyeIcon },
    { id: 'shifts', label: 'Feuilles actives', icon: TruckIcon },
    { id: 'alerts', label: 'Alertes', icon: ExclamationTriangleIcon },
    { id: 'realtime', label: 'Temps réel', icon: BellIcon }
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-7xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <EyeIcon className="h-6 w-6 text-blue-500 mr-2" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Supervision Administrative - Vue d&apos;ensemble temps réel
              </Dialog.Title>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportData}
                className="text-gray-400 hover:text-gray-600 p-2"
                title="Exporter les données"
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

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  {tab.id === 'alerts' && alerts.length > 0 && (
                    <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                      {alerts.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <TruckIcon className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">Feuilles actives</p>
                        <p className="text-2xl font-bold text-blue-900">{metrics.activeShiftsCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <CurrencyEuroIcon className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">Recettes temps réel</p>
                        <p className="text-2xl font-bold text-green-900">€{metrics.totalRevenue.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center">
                      <ClockIcon className="h-8 w-8 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">Courses totales</p>
                        <p className="text-2xl font-bold text-purple-900">{metrics.totalCourses}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-600">Alertes actives</p>
                        <p className="text-2xl font-bold text-red-900">{metrics.alertsCount}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Résumé des performances</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Recette moyenne par feuille</p>
                      <p className="text-xl font-bold text-gray-900">€{metrics.averageRevenuePerShift.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Courses moyenne par feuille</p>
                      <p className="text-xl font-bold text-gray-900">{metrics.averageCoursesPerShift.toFixed(1)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Résultat net total</p>
                      <p className={`text-xl font-bold ${metrics.netRevenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        €{metrics.netRevenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Activité récente</h3>
                  <div className="space-y-2">
                    {realtimeUpdates.slice(0, 5).map((update) => {
                      const IconComponent = getUpdateTypeIcon(update.type);
                      return (
                        <div key={update.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <IconComponent className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {update.type === 'course' && 'Nouvelle course'}
                              {update.type === 'expense' && 'Nouvelle charge'}
                              {update.type === 'shift' && 'Mise à jour feuille'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {update.timestamp.toLocaleTimeString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Active Shifts Tab */}
            {selectedTab === 'shifts' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Feuilles de route actives ({activeShifts.length})
                  </h3>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {activeShifts.map((shift) => (
                      <div key={shift.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {shift.chauffeur.prenom} {shift.chauffeur.nom}
                            </h4>
                            <p className="text-sm text-gray-500">{shift.vehicule.plaque_immatriculation}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{formatDate(shift.date)}</p>
                            <p className="text-sm font-medium">{formatTime(shift.heure_debut)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center py-3 bg-gray-50 rounded">
                          <div>
                            <p className="text-lg font-bold text-blue-600">{shift.stats.completedCourses}</p>
                            <p className="text-xs text-gray-500">Courses</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-green-600">€{shift.stats.totalRevenue.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Recettes</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-purple-600">{shift.stats.durationHours}h</p>
                            <p className="text-xs text-gray-500">Durée</p>
                          </div>
                        </div>

                        <div className="mt-3 flex justify-between items-center">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {shift.stats.activeCourses > 0 ?
                              `${shift.stats.activeCourses} course(s) en cours` :
                              'Aucune course active'}
                          </div>
                          <button
                            onClick={() => setSelectedShift(shift)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Détails
                          </button>
                        </div>

                        {shift.stats.lastActivity && (
                          <div className="mt-2 text-xs text-gray-500">
                            Dernière activité: {shift.stats.lastActivity.toLocaleTimeString('fr-FR')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Alerts Tab */}
            {selectedTab === 'alerts' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Alertes non résolues ({alerts.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`border rounded-lg p-4 ${getAlertSeverityColor(alert.severite)}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                            <span className="font-medium text-sm uppercase tracking-wide">
                              {alert.severite} - {alert.type_alerte}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{alert.message}</p>
                          <div className="text-xs opacity-75">
                            {alert.feuille_route && (
                              <span>
                                Feuille: {alert.feuille_route.chauffeur.prenom} {alert.feuille_route.chauffeur.nom} -
                                {formatDate(alert.feuille_route.date)}
                              </span>
                            )}
                            {alert.course && (
                              <span className="ml-2">
                                Course: {alert.course.lieu_embarquement} → {alert.course.lieu_debarquement}
                              </span>
                            )}
                          </div>
                          <div className="text-xs mt-1">
                            Créée le {new Date(alert.date_alerte).toLocaleString('fr-FR')}
                          </div>
                        </div>
                        <button
                          onClick={() => resolveAlert(alert.id, 1)} // Assuming admin user ID = 1
                          className="ml-4 bg-white text-gray-700 border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
                        >
                          <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                          Résoudre
                        </button>
                      </div>
                    </div>
                  ))}

                  {alerts.length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Aucune alerte</h3>
                      <p className="text-sm text-gray-500">
                        Toutes les alertes ont été résolues
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Real-time Updates Tab */}
            {selectedTab === 'realtime' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Mises à jour en temps réel
                  </h3>
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    En direct
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {realtimeUpdates.map((update) => {
                    const IconComponent = getUpdateTypeIcon(update.type);
                    return (
                      <div key={update.id} className="flex items-start p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                        <IconComponent className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {update.event === 'INSERT' && 'Création'}
                                {update.event === 'UPDATE' && 'Modification'}
                                {update.event === 'DELETE' && 'Suppression'}
                                {' '}
                                {update.type === 'course' && 'de course'}
                                {update.type === 'expense' && 'de charge'}
                                {update.type === 'shift' && 'de feuille de route'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {update.data.description || update.data.lieu_embarquement || 'Détails non disponibles'}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 ml-4">
                              {update.timestamp.toLocaleTimeString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {realtimeUpdates.length === 0 && (
                    <div className="text-center py-12">
                      <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Aucune mise à jour</h3>
                      <p className="text-sm text-gray-500">
                        Les mises à jour en temps réel apparaîtront ici
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>

      {/* Shift Details Modal */}
      {selectedShift && (
        <Dialog open={!!selectedShift} onClose={() => setSelectedShift(null)} className="relative z-60">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium">Détails de la feuille de route</h3>
                <button onClick={() => setSelectedShift(null)}>
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Chauffeur</p>
                      <p className="font-medium">{selectedShift.chauffeur.prenom} {selectedShift.chauffeur.nom}</p>
                      <p className="text-sm text-gray-500">{selectedShift.chauffeur.telephone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Véhicule</p>
                      <p className="font-medium">{selectedShift.vehicule.plaque_immatriculation}</p>
                      <p className="text-sm text-gray-500">{selectedShift.vehicule.marque} {selectedShift.vehicule.modele}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{selectedShift.stats.completedCourses}</p>
                      <p className="text-xs text-gray-500">Courses terminées</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">€{selectedShift.stats.totalRevenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Recettes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-orange-600">€{selectedShift.stats.totalExpenses.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Charges</p>
                    </div>
                  </div>

                  {selectedShift.notes && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Notes</p>
                      <p className="text-sm bg-gray-50 p-3 rounded">{selectedShift.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </Dialog>
  );
}
