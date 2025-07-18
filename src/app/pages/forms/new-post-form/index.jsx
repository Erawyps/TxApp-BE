import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema, defaultData } from './schema';
import ErrorBoundary from './components/ErrorBoundary';

export default function FeuilleRouteApp() {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultData
  });

  return (
    <ErrorBoundary>
      <div className="p-4 max-w-3xl mx-auto">
        <ShiftForm 
          control={methods.control}
          onSubmit={methods.handleSubmit(onSubmit)}
        />
      </div>
    </ErrorBoundary>
  );
}