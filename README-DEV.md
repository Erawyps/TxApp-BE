# 🚀 TxApp API - Développement Local

## Démarrage rapide

```bash
# Aller dans le répertoire du projet
cd /Users/kuassitehou/Documents/Documents\ -\ OHMPXV/GitHub/TxApp-BE

# Démarrer le serveur de développement
NODE_ENV=development node src/api/server.js
```

**Serveur disponible sur:** `http://0.0.0.0:3001`

## Health Check

```bash
curl http://0.0.0.0:3001/health
```

## Endpoints principaux

| Endpoint | Description | Données de test |
|----------|-------------|----------------|
| `GET /api/chauffeurs` | Liste des chauffeurs | 6 chauffeurs |
| `GET /api/vehicules` | Liste des véhicules | 10 véhicules |
| `GET /api/clients` | Liste des clients | 10 clients |
| `GET /api/courses` | Liste des courses | 40 courses |
| `GET /api/charges` | Liste des charges | 15 charges |
| `GET /api/modes-paiement` | Modes de paiement | 7 modes |
| `GET /api/regles-salaire` | Règles de salaire | 3 règles |

## Test rapide de tous les endpoints

```bash
# Démarrer le serveur en arrière-plan
NODE_ENV=development node src/api/server.js &

# Attendre le démarrage
sleep 3

# Tester tous les endpoints
echo "=== TESTS RAPIDES ==="
echo "Chauffeurs: $(curl -s http://0.0.0.0:3001/api/chauffeurs | jq length)"
echo "Véhicules: $(curl -s http://0.0.0.0:3001/api/vehicules | jq length)"
echo "Clients: $(curl -s http://0.0.0.0:3001/api/clients | jq length)"
echo "Courses: $(curl -s http://0.0.0.0:3001/api/courses | jq length)"
echo "Charges: $(curl -s http://0.0.0.0:3001/api/charges | jq length)"
echo "Modes-paiement: $(curl -s http://0.0.0.0:3001/api/modes-paiement | jq length)"
echo "Règles-salaire: $(curl -s http://0.0.0.0:3001/api/regles-salaire | jq length)"

# Arrêter le serveur
pkill -f "node src/api/server.js"
```

## Exemples d'utilisation

### Récupérer un chauffeur avec ses relations
```bash
curl -s http://0.0.0.0:3001/api/chauffeurs/1 | jq
```

### Créer une nouvelle course
```bash
curl -X POST http://0.0.0.0:3001/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "feuille_id": 1,
    "num_ordre": 1,
    "prix_taximetre": 25.50,
    "sommes_percues": 30.00,
    "mode_paiement_id": 1,
    "client_id": 1
  }'
```

## 🔐 Authentification (Développement)

L'authentification JWT est implémentée mais **optionnelle** en développement local pour faciliter les tests.

### Utilisateur de test
- **Email:** `jean.dupont@txapp.be`
- **Mot de passe:** `admin123`
- **Rôle:** `admin`

### Exemples d'authentification

#### Connexion
```bash
curl -X POST http://0.0.0.0:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@txapp.be",
    "password": "admin123"
  }'
```

#### Vérification du token
```bash
# D'abord récupérer un token
TOKEN=$(curl -s -X POST http://0.0.0.0:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jean.dupont@txapp.be","password":"admin123"}' \
  | jq -r .token)

# Puis vérifier le token
curl -X POST http://0.0.0.0:3001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$TOKEN\"}"
```

#### Changement de mot de passe
```bash
curl -X POST http://0.0.0.0:3001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "oldPassword": "admin123",
    "newPassword": "nouveau123"
  }'
```

### Utilisation avec authentification (optionnel)

```bash
# Récupérer un token
TOKEN=$(curl -s -X POST http://0.0.0.0:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jean.dupont@txapp.be","password":"admin123"}' \
  | jq -r .token)

# Utiliser le token (optionnel en développement)
curl -X GET http://0.0.0.0:3001/api/chauffeurs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

## ⚠️ Points importants

- **Authentification JWT** implémentée mais optionnelle en développement local
- **Toutes les relations** de base de données sont chargées automatiquement
- **Données de test** déjà présentes dans la base de données
- **Logs détaillés** activés en mode développement
- **CORS configuré** pour `localhost:5173` et `localhost:5174`

## Architecture

- **Framework:** Hono.js (Node.js)
- **Base de données:** PostgreSQL + Prisma ORM
- **Port:** 3001
- **Environment:** `NODE_ENV=development`

## Scripts npm disponibles

```bash
npm run dev:api          # Démarre l'API en développement
npm run test:prod-config # Test de la configuration production
```

---

📖 **Documentation complète:** Voir `API.md` pour tous les détails des endpoints et schémas de données.</content>
<parameter name="filePath">/Users/kuassitehou/Documents/Documents - OHMPXV/GitHub/TxApp-BE/README-DEV.md