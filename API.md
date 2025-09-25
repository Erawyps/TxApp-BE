# TxApp API Documentation

## 🚀 Développement Local (API-DEV-LOCAL)

### Configuration de l'environnement de développement

**Base URL:** `http://0.0.0.0:3001/api` ou `http://localhost:3001/api`  
**Version:** 1.0.0 (Développement)  
**Authentification:** ✅ **IMPLÉMENTÉE** (routes `/api/auth/*` disponibles)  
**Format:** JSON  
**Serveur:** Hono.js + Node.js  
**Base de données:** PostgreSQL + Prisma ORM

### Démarrage du serveur de développement

```bash
# Depuis la racine du projet
cd /Users/kuassitehou/Documents/Documents\ -\ OHMPXV/GitHub/TxApp-BE

# Installation des dépendances (si nécessaire)
npm install

# Démarrage du serveur en mode développement
NODE_ENV=development node src/api/server.js

# Ou en arrière-plan pour les tests
NODE_ENV=development node src/api/server.js &
```

### Health Check

```http
GET /health
```

**Réponse de succès (200):**
```json
{
  "status": "OK",
  "timestamp": "2025-09-25T10:00:00.000Z",
  "environment": "development",
  "database": {
    "status": "healthy",
    "responseTime": 45
  },
  "monitoring": {
    "uptime": 3600,
    "requests": 150,
    "errorRate": 0.02,
    "recentAlerts": 0
  },
  "system": {
    "uptime": 3600,
    "memory": {
      "rss": 104857600,
      "heapTotal": 67108864,
      "heapUsed": 45000000,
      "external": 2000000
    },
    "platform": "darwin",
    "nodeVersion": "v18.17.0"
  }
}
```

### Headers pour les requêtes de développement

```
Content-Type: application/json
```

**Note:** Authentification JWT implémentée mais optionnelle en développement local pour faciliter les tests.

### Endpoints disponibles en développement

| Endpoint | Méthode | Description | Statut |
|----------|---------|-------------|--------|
| `/api/chauffeurs` | GET, POST | Gestion des chauffeurs | ✅ Opérationnel |
| `/api/chauffeurs/:id` | GET, PUT, DELETE | Chauffeur spécifique | ✅ Opérationnel |
| `/api/vehicules` | GET, POST | Gestion des véhicules | ✅ Opérationnel |
| `/api/vehicules/:id` | GET, PUT, DELETE | Véhicule spécifique | ✅ Opérationnel |
| `/api/clients` | GET, POST | Gestion des clients | ✅ Opérationnel |
| `/api/clients/:id` | GET, PUT, DELETE | Client spécifique | ✅ Opérationnel |
| `/api/feuilles-route` | GET, POST | Gestion des feuilles de route | ✅ Opérationnel |
| `/api/courses` | GET, POST | Gestion des courses | ✅ Opérationnel |
| `/api/courses/:id` | GET, PUT, DELETE | Course spécifique | ✅ Opérationnel |
| `/api/charges` | GET, POST | Gestion des charges | ✅ Opérationnel |
| `/api/charges/:id` | GET, PUT, DELETE | Charge spécifique | ✅ Opérationnel |
| `/api/modes-paiement` | GET, POST | Gestion des modes de paiement | ✅ Opérationnel |
| `/api/regles-salaire` | GET, POST | Gestion des règles de salaire | ✅ Opérationnel |
| `/api/auth/*` | POST | Authentification | ✅ Implémenté |

### Tests rapides des endpoints

```bash
# Démarrer le serveur en arrière-plan
NODE_ENV=development node src/api/server.js &

# Attendre le démarrage
sleep 3

# Tests des endpoints principaux
echo "=== TESTS RAPIDES DES ENDPOINTS ==="
echo "Chauffeurs:" && curl -s http://0.0.0.0:3001/api/chauffeurs | jq length
echo "Véhicules:" && curl -s http://0.0.0.0:3001/api/vehicules | jq length
echo "Clients:" && curl -s http://0.0.0.0:3001/api/clients | jq length
echo "Courses:" && curl -s http://0.0.0.0:3001/api/courses | jq length
echo "Charges:" && curl -s http://0.0.0.0:3001/api/charges | jq length
echo "Modes-paiement:" && curl -s http://0.0.0.0:3001/api/modes-paiement | jq length
echo "Règles-salaire:" && curl -s http://0.0.0.0:3001/api/regles-salaire | jq length

# Arrêter le serveur
pkill -f "node src/api/server.js"
```

### Données de test disponibles

En développement, la base de données contient des données de test :

- **6 chauffeurs** avec relations complètes (utilisateur, société, règle salaire, feuilles route)
- **10 véhicules** avec relations complètes
- **10 clients** avec relations complètes
- **40 courses** avec détails complets
- **15 charges** avec relations
- **7 modes de paiement** avec statistiques d'usage
- **3 règles de salaire** configurées

### Exemples de requêtes de développement

#### Récupérer tous les chauffeurs avec relations
```bash
curl -s http://0.0.0.0:3001/api/chauffeurs | jq '.[0] | {chauffeur_id, utilisateur: .utilisateur, societe_taxi: .societe_taxi, regle_salaire: .regle_salaire}'
```

#### Créer un nouveau chauffeur
```bash
curl -X POST http://0.0.0.0:3001/api/chauffeurs \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "Chauffeur",
    "email": "test.chauffeur@txapp.be",
    "telephone": "+32456789012",
    "statut": "Actif",
    "societe_id": 1,
    "regle_salaire_defaut_id": 1
  }'
```

#### Récupérer les courses avec détails
```bash
curl -s http://0.0.0.0:3001/api/courses | jq '.[0] | {course_id, num_ordre, prix_taximetre, sommes_percues, client: .client.nom_societe, chauffeur: .feuille_route.chauffeur.utilisateur.nom}'
```

---

## 🌐 Production API (api.txapp.be)

## Vue d'ensemble

L'API TxApp est une API REST complète pour la gestion d'une application de taxi. Elle fournit des opérations CRUD complètes pour tous les entités métier avec authentification JWT.

**Base URL:** `https://api.txapp.be/api`  
**Version:** 1.0.0  
**Authentification:** JWT Bearer Token  
**Format:** JSON

## Authentification

Toutes les requêtes nécessitent un token JWT valide dans le header `Authorization`.

### Headers requis
```
Authorization: Bearer <jwt_token>
X-API-Key: TxApp-2025-API-Key-Super-Secure  # Pour contourner Cloudflare
Content-Type: application/json
```

### 1. Connexion
```http
POST /api/auth/login
```

**Corps de la requête:**
```json
{
  "email": "jean.dupont@txapp.be",
  "password": "admin123"
}
```

**Réponse de succès (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "email": "jean.dupont@txapp.be",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "admin",
    "societe_id": 1
  },
  "expiresIn": "24h"
}
```

**Codes d'erreur:**
- `401 Unauthorized`: Email ou mot de passe incorrect

### 2. Vérification du token
```http
POST /api/auth/verify
```

**Corps de la requête:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Réponse de succès (200):**
```json
{
  "success": true,
  "user": {
    "user_id": 1,
    "email": "jean.dupont@txapp.be",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "admin",
    "societe_id": 1
  },
  "valid": true
}
```

**Codes d'erreur:**
- `401 Unauthorized`: Token invalide ou expiré

### 3. Changement de mot de passe
```http
POST /api/auth/change-password
```

**Corps de la requête:**
```json
{
  "userId": 1,
  "oldPassword": "admin123",
  "newPassword": "nouveauMotDePasse123"
}
```

**Réponse de succès (200):**
```json
{
  "success": true,
  "message": "Mot de passe changé avec succès",
  "changedAt": "2025-09-25T10:30:00.000Z"
}
```

**Codes d'erreur:**
- `400 Bad Request`: Ancien mot de passe incorrect ou nouveau mot de passe trop court
- `404 Not Found`: Utilisateur non trouvé

## Chauffeurs

### GET /api/chauffeurs

Récupère la liste de tous les chauffeurs.

**Réponse de succès (200):**
```json
[
  {
    "chauffeur_id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@txapp.be",
    "telephone": "+32456789012",
    "statut": "Actif",
    "societe_id": 1,
    "regle_salaire_defaut_id": 1,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/chauffeurs/:id

Récupère un chauffeur spécifique par son ID.

### POST /api/chauffeurs

Crée un nouveau chauffeur.

**Corps de la requête:**
```json
{
  "nom": "Dubois",
  "prenom": "Pierre",
  "email": "pierre.dubois@txapp.be",
  "telephone": "+32456789012",
  "statut": "Actif",
  "societe_id": 1,
  "regle_salaire_defaut_id": 1
}
```

### PUT /api/chauffeurs/:id

Met à jour un chauffeur existant.

### DELETE /api/chauffeurs/:id

Supprime un chauffeur.

---

## Véhicules

### GET /api/vehicules

Récupère la liste de tous les véhicules.

**Réponse de succès (200):**
```json
[
  {
    "vehicule_id": 1,
    "plaque_immatriculation": "AA-123-BB",
    "marque": "Peugeot",
    "modele": "208",
    "annee": 2020,
    "est_actif": true,
    "societe_id": 1,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/vehicules/:id

Récupère un véhicule spécifique par son ID.

### POST /api/vehicules

Crée un nouveau véhicule.

**Corps de la requête:**
```json
{
  "plaque_immatriculation": "AA-123-BB",
  "marque": "Peugeot",
  "modele": "208",
  "annee": 2020,
  "est_actif": true,
  "societe_id": 1
}
```

### PUT /api/vehicules/:id

Met à jour un véhicule existant.

### DELETE /api/vehicules/:id

Supprime un véhicule.

---

## Clients

### GET /api/clients

Récupère la liste de tous les clients.

**Réponse de succès (200):**
```json
[
  {
    "client_id": 1,
    "nom_societe": "Entreprise ABC",
    "num_tva": "BE0123456789",
    "adresse": "123 Rue de la Paix, 1000 Bruxelles",
    "telephone": "+32 2 123 45 67",
    "est_actif": true,
    "societe_id": 1,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/clients/:id

Récupère un client spécifique par son ID.

### POST /api/clients

Crée un nouveau client.

**Corps de la requête:**
```json
{
  "nom_societe": "Entreprise ABC",
  "num_tva": "BE0123456789",
  "adresse": "123 Rue de la Paix, 1000 Bruxelles",
  "telephone": "+32 2 123 45 67",
  "est_actif": true,
  "societe_id": 1
}
```

### PUT /api/clients/:id

Met à jour un client existant.

### DELETE /api/clients/:id

Supprime un client.

---

## Courses

### GET /api/courses

Récupère la liste de toutes les courses.

**Réponse de succès (200):**
```json
[
  {
    "course_id": 1,
    "feuille_id": 1,
    "num_ordre": 1,
    "index_embarquement": 1000,
    "index_debarquement": 1100,
    "sommes_percues": 25.50,
    "mode_paiement_id": 1,
    "client_id": 1,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/courses/:id

Récupère une course spécifique par son ID.

### POST /api/courses

Crée une nouvelle course.

**Corps de la requête:**
```json
{
  "feuille_id": 1,
  "num_ordre": 1,
  "index_embarquement": 1000,
  "index_debarquement": 1100,
  "sommes_percues": 25.50,
  "mode_paiement_id": 1,
  "client_id": 1
}
```

### PUT /api/courses/:id

Met à jour une course existante.

### DELETE /api/courses/:id

Supprime une course.

---

## Charges

### GET /api/charges

Récupère la liste de toutes les charges.

**Réponse de succès (200):**
```json
[
  {
    "charge_id": 1,
    "feuille_id": 1,
    "description": "Carburant",
    "montant": 45.00,
    "mode_paiement_id": 2,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/charges/:id

Récupère une charge spécifique par son ID.

### POST /api/charges

Crée une nouvelle charge.

**Corps de la requête:**
```json
{
  "feuille_id": 1,
  "description": "Carburant",
  "montant": 45.00,
  "mode_paiement_id": 2
}
```

### PUT /api/charges/:id

Met à jour une charge existante.

### DELETE /api/charges/:id

Supprime une charge.

---

## Modes de paiement

### GET /api/modes-paiement

Récupère la liste de tous les modes de paiement.

**Réponse de succès (200):**
```json
[
  {
    "mode_id": 1,
    "code": "ESP",
    "libelle": "Espèces",
    "type": "Cash",
    "est_actif": true,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/modes-paiement/:id

Récupère un mode de paiement spécifique par son ID.

### POST /api/modes-paiement

Crée un nouveau mode de paiement.

**Corps de la requête:**
```json
{
  "code": "CB",
  "libelle": "Carte bancaire",
  "type": "Bancontact",
  "est_actif": true
}
```

### PUT /api/modes-paiement/:id

Met à jour un mode de paiement existant.

### DELETE /api/modes-paiement/:id

Supprime un mode de paiement.

---

## Règles de salaire

### GET /api/regles-salaire

Récupère la liste de toutes les règles de salaire.

**Réponse de succès (200):**
```json
[
  {
    "id": 1,
    "regle_id": 1,
    "nom_regle": "Règle standard",
    "est_variable": true,
    "seuil_recette": 500.00,
    "pourcentage_base": 5.00,
    "pourcentage_au_dela": 10.00,
    "description": "Règle de salaire standard pour les chauffeurs",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/regles-salaire/:id

Récupère une règle de salaire spécifique par son ID.

### POST /api/regles-salaire

Crée une nouvelle règle de salaire.

**Corps de la requête:**
```json
{
  "nom_regle": "Règle premium",
  "est_variable": true,
  "seuil_recette": 750.00,
  "pourcentage_base": 7.00,
  "pourcentage_au_dela": 12.00,
  "description": "Règle de salaire premium"
}
```

### PUT /api/regles-salaire/:id

Met à jour une règle de salaire existante.

### DELETE /api/regles-salaire/:id

Supprime une règle de salaire.

---

## Gestion d'erreurs

### Codes d'erreur HTTP

- **400 Bad Request**: Données invalides ou manquantes
- **401 Unauthorized**: Token JWT manquant ou invalide
- **403 Forbidden**: Permissions insuffisantes
- **404 Not Found**: Ressource non trouvée
- **409 Conflict**: Contrainte d'unicité violée (ex: email déjà utilisé)
- **500 Internal Server Error**: Erreur serveur

### Structure des erreurs

```json
{
  "error": "Description de l'erreur",
  "details": "Détails techniques (optionnel)",
  "code": "CODE_ERREUR_PRISMA"
}
```

### Erreurs communes

- **P2002**: Contrainte d'unicité violée
- **P2025**: Enregistrement non trouvé pour la mise à jour/suppression
- **P2003**: Contrainte de clé étrangère violée

---

## Exemples d'utilisation

### Créer un chauffeur complet

```bash
# 1. Authentification
TOKEN=$(curl -s -X POST "https://api.txapp.be/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: TxApp-2025-API-Key-Super-Secure" \
  -d '{"email":"jean.dupont@txapp.be","password":"admin123"}' | jq -r .token)

# 2. Créer un chauffeur
curl -X POST "https://api.txapp.be/api/chauffeurs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: TxApp-2025-API-Key-Super-Secure" \
  -d '{
    "nom": "Dubois",
    "prenom": "Pierre",
    "email": "pierre.dubois@txapp.be",
    "telephone": "+32456789012",
    "statut": "Actif"
  }'
```

### Créer une course complète

```bash
curl -X POST "https://api.txapp.be/api/courses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: TxApp-2025-API-Key-Super-Secure" \
  -d '{
    "feuille_id": 1,
    "num_ordre": 1,
    "index_embarquement": 1000,
    "index_debarquement": 1100,
    "sommes_percues": 25.50,
    "mode_paiement_id": 1,
    "client_id": 1
  }'
```

---

## Notes importantes

- **Authentification obligatoire**: Toutes les routes nécessitent un token JWT valide
- **Cloudflare bypass**: Le header `X-API-Key` est requis en production pour contourner la protection Cloudflare
- **Format des données**: Les dates doivent être au format ISO 8601, les montants en décimales
- **Relations automatiques**: L'API gère automatiquement les relations entre entités
- **Validation**: Toutes les données sont validées avant insertion/modification
- **Logs**: Les erreurs sont loggées côté serveur pour faciliter le debugging

---

*Documentation mise à jour: Septembre 2025*