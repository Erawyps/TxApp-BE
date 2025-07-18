import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ErrorBoundary from './components/ErrorBoundary';
import { ShiftForm } from './components/ShiftForm';
import { schema, defaultData } from './schema';
import { toast } from 'sonner';

export default function FeuilleRouteApp() {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultData
  });

  // Données de test pour les véhicules
  const vehicles = [
    { id: 'v1', plate: 'ABC-123', model: 'Toyota Prius' },
    { id: 'v2', plate: 'DEF-456', model: 'Mercedes E-Class' },
    { id: 'v3', plate: 'GHI-789', model: 'BMW 5 Series' }
  ];

  const handleSubmit = (data) => {
    console.log('Données soumises:', data);
    toast.success('Données enregistrées avec succès !');
  };

  return (
    <ErrorBoundary>
      <div className="p-4 max-w-3xl mx-auto">
        <ShiftForm 
          control={methods.control}
          onSubmit={methods.handleSubmit(handleSubmit)}
          vehicles={vehicles} // Passer les véhicules
        />
      </div>
    </ErrorBoundary>
  );
}