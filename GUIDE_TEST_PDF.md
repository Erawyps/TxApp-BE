# 🧪 Guide de Test - Génération Feuille de Route PDF

## ✅ Corrections Appliquées

Toutes les corrections nécessaires ont été appliquées pour permettre la génération d'une **feuille de route complète et conforme** :

1. ✅ **Field Mapper créé** (`/src/utils/fieldMapper.js`)
   - Transformation complète DB → Frontend
   - Support `index_depart` avec fallback

2. ✅ **printUtils.js corrigé** (`/src/app/pages/forms/new-post-form/utils/printUtils.js`)
   - Import et utilisation du Field Mapper
   - `fetchDataForPDF` décommentée et corrigée
   - Transformation automatique des données

3. ✅ **API configurée** (`/src/api/prismaRoutes.js`)
   - Endpoint `/api/feuilles-route/:id` retourne toutes les relations
   - Inclut : chauffeur, vehicule, courses, charges, taximetre, societe_taxi

4. ✅ **Service Prisma corrigé** (`/src/services/prismaService.js`)
   - Relations au pluriel : `courses`, `charges`
   - Includes complets avec toutes les données réglementaires

---

## 🚀 Comment Tester

### **Méthode 1 : Test Direct dans la Vue Chauffeur**

1. **Ouvrir la vue chauffeur** dans le navigateur
2. **Sélectionner une feuille de route** existante
3. **Cliquer sur le bouton "Générer PDF"** ou "Imprimer"
4. **Vérifier le PDF généré** contient :
   - ✅ Nom exploitant (extrait de `societe_taxi`)
   - ✅ Données taximètre complètes
   - ✅ Toutes les courses avec index_depart
   - ✅ Toutes les charges
   - ✅ Calculs corrects

### **Méthode 2 : Test via Console Navigateur**

Ouvrir la console du navigateur (F12) et exécuter :

```javascript
// Test de récupération des données
import { fetchDataForPDF } from './utils/printUtils.js';

const feuilleId = 1; // Remplacer par un ID réel
const data = await fetchDataForPDF(feuilleId);

console.log('📊 Données récupérées:', data);
console.log('👤 Chauffeur:', data.driver);
console.log('🚗 Véhicule:', data.vehicle);
console.log('📍 Courses:', data.courses);
console.log('💰 Charges:', data.expenses);
console.log('📋 Feuille complète:', data.shiftData);

// Vérifications critiques
console.log('✅ Nom exploitant:', data.shiftData.nom_exploitant);
console.log('✅ Numéro taximètre:', data.shiftData.numero_taximetre);
console.log('✅ Nombre de courses:', data.courses?.length);
console.log('✅ Nombre de charges:', data.expenses?.length);
```

### **Méthode 3 : Test API Direct**

```bash
# Récupérer une feuille de route via l'API
curl http://localhost:5173/api/feuilles-route/1 | jq .

# Vérifier que la réponse contient :
# - chauffeur.societe_taxi.nom
# - vehicule.societe_taxi.nom
# - taximetre.numero_serie
# - courses[] (array, pas course)
# - charges[] (array, pas charge)
```

### **Méthode 4 : Test de Génération PDF Complet**

Dans le composant React de la vue chauffeur :

```javascript
import { generateFeuilleDeRoutePDF } from './utils/printUtils';

// Dans un bouton ou gestionnaire d'événement
const handleGeneratePDF = async () => {
  try {
    const feuilleId = selectedFeuille.feuille_id;
    
    // Générer le PDF avec toutes les vérifications
    const fileName = await generateFeuilleDeRoutePDF(feuilleId);
    
    console.log('✅ PDF généré avec succès:', fileName);
    // Afficher un message de succès à l'utilisateur
  } catch (error) {
    console.error('❌ Erreur génération PDF:', error);
    // Afficher un message d'erreur à l'utilisateur
  }
};
```

---

## 🔍 Points de Vérification du PDF

### **Page 1 - En-tête et Service**

- [ ] **Date de service** affichée correctement
- [ ] **Nom du chauffeur** complet (prénom + nom)
- [ ] **Plaque d'immatriculation** du véhicule
- [ ] **Nom exploitant** affiché (extrait de `societe_taxi.nom`)

### **Section Compteur Taximètre**

- [ ] **Prise en charge** (début et fin)
- [ ] **Index kilométrique** (début et fin)
- [ ] **Kilomètres chargé** (début et fin)
- [ ] **Chutes** (début et fin)
- [ ] **Tous les champs** proviennent de `feuille.taximetre.*`

### **Section Tableau de Bord**

- [ ] **KM début** (`index_km_debut_tdb`)
- [ ] **KM fin** (`index_km_fin_tdb`)
- [ ] **Différence** calculée automatiquement

### **Section Courses**

- [ ] **Toutes les courses** listées
- [ ] **Index de départ** présent pour chaque course
- [ ] **Index embarquement** et **débarquement** corrects
- [ ] **Heures** formatées correctement (HH:MM)
- [ ] **Lieux** affichés
- [ ] **Prix taximètre** et **sommes perçues** corrects
- [ ] **Total des recettes** calculé automatiquement

### **Section Charges**

- [ ] **Toutes les charges** listées
- [ ] **Descriptions** complètes
- [ ] **Montants** corrects
- [ ] **Total des dépenses** calculé automatiquement

### **Calculs Automatiques**

- [ ] **Total recettes** = somme de toutes les courses
- [ ] **Total dépenses** = somme de toutes les charges
- [ ] **Nombre de courses** correct
- [ ] **KM parcourus** = KM fin - KM début

---

## ⚠️ Erreurs Possibles et Solutions

### **Erreur 1 : "Cannot read property 'courses' of undefined"**

**Cause :** L'API ne retourne pas les données attendues

**Solution :**
```javascript
// Vérifier que l'API retourne bien les données
console.log('API Response:', await fetch('/api/feuilles-route/1').then(r => r.json()));

// Vérifier que getFeuilleRouteById inclut bien 'courses' (pluriel)
```

### **Erreur 2 : "nom_exploitant is undefined"**

**Cause :** Le Field Mapper n'est pas utilisé ou les relations ne sont pas incluses

**Solution :**
```javascript
// Dans printUtils.js, vérifier que mapFeuilleRouteFromDB est bien appelé :
const shiftData = rawShiftData ? mapFeuilleRouteFromDB(rawShiftData) : {};

// Vérifier que l'API inclut chauffeur.societe_taxi
```

### **Erreur 3 : "index_depart is undefined"**

**Cause :** Le mapping de course n'utilise pas le fallback

**Solution :**
```javascript
// Dans fieldMapper.js, vérifier :
index_depart: dbCourse.index_depart ?? dbCourse.index_embarquement
```

### **Erreur 4 : "fetchDataForPDF is not a function"**

**Cause :** La fonction est encore commentée

**Solution :**
```javascript
// Vérifier que fetchDataForPDF est bien exportée et non commentée dans printUtils.js
export const fetchDataForPDF = async (feuilleId) => { ... }
```

---

## 📊 Données de Test Recommandées

### **Feuille de Route Test Minimale**

```sql
-- Créer une feuille de route avec toutes les données requises
INSERT INTO feuille_route (
  chauffeur_id, 
  vehicule_id, 
  date_service, 
  heure_debut, 
  heure_fin,
  index_km_debut_tdb,
  index_km_fin_tdb,
  mode_encodage
) VALUES (
  1,  -- chauffeur_id existant
  1,  -- vehicule_id existant
  '2024-10-04',
  '06:00:00',
  '14:00:00',
  125000,
  125180,
  'MANUEL'
);

-- Ajouter des courses
INSERT INTO course (
  feuille_id,
  num_ordre,
  index_depart,
  index_embarquement,
  lieu_embarquement,
  heure_embarquement,
  index_debarquement,
  lieu_debarquement,
  heure_debarquement,
  prix_taximetre,
  sommes_percues,
  mode_paiement_id
) VALUES 
  (1, 1, 125000, 125005, 'Gare Centrale', '06:15:00', 125018, 'Aéroport', '06:45:00', 45.20, 45.20, 1),
  (1, 2, 125018, 125025, 'Aéroport', '07:00:00', 125040, 'Centre Ville', '07:30:00', 32.50, 35.00, 2);

-- Ajouter des charges
INSERT INTO charge (
  feuille_id,
  chauffeur_id,
  vehicule_id,
  description,
  montant,
  mode_paiement_charge
) VALUES 
  (1, 1, 1, 'Carburant', 50.00, 1),
  (1, 1, 1, 'Péage', 5.50, 1);

-- Vérifier les données
SELECT 
  fr.feuille_id,
  fr.date_service,
  c.prenom || ' ' || c.nom as chauffeur,
  st.nom as exploitant,
  COUNT(DISTINCT co.course_id) as nb_courses,
  COUNT(DISTINCT ch.charge_id) as nb_charges
FROM feuille_route fr
JOIN chauffeur c ON fr.chauffeur_id = c.chauffeur_id
JOIN societe_taxi st ON c.societe_id = st.societe_id
LEFT JOIN course co ON fr.feuille_id = co.feuille_id
LEFT JOIN charge ch ON fr.feuille_id = ch.feuille_id
WHERE fr.feuille_id = 1
GROUP BY fr.feuille_id, fr.date_service, c.prenom, c.nom, st.nom;
```

---

## ✅ Checklist Finale

Avant de déclarer la vue chauffeur complète, vérifier :

- [ ] **Field Mapper** importé dans printUtils.js
- [ ] **fetchDataForPDF** décommentée et fonctionnelle
- [ ] **API** retourne toutes les relations (vérifier avec curl ou Postman)
- [ ] **PDF généré** contient toutes les sections
- [ ] **Nom exploitant** affiché correctement
- [ ] **Données taximètre** complètes
- [ ] **index_depart** présent pour chaque course
- [ ] **Calculs automatiques** corrects
- [ ] **Pas d'erreurs** dans la console navigateur
- [ ] **Pas d'erreurs** dans les logs serveur

---

## 🎯 Résultat Attendu

Après l'application de toutes les corrections, la vue chauffeur doit permettre de générer un PDF de feuille de route avec :

✅ **Conformité réglementaire complète**
✅ **Toutes les données présentes** (exploitant, taximètre, courses, charges)
✅ **Calculs automatiques corrects**
✅ **Format professionnel** et lisible
✅ **Aucune donnée manquante**

---

**Date de création :** 2024-10-04  
**Statut :** ✅ Corrections appliquées, prêt pour test
