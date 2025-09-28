import { useState, useEffect } from 'react';
import { Card, Button } from 'components/ui';
import {
  UserGroupIcon,
  TruckIcon,
  UserIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAdminOversight } from 'hooks/useAdminOversight';

export default function OverviewDashboard() {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, admins: 0 },
    drivers: { total: 0, active: 0, inactive: 0 },
    vehicles: { total: 0, active: 0, maintenance: 0 },
    clients: { total: 0, active: 0, inactive: 0 },
    courses: { today: 0, week: 0, month: 0 },
    revenue: { today: 0, week: 0, month: 0 }
  });

  const [isLoading, setIsLoading] = useState(true);
  useAdminOversight();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API calls to get dashboard statistics
      // For now, using mock data
      setStats({
        users: { total: 15, active: 12, admins: 3 },
        drivers: { total: 8, active: 6, inactive: 2 },
        vehicles: { total: 12, active: 10, maintenance: 2 },
        clients: { total: 45, active: 38, inactive: 7 },
        courses: { today: 24, week: 156, month: 624 },
        revenue: { today: 1240.50, week: 8750.25, month: 35200.75 }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Utilisateurs',
      icon: UserGroupIcon,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      stats: [
        { label: 'Total', value: stats.users.total, color: 'text-gray-900 dark:text-white' },
        { label: 'Actifs', value: stats.users.active, color: 'text-green-600 dark:text-green-400' },
        { label: 'Admins', value: stats.users.admins, color: 'text-purple-600 dark:text-purple-400' }
      ]
    },
    {
      title: 'Chauffeurs',
      icon: UserIcon,
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      stats: [
        { label: 'Total', value: stats.drivers.total, color: 'text-gray-900 dark:text-white' },
        { label: 'Actifs', value: stats.drivers.active, color: 'text-green-600 dark:text-green-400' },
        { label: 'Inactifs', value: stats.drivers.inactive, color: 'text-red-600 dark:text-red-400' }
      ]
    },
    {
      title: 'Véhicules',
      icon: TruckIcon,
      iconColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      stats: [
        { label: 'Total', value: stats.vehicles.total, color: 'text-gray-900 dark:text-white' },
        { label: 'Actifs', value: stats.vehicles.active, color: 'text-green-600 dark:text-green-400' },
        { label: 'Maintenance', value: stats.vehicles.maintenance, color: 'text-yellow-600 dark:text-yellow-400' }
      ]
    },
    {
      title: 'Clients',
      icon: BuildingOfficeIcon,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
      stats: [
        { label: 'Total', value: stats.clients.total, color: 'text-gray-900 dark:text-white' },
        { label: 'Actifs', value: stats.clients.active, color: 'text-green-600 dark:text-green-400' },
        { label: 'Inactifs', value: stats.clients.inactive, color: 'text-red-600 dark:text-red-400' }
      ]
    }
  ];

  const activityCards = [
    {
      title: 'Courses aujourd\'hui',
      value: stats.courses.today,
      icon: DocumentTextIcon,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      trend: '+12%',
      trendColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Revenus aujourd\'hui',
      value: `${stats.revenue.today.toFixed(2)} €`,
      icon: CurrencyEuroIcon,
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      trend: '+8%',
      trendColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Courses cette semaine',
      value: stats.courses.week,
      icon: ClockIcon,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      trend: '+15%',
      trendColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Revenus cette semaine',
      value: `${stats.revenue.week.toFixed(2)} €`,
      icon: CreditCardIcon,
      iconColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      trend: '+22%',
      trendColor: 'text-green-600 dark:text-green-400'
    }
  ];

  const quickActions = [
    {
      title: 'Nouveau chauffeur',
      description: 'Ajouter un chauffeur à la flotte',
      icon: <UserIcon className="w-5 h-5" />,
      action: () => console.log('Nouveau chauffeur')
    },
    {
      title: 'Nouveau véhicule',
      description: 'Enregistrer un nouveau véhicule',
      icon: <TruckIcon className="w-5 h-5" />,
      action: () => console.log('Nouveau véhicule')
    },
    {
      title: 'Nouveau client',
      description: 'Créer une fiche client',
      icon: <BuildingOfficeIcon className="w-5 h-5" />,
      action: () => console.log('Nouveau client')
    },
    {
      title: 'Générer facture',
      description: 'Créer une nouvelle facture',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      action: () => console.log('Générer facture')
    }
  ];

  const alerts = [
    {
      type: 'warning',
      message: '2 véhicules nécessitent une maintenance',
      icon: <ExclamationTriangleIcon className="w-5 h-5" />
    },
    {
      type: 'info',
      message: '3 chauffeurs ont des feuilles de route à valider',
      icon: <ClockIcon className="w-5 h-5" />
    },
    {
      type: 'success',
      message: 'Toutes les factures du mois ont été générées',
      icon: <CheckCircleIcon className="w-5 h-5" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vue d&apos;ensemble</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Tableau de bord général de l&apos;administration</p>
        </div>
        <Button
          onClick={loadDashboardStats}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-8 w-8 ${card.iconColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <div className="space-y-1">
                  {card.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
                      <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activityCards.map((card, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-8 w-8 ${card.iconColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
                <p className={`text-sm font-medium ${card.trendColor}`}>
                  {card.trend}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Alerts Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alertes et notifications</h3>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div className={`p-1 rounded-full ${
                alert.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                alert.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              }`}>
                {alert.icon}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{alert.message}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="p-4 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  {action.icon}
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">{action.title}</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}