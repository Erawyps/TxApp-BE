# TxApp API - Documentation Postman

## Vue d'ensemble

Cette collection Postman contient tous les endpoints de l'API TxApp pour la gestion des taxis. Elle est organisée par entités et inclut des exemples de requêtes pour tous les endpoints CRUD.

## Configuration des environnements

### Environnement de développement (TxApp-Dev)
- **Base URL**: `http://localhost:8787/api`
- **Variables**:
  - `base_url`: `http://localhost:8787/api`
  - `jwt_token`: À définir après authentification

### Environnement de production (TxApp-Prod)
- **Base URL**: `https://txapp.be/api`
- **Variables**:
  - `base_url`: `https://txapp.be/api`
  - `jwt_token`: À définir après authentification

## Structure de la collection

### 1. Utilisateurs
- **GET** `/utilisateurs` - Liste des utilisateurs
- **GET** `/utilisateurs/:id` - Utilisateur par ID
- **POST** `/utilisateurs` - Créer utilisateur
- **PUT** `/utilisateurs/:id` - Modifier utilisateur
- **DELETE** `/utilisateurs/:id` - Supprimer utilisateur

### 2. Chauffeurs
- **GET** `/chauffeurs` - Liste des chauffeurs
- **GET** `/chauffeurs/:id` - Chauffeur par ID
- **GET** `/chauffeurs/:chauffeurId/feuilles-route` - Feuilles de route du chauffeur
- **GET** `/chauffeurs/:chauffeurId/interventions` - Interventions du chauffeur
- **POST** `/chauffeurs` - Créer chauffeur
- **PUT** `/chauffeurs/:id` - Modifier chauffeur
- **DELETE** `/chauffeurs/:id` - Supprimer chauffeur

### 3. Interventions
- **GET** `/interventions` - Liste des interventions
- **POST** `/interventions` - Créer intervention

### 4. Véhicules
- **GET** `/vehicules` - Liste des véhicules
- **GET** `/vehicules/:id` - Véhicule par ID
- **POST** `/vehicules` - Créer véhicule
- **PUT** `/vehicules/:id` - Modifier véhicule
- **DELETE** `/vehicules/:id` - Supprimer véhicule

### 5. Clients
- **GET** `/clients` - Liste des clients
- **GET** `/clients/:id` - Client par ID
- **POST** `/clients` - Créer client
- **PUT** `/clients/:id` - Modifier client
- **DELETE** `/clients/:id` - Supprimer client

### 6. Feuilles de Route
- **GET** `/feuilles-route` - Liste des feuilles de route
- **GET** `/feuilles-route/:id` - Feuille de route par ID
- **POST** `/feuilles-route` - Créer feuille de route
- **PUT** `/feuilles-route/:id` - Modifier feuille de route
- **DELETE** `/feuilles-route/:id` - Supprimer feuille de route

### 7. Courses
- **GET** `/courses` - Liste des courses
- **GET** `/courses/feuille/:feuilleId` - Courses par feuille
- **POST** `/courses` - Créer course
- **PUT** `/courses/:id` - Modifier course
- **DELETE** `/courses/:id` - Supprimer course

### 8. Charges
- **GET** `/charges` - Liste des charges
- **GET** `/charges/feuille/:feuilleId` - Charges par feuille
- **POST** `/charges` - Créer charge
- **PUT** `/charges/:id` - Modifier charge
- **DELETE** `/charges/:id` - Supprimer charge

### 9. Modes de Paiement
- **GET** `/modes-paiement` - Liste des modes de paiement
- **POST** `/modes-paiement` - Créer mode de paiement

### 10. Règles de Salaire
- **GET** `/regles-salaire` - Liste des règles de salaire
- **POST** `/regles-salaire` - Créer règle de salaire

### 11. Règles de Facturation
- **GET** `/regles-facturation` - Liste des règles de facturation
- **POST** `/regles-facturation` - Créer règle de facturation

### 12. Partenaires
- **GET** `/partenaires` - Liste des partenaires
- **POST** `/partenaires` - Créer partenaire

### 13. Sociétés de Taxi
- **GET** `/societes-taxi` - Liste des sociétés

## Utilisation

### 1. Configuration initiale
1. Ouvrez Postman
2. Importez la collection `TxApp-API.postman_collection.json`
3. Importez l'environnement approprié (`TxApp-Dev.postman_environment.json` ou `TxApp-Prod.postman_environment.json`)
4. Sélectionnez l'environnement actif

### 2. Authentification
La plupart des endpoints nécessitent une authentification JWT. Vous devez d'abord vous connecter pour obtenir un token JWT, puis le définir dans la variable `jwt_token` de l'environnement.

### 3. Variables dynamiques
- `:id` - Remplacez par l'ID réel de la ressource
- `:chauffeurId` - Remplacez par l'ID du chauffeur
- `:feuilleId` - Remplacez par l'ID de la feuille de route

### 4. Exemples de requêtes
Chaque requête inclut des exemples de corps JSON valides. Les champs obligatoires sont marqués dans la documentation API complète.

## Codes d'erreur courants

- **200**: Succès
- **201**: Créé avec succès
- **400**: Requête invalide
- **401**: Non autorisé (token manquant ou invalide)
- **403**: Interdit (permissions insuffisantes)
- **404**: Ressource non trouvée
- **500**: Erreur serveur

## Bonnes pratiques

1. **Testez d'abord en développement** avant de passer en production
2. **Utilisez des variables d'environnement** pour les URLs et tokens
3. **Vérifiez les permissions** avant d'exécuter des opérations de modification
4. **Sauvegardez vos environnements** après configuration
5. **Documentez vos modifications** si vous ajoutez des requêtes personnalisées

## Support

Pour toute question concernant l'utilisation de cette collection Postman, consultez la documentation API complète dans `API.md` ou contactez l'équipe de développement.