import { useState } from 'react';
import { Page } from 'components/shared/Page';
import { Button } from 'components/ui';
import {
  UserGroupIcon,
  TruckIcon,
  UserIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Import admin section components
import UsersManagement from './sections/UsersManagement';
import DriversManagement from './sections/DriversManagement';
import VehiclesManagement from './sections/VehiclesManagement';
import ClientsManagement from './sections/ClientsManagement';
import PaymentMethodsManagement from './sections/PaymentMethodsManagement';
import SalaryRulesManagement from './sections/SalaryRulesManagement';
import BillingRulesManagement from './sections/BillingRulesManagement';
import PartnersManagement from './sections/PartnersManagement';
import InvoicesManagement from './sections/InvoicesManagement';
import InterventionsManagement from './sections/InterventionsManagement';
import CompanySettings from './sections/CompanySettings';
import OverviewDashboard from './sections/OverviewDashboard';

const navigationSections = [
  {
    title: 'Vue d\'ensemble',
    items: [
      { key: 'overview', label: 'Tableau de bord', icon: ChartBarIcon, component: OverviewDashboard }
    ]
  },
  {
    title: 'Opérations quotidiennes',
    items: [
      { key: 'drivers', label: 'Chauffeurs', icon: UserIcon, component: DriversManagement },
      { key: 'vehicles', label: 'Véhicules', icon: TruckIcon, component: VehiclesManagement }
    ]
  },
  {
    title: 'Gestion commerciale',
    items: [
      { key: 'users', label: 'Utilisateurs', icon: UserGroupIcon, component: UsersManagement },
      { key: 'clients', label: 'Clients', icon: BuildingOfficeIcon, component: ClientsManagement },
      { key: 'invoices', label: 'Factures', icon: ClipboardDocumentListIcon, component: InvoicesManagement },
      { key: 'partners', label: 'Partenaires', icon: BuildingStorefrontIcon, component: PartnersManagement }
    ]
  },
  {
    title: 'Maintenance',
    items: [
      { key: 'interventions', label: 'Interventions', icon: WrenchScrewdriverIcon, component: InterventionsManagement }
    ]
  },
  {
    title: 'Configuration',
    items: [
      { key: 'payment-methods', label: 'Modes de paiement', icon: CreditCardIcon, component: PaymentMethodsManagement },
      { key: 'salary-rules', label: 'Règles de salaire', icon: CurrencyEuroIcon, component: SalaryRulesManagement },
      { key: 'billing-rules', label: 'Règles de facturation', icon: DocumentTextIcon, component: BillingRulesManagement },
      { key: 'company-settings', label: 'Société', icon: Cog6ToothIcon, component: CompanySettings }
    ]
  }
];

// Flatten navigation items for backward compatibility
const tabs = navigationSections.flatMap(section => section.items);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const ActiveComponent = tabs.find(tab => tab.key === activeTab)?.component || OverviewDashboard;

  const handleRefreshData = () => {
    // Recharger les données des composants actifs
    window.location.reload();
  };

  return (
    <Page title="Administration - TxApp" className="bg-gray-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* En-tête avec bouton d'actualisation */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Administration TxApp
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gérez tous les aspects de votre société de taxi : utilisateurs, chauffeurs, véhicules, clients et paramètres système.
              </p>
            </div>
            <Button
              onClick={handleRefreshData}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Navigation verticale organisée en sections */}
        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Navigation latérale */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Administration
                </h3>
                <nav className="space-y-6">
                  {navigationSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {section.title}
                      </h4>
                      <div className="space-y-1">
                        {section.items.map(item => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.key}
                              onClick={() => setActiveTab(item.key)}
                              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                activeTab === item.key
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-r-2 border-blue-500'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-dark-700'
                              }`}
                            >
                              <Icon className="h-5 w-5 flex-shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 p-6">
                {/* En-tête de la section active */}
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const activeItem = tabs.find(tab => tab.key === activeTab);
                      if (activeItem) {
                        const Icon = activeItem.icon;
                        return <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
                      }
                      return null;
                    })()}
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {tabs.find(tab => tab.key === activeTab)?.label || 'Section'}
                    </h2>
                  </div>
                </div>

                {/* Contenu de l'onglet */}
                <div className="transition-content">
                  <ActiveComponent />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}