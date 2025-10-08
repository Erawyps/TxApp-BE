# 🎬 Guide Rapide - Test des Corrections Taximètre

**Objectif**: Vérifier que le problème de pré-remplissage est résolu

---

## 🚀 Démarrage

### 1. Redémarrer le serveur

```bash
# Terminal 1 - Backend
cd /Users/kuassitehou/Documents/Documents\ -\ OHMPXV/GitHub/TxApp-BE
node server-dev.js

# Terminal 2 - Frontend (si séparé)
npm run dev
```

**Attendu**: 
```
🚀 Serveur de développement démarré sur http://localhost:3001
📡 CORS configuré pour: http://localhost:5173
```

### 2. Ouvrir l'application

1. Navigateur → `http://localhost:5173` (ou le port affiché)
2. Se connecter avec un compte **chauffeur**

---

## ✅ Test 1: Nouveau Shift - Formulaire Vide

### Étapes

1. **Cliquer** sur "Nouveau Shift" ou "Démarrer un shift"

2. **VÉRIFIER** 👁️:
   ```
   ❌ Les champs NE DOIVENT PAS être pré-remplis
   ✅ Seulement date/heure actuelles
   ```

3. **Remplir** le formulaire:
   - Véhicule: [Choisir]
   - Date: [Automatique]
   - Mode: LIVE
   - Heure début: [Automatique]
   - Index km tableau de bord: `100000`
   
   **SECTION TAXIMETRE** (nouveauté):
   - Prise en charge début: `500`
   - Index km début: `100000`
   - Km en charge début: `0`
   - Chutes début: `0`

4. **Soumettre** le formulaire

5. **Résultat attendu**:
   ```
   ✅ "Shift démarré avec succès"
   ✅ Redirection vers le dashboard
   ```

---

## ✅ Test 2: Fin de Shift - Champs Vides

### Étapes

1. **Ajouter** au moins 1 course au shift actif

2. **Cliquer** sur "Terminer le shift" ou "Fin de shift"

3. **VÉRIFIER** 👁️:
   ```
   ❌ Les champs taximètre NE DOIVENT PAS être pré-remplis
   ✅ Signature = "Prénom Nom" du chauffeur
   ✅ Tous les autres champs vides
   ```

4. **Remplir** le formulaire:
   - Heure fin: `18:00`
   - Interruptions: `30` (minutes)
   - Km tableau de bord fin: `100150`
   
   **SECTION TAXIMETRE FIN**:
   - Prise en charge fin: `650`
   - Index km fin: `100150`
   - Km en charge fin: `120`
   - Chutes fin: `15.50`

5. **Soumettre** le formulaire

6. **Résultat attendu**:
   ```
   ✅ "Shift terminé avec succès"
   ✅ Possibilité de générer le PDF
   ```

---

## ✅ Test 3: Vérification DevTools

### Pendant le Test 2, ouvrir DevTools

1. **F12** ou **Clic droit → Inspecter**

2. **Onglet Network**

3. **Filtrer**: `feuilles-route`

4. **Soumettre** le formulaire de fin

5. **Cliquer** sur la requête `PUT ...feuilles-route/[ID]`

6. **Onglet Payload** ou **Request**

7. **VÉRIFIER** 👁️:
   ```json
   {
     "heure_fin": "18:00",
     "interruptions": 30,
     "km_tableau_bord_fin": 100150,
     "index_km_fin_tdb": 100150,
     
     ✅ CES CHAMPS DOIVENT ÊTRE PRÉSENTS:
     "taximetre_prise_charge_fin": 650,
     "taximetre_index_km_fin": 100150,
     "taximetre_km_charge_fin": 120,
     "taximetre_chutes_fin": 15.50,
     
     "observations": "...",
     "signature_chauffeur": "Prénom Nom",
     "est_validee": true
   }
   ```

8. **Onglet Response**

9. **VÉRIFIER** 👁️:
   ```json
   {
     "feuille_id": 92,
     "date_service": "2025-10-08",
     
     ✅ CES CHAMPS DOIVENT ÊTRE REMPLIS:
     "taximetre_prise_charge_debut": 500,
     "taximetre_prise_charge_fin": 650,
     "taximetre_index_km_debut": 100000,
     "taximetre_index_km_fin": 100150,
     ...
   }
   ```

---

## ✅ Test 4: Vérification Base de Données

### Option A: Via pgAdmin ou DBeaver

1. Se connecter à la base de données

2. Exécuter:
   ```sql
   SELECT 
     fr.feuille_id,
     fr.date_service,
     fr.heure_debut,
     fr.heure_fin,
     t.*
   FROM feuille_route fr
   LEFT JOIN taximetre t ON fr.feuille_id = t.feuille_id
   ORDER BY fr.created_at DESC
   LIMIT 1;
   ```

3. **VÉRIFIER** 👁️:
   ```
   ✅ taximetre_prise_charge_debut = 500
   ✅ taximetre_prise_charge_fin = 650
   ✅ taximetre_index_km_debut = 100000
   ✅ taximetre_index_km_fin = 100150
   ✅ taximetre_km_charge_debut = 0
   ✅ taximetre_km_charge_fin = 120
   ✅ taximetre_chutes_debut = 0
   ✅ taximetre_chutes_fin = 15.50
   ```

### Option B: Via psql (terminal)

```bash
psql -h localhost -U votre_user -d votre_db

# Puis dans psql:
SELECT * FROM taximetre ORDER BY created_at DESC LIMIT 1;
```

---

## ✅ Test 5: Vérification PDF

### Étapes

1. **Terminer** complètement un shift (avec fin validée)

2. **Cliquer** sur "Imprimer feuille de route" ou "Générer PDF"

3. **Ouvrir** le PDF téléchargé

4. **VÉRIFIER** 👁️ Section "Service":

   **Colonne "Taximètre"**:
   ```
   ┌─────────────────┐
   │ Taximètre       │
   ├─────────────────┤
   │ Fin   │ 100150  │ ✅ DOIT ÊTRE AFFICHÉ
   │ Début │ 100000  │ ✅ DOIT ÊTRE AFFICHÉ
   │ Total │    150  │ ✅ DOIT ÊTRE CALCULÉ
   └─────────────────┘
   ```

5. **VÉRIFIER** 👁️ Section "Prise en charge, Index Km...":

   ```
   ┌───────┬───────────┬──────────┬─────────┬─────────┬──────────┐
   │       │ Prise en  │ Index Km │ Km en   │ Chutes  │ Recettes │
   │       │ charge    │          │ charge  │ (€)     │          │
   ├───────┼───────────┼──────────┼─────────┼─────────┼──────────┤
   │ Fin   │ 650       │ 100150   │ 120     │ 15.50   │ [Total]  │ ✅
   │ Début │ 500       │ 100000   │ 0       │ 0       │          │ ✅
   │ Total │ 150       │ 150      │ 120     │ 15.50   │ [Total]  │ ✅
   └───────┴───────────┴──────────┴─────────┴─────────┴──────────┘
   ```

---

## 🔴 Que Faire Si Ça Ne Marche Pas ?

### Problème 1: Les champs sont toujours pré-remplis

**Solution**:
```bash
# 1. Vider le cache navigateur
# Chrome: Ctrl+Shift+Delete → Cocher "Cached images" et "Cookies"

# 2. Vider localStorage
# Console navigateur (F12):
localStorage.clear();
location.reload();

# 3. Redémarrer le serveur
# Terminal:
# Ctrl+C pour arrêter
node server-dev.js
```

### Problème 2: Les données ne sont pas dans le payload

**Vérifier**:
```javascript
// Console navigateur (F12) → Console tab
// Chercher les logs:
🔍 EndShiftForm - Données brutes du formulaire: {...}
🔍 handleEndShift - Données reçues: {...}

// Vérifier que ces logs contiennent bien:
taximetre_prise_charge_fin: 650
```

### Problème 3: Erreur lors de la soumission

**Vérifier logs serveur**:
```
# Terminal où tourne server-dev.js
# Chercher:
📝 FRONTEND DATA received (RAW): {...}
🔧 Données taximètre mappées pour update: {...}

# Si "Données taximètre mappées" est vide {}
# → Problème de mapping backend
```

---

## ✅ Checklist Finale

- [ ] Nouveau shift: Champs taximètre vides ✓
- [ ] Fin de shift: Champs taximètre vides ✓
- [ ] DevTools: Payload contient `taximetre_*_fin` ✓
- [ ] DevTools: Response contient données complètes ✓
- [ ] Base de données: Colonnes `*_fin` remplies ✓
- [ ] PDF: Toutes les données affichées ✓

**Si tous les tests passent → ✅ CORRECTION RÉUSSIE !**

---

## 📞 Besoin d'aide ?

1. Consulter `DIAGNOSTIC_PROBLEMES_TAXIMETRE.md` pour l'analyse
2. Consulter `CORRECTIONS_TAXIMETRE_APPLIQUEES.md` pour les détails techniques
3. Vérifier les logs console (navigateur + serveur)

---

**Bon test !** 🚀
