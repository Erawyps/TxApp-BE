#!/bin/bash

# Script pour corriger automatiquement tous les services API
# Remplace les URLs relatives par des URLs absolues avec la configuration centralisée

echo "🔧 Correction automatique des services API..."

# Fonction pour corriger un fichier service
fix_service_file() {
    local file=$1
    echo "📝 Correction de $file"
    
    # Ajouter l'import de la configuration API si pas déjà présent
    if ! grep -q "getApiUrl" "$file"; then
        sed -i '' "1a\\
import { getApiUrl, getDefaultHeaders } from '../configs/api.config.js';\\
" "$file"
    fi
    
    # Remplacer les URLs relatives par getApiUrl()
    sed -i '' "s|'/api/|getApiUrl('|g" "$file"
    sed -i '' "s|\`/api/|\`\${getApiUrl('|g" "$file"
    
    # Corriger les templates literals
    sed -i '' "s|getApiUrl('\([^']*\)\${|\${getApiUrl('\1|g" "$file"
    
    # Ajouter les headers par défaut
    sed -i '' "s|headers: {[^}]*}|headers: getDefaultHeaders()|g" "$file"
}

# Liste des fichiers à corriger
services_files=(
    "src/services/adminService.js"
    "src/services/courses.js"
    "src/services/charges.js"
    "src/services/chauffeurData.js"
    "src/services/chauffeurStats.js"
    "src/services/feuillesRoute.js"
    "src/services/modesPaiement.js"
    "src/services/reglesSalaire.js"
    "src/services/tripsService.js"
)

# Corriger chaque fichier
for file in "${services_files[@]}"; do
    if [ -f "$file" ]; then
        fix_service_file "$file"
    else
        echo "⚠️ Fichier non trouvé: $file"
    fi
done

echo "✅ Correction automatique terminée!"