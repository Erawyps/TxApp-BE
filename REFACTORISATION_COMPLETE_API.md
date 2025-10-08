# ANALYSE COMPLÈTE - Refactorisation APIs Feuilles de Route

## 1. STRUCTURE DES FORMULAIRES FRONTEND

### NewShiftForm.jsx
**Champs utilisés :**
- `vehicule_id` (obligatoire)
- `date_service` (obligatoire)
- `mode_encodage` (LIVE/ULTERIEUR)
- `heure_debut` (obligatoire)
- `index_km_debut_tdb` (obligatoire)
- `interruptions` (optionnel)

**❌ PAS de champs taximètre dans NewShiftForm**

### ShiftForm.jsx (Formulaire principal)
**Champs taximètre de DÉBUT :**
- `taximetre_prise_charge_debut`
- `taximetre_index_km_debut`
- `taximetre_km_charge_debut`
- `taximetre_chutes_debut`

### EndShiftForm.jsx
**Champs taximètre de FIN :**
- `taximetre_prise_charge_fin`
- `taximetre_index_km_fin`
- `taximetre_km_charge_fin`
- `taximetre_chutes_fin`

## 2. MODÈLE PRISMA (Base de données)

### Table `feuille_route`
- `feuille_id` (PK)
- `chauffeur_id`
- `vehicule_id`
- `date_service`
- `mode_encodage`
- `heure_debut`, `heure_fin`
- `index_km_debut_tdb`, `index_km_fin_tdb`
- `km_tableau_bord_debut`, `km_tableau_bord_fin`
- `interruptions`
- `est_validee`
- Relation: `taximetre` (1:1)

### Table `taximetre`
- `feuille_id` (PK, FK vers feuille_route)
- **Champs anciens (legacy) :**
  - `pc_debut_tax`, `pc_fin_tax`
  - `index_km_debut_tax`, `index_km_fin_tax`
  - `km_charge_debut`, `km_charge_fin`
  - `chutes_debut_tax`, `chutes_fin_tax`
- **Champs nouveaux (utilisés par frontend) :**
  - `taximetre_prise_charge_debut`, `taximetre_prise_charge_fin`
  - `taximetre_index_km_debut`, `taximetre_index_km_fin`
  - `taximetre_km_charge_debut`, `taximetre_km_charge_fin`
  - `taximetre_chutes_debut`, `taximetre_chutes_fin`

## 3. CANEVAS PDF (Objectif final)

D'après printUtils.js, le PDF utilise les champs :
- `shiftData.taximetre_prise_charge_debut/fin`
- `shiftData.taximetre_index_km_debut/fin`
- `shiftData.taximetre_km_charge_debut/fin`
- `shiftData.taximetre_chutes_debut/fin`

## 4. PROBLÈMES IDENTIFIÉS

### Structure de données incohérente
1. **Double mapping** : champs anciens + nouveaux dans la même table
2. **Logique dispersée** : différents formulaires pour début/fin
3. **APIs confuses** : endpoints qui ne respectent pas la structure frontend

### Flux de données actuel problématique
1. **NewShiftForm** → n'envoie que les données de base (sans taximètre)
2. **ShiftForm** → envoie les données taximètre de début
3. **EndShiftForm** → envoie les données taximètre de fin
4. **Backend** → essaie de mapper dans tous les sens

## 5. SOLUTION PROPOSÉE

### Nouveau flux simplifié et cohérent

#### 5.1. Création d'un shift (POST)
**Endpoint :** `POST /api/feuilles-route`
**Données envoyées :**
```json
{
  // Données de base (NewShiftForm)
  "chauffeur_id": 6,
  "vehicule_id": 3,
  "date_service": "2025-10-07",
  "mode_encodage": "LIVE",
  "heure_debut": "14:00",
  "index_km_debut_tdb": 125400,
  "interruptions": "",
  
  // Données taximètre de début (ShiftForm)
  "taximetre_prise_charge_debut": "100.0",
  "taximetre_index_km_debut": 125400,
  "taximetre_km_charge_debut": "50000",
  "taximetre_chutes_debut": "200.5"
}
```

#### 5.2. Mise à jour d'un shift (PUT)
**Endpoint :** `PUT /api/feuilles-route/:id`
**Données envoyées :**
```json
{
  // Modification générale OU fin de shift
  "heure_fin": "22:00",
  "index_km_fin_tdb": 125500,
  
  // Données taximètre de fin (EndShiftForm)
  "taximetre_prise_charge_fin": "575.25",
  "taximetre_index_km_fin": 125500,
  "taximetre_km_charge_fin": "55000",
  "taximetre_chutes_fin": "235.5",
  
  // Validation
  "est_validee": true
}
```

#### 5.3. Récupération d'un shift actif (GET)
**Endpoint :** `GET /api/feuilles-route/active/:chauffeurId`
**Réponse :**
```json
{
  "feuille_id": 72,
  "chauffeur_id": 6,
  "vehicule_id": 3,
  "date_service": "2025-10-07",
  "mode_encodage": "LIVE",
  "heure_debut": "14:00",
  "heure_fin": null,
  "index_km_debut_tdb": 125400,
  "index_km_fin_tdb": null,
  "interruptions": "",
  "est_validee": false,
  
  // Données taximètre complètes
  "taximetre_prise_charge_debut": "100.0",
  "taximetre_index_km_debut": 125400,
  "taximetre_km_charge_debut": "50000",
  "taximetre_chutes_debut": "200.5",
  "taximetre_prise_charge_fin": null,
  "taximetre_index_km_fin": null,
  "taximetre_km_charge_fin": null,
  "taximetre_chutes_fin": null,
  
  // Relations
  "chauffeur": {...},
  "vehicule": {...},
  "course": [...],
  "charge": [...]
}
```

## 6. ENDPOINTS À REFACTORISER

### À SUPPRIMER
- `GET /api/dashboard/feuilles-route/active/:chauffeurId` (remplacé)
- `GET /api/dashboard/feuilles-route/defaults/:chauffeurId` (remplacé)
- `POST /api/dashboard/feuilles-route` (remplacé)
- `PUT /api/dashboard/feuilles-route/:id` (remplacé)

### À CRÉER
- `GET /api/feuilles-route/active/:chauffeurId` (simplifié)
- `POST /api/feuilles-route` (avec taximètre complet)
- `PUT /api/feuilles-route/:id` (avec taximètre complet)

## 7. MAPPING UNIFIÉ

### Backend → Frontend (réponse API)
```javascript
const mapFeuilleRouteForFrontend = (dbData) => ({
  // Données de base
  feuille_id: dbData.feuille_id,
  chauffeur_id: dbData.chauffeur_id,
  vehicule_id: dbData.vehicule_id,
  date_service: dbData.date_service,
  mode_encodage: dbData.mode_encodage,
  heure_debut: dbData.heure_debut,
  heure_fin: dbData.heure_fin,
  index_km_debut_tdb: dbData.index_km_debut_tdb,
  index_km_fin_tdb: dbData.index_km_fin_tdb,
  interruptions: dbData.interruptions,
  est_validee: dbData.est_validee,
  
  // Données taximètre (utiliser les nouveaux champs)
  taximetre_prise_charge_debut: dbData.taximetre?.taximetre_prise_charge_debut,
  taximetre_index_km_debut: dbData.taximetre?.taximetre_index_km_debut,
  taximetre_km_charge_debut: dbData.taximetre?.taximetre_km_charge_debut,
  taximetre_chutes_debut: dbData.taximetre?.taximetre_chutes_debut,
  taximetre_prise_charge_fin: dbData.taximetre?.taximetre_prise_charge_fin,
  taximetre_index_km_fin: dbData.taximetre?.taximetre_index_km_fin,
  taximetre_km_charge_fin: dbData.taximetre?.taximetre_km_charge_fin,
  taximetre_chutes_fin: dbData.taximetre?.taximetre_chutes_fin,
  
  // Relations
  chauffeur: dbData.chauffeur,
  vehicule: dbData.vehicule,
  course: dbData.course,
  charge: dbData.charge
});
```

### Frontend → Backend (envoi API)
```javascript
const prepareFeuilleRouteForAPI = (formData) => ({
  // Données de base
  chauffeur_id: parseInt(formData.chauffeur_id),
  vehicule_id: parseInt(formData.vehicule_id),
  date_service: formData.date_service,
  mode_encodage: formData.mode_encodage,
  heure_debut: formData.heure_debut,
  heure_fin: formData.heure_fin,
  index_km_debut_tdb: parseInt(formData.index_km_debut_tdb),
  index_km_fin_tdb: formData.index_km_fin_tdb ? parseInt(formData.index_km_fin_tdb) : null,
  interruptions: formData.interruptions || '',
  est_validee: formData.est_validee || false,
  
  // Données taximètre
  taximetre: {
    taximetre_prise_charge_debut: formData.taximetre_prise_charge_debut,
    taximetre_index_km_debut: formData.taximetre_index_km_debut ? parseInt(formData.taximetre_index_km_debut) : null,
    taximetre_km_charge_debut: formData.taximetre_km_charge_debut,
    taximetre_chutes_debut: formData.taximetre_chutes_debut,
    taximetre_prise_charge_fin: formData.taximetre_prise_charge_fin,
    taximetre_index_km_fin: formData.taximetre_index_km_fin ? parseInt(formData.taximetre_index_km_fin) : null,
    taximetre_km_charge_fin: formData.taximetre_km_charge_fin,
    taximetre_chutes_fin: formData.taximetre_chutes_fin
  }
});
```

## 8. PLAN D'IMPLÉMENTATION

1. **Supprimer les anciens endpoints dashboard** ✋
2. **Créer les nouveaux endpoints simplifiés** 🔨
3. **Implémenter le mapping unifié** 🗺️
4. **Tester avec les formulaires existants** ✅
5. **Valider avec la génération PDF** 📄

Cette approche garantit :
- ✅ Cohérence entre frontend/backend
- ✅ Simplicité des APIs
- ✅ Compatibilité avec le PDF
- ✅ Maintenance facilitée