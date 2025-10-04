# 📋 CORRECTIONS TABLEAU COURSES - 04 Octobre 2025

## 🎯 Problèmes identifiés

### 1️⃣ Affichage du tableau principal
```
undefined undefined  ← Chauffeur
0.00 €              ← Prix
Inconnu             ← Statut
```

**Cause** : Les colonnes utilisaient des accesseurs qui cherchaient des champs inexistants :
- `row.chauffeur_nom` et `row.chauffeur_prenom` ❌
- `row.vehicule_immatriculation` ❌
- `row.prix_course` ❌
- `row.distance_km` ❌
- `row.mode_paiement_libelle` ❌

### 2️⃣ Détails de la course (SubRow)
```
Place Flagey → Gare Centrale
07:30 AM
0.00 €  ← Prix incorrect
```

**Cause** : SubRow cherchait des champs qui n'existent pas :
- `course.prix_final` ❌
- `course.prix_base` ❌
- `course.statut` ❌

---

## ✅ Corrections appliquées

### Fichier `/src/app/pages/dashboards/home/trips/columns.js`

#### Avant (❌ Champs inexistants) :
```javascript
columnHelper.accessor((row) => `${row.chauffeur_nom} ${row.chauffeur_prenom}`, {
  id: "chauffeur",
  // ...
})

columnHelper.accessor((row) => row.vehicule_immatriculation, {
  id: "vehicule",
  // ...
})

columnHelper.accessor((row) => row.distance_km, {
  id: "distance",
  // ...
})
```

#### Après (✅ Données imbriquées correctement extraites) :
```javascript
// ✅ Extraction du nom du chauffeur depuis la structure imbriquée
columnHelper.accessor((row) => {
  const prenom = row.feuille_route?.chauffeur?.utilisateur?.prenom || '';
  const nom = row.feuille_route?.chauffeur?.utilisateur?.nom || '';
  return `${prenom} ${nom}`.trim() || 'Inconnu';
}, {
  id: "chauffeur",
  label: "Chauffeur",
  header: "Chauffeur",
  cell: ChauffeurCell,
})

// ✅ Extraction de la plaque du véhicule
columnHelper.accessor((row) => {
  return row.feuille_route?.vehicule?.plaque_immatriculation || 'N/A';
}, {
  id: "vehicule",
  label: "Véhicule",
  header: "Véhicule",
  cell: VehiculeCell,
})

// ✅ Construction du trajet
columnHelper.accessor((row) => {
  const depart = row.lieu_embarquement || 'N/A';
  const arrivee = row.lieu_debarquement || 'N/A';
  return `${depart} → ${arrivee}`;
}, {
  id: "trajet",
  // ...
})

// ✅ Calcul de la distance en km
columnHelper.accessor((row) => {
  const distance = (row.index_debarquement || 0) - (row.index_embarquement || 0);
  return distance;
}, {
  id: "distance",
  // ...
})

// ✅ Utilisation de sommes_percues comme prix
columnHelper.accessor((row) => {
  return parseFloat(row.sommes_percues || 0);
}, {
  id: "prix",
  // ...
})

// ✅ Extraction du mode de paiement
columnHelper.accessor((row) => {
  return row.mode_paiement?.libelle || 'Non spécifié';
}, {
  id: "paiement",
  // ...
})

// ✅ Calcul du statut de la course
columnHelper.accessor((row) => {
  if (row.est_hors_heures) return 'hors_heures';
  if (row.feuille_route?.est_validee) return 'validee';
  return 'en_cours';
}, {
  id: "statut",
  // ...
})
```

---

### Fichier `/src/app/pages/dashboards/home/trips/data.js`

#### Correction des statuts

**Avant** (❌ Statuts inadaptés) :
```javascript
export const tripStatusOptions = [
  { value: "En attente", label: "En attente", color: "warning", icon: ClockIcon },
  { value: "Confirmée", label: "Confirmée", color: "info", icon: DocumentTextIcon },
  { value: "En cours", label: "En cours", color: "primary", icon: ClockIcon },
  { value: "Terminée", label: "Terminée", color: "success", icon: CheckCircleIcon },
  { value: "Annulée", label: "Annulée", color: "error", icon: XCircleIcon },
  { value: "Facturée", label: "Facturée", color: "success", icon: DocumentTextIcon },
];
```

**Après** (✅ Statuts alignés avec le modèle DB) :
```javascript
export const tripStatusOptions = [
  {
    value: "en_cours",
    label: "En cours",
    color: "warning",
    icon: ClockIcon,
  },
  {
    value: "validee",
    label: "Validée",
    color: "success",
    icon: CheckCircleIcon,
  },
  {
    value: "hors_heures",
    label: "Hors heures",
    color: "info",
    icon: MoonIcon,
  },
  {
    value: "annulee",
    label: "Annulée",
    color: "error",
    icon: XCircleIcon,
  },
];
```

---

### Fichier `/src/app/pages/dashboards/home/trips/SubRowComponent.jsx`

#### Correction de l'affichage des détails

**Avant** (❌ Champs inexistants) :
```javascript
<Td>{(course.prix_final || 0).toFixed(2)} €</Td>
<Td>Prix de base : {(course.prix_base || 0).toFixed(2)} €</Td>
<Tag color={
  course.statut === 'Terminée' ? 'success' : 
  course.statut === 'Annulée' ? 'error' : 'warning'
}>
  {course.statut}
</Tag>
```

**Après** (✅ Calculs depuis les données API) :
```javascript
// ✅ Calcul des valeurs
const prixBase = parseFloat(course.prix_taximetre || 0);
const sommesPercues = parseFloat(course.sommes_percues || 0);
const supplement = sommesPercues > prixBase ? sommesPercues - prixBase : 0;
const distance = (course.index_debarquement || 0) - (course.index_embarquement || 0);

// ✅ Détermination du statut
let statut = 'En cours';
let statutColor = 'warning';
if (course.est_hors_heures) {
  statut = 'Hors heures';
  statutColor = 'info';
} else if (course.feuille_route?.est_validee) {
  statut = 'Validée';
  statutColor = 'success';
}

// ✅ Affichage
<Td className="font-medium">{sommesPercues.toFixed(2)} €</Td>
<Td>Prix taximètre : {prixBase.toFixed(2)} €</Td>
{supplement > 0 && (
  <Tr>
    <Td>Supplément :</Td>
    <Td>+{supplement.toFixed(2)} €</Td>
  </Tr>
)}
<Tr>
  <Td>Distance :</Td>
  <Td>{distance} km</Td>
</Tr>
<Tag color={statutColor}>
  {statut}
</Tag>
```

---

## 📊 Structure des données de l'API

### Réponse `/api/courses`

```json
{
  "course_id": 41,
  "feuille_id": 22,
  "num_ordre": 1,
  "index_depart": 12000,
  "index_embarquement": 12000,
  "lieu_embarquement": "Place Flagey",
  "heure_embarquement": "1970-01-01T06:30:00.000Z",
  "index_debarquement": 12015,
  "lieu_debarquement": "Gare Centrale",
  "heure_debarquement": "1970-01-01T06:45:00.000Z",
  "prix_taximetre": "18.5",
  "sommes_percues": "20",
  "mode_paiement_id": 1,
  "client_id": null,
  "est_hors_heures": false,
  "created_at": "2025-10-04T01:54:43.420Z",
  
  "feuille_route": {
    "feuille_id": 22,
    "chauffeur_id": 5,
    "vehicule_id": 2,
    "est_validee": false,
    
    "chauffeur": {
      "chauffeur_id": 5,
      "utilisateur": {
        "user_id": 5,
        "email": "hasler.tehou@txapp.be",
        "nom": "TEHOU",
        "prenom": "Hasler",
        "role": "Driver"
      }
    },
    
    "vehicule": {
      "vehicule_id": 2,
      "plaque_immatriculation": "TXAA-752",
      "num_identification": "N°2",
      "marque": "BMW",
      "modele": "Série 5"
    }
  },
  
  "mode_paiement": {
    "mode_id": 1,
    "code": "CASH",
    "libelle": "Espèces",
    "type": "Cash"
  },
  
  "client": null
}
```

---

## 🎨 Résultat attendu

### Tableau principal

| Chauffeur | Véhicule | Départ → Arrivée | Départ | Distance | Prix | Paiement | Statut |
|-----------|----------|------------------|--------|----------|------|----------|--------|
| Hasler TEHOU | TXAA-752 | Place Flagey → Gare Centrale | 06:30 | 15 km | 20.00 € | Espèces | En cours |

### Détails de la course (expandable)

```
Détails de la course:

Trajet                          | Heure  | Montant  | Paiement | Statut
Place Flagey → Gare Centrale    | 06:30  | 20.00 €  | Espèces  | En cours

                    Prix taximètre :    18.50 €
                    Supplément :        +1.50 €
                    Distance :          15 km
                    Total :             20.00 €
```

---

## 🚀 Test de vérification

1. **Ouvrir le navigateur** : `http://localhost:5173`
2. **Se connecter** avec un compte admin
3. **Naviguer** vers le Dashboard
4. **Vérifier le tableau** :
   - ✅ Nom du chauffeur visible (ex: "Hasler TEHOU")
   - ✅ Plaque du véhicule (ex: "TXAA-752")
   - ✅ Trajet complet (ex: "Place Flagey → Gare Centrale")
   - ✅ Heure correcte (ex: "06:30")
   - ✅ Distance calculée (ex: "15 km")
   - ✅ Prix affiché (ex: "20.00 €")
   - ✅ Mode de paiement (ex: badge "Espèces" vert)
   - ✅ Statut (ex: badge "En cours" orange)

5. **Cliquer sur une ligne** pour l'expandre :
   - ✅ Détails complets affichés
   - ✅ Prix taximètre (18.50 €)
   - ✅ Supplément si applicable (1.50 €)
   - ✅ Distance (15 km)
   - ✅ Total (20.00 €)

---

**Date** : 04 Octobre 2025  
**Auteur** : GitHub Copilot  
**Status** : ✅ Corrections appliquées - Prêt pour test
