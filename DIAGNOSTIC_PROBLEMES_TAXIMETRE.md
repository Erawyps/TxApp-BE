# 🔍 Diagnostic Complet - Problèmes Taximètre et Feuille de Route

**Date**: 8 octobre 2025  
**Statut**: En cours d'analyse et correction

---

## 📋 Problèmes Identifiés

### 1. ❌ PROBLÈME MAJEUR: Pré-remplissage automatique incorrect

**Symptôme**: Le formulaire de début de shift (`NewShiftForm`) pré-remplit automatiquement les champs taximètre avec les données du **premier enregistrement** de la table taximetre, au lieu de rester vide pour un nouveau shift.

**Impact**: 
- Les conducteurs voient des données incorrectes dès l'ouverture du formulaire
- Confusion entre les données de l'ancien shift et le nouveau
- Risque d'enregistrer des données erronées sans s'en apercevoir

**Cause identifiée**:
```javascript
// Dans EndShiftForm.jsx - ligne ~100
const getDefaultValues = () => {
  // ❌ PROBLÈME: Utilise les données du shift PRÉCÉDENT
  taximetre_prise_charge_fin: shiftData?.taximetre?.taximetre_prise_charge_fin || '',
  // ...
}
```

---

### 2. ❌ Structure confuse de la table `taximetre`

**Analyse du schéma Prisma**:

```prisma
model taximetre {
  feuille_id Int @id  // ✅ Relation 1:1 avec feuille_route
  
  // ❌ DOUBLON 1: Anciens champs (à supprimer?)
  pc_debut_tax         Decimal?
  pc_fin_tax          Decimal?
  index_km_debut_tax  Int?
  index_km_fin_tax    Int?
  km_charge_debut     Decimal?
  km_charge_fin       Decimal?
  chutes_debut_tax    Decimal?
  chutes_fin_tax      Decimal?
  
  // ✅ NOUVEAUX CHAMPS (ceux utilisés actuellement)
  taximetre_prise_charge_debut Decimal?
  taximetre_prise_charge_fin   Decimal?
  taximetre_index_km_debut     Int?
  taximetre_index_km_fin       Int?
  taximetre_km_charge_debut    Decimal?
  taximetre_km_charge_fin      Decimal?
  taximetre_chutes_debut       Decimal?
  taximetre_chutes_fin         Decimal?
}
```

**Problèmes**:
1. **Doublon de colonnes**: Anciens (`pc_debut_tax`, etc.) vs nouveaux (`taximetre_prise_charge_debut`)
2. **Pas de séparation claire**: Début et fin sont mélangés dans la même table
3. **Confusion**: Quelle version utiliser? L'ancienne ou la nouvelle?

---

### 3. ❌ Logique d'enregistrement fragmentée

**Flux actuel** (problématique):

```
DÉBUT SHIFT (NewShiftForm)
  ↓
Création feuille_route + taximetre (DÉBUT seulement)
  ↓
[Shift en cours - courses enregistrées]
  ↓
FIN SHIFT (EndShiftForm)
  ↓
UPDATE taximetre (FIN seulement) ❌ PROBLÈME ICI
```

**Logs du problème**:
```
🔧 Données taximètre mappées pour update: {}  ← VIDE!
```

Quand le shift se termine, les données de fin ne sont PAS enregistrées dans taximetre!

---

### 4. ❌ Données manquantes dans le PDF

**Problème constaté**: Le PDF généré ne montre pas toutes les données taximètre

**Trace dans printUtils.js**:
```javascript
console.log('shiftData.taximetre_prise_charge_debut:', shiftData.taximetre_prise_charge_debut);
// ✅ Devrait afficher la valeur mais parfois undefined
```

**Cause**: 
- Le mapping `mapFeuilleRouteFromDB` dans server-dev.js ne récupère pas correctement les données de la relation taximetre
- Les champs sont cherchés au mauvais endroit (shiftData.taximetre vs shiftData.taximetre_prise_charge_debut)

---

## 🛠️ Solution Proposée

### Étape 1: Clarifier le schéma de données

**Option A: Utiliser une seule table taximetre (recommandé)**
```prisma
model taximetre {
  feuille_id Int @id
  
  // DÉBUT DE SHIFT
  taximetre_prise_charge_debut Decimal?
  taximetre_index_km_debut     Int?
  taximetre_km_charge_debut    Decimal?
  taximetre_chutes_debut       Decimal?
  
  // FIN DE SHIFT
  taximetre_prise_charge_fin   Decimal?
  taximetre_index_km_fin       Int?
  taximetre_km_charge_fin      Decimal?
  taximetre_chutes_fin         Decimal?
  
  created_at DateTime? @default(now())
  updated_at DateTime? @default(now()) @updatedAt  // ← AJOUTER
  
  feuille_route feuille_route @relation(...)
}
```

**Option B: Séparer en deux enregistrements** (non recommandé car relation 1:1)

---

### Étape 2: Corriger le mapping backend

**Dans `server-dev.js`** - Fonction `mapFeuilleRouteForFrontend`:

```javascript
const mapFeuilleRouteForFrontend = (dbData) => {
  if (!dbData) return null;
  
  return {
    // ... autres champs
    
    // ✅ CORRECTION: Mapper depuis la relation taximetre
    taximetre_prise_charge_debut: dbData.taximetre?.taximetre_prise_charge_debut ?? null,
    taximetre_index_km_debut: dbData.taximetre?.taximetre_index_km_debut ?? null,
    taximetre_km_charge_debut: dbData.taximetre?.taximetre_km_charge_debut ?? null,
    taximetre_chutes_debut: dbData.taximetre?.taximetre_chutes_debut ?? null,
    
    taximetre_prise_charge_fin: dbData.taximetre?.taximetre_prise_charge_fin ?? null,
    taximetre_index_km_fin: dbData.taximetre?.taximetre_index_km_fin ?? null,
    taximetre_km_charge_fin: dbData.taximetre?.taximetre_km_charge_fin ?? null,
    taximetre_chutes_fin: dbData.taximetre?.taximetre_chutes_fin ?? null,
    
    // Inclure l'objet complet pour référence
    taximetre: dbData.taximetre
  };
};
```

---

### Étape 3: Corriger preparePartialUpdateForDB

**Problème actuel**:
```javascript
const taximetreData = {};
// ❌ Les champs de fin ne sont JAMAIS ajoutés!
```

**Solution**:
```javascript
const preparePartialUpdateForDB = (formData) => {
  const taximetreData = {};
  
  // Champs de DÉBUT
  if (formData.taximetre_prise_charge_debut !== undefined) {
    taximetreData.taximetre_prise_charge_debut = Number(formData.taximetre_prise_charge_debut);
  }
  // ... autres champs début
  
  // ✅ AJOUTER: Champs de FIN
  if (formData.taximetre_prise_charge_fin !== undefined) {
    taximetreData.taximetre_prise_charge_fin = Number(formData.taximetre_prise_charge_fin);
  }
  if (formData.taximetre_index_km_fin !== undefined) {
    taximetreData.taximetre_index_km_fin = Number(formData.taximetre_index_km_fin);
  }
  if (formData.taximetre_km_charge_fin !== undefined) {
    taximetreData.taximetre_km_charge_fin = Number(formData.taximetre_km_charge_fin);
  }
  if (formData.taximetre_chutes_fin !== undefined) {
    taximetreData.taximetre_chutes_fin = Number(formData.taximetre_chutes_fin);
  }
  
  return {
    feuilleData: { /* ... */ },
    taximetreData: Object.keys(taximetreData).length > 0 ? taximetreData : null
  };
};
```

---

### Étape 4: Corriger NewShiftForm (pas de pré-remplissage)

```jsx
// Dans NewShiftForm.jsx
const {
  register,
  handleSubmit,
  formState: { errors },
  reset,
  setValue
} = useForm({
  resolver: yupResolver(shiftSchema),
  defaultValues: {
    date_service: new Date().toISOString().split('T')[0],
    mode_encodage: 'LIVE',
    heure_debut: new Date().toTimeString().slice(0, 5),
    interruptions: '',
    index_km_debut_tdb: '', // ✅ VIDE par défaut
    // ✅ PAS DE CHAMPS TAXIMETRE ICI - ils seront remplis manuellement
  }
});

// ❌ SUPPRIMER tout useEffect qui pré-remplit depuis localStorage ou API
```

---

### Étape 5: Corriger EndShiftForm

**Problème actuel**: Pré-remplit avec les données d'un shift précédent

**Solution**:
```jsx
const getDefaultValues = () => {
  // ✅ NE PAS utiliser localStorage pour les valeurs taximetre
  // ✅ Utiliser UNIQUEMENT les données du shift ACTUEL (shiftData)
  
  return {
    heure_fin: '', // Vide, à saisir par l'utilisateur
    interruptions: shiftData?.interruptions || '',
    km_tableau_bord_fin: '', // Vide, à saisir
    
    // ✅ Champs taximetre FIN - VIDES par défaut
    taximetre_prise_charge_fin: '',
    taximetre_index_km_fin: '',
    taximetre_km_charge_fin: '',
    taximetre_chutes_fin: '',
    
    // Signature pré-remplie
    signature_chauffeur: `${driver?.prenom || ''} ${driver?.nom || ''}`.trim()
  };
};

// ❌ SUPPRIMER le useEffect qui force les valeurs depuis shiftData.taximetre
// ❌ SUPPRIMER loadSavedData pour les champs taximetre
```

---

### Étape 6: Vérifier la requête API PUT

**Dans `PUT /api/dashboard/feuilles-route/:id`**:

```javascript
app.put('/api/dashboard/feuilles-route/:id', dbMiddleware, async (c) => {
  try {
    const feuilleId = parseInt(c.req.param('id'));
    const formData = await c.req.json();
    
    console.log('📝 FRONTEND DATA received (RAW):', JSON.stringify(formData, null, 2));
    
    // ✅ Mapper les données
    const { feuilleData, taximetreData } = preparePartialUpdateForDB(formData);
    
    console.log('🔧 Données feuille mappées:', feuilleData);
    console.log('🔧 Données taximètre mappées:', taximetreData);
    
    // ✅ VÉRIFIER: taximetreData ne doit PAS être vide si formData contient des champs taximetre_*_fin
    
    // Mise à jour feuille
    await prisma.feuille_route.update({
      where: { feuille_id: feuilleId },
      data: feuilleData
    });
    
    // ✅ Mise à jour taximetre (upsert pour gérer création/update)
    if (taximetreData) {
      await prisma.taximetre.upsert({
        where: { feuille_id: feuilleId },
        update: taximetreData,
        create: {
          feuille_id: feuilleId,
          ...taximetreData
        }
      });
    }
    
    // ...
  }
});
```

---

## 📊 Tests à effectuer

### Test 1: Nouveau shift sans pré-remplissage
- [ ] Ouvrir NewShiftForm
- [ ] Vérifier que TOUS les champs sont vides (sauf date/heure actuelles)
- [ ] Remplir manuellement les champs taximètre début
- [ ] Vérifier l'enregistrement en DB

### Test 2: Fin de shift avec sauvegarde correcte
- [ ] Ouvrir EndShiftForm
- [ ] Vérifier que les champs taximetre FIN sont vides
- [ ] Remplir les champs manuellement
- [ ] Soumettre le formulaire
- [ ] Vérifier dans DB que taximetre.taximetre_*_fin sont bien remplis

### Test 3: Génération PDF complète
- [ ] Créer un shift complet (début + courses + fin)
- [ ] Générer le PDF
- [ ] Vérifier que TOUTES les données taximetre (début ET fin) sont affichées

---

## 🎯 Prochaines étapes

1. ✅ **Documenter le problème** (ce fichier)
2. ⏳ **Corriger preparePartialUpdateForDB** dans server-dev.js
3. ⏳ **Supprimer le pré-remplissage automatique** dans les formulaires
4. ⏳ **Tester le flux complet**
5. ⏳ **Nettoyer la table taximetre** (supprimer les anciens champs)

---

## 📝 Notes importantes

- **Relation 1:1**: Une feuille_route = UN SEUL enregistrement taximetre
- **Début vs Fin**: Stockés dans le MÊME enregistrement (colonnes différentes)
- **Pas de pré-remplissage**: Les formulaires doivent être VIDES pour un nouveau shift
- **Mapping crucial**: Bien récupérer les données depuis la relation `taximetre`

---

**Auteur**: Analyse diagnostique automatisée  
**Dernière mise à jour**: 2025-10-08
