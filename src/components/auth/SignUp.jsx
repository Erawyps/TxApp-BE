// Import Dependencies
import { useState, useEffect } from "react";
import { useAuth } from "hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

// Local Imports
import { Card, Button, Input } from "components/ui";

// ----------------------------------------------------------------------

// Schéma de validation Yup basé sur le modèle Prisma utilisateur
const signUpSchema = yup.object().shape({
  email: yup
    .string()
    .email("Adresse email invalide")
    .required("L'adresse email est requise"),
  password: yup
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    )
    .required("Le mot de passe est requis"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], "Les mots de passe ne correspondent pas")
    .required("La confirmation du mot de passe est requise"),
  prenom: yup
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .required("Le prénom est requis"),
  nom: yup
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .required("Le nom est requis"),
  telephone: yup
    .string()
    .matches(/^(\+33|0)[1-9](\d{2}){4}$/, "Numéro de téléphone invalide")
    .required("Le numéro de téléphone est requis"),
  type_utilisateur: yup
    .string()
    .oneOf(['CLIENT', 'CHAUFFEUR'], "Type d'utilisateur invalide")
    .required("Le type d'utilisateur est requis"),
  adresse: yup
    .string()
    .min(5, "L'adresse doit contenir au moins 5 caractères")
    .required("L'adresse est requise"),
  ville: yup
    .string()
    .min(2, "La ville doit contenir au moins 2 caractères")
    .required("La ville est requise"),
  code_postal: yup
    .string()
    .matches(/^[0-9]{5}$/, "Code postal invalide")
    .required("Le code postal est requis"),
  acceptTerms: yup
    .boolean()
    .oneOf([true], "Vous devez accepter les conditions d'utilisation")
    .required("Vous devez accepter les conditions d'utilisation")
});

/**
 * Composant d'inscription utilisateur avec validation complète
 */
export default function SignUp() {
  const { register: registerUser, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger
  } = useForm({
    resolver: yupResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      type_utilisateur: 'client',
      acceptTerms: false
    }
  });

  const watchedType = watch("type_utilisateur");

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = getRedirectPath(user.type_utilisateur);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const getRedirectPath = (userType) => {
    const redirectMap = {
      ADMIN: '/dashboard/admin',
      GESTIONNAIRE: '/dashboard/gestionnaire',
      CHAUFFEUR: '/dashboard/chauffeur',
      CLIENT: '/dashboard/client'
    };
    return redirectMap[userType] || '/dashboard';
  };

  const getUserTypeLabel = (type) => {
    const labels = {
      CLIENT: 'Client',
      CHAUFFEUR: 'Chauffeur'
    };
    return labels[type] || type;
  };

  const getUserTypeDescription = (type) => {
    const descriptions = {
      CLIENT: 'Réservation et suivi de courses',
      CHAUFFEUR: 'Gestion des courses et véhicules'
    };
    return descriptions[type] || '';
  };

  const handleTypeChange = (type) => {
    setValue("type_utilisateur", type);
    trigger("type_utilisateur");
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Préparer les données utilisateur pour l'inscription
      const userData = {
        email: data.email,
        password: data.password,
        prenom: data.prenom,
        nom: data.nom,
        telephone: data.telephone,
        type_utilisateur: data.type_utilisateur,
        adresse: data.adresse,
        ville: data.ville,
        code_postal: data.code_postal
      };

      const result = await registerUser(userData);

      if (result.success) {
        toast.success(`🎉 Compte créé avec succès ! Bienvenue ${data.prenom} ${data.nom}`);
        // La redirection sera gérée automatiquement par le AuthProvider
      } else {
        toast.error(result.error || "Erreur lors de l'inscription");
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      toast.error("Erreur lors de l'inscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1
      ? ['prenom', 'nom', 'email', 'telephone']
      : ['password', 'confirmPassword', 'type_utilisateur', 'adresse', 'ville', 'code_postal', 'acceptTerms'];

    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, 2));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Afficher un indicateur de chargement pendant la redirection
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Inscription réussie !
          </h3>
          <p className="text-sm text-gray-600">
            Redirection vers votre tableau de bord...
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
            Créer un compte TxApp
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Rejoignez notre plateforme de transport
          </p>
        </div>

        {/* Indicateur de progression */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm">Informations</span>
          </div>
          <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm">Sécurité</span>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Étape 1: Informations personnelles */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <Input
                      {...register("prenom")}
                      className="w-full"
                      placeholder="Votre prénom"
                    />
                    {errors.prenom && (
                      <p className="mt-1 text-sm text-red-600">{errors.prenom.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <Input
                      {...register("nom")}
                      className="w-full"
                      placeholder="Votre nom"
                    />
                    {errors.nom && (
                      <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <EnvelopeIcon className="inline h-4 w-4 mr-1" />
                    Adresse email
                  </label>
                  <Input
                    {...register("email")}
                    type="email"
                    className="w-full"
                    placeholder="votre.email@exemple.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <PhoneIcon className="inline h-4 w-4 mr-1" />
                    Téléphone
                  </label>
                  <Input
                    {...register("telephone")}
                    type="tel"
                    className="w-full"
                    placeholder="06 12 34 56 78"
                  />
                  {errors.telephone && (
                    <p className="mt-1 text-sm text-red-600">{errors.telephone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPinIcon className="inline h-4 w-4 mr-1" />
                    Adresse
                  </label>
                  <Input
                    {...register("adresse")}
                    className="w-full"
                    placeholder="123 rue de la Paix"
                  />
                  {errors.adresse && (
                    <p className="mt-1 text-sm text-red-600">{errors.adresse.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <Input
                      {...register("ville")}
                      className="w-full"
                      placeholder="Paris"
                    />
                    {errors.ville && (
                      <p className="mt-1 text-sm text-red-600">{errors.ville.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal
                    </label>
                    <Input
                      {...register("code_postal")}
                      className="w-full"
                      placeholder="75001"
                    />
                    {errors.code_postal && (
                      <p className="mt-1 text-sm text-red-600">{errors.code_postal.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2: Sécurité et type d'utilisateur */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {/* Type d'utilisateur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Type de compte
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {['CLIENT', 'CHAUFFEUR'].map((type) => (
                      <div
                        key={type}
                        onClick={() => handleTypeChange(type)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          watchedType === type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            value={type}
                            checked={watchedType === type}
                            onChange={() => handleTypeChange(type)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">
                              {getUserTypeLabel(type)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {getUserTypeDescription(type)}
                            </div>
                          </div>
                          {watchedType === type && (
                            <CheckCircleIcon className="ml-auto h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.type_utilisateur && (
                    <p className="mt-1 text-sm text-red-600">{errors.type_utilisateur.message}</p>
                  )}
                </div>

                {/* Mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      className="w-full pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Conditions d'utilisation */}
                <div className="flex items-start">
                  <input
                    {...register("acceptTerms")}
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <label className="text-sm text-gray-700">
                      J&apos;accepte les{' '}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                        conditions d&apos;utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                        politique de confidentialité
                      </Link>
                    </label>
                    {errors.acceptTerms && (
                      <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Boutons de navigation */}
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Précédent
                </Button>
              )}

              {currentStep < 2 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création du compte...
                    </div>
                  ) : (
                    'Créer mon compte'
                  )}
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Déjà un compte ?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}