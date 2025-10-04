// Import Dependencies
import { useNavigate } from "react-router";
import {
  ArrowRightOnRectangleIcon,
  ClockIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

// Local Imports
import { Card, Button, Modal } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";

// ----------------------------------------------------------------------

export default function Logout({ onClose, showAsModal = false }) {
  const { user, logout, isLoading } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Déconnexion réussie");

      if (showAsModal) {
        onClose?.();
      }

      // Redirection vers la page de connexion
      navigate("/login", {
        replace: true,
        state: {
          message: "Vous avez été déconnecté avec succès"
        }
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const getUserTypeLabel = (type) => {
    const labels = {
      ADMIN: "Administrateur",
      GESTIONNAIRE: "Gestionnaire",
      CHAUFFEUR: "Chauffeur",
      CLIENT: "Client",
    };
    return labels[type] || type;
  };

  const getUserTypeColor = (type) => {
    const colors = {
      ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      GESTIONNAIRE: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      CHAUFFEUR: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      CLIENT: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  };

  const LogoutContent = () => (
    <div className="space-y-6">
      {/* Informations de l'utilisateur */}
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {user?.prenom?.[0]?.toUpperCase() || user?.nom?.[0]?.toUpperCase() || "U"}
          </span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : user?.email}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
        <div className="mt-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUserTypeColor(user?.type_utilisateur)}`}>
            {getUserTypeLabel(user?.type_utilisateur)}
          </span>
        </div>
      </div>

      {/* Informations de session */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Session active
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Dernière activité : Maintenant
            </p>
          </div>
        </div>
      </Card>

            {/* Actions */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          onClick={handleLogout}
          disabled={isLoading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Déconnexion...
            </div>
          ) : (
            <div className="flex items-center">
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
              Confirmer
            </div>
          )}
        </Button>
      </div>

      {/* Informations de sécurité */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <ShieldCheckIcon className="h-4 w-4" />
          <span>Vos données sont sécurisées</span>
        </div>
      </div>
    </div>
  );

  if (showAsModal) {
    return (
      <Modal
        isOpen={true}
        onClose={onClose}
        title="Déconnexion"
        size="sm"
        blur={true}
        highPriority={true}
        showFooter={false}
      >
        <LogoutContent />
      </Modal>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Déconnexion
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Confirmer votre déconnexion
          </p>
        </div>
        <LogoutContent />
      </Card>
    </div>
  );
}

