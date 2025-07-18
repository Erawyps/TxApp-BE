import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ErrorBoundary from './components/ErrorBoundary'; // Changé pour importer le export default
import { ShiftForm } from './components/ShiftForm';
import { schema, defaultData } from './schema';
import { toast } from 'sonner';

export default function FeuilleRouteApp() {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultData
  });

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
        />
      </div>
    </ErrorBoundary>
  );
}