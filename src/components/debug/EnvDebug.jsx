import { useSafeClerkAuth, useHasClerkProvider } from "auth/clerkSafe";

export function EnvDebug() {
  const { isSignedIn } = useSafeClerkAuth();
  const hasProvider = useHasClerkProvider();

  if (import.meta.env.PROD) return null; // Ne pas afficher en production

  const envVars = {
    'VITE_CLERK_PUBLISHABLE_KEY': import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'NODE_ENV': import.meta.env.NODE_ENV,
    'DEV': import.meta.env.DEV,
    'PROD': import.meta.env.PROD,
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg max-w-md text-xs font-mono z-50">
      <div className="font-bold mb-2">🐛 Debug Info (DEV only)</div>

      <div className="space-y-1">
        <div>Clerk Provider: {hasProvider ? '✅' : '❌'}</div>
        <div>Clerk Signed In: {isSignedIn ? '✅' : '❌'}</div>
      </div>

      <hr className="my-2 border-gray-600" />

      <div className="space-y-1">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-300">{key}:</span>
            <span className={value ? 'text-green-400' : 'text-red-400'}>
              {value ? '✅' : '❌'}
            </span>
          </div>
        ))}
      </div>

      <hr className="my-2 border-gray-600" />

      <div className="text-gray-400">
        Current: {window.location.pathname}
      </div>
    </div>
  );
}