import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  username: Yup.string()
    .email('Format d\'email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Le mot de passe est requis'),
});

export const registerSchema = Yup.object().shape({
  email: Yup.string()
    .email('Format d\'email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    )
    .required('Le mot de passe est requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('Confirmez le mot de passe'),
  nom: Yup.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Le nom est requis'),
  prenom: Yup.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .required('Le prénom est requis'),
  telephone: Yup.string()
    .matches(/^\+?[0-9\s\-()]{10,}$/, 'Format de téléphone invalide'),
  role: Yup.string()
    .oneOf(['Admin', 'Controleur', 'Chauffeur'], 'Rôle invalide')
    .required('Le rôle est requis'),
});

// Pour compatibilité avec l'ancien code
export const schema = loginSchema;