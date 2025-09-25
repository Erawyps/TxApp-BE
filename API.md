# TxApp API Documentation

## Vue d'ensemble

TxApp est une application de gestion de taxis qui fournit une API REST complète pour la gestion des chauffeurs, véhicules, clients, courses, charges et autres entités liées au métier du taxi.

**Base URL:** `https://txapp.be/api` (Production) | `http://localhost:3001/api` (Développement)

**Format de réponse:** JSON

**Authentification:** JWT via headers `Authorization: Bearer <token>`

---

## Utilisateurs

### GET /utilisateurs
Récupère la liste de tous les utilisateurs.

**Réponse:**
```json
[
  {
    "user_id": 1,
    "email": "user@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "Driver",
    "societe_id": 1,
    "chauffeur": {
      "chauffeur_id": 1,
      "statut": "Actif",
      "societe_taxi": {
        "societe_id": 1,
        "nom_societe": "Taxi Plus"
      }
    }
  }
]
```

### GET /utilisateurs/:id
Récupère un utilisateur spécifique par son ID.

**Paramètres:**
- `id` (path): ID de l'utilisateur

### POST /utilisateurs
Crée un nouvel utilisateur.

**Corps de la requête:**
```json
{
  "email": "newuser@example.com",
  "mot_de_passe_hashe": "hashed_password",
  "nom": "Martin",
  "prenom": "Marie",
  "role": "Driver",
  "societe_id": 1
}
```

### PUT /utilisateurs/:id
Met à jour un utilisateur existant.

### DELETE /utilisateurs/:id
Supprime un utilisateur.

---

## Chauffeurs

### GET /chauffeurs
Récupère la liste de tous les chauffeurs.

**Réponse:**
```json
[
  {
    "chauffeur_id": 1,
    "societe_id": 1,
    "statut": "Actif",
    "utilisateur": {
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@example.com"
    },
    "societe_taxi": {
      "nom_societe": "Taxi Plus"
    }
  }
]
```

### GET /chauffeurs/:id
Récupère un chauffeur spécifique par son ID.

### GET /chauffeurs/:chauffeurId/feuilles-route
Récupère les feuilles de route d'un chauffeur.

**Paramètres:**
- `chauffeurId` (path): ID du chauffeur
- `date` (query, optionnel): Date au format YYYY-MM-DD

### GET /chauffeurs/:chauffeurId/interventions
Récupère les interventions d'un chauffeur.

**Paramètres:**
- `chauffeurId` (path): ID du chauffeur

### POST /chauffeurs
Crée un nouveau chauffeur.

**Corps de la requête:**
```json
{
  "chauffeur_id": 1,
  "societe_id": 1,
  "statut": "Actif",
  "regle_salaire_defaut_id": 1
}
```

### PUT /chauffeurs/:id
Met à jour un chauffeur existant.

### DELETE /chauffeurs/:id
Supprime un chauffeur.

---

## Interventions

### GET /interventions
Récupère la liste de toutes les interventions.

**Réponse:**
```json
[
  {
    "intervention_id": 1,
    "chauffeur_id": 1,
    "type": "police",
    "description": "Contrôle de routine",
    "date": "2025-01-15",
    "location": "Paris Centre",
    "created_by": "admin",
    "created_at": "2025-01-15T10:30:00Z",
    "chauffeur": {
      "utilisateur": {
        "nom": "Dupont",
        "prenom": "Jean"
      }
    }
  }
]
```

### POST /interventions
Crée une nouvelle intervention.

**Corps de la requête:**
```json
{
  "chauffeurId": 1,
  "type": "police",
  "description": "Contrôle de routine",
  "date": "2025-01-15",
  "location": "Paris Centre",
  "createdBy": "admin"
}
```

---

## Véhicules

### GET /vehicules
Récupère la liste de tous les véhicules.

**Réponse:**
```json
[
  {
    "vehicule_id": 1,
    "societe_id": 1,
    "plaque_immatriculation": "AA-123-BB",
    "marque": "Peugeot",
    "modele": "208",
    "annee": 2020,
    "est_actif": true
  }
]
```

### GET /vehicules/:id
Récupère un véhicule spécifique par son ID.

### POST /vehicules
Crée un nouveau véhicule.

**Corps de la requête:**
```json
{
  "societe_id": 1,
  "plaque_immatriculation": "AA-123-BB",
  "marque": "Peugeot",
  "modele": "208",
  "annee": 2020,
  "est_actif": true
}
```

### PUT /vehicules/:id
Met à jour un véhicule existant.

### DELETE /vehicules/:id
Supprime un véhicule.

---

## Clients

### GET /clients
Récupère la liste de tous les clients.

**Réponse:**
```json
[
  {
    "client_id": 1,
    "societe_id": 1,
    "nom_societe": "Entreprise ABC",
    "num_tva": "BE0123456789",
    "adresse": "123 Rue de la Paix, 1000 Bruxelles",
    "telephone": "+32 2 123 45 67"
  }
]
```

### GET /clients/:id
Récupère un client spécifique par son ID.

### POST /clients
Crée un nouveau client.

**Corps de la requête:**
```json
{
  "societe_id": 1,
  "nom_societe": "Entreprise ABC",
  "num_tva": "BE0123456789",
  "adresse": "123 Rue de la Paix, 1000 Bruxelles",
  "telephone": "+32 2 123 45 67"
}
```

### PUT /clients/:id
Met à jour un client existant.

### DELETE /clients/:id
Supprime un client.

---

## Feuilles de Route

### GET /feuilles-route
Récupère la liste de toutes les feuilles de route.

### GET /feuilles-route/:id
Récupère une feuille de route spécifique par son ID.

### POST /feuilles-route
Crée une nouvelle feuille de route.

**Corps de la requête:**
```json
{
  "chauffeur_id": 1,
  "vehicule_id": 1,
  "date_feuille": "2025-01-15",
  "courses": [
    {
      "num_ordre": 1,
      "index_depart": 1000,
      "index_embarquement": 1005,
      "lieu_embarquement": "Gare Centrale",
      "heure_embarquement": "2025-01-15T08:00:00Z",
      "index_debarquement": 1020,
      "lieu_debarquement": "Aéroport",
      "heure_debarquement": "2025-01-15T08:30:00Z",
      "prix_taximetre": 25.50,
      "sommes_percues": 30.00,
      "mode_paiement_id": 1,
      "client_id": 1
    }
  ],
  "charges": [
    {
      "description": "Carburant",
      "montant": 45.00,
      "mode_paiement_id": 2
    }
  ]
}
```

### PUT /feuilles-route/:id
Met à jour une feuille de route existante.

### DELETE /feuilles-route/:id
Supprime une feuille de route.

---

## Courses

### GET /courses
Récupère la liste de toutes les courses.

### GET /courses/feuille/:feuilleId
Récupère les courses d'une feuille de route spécifique.

### POST /courses
Crée une nouvelle course.

### PUT /courses/:id
Met à jour une course existante.

### DELETE /courses/:id
Supprime une course.

---

## Charges

### GET /charges
Récupère la liste de toutes les charges.

### GET /charges/feuille/:feuilleId
Récupère les charges d'une feuille de route spécifique.

### POST /charges
Crée une nouvelle charge.

### PUT /charges/:id
Met à jour une charge existante.

### DELETE /charges/:id
Supprime une charge.

---

## Modes de Paiement

### GET /modes-paiement
Récupère la liste de tous les modes de paiement.

### POST /modes-paiement
Crée un nouveau mode de paiement.

---

## Règles de Salaire

### GET /regles-salaire
Récupère la liste de toutes les règles de salaire.

### POST /regles-salaire
Crée une nouvelle règle de salaire.

---

## Règles de Facturation

### GET /regles-facturation
Récupère la liste de toutes les règles de facturation.

### POST /regles-facturation
Crée une nouvelle règle de facturation.

---

## Partenaires

### GET /partenaires
Récupère la liste de tous les partenaires.

### POST /partenaires
Crée un nouveau partenaire.

---

## Sociétés de Taxi

### GET /societes-taxi
Récupère la liste de toutes les sociétés de taxi.

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 204 | Supprimé avec succès |
| 400 | Requête invalide |
| 401 | Non autorisé |
| 404 | Ressource non trouvée |
| 500 | Erreur interne du serveur |

## Exemples d'utilisation

### JavaScript (axios)

```javascript
import axios from 'axios';

// Configuration de base
const api = axios.create({
  baseURL: 'https://txapp.be/api',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Récupérer tous les chauffeurs
const chauffeurs = await api.get('/chauffeurs');

// Créer une nouvelle intervention
const intervention = await api.post('/interventions', {
  chauffeurId: 1,
  type: 'police',
  description: 'Contrôle de routine',
  date: '2025-01-15',
  location: 'Paris Centre',
  createdBy: 'admin'
});
```

### cURL

```bash
# Récupérer tous les chauffeurs
curl -X GET "https://txapp.be/api/chauffeurs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Créer une intervention
curl -X POST "https://txapp.be/api/interventions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chauffeurId": 1,
    "type": "police",
    "description": "Contrôle de routine",
    "date": "2025-01-15",
    "location": "Paris Centre",
    "createdBy": "admin"
  }'
```

---

## Notes importantes

- Toutes les dates doivent être au format ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
- Les montants sont représentés en décimales (ex: 25.50 pour 25,50€)
- Les relations entre entités sont automatiquement gérées par l'API
- L'authentification JWT est requise pour toutes les opérations d'écriture
- Les opérations de lecture peuvent être publiques selon la configuration

---

*Dernière mise à jour: Septembre 2025*