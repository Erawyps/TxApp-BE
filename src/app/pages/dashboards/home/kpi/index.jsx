import { Suspense } from 'react';
import ErrorBoundary from "components/shared/ErrorBoundary";
import KpiCards from './KpiCards';
import RevenuesChart from './RevenuesChart';
import TripsCountChart from './TripsCountChart';

// Vérification des données
import { kpis } from './data';

const KPISection = () => {
  // Validation des données avant rendu
  if (!kpis || typeof kpis !== 'object') {
    throw new Error('Données KPI non valides');
  }

  return (
    <div className="space-y-6">
      <ErrorBoundary fallback={<div>Erreur dans les cartes KPI</div>}>
        <Suspense fallback={<div>Chargement des cartes...</div>}>
          <KpiCards />
        </Suspense>
      </ErrorBoundary>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ErrorBoundary fallback={<div>Erreur dans le graphique des revenus</div>}>
          <RevenuesChart />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<div>Erreur dans le graphique des courses</div>}>
          <TripsCountChart />
        </ErrorBoundary>
      </div>
    </div>
  );
};

// Export par défaut essentiel pour le lazy loading
export default KPISection;