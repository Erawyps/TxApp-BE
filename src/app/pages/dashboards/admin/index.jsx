import { useState } from 'react';
import { Page } from 'components/shared/Page';
import ErrorBoundary from 'components/shared/ErrorBoundary';
import {
  UserGroupIcon,
  TruckIcon,
  UsersIcon,
  CogIcon,
  HandshakeIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// Import des composants admin
import ChauffeursManagement from './components/ChauffeursManagement';
import VehiculesManagement from './components/VehiculesManagement';
import ClientsManagement from './components/ClientsManagement';
import PartenairesManagement from './components/PartenairesManagement';
import ParametrageManagement from './components/ParametrageManagement';
import FeuilleRouteEncoding from './components/FeuilleRouteEncoding';
import RequetesSpecifiques from './components/RequetesSpecifiques';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('chauffeurs');

  const sections = [
    {
      id: 'feuille-route',
      label: 'Encodage Feuille de Route',
      icon: DocumentTextIcon,
      component: FeuilleRouteEncoding
    },
    {
      id: 'chauffeurs',
      label: 'Gestion Chauffeurs',
      icon: UserGroupIcon,
      component: ChauffeursManagement
    },
    {
      id: 'vehicules',
      label: 'Flotte Véhicules',
      icon: TruckIcon,
      component: VehiculesManagement
    },
    {
      id: 'clients',
      label: 'Clients & Facturation',
      icon: UsersIcon,
      component: ClientsManagement
    },
    {
      id: 'partenaires',
      label: 'Partenaires',
      icon: HandshakeIcon,
      component: PartenairesManagement
    },
    {
      id: 'parametrage',
      label: 'Paramétrage',
      icon: CogIcon,
      component: ParametrageManagement
    },
    {
      id: 'requetes',
      label: 'Requêtes Spécifiques',
      icon: MagnifyingGlassIcon,
      component: RequetesSpecifiques
    }
  ];

  const ActiveComponent = sections.find(section => section.id === activeSection)?.component;

  return (
    <Page title="Administration">
      <div className="flex h-full">
        {/* Sidebar de navigation */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Administration
            </h2>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors
                    ${activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <section.icon className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <ErrorBoundary fallback={<div className="p-8 text-center text-red-600">Erreur de chargement de la section sélectionnée</div>}>
              {ActiveComponent && <ActiveComponent />}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </Page>
  );
}