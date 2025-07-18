import { DriverForm } from './components/DriverForm';
import { ErrorBoundary } from './components/ErrorBoundary';

const vehicles = [
  {
    id: 'VH001',
    plaque: 'TX-AA-171',
    marque: 'Mercedes',
    modele: 'Classe E',
    type: 'Berline',
    km: 125000
  }
];

export default function App() {
  return (
    <ErrorBoundary>
      <DriverForm vehicles={vehicles} />
    </ErrorBoundary>
  );
}