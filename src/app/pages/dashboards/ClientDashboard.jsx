// Import Dependencies
import { useState } from "react";
import { Page } from "components/shared/Page";
import { useAuth } from "hooks/useAuth";
import { usePermissions } from "hooks/usePermissions";
import { Card, Button, Input } from "components/ui";
import {
  MapPinIcon,
  CurrencyEuroIcon,
  PhoneIcon,
  StarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

/**
 * Dashboard Client - Réservation et suivi de courses
 */
export default function ClientDashboard() {
  const { user } = useAuth();
  const { canPerformAction } = usePermissions();

  const [activeTab, setActiveTab] = useState('reservations');
  const [searchTerm, setSearchTerm] = useState('');

  // Données mockées pour la démonstration
  const [reservations] = useState([
    {
      id: 1,
      date: '2024-01-15',
      time: '14:30',
      pickup: '123 Rue de la Paix, Paris',
      dropoff: '456 Avenue des Champs, Paris',
      status: 'confirmed',
      driver: 'Jean Dupont',
      vehicle: 'Peugeot 308',
      price: 25.50,
      rating: 4.8
    },
    {
      id: 2,
      date: '2024-01-10',
      time: '09:15',
      pickup: '789 Boulevard Saint-Michel, Paris',
      dropoff: '321 Rue de Rivoli, Paris',
      status: 'completed',
      driver: 'Marie Martin',
      vehicle: 'Renault Clio',
      price: 18.75,
      rating: 5.0
    }
  ]);

  const [favorites] = useState([
    { id: 1, name: 'Maison', address: '123 Rue de la Paix, Paris' },
    { id: 2, name: 'Travail', address: '456 Avenue des Champs, Paris' },
    { id: 3, name: 'Aéroport', address: 'Aéroport Charles de Gaulle, Roissy' }
  ]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      in_progress: 'En cours',
      completed: 'Terminée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  };

  const filteredReservations = reservations.filter(reservation =>
    reservation.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.dropoff.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.driver.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewBooking = () => {
    if (canPerformAction('course', 'create')) {
      // TODO: Ouvrir le modal de réservation
      toast.info("Fonctionnalité de réservation à venir");
    } else {
      toast.error("Vous n'avez pas les permissions pour créer une course");
    }
  };

  const tabs = [
    { id: 'reservations', label: 'Mes réservations', count: reservations.length },
    { id: 'favorites', label: 'Adresses favorites', count: favorites.length },
    { id: 'history', label: 'Historique', count: reservations.filter(r => r.status === 'completed').length }
  ];

  return (
    <Page title="Mon Espace Client - TxApp">
      <div className="space-y-6">
        {/* En-tête avec informations utilisateur */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Bonjour {user?.prenom} {user?.nom}
              </h1>
              <p className="text-blue-100 mt-1">
                Bienvenue dans votre espace client TxApp
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-blue-100">Courses ce mois</div>
                <div className="text-2xl font-bold">{reservations.length}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Note moyenne</div>
                <div className="text-2xl font-bold">4.9</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleNewBooking}>
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <PlusIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Nouvelle course</h3>
                <p className="text-sm text-gray-600">Réserver un trajet</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Planifier</h3>
                <p className="text-sm text-gray-600">Course programmée</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <PhoneIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Support</h3>
                <p className="text-sm text-gray-600">Contacter l&apos;assistance</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation par onglets */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Barre de recherche */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une course, un chauffeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'reservations' && (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <Card key={reservation.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                        {getStatusLabel(reservation.status)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {reservation.date} à {reservation.time}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <MapPinIcon className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Départ</div>
                          <div className="text-sm text-gray-600">{reservation.pickup}</div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <MapPinIcon className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Arrivée</div>
                          <div className="text-sm text-gray-600">{reservation.dropoff}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{reservation.driver}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CurrencyEuroIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{(reservation.price || 0).toFixed(2)}€</span>
                        </div>
                        {reservation.rating && (
                          <div className="flex items-center space-x-1">
                            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{reservation.rating}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Détails
                        </Button>
                        {reservation.status === 'confirmed' && (
                          <Button variant="outline" size="sm">
                            Modifier
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {filteredReservations.length === 0 && (
              <div className="text-center py-12">
                <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune réservation trouvée
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Vous n\'avez pas encore de réservations.'}
                </p>
                <Button onClick={handleNewBooking}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Réserver ma première course
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{favorite.name}</h3>
                    <p className="text-sm text-gray-600">{favorite.address}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Utiliser
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {reservations.filter(r => r.status === 'completed').map((reservation) => (
              <Card key={reservation.id} className="p-6 opacity-75">
                <div className="text-sm text-gray-500 mb-2">Terminée le {reservation.date}</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {reservation.pickup} → {reservation.dropoff}
                    </div>
                    <div className="text-sm text-gray-600">
                      Chauffeur: {reservation.driver} • {(reservation.price || 0).toFixed(2)}€
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{reservation.rating}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}