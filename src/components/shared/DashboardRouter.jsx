// Import Dependencies
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "hooks/useAuth";
import { Card } from "components/ui";
import {
  UserGroupIcon,
  TruckIcon,
  CogIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

/**
 * Composant de routage intelligent basé sur le type d'utilisateur
 * Redirige automatiquement vers le dashboard approprié
 */
export default function DashboardRouter() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const redirectPath = getDashboardPath(user.type_utilisateur);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const getDashboardPath = (userType) => {
    const dashboardRoutes = {
      ADMIN: '/dashboard/admin',
      GESTIONNAIRE: '/dashboard/gestionnaire',
      CHAUFFEUR: '/dashboard/chauffeur',
      CLIENT: '/dashboard/client'
    };

    return dashboardRoutes[userType] || '/dashboard';
  };

  const getUserTypeInfo = (userType) => {
    const userTypes = {
      ADMIN: {
        icon: ShieldCheckIcon,
        title: 'Administrateur',
        description: 'Accès complet à la gestion de la plateforme',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        features: [
          'Gestion des utilisateurs',
          'Supervision en temps réel',
          'Rapports et analyses',
          'Configuration système'
        ]
      },
      GESTIONNAIRE: {
        icon: CogIcon,
        title: 'Gestionnaire',
        description: 'Gestion opérationnelle et supervision',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        features: [
          'Supervision des chauffeurs',
          'Gestion des courses',
          'Rapports opérationnels',
          'Support client'
        ]
      },
      CHAUFFEUR: {
        icon: TruckIcon,
        title: 'Chauffeur',
        description: 'Gestion de vos courses et feuilles de route',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        features: [
          'Gestion des shifts',
          'Saisie des courses',
          'Suivi des revenus',
          'Rapports quotidiens'
        ]
      },
      CLIENT: {
        icon: UserGroupIcon,
        title: 'Client',
        description: 'Réservation et suivi de vos courses',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        features: [
          'Réservation de courses',
          'Historique des trajets',
          'Gestion du profil',
          'Support et assistance'
        ]
      }
    };

    return userTypes[userType] || userTypes.client;
  };

  // Affichage de chargement pendant la redirection
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chargement de votre tableau de bord...
          </h3>
          <p className="text-sm text-gray-600">
            Redirection en cours
          </p>
        </Card>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Accès non autorisé
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Vous devez être connecté pour accéder à cette page
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Se connecter
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </button>
        </Card>
      </div>
    );
  }

  // Affichage temporaire avec informations sur le type d'utilisateur
  if (user) {
    const userInfo = getUserTypeInfo(user.type_utilisateur);
    const IconComponent = userInfo.icon;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <Card className="p-8 text-center">
            <div className={`mx-auto h-16 w-16 ${userInfo.bgColor} rounded-full flex items-center justify-center mb-6`}>
              <IconComponent className={`h-8 w-8 ${userInfo.color}`} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {userInfo.title}
            </h2>

            <p className="text-gray-600 mb-6">
              {userInfo.description}
            </p>

            <div className="text-left mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Fonctionnalités disponibles :
              </h3>
              <ul className="space-y-2">
                {userInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="animate-pulse">
              <div className="text-sm text-gray-500 mb-4">
                Redirection automatique en cours...
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}