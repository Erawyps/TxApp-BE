import { useForm } from 'react-hook-form';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ShiftForm } from './components/ShiftForm';
import { schema, defaultData } from './schema';

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