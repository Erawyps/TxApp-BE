# TxApp-BE

Stack: React (Vite) + Express + Cloudflare Workers + Supabase + Prisma + JWT Auth

Application de gestion complète pour sociétés de taxi avec interface web moderne et API REST.

## Vue d'ensemble

- **Frontend**: React avec Vite, interface moderne et responsive
- **Backend**: API REST Express.js déployée sur Cloudflare Workers
- **Base de données**: PostgreSQL via Supabase avec Prisma ORM
- **Authentification**: JWT avec gestion des rôles (Admin, Controleur, Driver)
- **Déploiement**: Cloudflare Workers avec Hyperdrive pour optimisation DB

## Architecture

### Migration Prisma Complète ✅

L'application utilise désormais une architecture moderne avec séparation claire frontend/backend:

- **Frontend**: Services utilisant exclusivement des appels HTTP axios vers l'API
- **Backend**: API REST avec Prisma pour l'accès aux données
- **Base de données**: PostgreSQL avec modèles relationnels complets

### Fonctionnalités Principales

- 👥 Gestion des utilisateurs et rôles
- 🚗 Gestion des chauffeurs et véhicules
- 👨‍💼 Gestion des clients et sociétés
- 📋 Gestion des feuilles de route et courses
- 💰 Gestion des charges et paiements
- 📊 Statistiques et rapports
- 🚨 Système d'interventions (nouveau)

## Démarrage Rapide

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd TxApp-BE

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs Supabase
```

### Développement Local

```bash
# Démarrer le serveur API
npm run dev:api

# Dans un autre terminal, démarrer le frontend
npm run dev

# Ou démarrage complet (frontend + API)
npm run dev:full
```

### Build et Déploiement

```bash
# Build pour la production
npm run build

# Déploiement sur Cloudflare Workers
npm run deploy
```

## API Documentation

📖 **[Documentation API complète](./API.md)**

L'API REST fournit des endpoints pour toutes les entités métier :

- **Utilisateurs**: `/api/utilisateurs`
- **Chauffeurs**: `/api/chauffeurs`
- **Véhicules**: `/api/vehicules`
- **Clients**: `/api/clients`
- **Feuilles de route**: `/api/feuilles-route`
- **Courses**: `/api/courses`
- **Charges**: `/api/charges`
- **Interventions**: `/api/interventions`
- **Modes de paiement**: `/api/modes-paiement`
- **Règles**: `/api/regles-salaire`, `/api/regles-facturation`

### Authentification

```javascript
// Header requis pour les requêtes authentifiées
Authorization: Bearer <jwt_token>
```

## Configuration

### Variables d'environnement

```env
# Base de données
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Authentification
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# Application
NODE_ENV=development|production
CORS_ORIGIN=https://your-domain.com
PORT=3001
HOST=0.0.0.0
```

### Collections Postman

Des collections Postman sont disponibles dans le dossier `postman/` :
- `TxApp-API.postman_collection.json` : Collection complète des endpoints
- `TxApp-Dev.postman_environment.json` : Environnement développement
- `TxApp-Prod.postman_environment.json` : Environnement production

## Scripts Disponibles

```bash
# Développement
npm run dev              # Frontend Vite
npm run dev:api          # Serveur API Express
npm run dev:full         # Frontend + API simultanément

# Build
npm run build            # Build production
npm run preview          # Prévisualisation build

# Déploiement
npm run deploy           # Déploiement Cloudflare Workers
npm run deploy:production # Script déploiement production personnalisé

# Base de données
npm run db:generate      # Générer client Prisma
npm run db:push          # Push schéma vers DB
npm run db:migrate       # Créer et appliquer migration
npm run db:reset         # Reset complet DB
npm run db:seed          # Seeder DB
npm run db:studio        # Interface Prisma Studio

# Tests et qualité
npm run lint             # ESLint
npm run test:prod-config # Test configuration production
```

## Structure du Projet

```
TxApp-BE/
├── src/
│   ├── api/             # Routes API Express
│   ├── services/        # Services métier (HTTP calls)
│   ├── app/             # Composants React
│   ├── components/      # Composants UI réutilisables
│   ├── hooks/           # Hooks React personnalisés
│   └── utils/           # Utilitaires
├── prisma/
│   ├── schema.prisma    # Schéma base de données
│   └── migrations/      # Migrations DB
├── postman/             # Collections Postman
├── scripts/             # Scripts utilitaires
├── public/              # Assets statiques
└── API.md               # Documentation API
```

## Technologies

- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Express.js, Node.js, Cloudflare Workers
- **Base de données**: PostgreSQL, Prisma ORM, Supabase
- **Authentification**: JWT, bcrypt
- **Déploiement**: Cloudflare Workers, Hyperdrive
- **Qualité**: ESLint, Prettier
- **Tests**: Scripts de validation manuels

## Migration Prisma

L'application a récemment été migrée vers une architecture moderne :

### ✅ Avant (Legacy)
- Services frontend avec imports Prisma directs
- Couplage fort entre frontend et base de données
- Difficultés de déploiement et maintenance

### ✅ Après (Moderne)
- Services frontend utilisant exclusivement des appels HTTP
- API REST indépendante et testable
- Séparation claire des responsabilités
- Déploiement simplifié sur Cloudflare Workers

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## Licence

MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

*TxApp - Solution moderne de gestion pour taxis* 🚕
