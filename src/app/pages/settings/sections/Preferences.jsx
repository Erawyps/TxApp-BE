// Import Dependencies
import { useState } from "react";
import { GlobeAltIcon, CurrencyEuroIcon, CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

// Local Imports
import { Card, Button, Select } from "components/ui";

// ----------------------------------------------------------------------

const languages = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "nl", label: "Nederlands" },
  { value: "de", label: "Deutsch" },
];

const currencies = [
  { value: "EUR", label: "Euro (€)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "CHF", label: "Swiss Franc (CHF)" },
];

const dateFormats = [
  { value: "DD/MM/YYYY", label: "31/12/2023" },
  { value: "MM/DD/YYYY", label: "12/31/2023" },
  { value: "YYYY-MM-DD", label: "2023-12-31" },
];

const timeFormats = [
  { value: "24h", label: "24 heures (14:30)" },
  { value: "12h", label: "12 heures (2:30 PM)" },
];

const timezones = [
  { value: "Europe/Brussels", label: "Brussels (CET/CEST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
];

const weekStarts = [
  { value: "monday", label: "Lundi" },
  { value: "sunday", label: "Dimanche" },
];

export default function Preferences() {
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    language: "fr",
    currency: "EUR",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    timezone: "Europe/Brussels",
    weekStart: "monday",
    numberFormat: "fr-FR",
    theme: "auto",
  });

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save preferences logic
      toast.success("Préférences sauvegardées avec succès");
    } catch {
      toast.error("Erreur lors de la sauvegarde des préférences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser toutes les préférences aux valeurs par défaut ?")) {
      return;
    }

    setPreferences({
      language: "fr",
      currency: "EUR",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      timezone: "Europe/Brussels",
      weekStart: "monday",
      numberFormat: "fr-FR",
      theme: "auto",
    });
    toast.success("Préférences réinitialisées aux valeurs par défaut");
  };

  const PreferenceSection = ({ title, icon: Icon, children }) => (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
          <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </Card>
  );

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg font-medium text-gray-800 dark:text-dark-50">
            Préférences d&apos;application
          </h5>
          <p className="mt-0.5 text-balance text-sm text-gray-500 dark:text-dark-200">
            Personnalisez votre expérience utilisateur selon vos préférences.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleResetToDefaults}>
            Réinitialiser
          </Button>
          <Button onClick={handleSavePreferences} disabled={isLoading}>
            {isLoading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>

      <div className="h-px bg-gray-200 dark:bg-dark-500" />

      {/* Langue et région */}
      <PreferenceSection title="Langue et région" icon={GlobeAltIcon}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Langue"
            value={preferences.language}
            onChange={(value) => handlePreferenceChange("language", value)}
            options={languages}
          />
          <Select
            label="Fuseau horaire"
            value={preferences.timezone}
            onChange={(value) => handlePreferenceChange("timezone", value)}
            options={timezones}
          />
        </div>
      </PreferenceSection>

      {/* Devise et format */}
      <PreferenceSection title="Devise et format" icon={CurrencyEuroIcon}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Devise"
            value={preferences.currency}
            onChange={(value) => handlePreferenceChange("currency", value)}
            options={currencies}
          />
          <Select
            label="Format des nombres"
            value={preferences.numberFormat}
            onChange={(value) => handlePreferenceChange("numberFormat", value)}
            options={[
              { value: "fr-FR", label: "Français (1 234,56 €)" },
              { value: "en-US", label: "English (1,234.56 $)" },
              { value: "de-DE", label: "Deutsch (1.234,56 €)" },
            ]}
          />
        </div>
      </PreferenceSection>

      {/* Date et heure */}
      <PreferenceSection title="Date et heure" icon={CalendarDaysIcon}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Format de date"
            value={preferences.dateFormat}
            onChange={(value) => handlePreferenceChange("dateFormat", value)}
            options={dateFormats}
          />
          <Select
            label="Format d'heure"
            value={preferences.timeFormat}
            onChange={(value) => handlePreferenceChange("timeFormat", value)}
            options={timeFormats}
          />
          <Select
            label="Début de semaine"
            value={preferences.weekStart}
            onChange={(value) => handlePreferenceChange("weekStart", value)}
            options={weekStarts}
          />
        </div>
      </PreferenceSection>

      {/* Thème et apparence */}
      <PreferenceSection title="Thème et apparence" icon={ClockIcon}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Thème"
            value={preferences.theme}
            onChange={(value) => handlePreferenceChange("theme", value)}
            options={[
              { value: "auto", label: "Automatique (système)" },
              { value: "light", label: "Clair" },
              { value: "dark", label: "Sombre" },
            ]}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Aperçu du thème
            </label>
            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-900 dark:text-white">
                Exemple de texte dans le thème actuel
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Les couleurs s&apos;adaptent automatiquement
              </p>
            </div>
          </div>
        </div>
      </PreferenceSection>

      {/* Préférences avancées */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Préférences avancées
        </h3>
        <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
          <div className="flex items-center justify-between">
            <span>Animations réduites</span>
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              onChange={(e) => handlePreferenceChange("reducedMotion", e.target.checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Mode développeur</span>
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              onChange={(e) => handlePreferenceChange("developerMode", e.target.checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Notifications sonores</span>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              onChange={(e) => handlePreferenceChange("soundNotifications", e.target.checked)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}