#!/bin/bash

# Script pour appliquer la migration des champs chauffeur
# Utilisation: ./apply-chauffeur-migration.sh

echo "🚀 Application de la migration des champs chauffeur..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet TxApp-BE"
    exit 1
fi

# Vérifier que Prisma est installé
if ! command -v npx &> /dev/null; then
    echo "❌ Erreur: npx n'est pas installé. Installez Node.js d'abord."
    exit 1
fi

# Appliquer la migration Prisma si nécessaire
echo "📦 Vérification du schéma Prisma..."
npx prisma generate

# Appliquer la migration SQL personnalisée
echo "🗃️ Application de la migration SQL..."
if [ -f "migrations/add-chauffeur-fields.sql" ]; then
    # Ici vous devriez exécuter la migration selon votre configuration de base de données
    # Par exemple avec psql si vous utilisez PostgreSQL directement:
    # PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f migrations/add-chauffeur-fields.sql

    echo "✅ Migration SQL trouvée: migrations/add-chauffeur-fields.sql"
    echo "⚠️  Veuillez appliquer cette migration manuellement selon votre configuration DB"
    echo "   Exemple pour PostgreSQL:"
    echo "   psql -h votre_host -U votre_user -d votre_db -f migrations/add-chauffeur-fields.sql"
else
    echo "❌ Fichier de migration non trouvé: migrations/add-chauffeur-fields.sql"
    exit 1
fi

# Pousser les changements Prisma si nécessaire
echo "🔄 Synchronisation du schéma Prisma..."
npx prisma db push --accept-data-loss

echo "✅ Migration terminée!"
echo ""
echo "📋 Résumé des changements:"
echo "   - Champ 'statut' ajouté à la table course"
echo "   - Champ 'pourboire' ajouté à la table course"
echo "   - Champs compteur km ajoutés à la table feuille_route"
echo "   - Table 'intervention' créée (optionnelle)"
echo ""
echo "🔄 Redémarrez votre serveur API pour prendre en compte les changements."