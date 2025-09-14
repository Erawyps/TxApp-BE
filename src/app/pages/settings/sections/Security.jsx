// Import Dependencies
import { useState } from "react";
import { ShieldCheckIcon, KeyIcon, DevicePhoneMobileIcon, ClockIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

// Local Imports
import { Card, Button, Input, Switch } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";

// ----------------------------------------------------------------------

export default function Security() {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30); // minutes

  const handleToggle2FA = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement 2FA toggle logic
      setTwoFactorEnabled(!twoFactorEnabled);
      toast.success(twoFactorEnabled ? "Authentification à deux facteurs désactivée" : "Authentification à deux facteurs activée");
    } catch {
      toast.error("Erreur lors de la modification de l'authentification à deux facteurs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionTimeoutChange = async (value) => {
    setIsLoading(true);
    try {
      // TODO: Implement session timeout update logic
      setSessionTimeout(value);
      toast.success("Délai d'expiration de session mis à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour du délai d'expiration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm("Êtes-vous sûr de vouloir révoquer toutes les sessions actives ? Vous serez déconnecté de tous vos appareils.")) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement revoke all sessions logic
      toast.success("Toutes les sessions ont été révoquées");
    } catch {
      toast.error("Erreur lors de la révocation des sessions");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div>
        <h5 className="text-lg font-medium text-gray-800 dark:text-dark-50">
          Sécurité du compte
        </h5>
        <p className="mt-0.5 text-balance text-sm text-gray-500 dark:text-dark-200">
          Gérez la sécurité de votre compte et vos préférences de connexion.
        </p>
      </div>

      <div className="h-px bg-gray-200 dark:bg-dark-500" />

      {/* Authentification à deux facteurs */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Authentification à deux facteurs
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ajoutez une couche de sécurité supplémentaire à votre compte
              </p>
            </div>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onChange={handleToggle2FA}
            disabled={isLoading}
          />
        </div>
      </Card>

      {/* Délai d'expiration de session */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
            <ClockIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Délai d&apos;expiration de session
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Durée avant déconnexion automatique pour inactivité
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            type="number"
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
            min="5"
            max="480"
            className="w-24"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
          <Button
            onClick={() => handleSessionTimeoutChange(sessionTimeout)}
            disabled={isLoading}
            size="sm"
          >
            Sauvegarder
          </Button>
        </div>
      </Card>

      {/* Sessions actives */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <DevicePhoneMobileIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Sessions actives
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gérez vos sessions actives sur différents appareils
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            color="error"
            onClick={handleRevokeAllSessions}
            disabled={isLoading}
            size="sm"
          >
            Révoquer tout
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Session actuelle
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Chrome sur macOS • {new Date().toLocaleString()}
                </p>
              </div>
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              Active
            </span>
          </div>
        </div>
      </Card>

      {/* Historique des connexions */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
            <KeyIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Historique des connexions
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Dernière connexion : {user?.last_login ? new Date(user.last_login).toLocaleString() : "Jamais"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>• Connexion réussie depuis Chrome sur macOS</p>
            <p>• Tentative de connexion échouée depuis Safari sur iOS</p>
            <p>• Changement de mot de passe réussi</p>
          </div>
        </div>
      </Card>
    </div>
  );
}