// Import Dependencies
import { useState } from "react";
import { BellIcon, EnvelopeIcon, DevicePhoneMobileIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

// Local Imports
import { Card, Button, Switch } from "components/ui";

// ----------------------------------------------------------------------

export default function Notifications() {
  const [isLoading, setIsLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    // Notifications par email
    email: {
      newCourses: true,
      paymentReceived: true,
      systemAlerts: true,
      weeklyReports: false,
      marketing: false,
    },
    // Notifications push
    push: {
      newCourses: true,
      paymentReceived: true,
      systemAlerts: true,
      driverUpdates: false,
    },
    // Notifications SMS
    sms: {
      urgentAlerts: true,
      paymentIssues: true,
      systemDown: true,
    },
    // Notifications in-app
    inApp: {
      newCourses: true,
      paymentReceived: true,
      systemAlerts: true,
      driverUpdates: true,
      weeklyReports: false,
    },
  });

  const handleNotificationChange = async (category, type, value) => {
    setIsLoading(true);
    try {
      // TODO: Implement notification settings update logic
      setNotificationSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [type]: value,
        },
      }));
      toast.success("Préférences de notification mises à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour des préférences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save all notification settings logic
      toast.success("Toutes les préférences de notification ont été sauvegardées");
    } catch {
      toast.error("Erreur lors de la sauvegarde des préférences");
    } finally {
      setIsLoading(false);
    }
  };

  const NotificationSection = ({ title, icon: Icon, category, settings, description }) => (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {getNotificationLabel(key)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getNotificationDescription(key)}
              </p>
            </div>
            <Switch
              checked={value}
              onChange={(checked) => handleNotificationChange(category, key, checked)}
              disabled={isLoading}
            />
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg font-medium text-gray-800 dark:text-dark-50">
            Préférences de notification
          </h5>
          <p className="mt-0.5 text-balance text-sm text-gray-500 dark:text-dark-200">
            Gérez comment et quand vous souhaitez être notifié des événements importants.
          </p>
        </div>
        <Button onClick={handleSaveAll} disabled={isLoading}>
          {isLoading ? "Sauvegarde..." : "Sauvegarder tout"}
        </Button>
      </div>

      <div className="h-px bg-gray-200 dark:bg-dark-500" />

      {/* Notifications par email */}
      <NotificationSection
        title="Notifications par email"
        icon={EnvelopeIcon}
        category="email"
        settings={notificationSettings.email}
        description="Recevez des notifications importantes par email"
      />

      {/* Notifications push */}
      <NotificationSection
        title="Notifications push"
        icon={BellIcon}
        category="push"
        settings={notificationSettings.push}
        description="Notifications push dans votre navigateur"
      />

      {/* Notifications SMS */}
      <NotificationSection
        title="Notifications SMS"
        icon={DevicePhoneMobileIcon}
        category="sms"
        settings={notificationSettings.sms}
        description="Messages texte pour les urgences uniquement"
      />

      {/* Notifications in-app */}
      <NotificationSection
        title="Notifications in-app"
        icon={ChatBubbleLeftRightIcon}
        category="inApp"
        settings={notificationSettings.inApp}
        description="Notifications dans l'application"
      />

      {/* Résumé des préférences */}
      <Card className="p-6 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Résumé de vos préférences
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Email actif</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {Object.values(notificationSettings.email).filter(Boolean).length} / {Object.keys(notificationSettings.email).length}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Push actif</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {Object.values(notificationSettings.push).filter(Boolean).length} / {Object.keys(notificationSettings.push).length}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">SMS actif</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {Object.values(notificationSettings.sms).filter(Boolean).length} / {Object.keys(notificationSettings.sms).length}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">In-app actif</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {Object.values(notificationSettings.inApp).filter(Boolean).length} / {Object.keys(notificationSettings.inApp).length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper functions for notification labels and descriptions
function getNotificationLabel(key) {
  const labels = {
    newCourses: "Nouvelles courses",
    paymentReceived: "Paiements reçus",
    systemAlerts: "Alertes système",
    weeklyReports: "Rapports hebdomadaires",
    marketing: "Communications marketing",
    driverUpdates: "Mises à jour chauffeurs",
    urgentAlerts: "Alertes urgentes",
    paymentIssues: "Problèmes de paiement",
    systemDown: "Panne système",
  };
  return labels[key] || key;
}

function getNotificationDescription(key) {
  const descriptions = {
    newCourses: "Quand une nouvelle course est créée",
    paymentReceived: "Lorsqu'un paiement est reçu",
    systemAlerts: "Alertes importantes du système",
    weeklyReports: "Résumé hebdomadaire des activités",
    marketing: "Offres et nouvelles fonctionnalités",
    driverUpdates: "Changements de statut des chauffeurs",
    urgentAlerts: "Situations nécessitant une attention immédiate",
    paymentIssues: "Problèmes avec les paiements",
    systemDown: "Indisponibilité du système",
  };
  return descriptions[key] || "";
}