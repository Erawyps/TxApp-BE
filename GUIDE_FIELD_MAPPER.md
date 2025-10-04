# 🛠️ Guide d'Utilisation du Field Mapper

## 📌 Vue d'ensemble

Le **Field Mapper** (`/src/utils/fieldMapper.js`) est un utilitaire de transformation qui assure la compatibilité entre :
- Le schéma Prisma (base de données)
- Le format attendu par le frontend (React)
- La génération de PDF réglementaires

---

## 🎯 Pourquoi utiliser le Field Mapper ?

### Problème résolu :
Le schéma Prisma utilise des **relations au pluriel** :
```prisma
model feuille_route {
  courses course[]  // Relation PLURIELLE
  charges charge[]  // Relation PLURIELLE
}
```

Mais certaines parties du code frontend attendaient des noms **singuliers** (`course`, `charge`).

### Solution :
Le Field Mapper transforme automatiquement les données pour :
- ✅ Utiliser les bons noms de champs (pluriel)
- ✅ Extraire les données des relations imbriquées
- ✅ Assurer la compatibilité avec l'ancien code

---

## 📦 Fonctions Disponibles

### 1. `mapFeuilleRouteFromDB(feuilleDB)`

**Utilisation :** Transformation complète d'une feuille de route depuis la DB

```javascript
import { mapFeuilleRouteFromDB } from '@/utils/fieldMapper';

// Depuis une API route
const feuilleDB = await prisma.feuille_route.findUnique({
  where: { feuille_id: id },
  include: {
    courses: { include: { client: true, mode_paiement: true } },
    charges: { include: { vehicule: true, mode_paiement: true } },
    chauffeur: { include: { societe_taxi: true } },
    vehicule: { include: { societe_taxi: true } },
    taximetre: true
  }
});

const feuilleMapped = mapFeuilleRouteFromDB(feuilleDB);

// ✅ feuilleMapped contient maintenant :
// - courses (array) ET course (alias pour compatibilité)
// - charges (array) ET charge (alias pour compatibilité)
// - nom_exploitant (extrait de chauffeur.societe_taxi.nom)
// - numero_taximetre (extrait de taximetre.numero_serie)
// - Tous les autres champs transformés
```

**Retour :**
```javascript
{
  feuille_id: 1,
  date_service: '2024-01-15T00:00:00.000Z',
  chauffeur_id: 5,
  vehicule_id: 3,
  
  // Relations transformées
  courses: [...],        // ✅ Données courses (pluriel)
  course: [...],         // ✅ Alias pour compatibilité
  charges: [...],        // ✅ Données charges (pluriel)
  charge: [...],         // ✅ Alias pour compatibilité
  
  // Données extraites des relations
  nom_exploitant: 'TaxiCo SARL',           // depuis chauffeur.societe_taxi.nom
  nom_exploitant_vehicule: 'TaxiCo SARL',  // depuis vehicule.societe_taxi.nom
  numero_taximetre: 'TXM-2024-001',        // depuis taximetre.numero_serie
  modele_taximetre: 'Digital Pro 500',     // depuis taximetre.modele
  
  // Objets de relations conservés
  chauffeur: { ... },
  vehicule: { ... },
  taximetre: { ... }
}
```

---

### 2. `mapCourseFromDB(courseDB)`

**Utilisation :** Transformation d'une course individuelle

```javascript
import { mapCourseFromDB } from '@/utils/fieldMapper';

const courseDB = await prisma.course.findUnique({
  where: { course_id: id },
  include: {
    client: true,
    mode_paiement: true
  }
});

const courseMapped = mapCourseFromDB(courseDB);

// ✅ courseMapped contient :
// - nom_client (extrait de client.nom)
// - mode_paiement_libelle (extrait de mode_paiement.libelle)
// - Tous les timestamps convertis en strings
```

---

### 3. `mapChargeFromDB(chargeDB)`

**Utilisation :** Transformation d'une charge individuelle

```javascript
import { mapChargeFromDB } from '@/utils/fieldMapper';

const chargeDB = await prisma.charge.findUnique({
  where: { charge_id: id },
  include: {
    vehicule: true,
    mode_paiement: true
  }
});

const chargeMapped = mapChargeFromDB(chargeDB);
```

---

### 4. `mapChauffeurFromDB(chauffeurDB)`

**Utilisation :** Transformation des données chauffeur

```javascript
import { mapChauffeurFromDB } from '@/utils/fieldMapper';

const chauffeurDB = await prisma.chauffeur.findUnique({
  where: { chauffeur_id: id },
  include: {
    utilisateur: true,
    societe_taxi: true
  }
});

const chauffeurMapped = mapChauffeurFromDB(chauffeurDB);

// ✅ chauffeurMapped contient :
// - nom_complet (prenom + nom)
// - nom_exploitant (depuis societe_taxi.nom)
```

---

### 5. `mapVehiculeFromDB(vehiculeDB)`

**Utilisation :** Transformation des données véhicule

```javascript
import { mapVehiculeFromDB } from '@/utils/fieldMapper';

const vehiculeDB = await prisma.vehicule.findUnique({
  where: { vehicule_id: id },
  include: {
    societe_taxi: true
  }
});

const vehiculeMapped = mapVehiculeFromDB(vehiculeDB);

// ✅ vehiculeMapped contient :
// - nom_exploitant (depuis societe_taxi.nom)
```

---

## 🔧 Intégration dans les Routes API

### Exemple avec Hono :

```javascript
import { mapFeuilleRouteFromDB } from '../utils/fieldMapper.js';

// Route GET pour récupérer une feuille de route
app.get('/feuilles-route/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    const feuilleDB = await prisma.feuille_route.findUnique({
      where: { feuille_id: id },
      include: {
        courses: {
          include: {
            client: true,
            mode_paiement: true
          }
        },
        charges: {
          include: {
            vehicule: true,
            mode_paiement: true
          }
        },
        chauffeur: {
          include: { societe_taxi: true }
        },
        vehicule: {
          include: { societe_taxi: true }
        },
        taximetre: true
      }
    });
    
    if (!feuilleDB) {
      return c.json({ error: 'Feuille non trouvée' }, 404);
    }
    
    // ✅ Transformer avant d'envoyer au frontend
    const feuilleMapped = mapFeuilleRouteFromDB(feuilleDB);
    
    return c.json(feuilleMapped, 200);
  } catch (error) {
    console.error('Erreur:', error);
    return c.json({ error: error.message }, 500);
  }
});
```

---

## 📄 Intégration dans la Génération PDF

### Exemple dans `printUtils.js` :

```javascript
import { mapFeuilleRouteFromDB } from '@/utils/fieldMapper';
import { generateAndDownloadReport } from './printUtils';

// Dans le composant React
const handlePrintReport = async (feuilleId) => {
  try {
    // 1. Récupérer les données depuis l'API
    const response = await fetch(`/api/feuilles-route/${feuilleId}`);
    const feuilleDB = await response.json();
    
    // 2. Transformer les données avec le Field Mapper
    const feuilleMapped = mapFeuilleRouteFromDB(feuilleDB);
    
    // 3. Générer le PDF avec les données transformées
    generateAndDownloadReport(
      feuilleMapped,                    // shiftData
      feuilleMapped.courses || [],      // courses
      feuilleMapped.chauffeur,          // driver
      feuilleMapped.vehicule,           // vehicle
      feuilleMapped.charges || [],      // expenses
      []                                 // externalCourses
    );
    
  } catch (error) {
    console.error('Erreur génération PDF:', error);
  }
};
```

---

## ⚡ Performances

### Quand mapper les données ?

**✅ RECOMMANDÉ - Mapper côté API :**
```javascript
// Dans l'API route
const feuilleDB = await prisma.feuille_route.findUnique({ ... });
const feuilleMapped = mapFeuilleRouteFromDB(feuilleDB);
return c.json(feuilleMapped);
```

**Avantages :**
- ✅ Un seul mapping par requête
- ✅ Frontend reçoit directement les bonnes données
- ✅ Pas de transformation côté client

**❌ PAS RECOMMANDÉ - Mapper côté Frontend :**
```javascript
// Frontend doit transformer à chaque utilisation
const feuilleMapped = mapFeuilleRouteFromDB(feuilleData);
```

**Inconvénients :**
- ❌ Transformations répétées
- ❌ Logique dupliquée
- ❌ Augmente la taille du bundle

---

## 🧪 Tests

### Tester le Field Mapper :

```javascript
import { mapFeuilleRouteFromDB } from '@/utils/fieldMapper';

// Données de test
const mockFeuilleDB = {
  feuille_id: 1,
  date_service: new Date('2024-01-15'),
  courses: [
    { course_id: 1, sommes_percues: '25.50', client: { nom: 'Client A' } }
  ],
  charges: [
    { charge_id: 1, montant: '15.00', vehicule: { plaque_immatriculation: 'ABC123' } }
  ],
  chauffeur: {
    prenom: 'Jean',
    nom: 'Dupont',
    societe_taxi: { nom: 'TaxiCo SARL' }
  },
  vehicule: {
    plaque_immatriculation: 'XYZ789',
    societe_taxi: { nom: 'TaxiCo SARL' }
  },
  taximetre: {
    numero_serie: 'TXM-2024-001',
    modele: 'Digital Pro 500'
  }
};

const result = mapFeuilleRouteFromDB(mockFeuilleDB);

console.log(result.nom_exploitant);           // 'TaxiCo SARL'
console.log(result.numero_taximetre);         // 'TXM-2024-001'
console.log(result.courses.length);           // 1
console.log(result.course.length);            // 1 (alias)
console.log(result.charges.length);           // 1
console.log(result.charge.length);            // 1 (alias)
```

---

## 🚨 Pièges à Éviter

### ❌ NE PAS utiliser les relations singulières directement :
```javascript
const feuille = await prisma.feuille_route.findUnique({
  include: {
    course: { ... },   // ❌ ERREUR - n'existe pas dans le schéma
    charge: { ... }    // ❌ ERREUR - n'existe pas dans le schéma
  }
});
```

### ✅ TOUJOURS utiliser les relations plurielles + mapper :
```javascript
const feuille = await prisma.feuille_route.findUnique({
  include: {
    courses: { ... },  // ✅ CORRECT
    charges: { ... }   // ✅ CORRECT
  }
});

const feuilleMapped = mapFeuilleRouteFromDB(feuille);
// Maintenant feuilleMapped a courses ET course (alias)
```

---

## 📚 Références

- **Fichier source :** `/src/utils/fieldMapper.js`
- **Documentation corrections :** `/CORRECTIONS_FEUILLE_ROUTE.md`
- **Schéma Prisma :** `/prisma/schema.prisma`

---

**Dernière mise à jour :** {{DATE}}  
**Auteur :** Équipe Développement TxApp
