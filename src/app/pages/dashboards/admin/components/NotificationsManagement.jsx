import { useState, useEffect } from 'react';
import { BellIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function NotificationsManagement() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, vehicle_change

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const storedNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    setNotifications(storedNotifications);
  };

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('admin_notifications');
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'vehicle_change') return notification.type === 'vehicle_change';
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'vehicle_change':
        return TruckIcon;
      default:
        return BellIcon;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">Suivez les activités importantes du système</p>
      </div>

      {/* Filtres et actions */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les notifications</option>
            <option value="unread">Non lues</option>
            <option value="vehicle_change">Changements de véhicule</option>
          </select>
          <span className="text-sm text-gray-500">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tout marquer comme lu
          </button>
          <button
            onClick={clearAllNotifications}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tout effacer
          </button>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune notification</p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => {
            const IconComponent = getNotificationIcon(notification.type);
            return (
              <div
                key={notification.id || index}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.read
                    ? 'bg-white border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    notification.type === 'vehicle_change' ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`h-5 w-5 ${
                      notification.type === 'vehicle_change' ? 'text-orange-600' : 'text-gray-600'
                    }`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.created_at)}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id || index)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Marquer comme lu"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>

                    {notification.data && (
                      <div className="mt-2 text-xs text-gray-500">
                        <div className="grid grid-cols-2 gap-2">
                          {notification.data.chauffeur_id && (
                            <div>Chauffeur ID: {notification.data.chauffeur_id}</div>
                          )}
                          {notification.data.ancien_vehicule_id && (
                            <div>Ancien véhicule ID: {notification.data.ancien_vehicule_id}</div>
                          )}
                          {notification.data.nouveau_vehicule_id && (
                            <div>Nouveau véhicule ID: {notification.data.nouveau_vehicule_id}</div>
                          )}
                          {notification.data.feuille_id && (
                            <div>Feuille ID: {notification.data.feuille_id}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}