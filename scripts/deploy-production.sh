#!/bin/bash

# Script de déploiement pour TxApp en production
# Ce script configure l'environnement de production et déploie l'application

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Début du déploiement TxApp en production..."

# Charger les variables d'environnement depuis .env.production
if [ -f ".env.production" ]; then
    echo "📄 Chargement des variables depuis .env.production..."
    export $(grep -v '^#' .env.production | xargs)
else
    echo "❌ Fichier .env.production non trouvé"
    exit 1
fi

# Vérification des variables d'environnement critiques
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Variable DATABASE_URL manquante"
    exit 1
fi

if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ Variable VITE_SUPABASE_URL manquante"
    exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Variable VITE_SUPABASE_ANON_KEY manquante"
    exit 1
fi

echo "✅ Variables d'environnement vérifiées"

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm ci --production=false

# Génération du client Prisma
echo "🗄️ Génération du client Prisma..."
npx prisma generate

# Test de connexion à la base de données
echo "🔗 Test de connexion à la base de données..."
node -e "
const { PrismaClient } = require('./prisma/node_modules/.prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT 1\`.then(() => {
  console.log('✅ Connexion DB réussie');
  process.exit(0);
}).catch(err => {
  console.error('❌ Connexion DB échouée:', err.message);
  process.exit(1);
}).finally(() => {
  prisma.\$disconnect();
});
"

# Construction de l'application
echo "🏗️ Construction de l'application..."
npm run build

# Vérification que le build s'est bien passé
if [ ! -d "dist" ]; then
    echo "❌ Le dossier dist n'a pas été créé"
    exit 1
fi

echo "✅ Build réussi"

# Déploiement sur Cloudflare Workers
echo "☁️ Déploiement sur Cloudflare Workers..."
npx wrangler deploy

echo "🎉 Déploiement terminé avec succès!"
echo "🌐 Application disponible sur: https://txapp.be"
echo "📊 Health check: https://txapp.be/health"
