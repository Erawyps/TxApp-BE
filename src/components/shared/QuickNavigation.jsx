import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  EyeIcon,
  TruckIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  HomeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from 'hooks/useAuth';

export function QuickNavigation() {
  const { user } = useAuth();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const isAdmin = user?.type_utilisateur === 'ADMIN';
  const isDriver = user?.type_utilisateur === 'CHAUFFEUR';

  const navigationItems = [
    {
      name: 'Accueil',
      href: '/dashboards/home',
      icon: HomeIcon,
      roles: ['all']
    },
    {
      name: 'Tableau Chauffeur',
      href: '/dashboards/driver',
      icon: TruckIcon,
      roles: ['CHAUFFEUR', 'ADMIN']
    },
    {
      name: 'Supervision Admin',
      href: '/admin/oversight',
      icon: EyeIcon,
      roles: ['ADMIN'],
      badge: true
    },
    {
      name: 'Gestion Courses',
      href: '/admin/courses',
      icon: ChartBarIcon,
      roles: ['ADMIN']
    },
    {
      name: 'Formulaires',
      href: '/forms/ekyc-form',
      icon: DocumentTextIcon,
      roles: ['ADMIN']
    },
    {
      name: 'Profil',
      href: '/profile',
      icon: UsersIcon,
      roles: ['all']
    },
    {
      name: 'Paramètres',
      href: '/settings',
      icon: CogIcon,
      roles: ['ADMIN']
    }
  ];

  const filteredItems = navigationItems.filter(item => {
    if (item.roles.includes('all')) return true;
        if (isAdmin && item.roles.includes('ADMIN')) return true;
    if (isDriver && item.roles.includes('CHAUFFEUR')) return true;
    return false;
  });

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Navigation rapide"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {isExpanded && (
          <div className="absolute top-16 right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Navigation Rapide</h3>
              <p className="text-xs text-gray-500 mt-1">
                {isAdmin ? 'Mode Administrateur' : isDriver ? 'Mode Chauffeur' : 'Utilisateur'}
              </p>
            </div>

            <div className="py-2">
              {filteredItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsExpanded(false)}
                  className={`flex items-center px-4 py-3 text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${
                    isActive(item.href) ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  )}
                  {item.name === 'Supervision Admin' && (
                    <ExclamationTriangleIcon className="h-4 w-4 ml-2 text-orange-500" />
                  )}
                </Link>
              ))}
            </div>

            {isAdmin && (
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="px-4 py-2">
                  <p className="text-xs text-gray-500 mb-2">Accès rapide</p>
                  <Link
                    to="/admin/oversight"
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Supervision temps réel
                    <div className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay pour fermer le menu */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}
