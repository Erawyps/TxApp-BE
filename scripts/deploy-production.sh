#!/bin/bash

# Script de déploiement pour TxApp en production
# Ce script configure l'environnement de production et déploie l'application

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Début du déploiement TxApp en production..."

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
import { testDatabaseConnection } from './src/configs/database.config.js';
testDatabaseConnection().then(connected => {
  if (!connected) {
    console.error('❌ Connexion DB échouée');
    process.exit(1);
  }
  console.log('✅ Connexion DB réussie');
}).catch(err => {
  console.error('❌ Erreur de connexion DB:', err);
  process.exit(1);
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
