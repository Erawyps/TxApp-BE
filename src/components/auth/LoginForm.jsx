import { useState, useEffect, useCallback } from 'react';
import { useAuth } from 'hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'components/ui/Button';
import { Input } from 'components/ui/Input';
import { Card } from 'components/ui/Card';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

/**
 * Composant de connexion utilisateur amélioré avec gestion des types d'utilisateurs
 */
export function LoginForm() {
  const { login, isAuthenticated, isLoading, errorMessage, clearError, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);

  // Gestion du blocage après trop de tentatives
  useEffect(() => {
    if (loginAttempts >= 5) {
      setIsBlocked(true);
      setBlockTimeLeft(300); // 5 minutes en secondes

      const timer = setInterval(() => {
        setBlockTimeLeft(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            setLoginAttempts(0);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loginAttempts]);

  // Rediriger si déjà connecté avec gestion des types d'utilisateurs
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = getRedirectPath(user.type_utilisateur);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const getRedirectPath = useCallback((userType) => {
    const from = location.state?.from?.pathname;

    // Si l'utilisateur vient d'une page spécifique, essayer de le rediriger là
    if (from && from !== '/auth') {
      return from;
    }

    // Redirection basée sur le type d'utilisateur
    const redirectMap = {
      admin: '/dashboard/admin',
      gestionnaire: '/dashboard/gestionnaire',
      chauffeur: '/dashboard/chauffeur',
      client: '/dashboard/client'
    };

    return redirectMap[userType] || '/dashboard';
  }, [location.state?.from?.pathname]);

  const getUserTypeLabel = (type) => {
    const labels = {
      admin: 'Administrateur',
      gestionnaire: 'Gestionnaire',
      chauffeur: 'Chauffeur',
      client: 'Client'
    };
    return labels[type] || type;
  };

  const getUserTypeIcon = (type) => {
    const icons = {
      admin: '👑',
      gestionnaire: '⚙️',
      chauffeur: '🚗',
      client: '👤'
    };
    return icons[type] || '👤';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Effacer l'erreur quand l'utilisateur tape
    if (errorMessage) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.email) {
      errors.push('L\'adresse email est requise');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('L\'adresse email n\'est pas valide');
    }

    if (!formData.password) {
      errors.push('Le mot de passe est requis');
    } else if (formData.password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBlocked) {
      toast.error(`Trop de tentatives. Réessayez dans ${Math.ceil(blockTimeLeft / 60)} minutes`);
      return;
    }

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      if (result.success) {
        const userTypeLabel = getUserTypeLabel(result.user?.type_utilisateur);
        const userIcon = getUserTypeIcon(result.user?.type_utilisateur);
        toast.success(`${userIcon} Bienvenue ${result.user?.prenom || result.user?.email} (${userTypeLabel}) !`);
        setLoginAttempts(0); // Réinitialiser les tentatives en cas de succès
      } else {
        setLoginAttempts(prev => prev + 1);
        toast.error(result.error || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setLoginAttempts(prev => prev + 1);
      toast.error('Erreur lors de la connexion');
    }
  };

  // Afficher un indicateur de chargement pendant la redirection
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Connexion en cours...
          </h3>
          <p className="text-sm text-gray-600">
            Redirection vers votre tableau de bord {getUserTypeLabel(user.type_utilisateur).toLowerCase()}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <UserIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion à TxApp
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connectez-vous à votre compte pour accéder à l&apos;application
          </p>
        </div>

        <Card className="p-6">
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <div className="text-red-600 text-sm flex-1">{errorMessage}</div>
                {loginAttempts > 0 && (
                  <span className="text-xs text-red-500 ml-2">
                    Tentative {loginAttempts}/5
                  </span>
                )}
              </div>
            </div>
          )}

          {isBlocked && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <div className="text-yellow-800 text-sm">
                  Compte temporairement bloqué. Réessayez dans {Math.ceil(blockTimeLeft / 60)} minutes.
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full"
                placeholder="votre.email@exemple.com"
                disabled={isBlocked}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pr-10"
                  placeholder="••••••••"
                  disabled={isBlocked}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isBlocked}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isBlocked}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                {/* TODO: Implement forgot password functionality */}
                {/* <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Mot de passe oublié ?
                </a> */}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isBlocked}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Nouveau sur TxApp ?</span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/sign-up"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Créer un compte
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LoginForm;
