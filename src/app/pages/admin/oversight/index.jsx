import { useState, useEffect } from 'react';
import { Page } from 'components/shared/Page';
import {
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyEuroIcon,
  TruckIcon,
  ArrowDownTrayIcon,
  BellIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAdminOversight } from 'hooks/useAdminOversight';
import { Dialog } from '@headlessui/react';

export default function AdminOversightPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedShift, setSelectedShift] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const {
    activeShifts,
    realtimeUpdates,
    alerts,
    isLoading,
    resolveAlert,
    getShiftPerformanceMetrics,
    exportLiveData,
    refreshData
  } = useAdminOversight();

  const metrics = getShiftPerformanceMetrics();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshData();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshData]);

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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <Page title="Supervision Administrative">
      <div className="transition-content mt-5 px-4 pb-8 lg:mt-6 lg:px-6">
        {/* Header avec contrôles */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supervision Administrative</h1>
            <p className="text-gray-600 mt-1">Vue d&#39;ensemble temps réel des activités des chauffeurs</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoRefresh" className="ml-2 text-sm text-gray-700">
                Actualisation auto (30s)
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={refreshData}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Actualiser
              </button>
              <button
                onClick={handleExportData}
                className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Exporter
              </button>
            </div>
          </div>
        </div>

        {/* Indicateur temps réel */}
        {autoRefresh && (
          <div className="mb-6 flex items-center justify-center">
            <div className="flex items-center text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Supervision en temps réel active
            </div>
          </div>
        )}

        {/* Métriques clés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TruckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Feuilles actives</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeShiftsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyEuroIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recettes temps réel</p>
                <p className="text-2xl font-bold text-gray-900">€{metrics.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Courses totales</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alertes actives</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.alertsCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  {tab.id === 'alerts' && alerts.length > 0 && (
                    <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-medium">
                      {alerts.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Vue d'ensemble */}
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Résumé des performances */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé des performances</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Recette moyenne par feuille</p>
                      <p className="text-2xl font-bold text-gray-900">€{metrics.averageRevenuePerShift.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Courses moyenne par feuille</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.averageCoursesPerShift.toFixed(1)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Résultat net total</p>
                      <p className={`text-2xl font-bold ${metrics.netRevenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        €{metrics.netRevenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activité récente */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
                  <div className="space-y-3">
                    {realtimeUpdates.slice(0, 8).map((update) => {
                      const IconComponent = getUpdateTypeIcon(update.type);
                      return (
                        <div key={update.id} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <IconComponent className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="ml-4 flex-1">
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
                              {update.data?.description || update.data?.lieu_embarquement || 'Activité système'}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 ml-4">
                            {update.timestamp.toLocaleTimeString('fr-FR')}
                          </p>
                        </div>
                      );
                    })}
                    {realtimeUpdates.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Aucune activité récente</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Feuilles actives */}
            {selectedTab === 'shifts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Feuilles de route actives ({activeShifts.length})
                  </h3>
                  {!isLoading && (
                    <p className="text-sm text-gray-500">
                      Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
                    </p>
                  )}
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {activeShifts.map((shift) => (
                      <div key={shift.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {shift.chauffeur?.prenom} {shift.chauffeur?.nom}
                            </h4>
                            <div className="mt-1 space-y-1">
                              <p className="text-sm text-gray-600 flex items-center">
                                <TruckIcon className="h-3 w-3 mr-1" />
                                {shift.vehicule?.plaque_immatriculation}
                              </p>
                              <p className="text-sm text-gray-600">
                                📞 {shift.chauffeur?.telephone}
                              </p>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm text-gray-500">{formatDate(shift.date)}</p>
                            <p className="text-sm font-medium text-gray-900">{formatTime(shift.heure_debut)}</p>
                            <p className="text-xs text-gray-500 mt-1">{shift.stats.durationHours}h de service</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-lg font-bold text-blue-600">{shift.stats.completedCourses}</p>
                            <p className="text-xs text-gray-600">Courses</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-lg font-bold text-green-600">€{shift.stats.totalRevenue.toFixed(2)}</p>
                            <p className="text-xs text-gray-600">Recettes</p>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <p className="text-lg font-bold text-orange-600">€{shift.stats.totalExpenses.toFixed(2)}</p>
                            <p className="text-xs text-gray-600">Charges</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <div className="flex items-center text-sm text-gray-600">
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
                          <div className="mt-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                            Dernière activité: {shift.stats.lastActivity.toLocaleTimeString('fr-FR')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!isLoading && activeShifts.length === 0 && (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                    <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune feuille active</h3>
                    <p className="text-gray-500">
                      Aucune feuille de route n&#39;est actuellement en cours
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Alertes */}
            {selectedTab === 'alerts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Alertes non résolues ({alerts.length})
                  </h3>
                  {alerts.length > 0 && (
                    <p className="text-sm text-red-600 font-medium">
                      Attention requise
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`border rounded-lg p-6 ${getAlertSeverityColor(alert.severite)} hover:shadow-md transition-shadow`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                            <span className="font-semibold text-sm uppercase tracking-wide">
                              {alert.severite} - {alert.type_alerte?.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm mb-3 font-medium">{alert.message}</p>
                          <div className="text-xs space-y-1">
                            {alert.feuille_route && (
                              <p>
                                📋 Feuille: {alert.feuille_route.chauffeur?.prenom} {alert.feuille_route.chauffeur?.nom} -
                                {formatDate(alert.feuille_route.date)}
                              </p>
                            )}
                            {alert.course && (
                              <p>
                                🚗 Course: {alert.course.lieu_embarquement} → {alert.course.lieu_debarquement}
                              </p>
                            )}
                            <p className="text-gray-600">
                              📅 Créée le {formatDateTime(alert.date_alerte)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => resolveAlert(alert.id, 1)}
                          className="ml-6 bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Résoudre
                        </button>
                      </div>
                    </div>
                  ))}

                  {alerts.length === 0 && (
                    <div className="text-center py-16 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune alerte</h3>
                      <p className="text-gray-600">
                        Toutes les alertes ont été résolues. Le système fonctionne normalement.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Temps réel */}
            {selectedTab === 'realtime' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Flux d&#39;activité en temps réel
                  </h3>
                  <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    En direct
                  </div>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {realtimeUpdates.map((update) => {
                    const IconComponent = getUpdateTypeIcon(update.type);
                    return (
                      <div key={update.id} className="flex items-start p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {update.event === 'INSERT' && '✅ Création'}
                                {update.event === 'UPDATE' && '✏️ Modification'}
                                {update.event === 'DELETE' && '🗑️ Suppression'}
                                {' '}
                                {update.type === 'course' && 'de course'}
                                {update.type === 'expense' && 'de charge'}
                                {update.type === 'shift' && 'de feuille de route'}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {update.data?.description ||
                                 update.data?.lieu_embarquement ||
                                 update.data?.type_charge ||
                                 'Activité système'}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 ml-4 whitespace-nowrap">
                              {update.timestamp.toLocaleTimeString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {realtimeUpdates.length === 0 && (
                    <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                      <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">En attente d&#39;activité</h3>
                      <p className="text-gray-500">
                        Les mises à jour en temps réel apparaîtront ici dès qu&#39;il y aura de l&#39;activité
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de détails de feuille */}
      {selectedShift && (
        <Dialog open={!!selectedShift} onClose={() => setSelectedShift(null)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">Détails de la feuille de route</h3>
                <button onClick={() => setSelectedShift(null)}>
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Chauffeur</h4>
                      <p className="font-medium">{selectedShift.chauffeur?.prenom} {selectedShift.chauffeur?.nom}</p>
                      <p className="text-sm text-gray-600">{selectedShift.chauffeur?.telephone}</p>
                      <p className="text-sm text-gray-600">Badge: {selectedShift.chauffeur?.numero_badge}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Véhicule</h4>
                      <p className="font-medium">{selectedShift.vehicule?.plaque_immatriculation}</p>
                      <p className="text-sm text-gray-600">{selectedShift.vehicule?.marque} {selectedShift.vehicule?.modele}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedShift.stats.completedCourses}</p>
                      <p className="text-xs text-gray-600">Courses terminées</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">€{selectedShift.stats.totalRevenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">Recettes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">€{selectedShift.stats.totalExpenses.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">Charges</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{selectedShift.stats.durationHours}h</p>
                      <p className="text-xs text-gray-600">Durée</p>
                    </div>
                  </div>

                  {selectedShift.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded border">{selectedShift.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </Page>
  );
}
