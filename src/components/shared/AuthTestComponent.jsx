import { useState } from "react";
import { useAuthContext } from "app/contexts/auth/context";
import { runAllTests } from "utils/testAuth";
import { Card, Button } from "components/ui";

/**
 * Composant de test pour vérifier le système d&apos;authentification
 * et la connexion à la base de données
 */
export default function AuthTestComponent() {
  const { user, isAuthenticated, logout } = useAuthContext();
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runDatabaseTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error("Erreur lors des tests:", error);
      setTestResults({
        passed: 0,
        total: 0,
        results: [],
        error: error.message
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informations d'authentification */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          État de l&apos;authentification
        </h2>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Statut:</span>
            <span className={`px-2 py-1 rounded-full text-sm ${
              isAuthenticated 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {isAuthenticated ? '✅ Connecté' : '❌ Non connecté'}
            </span>
          </div>

          {user && (
            <>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Utilisateur:</span>
                <span>{user.prenom} {user.nom}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-medium">Type:</span>
                <span className="capitalize">{user.type_utilisateur}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-medium">ID:</span>
                <span>{user.id}</span>
              </div>

              {user.last_login && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Dernière connexion:</span>
                  <span>{new Date(user.last_login).toLocaleString()}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-4">
          <Button
            onClick={logout}
            variant="outline"
            color="error"
            size="sm"
          >
            Se déconnecter
          </Button>
        </div>
      </Card>

      {/* Tests de la base de données */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Tests de la base de données
        </h2>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Cliquez sur le bouton ci-dessous pour tester la connexion à la base de données
            et vérifier que les services d&apos;authentification fonctionnent correctement.
          </p>

          <Button
            onClick={runDatabaseTests}
            disabled={isRunningTests}
            color="primary"
          >
            {isRunningTests ? "Tests en cours..." : "Lancer les tests"}
          </Button>

          {testResults && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">Résultats des tests:</h3>

              {testResults.error ? (
                <div className="text-red-600 dark:text-red-400">
                  Erreur: {testResults.error}
                </div>
              ) : (
                <>
                  <div className={`text-lg font-medium mb-2 ${
                    testResults.passed === testResults.total 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {testResults.passed}/{testResults.total} tests réussis
                  </div>

                  <div className="space-y-1">
                    {testResults.results.map((result, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                          {result.success ? '✅' : '❌'}
                        </span>
                        <span>{result.name}</span>
                        {result.error && (
                          <span className="text-sm text-red-500">({result.error})</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {testResults.passed === testResults.total && (
                    <div className="mt-3 p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                      🎉 Tous les tests sont passés ! Le système est opérationnel.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Informations système */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Informations système
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Token stocké:</span>
            <span className="ml-2">
              {localStorage.getItem('authToken') ? '✅ Présent' : '❌ Absent'}
            </span>
          </div>

          <div>
            <span className="font-medium">Supabase URL:</span>
            <span className="ml-2 text-xs">
              {import.meta.env.VITE_SUPABASE_URL || 'Non configuré'}
            </span>
          </div>

          <div>
            <span className="font-medium">API Base URL:</span>
            <span className="ml-2 text-xs">
              {import.meta.env.VITE_API_BASE_URL || 'Non configuré'}
            </span>
          </div>

          <div>
            <span className="font-medium">Environnement:</span>
            <span className="ml-2">
              {import.meta.env.MODE || 'development'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
