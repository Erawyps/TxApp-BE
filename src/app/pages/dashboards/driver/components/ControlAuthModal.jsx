import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { ShieldCheckIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { Button, Input } from 'components/ui';
import { useAuthContext } from 'app/contexts/auth/context';

// Schéma de validation pour l'authentification contrôleur
const controlAuthSchema = Yup.object().shape({
  email: Yup.string()
    .email('Format d\'email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .required('Le mot de passe est requis'),
});

export function ControlAuthModal({ isOpen, onClose, onSuccess }) {
  const { login: loginUser } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(controlAuthSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      // Tenter de se connecter avec les identifiants fournis
      const result = await loginUser(data.email, data.password);

      if (result.success) {
        // Vérifier que l'utilisateur est bien un contrôleur
        if (result.user?.role === 'Controleur') {
          onSuccess(result.user);
          onClose();
          reset();
        } else {
          setError('Vous n\'avez pas les permissions de contrôleur.');
        }
      } else {
        setError('Email ou mot de passe incorrect.');
      }
    } catch (err) {
      console.error('Erreur d\'authentification contrôleur:', err);
      setError(err.message || 'Erreur lors de l\'authentification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Authentification contrôleur
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Pour accéder aux données des chauffeurs, veuillez confirmer votre identité de contrôleur.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                  <div>
                    <Input
                      unstyled
                      placeholder="Votre email"
                      type="email"
                      className="w-full rounded-lg bg-gray-150 px-3 py-2 transition-colors placeholder:text-gray-400 focus:ring-3 focus:ring-purple-500/50 dark:bg-dark-900 dark:placeholder:text-dark-200/70"
                      prefix={
                        <UserIcon className="size-5 transition-colors duration-200" strokeWidth="1" />
                      }
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      unstyled
                      type="password"
                      placeholder="Votre mot de passe"
                      className="w-full rounded-lg bg-gray-150 px-3 py-2 transition-colors placeholder:text-gray-400 focus:ring-3 focus:ring-purple-500/50 dark:bg-dark-900 dark:placeholder:text-dark-200/70"
                      prefix={
                        <LockClosedIcon className="size-5 transition-colors duration-200" strokeWidth="1" />
                      }
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {isLoading ? 'Authentification...' : 'S\'authentifier'}
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Annuler
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}