// Import Dependencies
import { useState } from "react";
import { CloudArrowUpIcon, ArrowDownTrayIcon, TrashIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

// Local Imports
import { Card, Button, Progress } from "components/ui";

// ----------------------------------------------------------------------

export default function DataBackup() {
  const [isLoading, setIsLoading] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [exportProgress, setExportProgress] = useState(0);

  const [dataSettings, setDataSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily", // daily, weekly, monthly
    retentionPeriod: 30, // days
    backupLocation: "cloud", // local, cloud
    encryptBackups: true,
    includeAttachments: true,
  });

  const [recentBackups] = useState([
    {
      id: 1,
      date: "2024-01-15T10:30:00Z",
      size: "2.4 GB",
      type: "Automatique",
      status: "success",
    },
    {
      id: 2,
      date: "2024-01-14T10:30:00Z",
      size: "2.3 GB",
      type: "Automatique",
      status: "success",
    },
    {
      id: 3,
      date: "2024-01-13T10:30:00Z",
      size: "2.2 GB",
      type: "Manuel",
      status: "success",
    },
  ]);

  const handleCreateBackup = async () => {
    setIsLoading(true);
    setBackupProgress(0);

    try {
      // Simulate backup progress
      for (let i = 0; i <= 100; i += 10) {
        setBackupProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      toast.success("Sauvegarde créée avec succès");
      setBackupProgress(0);
    } catch {
      toast.error("Erreur lors de la création de la sauvegarde");
      setBackupProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async (format) => {
    setIsLoading(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 5) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Trigger download
      const blob = new Blob([`Sample ${format.toUpperCase()} data`], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `txapp-data-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Données exportées au format ${format.toUpperCase()}`);
      setExportProgress(0);
    } catch {
      toast.error("Erreur lors de l'export des données");
      setExportProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteData = async (dataType) => {
    const confirmMessage = {
      courses: "Êtes-vous sûr de vouloir supprimer toutes les courses ? Cette action est irréversible.",
      clients: "Êtes-vous sûr de vouloir supprimer tous les clients ? Cette action est irréversible.",
      drivers: "Êtes-vous sûr de vouloir supprimer tous les chauffeurs ? Cette action est irréversible.",
      all: "Êtes-vous sûr de vouloir supprimer TOUTES les données ? Cette action est IRRÉVERSIBLE et supprimera tout.",
    };

    if (!confirm(confirmMessage[dataType])) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement data deletion logic
      toast.success(`${dataType === 'all' ? 'Toutes les données' : `Données ${dataType}`} supprimées`);
    } catch {
      toast.error("Erreur lors de la suppression des données");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = async (key, value) => {
    setIsLoading(true);
    try {
      // TODO: Implement setting update logic
      setDataSettings(prev => ({
        ...prev,
        [key]: value,
      }));
      toast.success("Paramètre mis à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour du paramètre");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl space-y-6">
      <div>
        <h5 className="text-lg font-medium text-gray-800 dark:text-dark-50">
          Données &amp; Sauvegarde
        </h5>
        <p className="mt-0.5 text-balance text-sm text-gray-500 dark:text-dark-200">
          Gérez vos données, sauvegardes et paramètres de confidentialité.
        </p>
      </div>

      <div className="h-px bg-gray-200 dark:bg-dark-500" />

      {/* Paramètres de sauvegarde automatique */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <CloudArrowUpIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Sauvegarde automatique
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configurez les sauvegardes automatiques de vos données
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sauvegarde automatique
            </label>
            <div className="mt-1">
              <input
                type="checkbox"
                checked={dataSettings.autoBackup}
                onChange={(e) => handleSettingChange("autoBackup", e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Fréquence
            </label>
            <select
              value={dataSettings.backupFrequency}
              onChange={(e) => handleSettingChange("backupFrequency", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuelle</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Rétention (jours)
            </label>
            <input
              type="number"
              value={dataSettings.retentionPeriod}
              onChange={(e) => handleSettingChange("retentionPeriod", parseInt(e.target.value))}
              min="1"
              max="365"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Emplacement
            </label>
            <select
              value={dataSettings.backupLocation}
              onChange={(e) => handleSettingChange("backupLocation", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="cloud">Cloud</option>
              <option value="local">Local</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <input
            type="checkbox"
            checked={dataSettings.encryptBackups}
            onChange={(e) => handleSettingChange("encryptBackups", e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Chiffrer les sauvegardes
          </label>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <input
            type="checkbox"
            checked={dataSettings.includeAttachments}
            onChange={(e) => handleSettingChange("includeAttachments", e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Inclure les pièces jointes
          </label>
        </div>
      </Card>

      {/* Actions de sauvegarde */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
            <ArrowDownTrayIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Actions de sauvegarde
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Créez des sauvegardes et exportez vos données
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Créer une sauvegarde */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Créer une sauvegarde manuelle
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sauvegardez immédiatement toutes vos données
              </p>
            </div>
            <Button
              onClick={handleCreateBackup}
              disabled={isLoading}
            >
              {isLoading ? "Sauvegarde..." : "Créer"}
            </Button>
          </div>

          {backupProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression de la sauvegarde</span>
                <span>{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="w-full" />
            </div>
          )}

          {/* Export des données */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Export CSV
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Téléchargez vos données en CSV
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleExportData('csv')}
                disabled={isLoading}
              >
                Exporter
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Export JSON
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Téléchargez vos données en JSON
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleExportData('json')}
                disabled={isLoading}
              >
                Exporter
              </Button>
            </div>
          </div>

          {exportProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression de l&apos;export</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}
        </div>
      </Card>

      {/* Historique des sauvegardes */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
            <DocumentTextIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Historique des sauvegardes
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Consultez vos sauvegardes récentes
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {recentBackups.map((backup) => (
            <div key={backup.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`h-2 w-2 rounded-full ${
                  backup.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {backup.type} - {new Date(backup.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {backup.size} • {new Date(backup.date).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Télécharger
                </Button>
                <Button variant="outline" size="sm" color="error">
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Zone de danger */}
      <Card className="p-6 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
            <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-900 dark:text-red-100">
              Zone de danger
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200">
              Actions irréversibles - utilisez avec précaution
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            color="error"
            onClick={() => handleDeleteData('courses')}
            disabled={isLoading}
          >
            Supprimer toutes les courses
          </Button>
          <Button
            variant="outline"
            color="error"
            onClick={() => handleDeleteData('clients')}
            disabled={isLoading}
          >
            Supprimer tous les clients
          </Button>
          <Button
            variant="outline"
            color="error"
            onClick={() => handleDeleteData('drivers')}
            disabled={isLoading}
          >
            Supprimer tous les chauffeurs
          </Button>
          <Button
            variant="outline"
            color="error"
            onClick={() => handleDeleteData('all')}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Supprimer TOUTES les données
          </Button>
        </div>
      </Card>
    </div>
  );
}