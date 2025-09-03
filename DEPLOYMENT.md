# Guide de Déploiement TxApp

## 🚀 Configuration Production avec PostgreSQL & Hyperdrive

### Prérequis
- Base de données PostgreSQL Supabase configurée
- Cloudflare Workers avec Hyperdrive configuré
- Variables d'environnement de production

### 1. Configuration de l'environnement

#### Base de données PostgreSQL (Supabase)
```
Host: aws-0-eu-central-1.pooler.supabase.com
Port: 5432
Database: postgres
User: postgres.jfrhzwtkfotsrjkacrns
```

#### Hyperdrive Cloudflare
```
ID: 524a9438f01e47e88558cb5a181d0b14
Connection String: postgresql://postgres.jfrhzwtkfotsrjkacrns:rKcnNJbacyLF3TQd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

### 2. Scripts de déploiement disponibles

#### Développement local (SQLite)
```bash
# Démarrer en mode développement
npm run dev:full

# Gérer la base de données SQLite
npm run db:generate
npm run db:push
npm run create-test-user
```

#### Production (PostgreSQL + Hyperdrive)
```bash
# Générer le client Prisma pour PostgreSQL
npm run db:generate:prod

# Pousser le schéma vers PostgreSQL
npm run db:push:prod

# Créer les utilisateurs de production
npm run create-prod-user

# Construire et déployer
npm run deploy
```

### 3. Comptes utilisateur

#### Développement (SQLite)
- Admin: `admin@txapp.com` / `password123`
- Chauffeur: `chauffeur@txapp.com` / `chauffeur123`

#### Production (PostgreSQL)
- Admin: `admin@txapp.com` / `TxApp@Admin2024!`
- Manager: `manager@txapp.com` / `TxApp@Manager2024!`
- Chauffeur: `chauffeur@txapp.com` / `TxApp@Chauffeur2024!`

### 4. Architecture de déploiement

```
Développement:
Frontend (Vite) → API Local (Express) → SQLite

Production:
Frontend (Static) → Cloudflare Worker → Hyperdrive → PostgreSQL (Supabase)
```

### 5. Variables d'environnement

#### .env.development
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret"
VITE_API_BASE_URL="http://localhost:3001/api"
NODE_ENV="development"
```

#### .env.production
```env
DATABASE_URL="postgresql://postgres.jfrhzwtkfotsrjkacrns:rKcnNJbacyLF3TQd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="production-secret"
VITE_API_BASE_URL="https://txapp.your-domain.workers.dev/api"
NODE_ENV="production"
```

### 6. Commandes de déploiement

```bash
# 1. Préparer la production
npm run db:generate:prod
npm run db:push:prod

# 2. Créer les utilisateurs
npm run create-prod-user

# 3. Déployer l'application
npm run deploy

# 4. Vérifier le déploiement
curl https://txapp.your-domain.workers.dev/api/health
```

### 7. Monitoring et maintenance

- Logs Cloudflare Workers via dashboard
- Monitoring Supabase via interface
- Prisma Studio pour PostgreSQL: `npm run db:studio:prod`

### 8. Rollback et backup

- Migrations Prisma versionnées
- Backup automatique Supabase
- Possibilité de rollback via Cloudflare Workers
