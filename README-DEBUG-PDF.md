# 🐛 Debug - Données Manquantes dans le PDF

## ❌ Problème Identifié

Les données suivantes apparaissent comme "Non renseigné" ou vides dans le PDF :
- **Nom de l'exploitant**
- **Index km** (Fin, Début, Total)
- **Tableau de bord** (toutes les valeurs)
- **Taximètre** (Prise en charge, Index Km, Km en charge, Chutes)

## ✅ Corrections Appliquées

### 1. **Correction du Field Mapper** ✅

**Fichier modifié :** `/src/utils/fieldMapper.js`

**Problème :** Le Field Mapper utilisait des noms de champs incorrects pour accéder aux données du taximètre.

**Champs corrigés :**
```javascript
// AVANT (INCORRECT)
taximetre_prise_charge_debut: dbData.taximetre?.prise_en_charge_debut
taximetre_km_charge_debut: dbData.taximetre?.km_en_charge_debut

// APRÈS (CORRECT)
taximetre_prise_charge_debut: dbData.taximetre?.taximetre_prise_charge_debut || 
                               dbData.taximetre?.pc_debut_tax
taximetre_km_charge_debut: dbData.taximetre?.taximetre_km_charge_debut || 
                           dbData.taximetre?.km_charge_debut
```

**Support de plusieurs formats :** Le Field Mapper essaie maintenant plusieurs noms de champs pour assurer la compatibilité.

---

## 🔍 Vérification des Données

Pour vérifier si les données sont présentes dans votre base de données :

### **Méthode 1 : Console du Navigateur**

1. Ouvrir la vue chauffeur
2. Appuyer sur `F12` pour ouvrir la console
3. Copier/coller ce code :

```javascript
// Remplacer 1 par l'ID de votre feuille de route
const feuilleId = 1;

// Récupérer les données
const response = await fetch(`/api/feuilles-route/${feuilleId}`);
const data = await response.json();

// Afficher les données critiques
console.log('=== DIAGNOSTIC DONNÉES PDF ===');
console.log('\n1. NOM EXPLOITANT:');
console.log('  - Chauffeur.societe_taxi:', data.chauffeur?.societe_taxi);
console.log('  - Vehicule.societe_taxi:', data.vehicule?.societe_taxi);
console.log('  - Nom exploitant:', data.chauffeur?.societe_taxi?.nom_exploitant || data.vehicule?.societe_taxi?.nom_exploitant);

console.log('\n2. TABLEAU DE BORD:');
console.log('  - index_km_debut_tdb:', data.index_km_debut_tdb);
console.log('  - index_km_fin_tdb:', data.index_km_fin_tdb);

console.log('\n3. TAXIMÈTRE:');
console.log('  - Existe?:', !!data.taximetre);
if (data.taximetre) {
  console.log('  - pc_debut_tax:', data.taximetre.pc_debut_tax);
  console.log('  - pc_fin_tax:', data.taximetre.pc_fin_tax);
  console.log('  - index_km_debut_tax:', data.taximetre.index_km_debut_tax);
  console.log('  - index_km_fin_tax:', data.taximetre.index_km_fin_tax);
  console.log('  - km_charge_debut:', data.taximetre.km_charge_debut);
  console.log('  - km_charge_fin:', data.taximetre.km_charge_fin);
  console.log('  - chutes_debut_tax:', data.taximetre.chutes_debut_tax);
  console.log('  - chutes_fin_tax:', data.taximetre.chutes_fin_tax);
} else {
  console.log('  ❌ PAS DE DONNÉES TAXIMÈTRE DANS LA DB!');
}

console.log('\n4. DONNÉES COMPLÈTES:');
console.log(data);
```

### **Méthode 2 : Prisma Studio**

```bash
npm run db:studio
```

Puis vérifier :
1. Table `feuille_route` → Votre feuille de route
2. Table `taximetre` → Chercher `feuille_id` correspondant
3. Table `societe_taxi` → Vérifier que `nom_exploitant` est renseigné

---

## 🔧 Solutions selon le Diagnostic

### **Cas 1 : Nom exploitant vide**

**Symptôme :** "Non renseigné" s'affiche pour le nom de l'exploitant

**Cause :** La table `societe_taxi` n'a pas de valeur pour `nom_exploitant`

**Solution SQL :**
```sql
-- Vérifier les sociétés sans nom
SELECT societe_id, nom_exploitant 
FROM societe_taxi 
WHERE nom_exploitant IS NULL OR nom_exploitant = '';

-- Mettre à jour (remplacer 1 par le bon societe_id)
UPDATE societe_taxi 
SET nom_exploitant = 'Nom de votre société'
WHERE societe_id = 1;
```

---

### **Cas 2 : Tableau de bord vide**

**Symptôme :** Les champs "Index km" sont vides

**Cause :** `index_km_debut_tdb` et `index_km_fin_tdb` sont NULL dans `feuille_route`

**Solution SQL :**
```sql
-- Vérifier les données manquantes
SELECT feuille_id, index_km_debut_tdb, index_km_fin_tdb
FROM feuille_route
WHERE feuille_id = 1;  -- Remplacer par votre ID

-- Mettre à jour (exemple)
UPDATE feuille_route
SET 
  index_km_debut_tdb = 125000,
  index_km_fin_tdb = 125180
WHERE feuille_id = 1;
```

---

### **Cas 3 : Données taximètre vides**

**Symptôme :** Toute la section taximètre est vide

**Cause 1 :** Pas d'enregistrement dans la table `taximetre` pour cette `feuille_id`

**Solution SQL :**
```sql
-- Vérifier si l'enregistrement existe
SELECT * FROM taximetre WHERE feuille_id = 1;

-- Si vide, créer l'enregistrement
INSERT INTO taximetre (
  feuille_id,
  pc_debut_tax,
  pc_fin_tax,
  index_km_debut_tax,
  index_km_fin_tax,
  km_charge_debut,
  km_charge_fin,
  chutes_debut_tax,
  chutes_fin_tax
) VALUES (
  1,                 -- feuille_id
  2.40,              -- prise en charge début
  2.40,              -- prise en charge fin
  125000,            -- index km début
  125180,            -- index km fin
  15642.5,           -- km chargé début
  15722.8,           -- km chargé fin
  1254.60,           -- chutes début
  1389.20            -- chutes fin
);
```

**Cause 2 :** L'enregistrement existe mais les champs sont NULL

**Solution SQL :**
```sql
-- Mettre à jour les données existantes
UPDATE taximetre
SET 
  pc_debut_tax = 2.40,
  pc_fin_tax = 2.40,
  index_km_debut_tax = 125000,
  index_km_fin_tax = 125180,
  km_charge_debut = 15642.5,
  km_charge_fin = 15722.8,
  chutes_debut_tax = 1254.60,
  chutes_fin_tax = 1389.20
WHERE feuille_id = 1;
```

---

## 📋 Checklist de Vérification

Avant de générer un PDF, vérifier que :

- [ ] **Chauffeur existe** et a un `societe_id`
- [ ] **Societe_taxi existe** avec `nom_exploitant` renseigné
- [ ] **Feuille_route existe** avec :
  - [ ] `index_km_debut_tdb` renseigné
  - [ ] `index_km_fin_tdb` renseigné
  - [ ] Relation `chauffeur` incluse
  - [ ] Relation `vehicule` incluse
- [ ] **Enregistrement taximetre existe** pour cette `feuille_id`
- [ ] **Données taximètre renseignées** (au moins quelques champs)

---

## 🎯 Test Rapide

Pour tester rapidement si tout fonctionne :

```javascript
// Dans la console du navigateur
import { fetchDataForPDF } from './utils/printUtils.js';

const data = await fetchDataForPDF(1); // Remplacer 1 par votre ID

console.log('Nom exploitant:', data.shiftData.nom_exploitant);
console.log('KM début:', data.shiftData.km_tableau_bord_debut);
console.log('KM fin:', data.shiftData.km_tableau_bord_fin);
console.log('Prise charge début:', data.shiftData.taximetre_prise_charge_debut);
console.log('Prise charge fin:', data.shiftData.taximetre_prise_charge_fin);
```

**Résultat attendu :** Toutes les valeurs doivent être renseignées (pas `null` ou `undefined`)

---

## 💡 Exemple de Données Complètes

Voici un exemple de feuille de route avec toutes les données :

```sql
-- 1. Vérifier/Créer la société
INSERT INTO societe_taxi (nom_exploitant, num_tva) 
VALUES ('Taxi Express Brussels', 'BE0123456789')
ON CONFLICT DO NOTHING;

-- 2. Feuille de route avec données tableau de bord
UPDATE feuille_route
SET 
  index_km_debut_tdb = 125000,
  index_km_fin_tdb = 125180,
  heure_debut = '06:00:00',
  heure_fin = '14:00:00'
WHERE feuille_id = 1;

-- 3. Données taximètre
INSERT INTO taximetre (feuille_id, pc_debut_tax, pc_fin_tax, index_km_debut_tax, index_km_fin_tax, km_charge_debut, km_charge_fin, chutes_debut_tax, chutes_fin_tax)
VALUES (1, 2.40, 2.40, 125000, 125180, 15642.5, 15722.8, 1254.60, 1389.20)
ON CONFLICT (feuille_id) DO UPDATE SET
  pc_debut_tax = EXCLUDED.pc_debut_tax,
  pc_fin_tax = EXCLUDED.pc_fin_tax,
  index_km_debut_tax = EXCLUDED.index_km_debut_tax,
  index_km_fin_tax = EXCLUDED.index_km_fin_tax,
  km_charge_debut = EXCLUDED.km_charge_debut,
  km_charge_fin = EXCLUDED.km_charge_fin,
  chutes_debut_tax = EXCLUDED.chutes_debut_tax,
  chutes_fin_tax = EXCLUDED.chutes_fin_tax;
```

---

## ✅ Après les Corrections

1. **Recharger la page** (Ctrl+R ou Cmd+R)
2. **Sélectionner une feuille de route**
3. **Générer le PDF**
4. **Vérifier que toutes les sections sont remplies**

Si les données sont toujours vides, exécuter le diagnostic dans la console (voir Méthode 1).

---

**Date de création :** 2024-10-04  
**Corrections appliquées :** Field Mapper mis à jour avec les bons noms de champs
