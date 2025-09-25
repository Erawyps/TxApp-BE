import { Suspense, useState, useEffect } from 'react';
import ErrorBoundary from "components/shared/ErrorBoundary";
import KpiCards from './KpiCards';
import RevenuesChart from './RevenuesChart';
import TripsCountChart from './TripsCountChart';
import PaymentMethodChart from './PaymentMethodChart';
import DriverPerformanceChart from './DriverPerformanceChart';

// Import des services
import { getKPIs, getChartData, defaultKPIs } from './data';

const KPISection = () => {
  const [kpis, setKpis] = useState(defaultKPIs);
  const [chartData, setChartData] = useState({
    dailyRevenues: [],
    dailyTripsCount: [],
    paymentMethodDistribution: [],
    driverPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Charger les KPIs
        const kpiData = await getKPIs();
        setKpis(kpiData);

        // Charger les données des graphiques
        const [revenues, tripsCount, paymentDist, driverPerf] = await Promise.all([
          getChartData('dailyRevenues'),
          getChartData('dailyTripsCount'),
          getChartData('paymentMethodDistribution'),
          getChartData('driverPerformance')
        ]);

        setChartData({
          dailyRevenues: revenues,
          dailyTripsCount: tripsCount,
          paymentMethodDistribution: paymentDist,
          driverPerformance: driverPerf
        });

      } catch (err) {
        console.error('Erreur lors du chargement des données KPI:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Erreur de chargement des données: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ErrorBoundary fallback={<div>Erreur dans les cartes KPI</div>}>
        <Suspense fallback={<div>Chargement des cartes...</div>}>
          <KpiCards kpis={kpis} loading={loading} />
        </Suspense>
      </ErrorBoundary>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ErrorBoundary fallback={<div>Erreur dans le graphique des revenus</div>}>
          <RevenuesChart data={chartData.dailyRevenues} loading={loading} />
        </ErrorBoundary>

        <ErrorBoundary fallback={<div>Erreur dans le graphique des courses</div>}>
          <TripsCountChart data={chartData.dailyTripsCount} loading={loading} />
        </ErrorBoundary>

        <ErrorBoundary fallback={<div>Erreur dans le graphique des paiements</div>}>
          <PaymentMethodChart data={chartData.paymentMethodDistribution} loading={loading} />
        </ErrorBoundary>

        <ErrorBoundary fallback={<div>Erreur dans le graphique des performances</div>}>
          <DriverPerformanceChart data={chartData.driverPerformance} loading={loading} />
        </ErrorBoundary>
      </div>
    </div>
  );
};

// Export par défaut essentiel pour le lazy loading
export default KPISection;