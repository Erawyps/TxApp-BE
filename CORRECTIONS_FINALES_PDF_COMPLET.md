# CORRECTIONS FINALES PDF - Affichage complet des données

## 🔧 Corrections appliquées

### 1. **Fonction formatTime corrigée** ✅
**Problème** : Les heures en format ISO (`1970-01-01T06:00:00.000Z`) étaient mal extraites, donnant `"1970-"` au lieu de `"06:00"`.

**Solution** : Extraction correcte de la partie heure après le `T` :
```javascript
const formatTime = (time) => {
  if (!time) return '';
  const timeStr = time.toString();
  
  // Si c'est une date ISO (contient 'T'), extraire la partie heure
  if (timeStr.includes('T')) {
    const timePart = timeStr.split('T')[1]; // "06:00:00.000Z"
    return timePart.substring(0, 5); // "06:00"
  }
  
  // Sinon, gérer les formats HH:MM:SS et HH:MM
  return timeStr.substring(0, 5);
};
```

### 2. **Chemin d'import du Field Mapper corrigé** ✅
**Problème** : Chemin relatif `../../../../../utils/fieldMapper.js` pouvait échouer avec le bundler Vite.

**Solution** : Utilisation du chemin depuis `baseUrl` configuré dans `jsconfig.json` :
```javascript
import { mapFeuilleRouteFromDB, mapCourseFromDB } from 'utils/fieldMapper.js';
```

### 3. **Logs de débogage ajoutés** 🔍
Pour diagnostiquer les problèmes, des logs ont été ajoutés au début de `generateAndDownloadReport` :
```javascript
console.log('🔍 DEBUG generateAndDownloadReport:');
console.log('  rawShiftData:', rawShiftData);
console.log('  rawCourses:', rawCourses);
console.log('  courses.length:', courses.length);
// ... etc
```

## 📋 Données qui DOIVENT s'afficher dans le PDF

### En-tête
- ✅ Nom de l'exploitant : "Taxi Express Brussels"
- ✅ Date : "03/10/2025" (format français)
- ✅ Nom du chauffeur : "Hasler TEHOU"
- ✅ Véhicule : "TXAA-751"

### Section Service - Heures des prestations
- ✅ Début : `06:00`
- ✅ Fin : `14:00`
- ⚠️ Interruptions : (calculé ou vide)
- ✅ Total : `8h00` (calculé automatiquement)

### Section Service - Index km
- ✅ Fin : `125180`
- ✅ Début : `125000`
- ✅ Total : `180` km (calculé automatiquement)

### Section Service - Tableau de bord
- ⚠️ Fin : `3433` (ou valeur de `index_km_fin_tdb`)
- ✅ Début : `3433` (valeur de `index_km_debut_tdb`)
- ⚠️ Total : `0` (si Fin manquant) ou calculé

### Section Service - Taximètre (tableau bas)
**Prise en charge** :
- ✅ Fin : `2.40`
- ✅ Début : `2.40`
- ✅ Total : `0.00`

**Index Km (Km totaux)** :
- ✅ Fin : `125180`
- ✅ Début : `125000`
- ✅ Total : `180`

**Km en charge** :
- ✅ Fin : `15722.8`
- ✅ Début : `15642.5`
- ✅ Total : `80.3`

**Chutes (€)** :
- ✅ Fin : `1389.20`
- ✅ Début : `1254.60`
- ✅ Total : `134.60`

**Recettes** :
- ✅ Total : Somme de toutes les courses (ex: `195.80 €`)

### Section Courses
**4 courses doivent s'afficher** :

| N° | Index départ | Index emb | Lieu emb | Heure emb | Index déb | Lieu déb | Heure déb | Prix taxi | Sommes perçues |
|----|--------------|-----------|----------|-----------|-----------|----------|-----------|-----------|----------------|
| 1  | 125000       | 125005    | Gare Centrale | 06:15 | 125018 | Brussels Airport | 06:45 | 45.20 | 45.20 |
| 2  | 125018       | 125025    | Atomium | 07:30 | 125065 | Centre Ville | 08:15 | 78.50 | 78.50 |
| 3  | 125065       | 125070    | Grand Place | 09:00 | 125115 | Gare du Midi | 09:45 | 52.30 | 52.30 |
| 4  | 125115       | 125120    | Place Flagey | 11:00 | 125180 | ULB Solbosch | 12:00 | 19.80 | 19.80 |

### Signature
- ✅ Nom du chauffeur : "Hasler TEHOU"

### Résumé financier
- ✅ Courses réalisées : `4`
- ✅ Recettes courses : `195.80 €`
- ✅ Prix taximètre : `195.80 €`
- ✅ Dépenses : (charges si présentes)
- ✅ Bénéfice net : (calculé)

## 🔍 Diagnostic à faire

1. **Rafraîchir complètement le navigateur** : `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac)

2. **Ouvrir la console du navigateur** : `F12` > onglet "Console"

3. **Générer le PDF** : Cliquer sur le bouton d'impression/téléchargement

4. **Observer les logs** :
   ```
   🔍 DEBUG generateAndDownloadReport:
     rawShiftData: {...}
     rawCourses: [...]
     rawCourses.length: 4
     driver: {...}
     vehicle: {...}
   ✅ Après mapping:
     shiftData.nom_exploitant: "Taxi Express Brussels"
     shiftData.courses: [...]
     courses (variable): [...]
     courses.length: 4
   ```

5. **Vérifier le PDF généré** : Toutes les sections doivent être remplies

## ❌ Problèmes possibles

### Si les courses n'apparaissent toujours pas :
- Vérifier dans la console si `courses.length` est bien `4`
- Vérifier si une erreur JavaScript apparaît
- Vérifier que `mapCourseFromDB` est bien importé et fonctionne

### Si les heures affichent "1970-" :
- Le navigateur n'a peut-être pas rechargé le nouveau code
- Faire un "hard refresh" : `Ctrl+Shift+R`
- Vider le cache navigateur

### Si le nom exploitant n'apparaît pas :
- Vérifier dans les logs `shiftData.nom_exploitant`
- Devrait afficher `"Taxi Express Brussels"`
- Si vide, vérifier que l'API retourne bien `chauffeur.societe_taxi.nom_exploitant`

### Si le taximètre est vide :
- Vérifier dans les logs `shiftData.taximetre_prise_charge_debut`, etc.
- Vérifier que l'API retourne bien `taximetre.pc_debut_tax`, etc.

## 🚀 Prochaines étapes après test

1. **Si tout fonctionne** : Supprimer les logs de débogage de `printUtils.js`

2. **Si problèmes persistent** :
   - Noter les logs de la console
   - Noter quelles sections sont vides
   - Vérifier la réponse de l'API : `curl http://localhost:5173/api/feuilles-route/1`

3. **Optimisations possibles** :
   - Calculer automatiquement les totaux d'heures
   - Calculer automatiquement les interruptions
   - Formater les montants avec le symbole €
   - Gérer les dates en tenant compte du fuseau horaire

## 📝 Fichiers modifiés

- ✅ `/src/app/pages/forms/new-post-form/utils/printUtils.js`
  - Fonction `formatTime` corrigée (lignes 26-38)
  - Import Field Mapper corrigé (ligne 3)
  - Logs de débogage ajoutés (lignes 6-20)

- ✅ `/src/utils/fieldMapper.js` (corrections précédentes)
  - Relations `course` / `charge` (singulier)
  - Mappings taximètre corrigés

- ✅ `/src/services/prismaService.js` (corrections précédentes)
  - Relations `course` / `charge` (singulier)

- ✅ `/src/app/pages/forms/new-post-form/index.jsx` (corrections précédentes)
  - Utilisation de `generateFeuilleDeRoutePDF(id)` au lieu de données manuelles

## 🎯 Résultat attendu

Un PDF complet avec :
- ✅ Toutes les sections remplies (pas de "Non renseigné" sauf si donnée vraiment absente)
- ✅ Les 4 courses listées avec tous les détails
- ✅ Les heures formatées correctement (06:00, 14:00, etc.)
- ✅ Les montants taximètre affichés
- ✅ Les km affichés
- ✅ Le nom de l'exploitant affiché
- ✅ Le nom du chauffeur pour la signature
- ✅ Le résumé financier complet

**Si après ces corrections le PDF n'est toujours pas complet, faire des captures d'écran de la console et du PDF pour diagnostic approfondi.**
