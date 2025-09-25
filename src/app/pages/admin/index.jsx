import { useState } from 'react';
import { Page } from 'components/shared/Page';
import { Card } from 'components/ui';
import { Tabs } from 'components/ui/Tabs';
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
  ChartBarIcon
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

const tabs = [
  {
    label: 'Vue d\'ensemble',
    value: 'overview',
    icon: <ChartBarIcon className="w-5 h-5" />,
    component: OverviewDashboard
  },
  {
    label: 'Utilisateurs',
    value: 'users',
    icon: <UserGroupIcon className="w-5 h-5" />,
    component: UsersManagement
  },
  {
    label: 'Chauffeurs',
    value: 'drivers',
    icon: <UserIcon className="w-5 h-5" />,
    component: DriversManagement
  },
  {
    label: 'Véhicules',
    value: 'vehicles',
    icon: <TruckIcon className="w-5 h-5" />,
    component: VehiclesManagement
  },
  {
    label: 'Clients',
    value: 'clients',
    icon: <BuildingOfficeIcon className="w-5 h-5" />,
    component: ClientsManagement
  },
  {
    label: 'Modes de paiement',
    value: 'payment-methods',
    icon: <CreditCardIcon className="w-5 h-5" />,
    component: PaymentMethodsManagement
  },
  {
    label: 'Règles de salaire',
    value: 'salary-rules',
    icon: <CurrencyEuroIcon className="w-5 h-5" />,
    component: SalaryRulesManagement
  },
  {
    label: 'Règles de facturation',
    value: 'billing-rules',
    icon: <DocumentTextIcon className="w-5 h-5" />,
    component: BillingRulesManagement
  },
  {
    label: 'Partenaires',
    value: 'partners',
    icon: <BuildingStorefrontIcon className="w-5 h-5" />,
    component: PartnersManagement
  },
  {
    label: 'Gestion factures',
    value: 'invoices',
    icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
    component: InvoicesManagement
  },
  {
    label: 'Interventions',
    value: 'interventions',
    icon: <WrenchScrewdriverIcon className="w-5 h-5" />,
    component: InterventionsManagement
  },
  {
    label: 'Paramètres société',
    value: 'company-settings',
    icon: <Cog6ToothIcon className="w-5 h-5" />,
    component: CompanySettings
  }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const ActiveComponent = tabs.find(tab => tab.value === activeTab)?.component || OverviewDashboard;

  return (
    <Page title="Administration - TxApp" className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administration TxApp
          </h1>
          <p className="text-gray-600">
            Gérez tous les aspects de votre société de taxi : utilisateurs, chauffeurs, véhicules, clients et paramètres système.
          </p>
        </div>

        <Card className="mb-6">
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.TabList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 p-4">
              {tabs.map((tab) => (
                <Tabs.TabNav
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </Tabs.TabNav>
              ))}
            </Tabs.TabList>

            <div className="p-6">
              <ActiveComponent />
            </div>
          </Tabs>
        </Card>
      </div>
    </Page>
  );
}