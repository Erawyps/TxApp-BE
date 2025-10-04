# 🔍 Clarification Schema Prisma - Relations Singulier vs Pluriel

## ⚠️ Source de Confusion

Le schéma Prisma (`schema.prisma`) définit les relations comme ceci :

```prisma
model feuille_route {
  feuille_id   Int       @id
  // ... autres champs ...
  
  charge       charge[]  // ⚠️ NOM SINGULIER mais TYPE PLURIEL (tableau)
  course       course[]  // ⚠️ NOM SINGULIER mais TYPE PLURIEL (tableau)
  chauffeur    chauffeur @relation(...)
  vehicule     vehicule  @relation(...)
  taximetre    taximetre?
}
```

---

## 🎯 Le Problème

Dans le **schéma Prisma**, les noms des relations sont écrits au **singulier** :
- `charge charge[]` - nom = "charge", type = tableau de charge
- `course course[]` - nom = "course", type = tableau de course

Mais quand on utilise **Prisma Client** dans le code, on doit utiliser le **nom pluriel** pour accéder aux tableaux :
```javascript
// ❌ ANCIEN CODE (ne fonctionne plus avec Prisma 6+)
const feuille = await prisma.feuille_route.findUnique({
  include: {
    course: true,  // ❌ Prisma 6 attend "courses"
    charge: true   // ❌ Prisma 6 attend "charges"
  }
});

// ✅ NOUVEAU CODE (Prisma 6+)
const feuille = await prisma.feuille_route.findUnique({
  include: {
    courses: true,  // ✅ PLURIEL
    charges: true   // ✅ PLURIEL
  }
});
```

---

## 📋 Pourquoi ce Changement ?

### Prisma < 6.0 (Ancien Comportement)
- Utilisait le nom **exact** du champ dans le schéma (`charge`, `course`)
- Plus proche de la définition SQL

### Prisma >= 6.0 (Nouveau Comportement)
- Utilise automatiquement le **pluriel** pour les relations `[]` (tableaux)
- Plus intuitif : un tableau de courses → `courses`
- Meilleure conformité avec les conventions JavaScript/TypeScript

---

## 🔧 Solution : Field Mapper

Pour éviter de casser l'ancien code et assurer la transition, le **Field Mapper** fournit les deux versions :

```javascript
import { mapFeuilleRouteFromDB } from '@/utils/fieldMapper';

const feuilleDB = await prisma.feuille_route.findUnique({
  include: {
    courses: true,  // ✅ Prisma 6 utilise le pluriel
    charges: true   // ✅ Prisma 6 utilise le pluriel
  }
});

const feuilleMapped = mapFeuilleRouteFromDB(feuilleDB);

// ✅ Résultat contient les deux versions :
console.log(feuilleMapped.courses);  // Array de courses (nouveau)
console.log(feuilleMapped.course);   // Alias → même tableau (compatibilité)
console.log(feuilleMapped.charges);  // Array de charges (nouveau)
console.log(feuilleMapped.charge);   // Alias → même tableau (compatibilité)
```

---

## 📊 Tableau de Correspondance

| Schéma Prisma | Prisma < 6.0 | Prisma >= 6.0 | Field Mapper Output |
|---------------|--------------|---------------|---------------------|
| `charge charge[]` | `include: { charge }` | `include: { charges }` | `{ charges: [...], charge: [...] }` |
| `course course[]` | `include: { course }` | `include: { courses }` | `{ courses: [...], course: [...] }` |
| `chauffeur chauffeur` | `include: { chauffeur }` | `include: { chauffeur }` | `{ chauffeur: {...} }` |
| `vehicule vehicule` | `include: { vehicule }` | `include: { vehicule }` | `{ vehicule: {...} }` |

---

## ✅ Règle Simple à Retenir

### Dans les requêtes Prisma (code backend) :
- Relations **1-to-many** (tableaux `[]`) → utiliser le **PLURIEL**
- Relations **1-to-1** ou **many-to-1** → utiliser le **SINGULIER**

```javascript
// ✅ CORRECT
await prisma.feuille_route.findUnique({
  include: {
    courses: true,     // ✅ Pluriel (1-to-many)
    charges: true,     // ✅ Pluriel (1-to-many)
    chauffeur: true,   // ✅ Singulier (many-to-1)
    vehicule: true,    // ✅ Singulier (many-to-1)
    taximetre: true    // ✅ Singulier (1-to-1)
  }
});
```

### Dans le code frontend :
- Utiliser `feuille.courses` ou `feuille.course` (le Field Mapper fournit les deux)
- Préférer `feuille.courses` (version moderne)

---

## 🚨 Erreurs Courantes

### ❌ ERREUR 1 : Utiliser le singulier dans Prisma 6+
```javascript
const feuille = await prisma.feuille_route.findUnique({
  include: {
    course: true  // ❌ Erreur : "course" n'est pas une relation valide
  }
});
```

**Solution :**
```javascript
const feuille = await prisma.feuille_route.findUnique({
  include: {
    courses: true  // ✅ Correct
  }
});
```

---

### ❌ ERREUR 2 : Oublier le Field Mapper
```javascript
const feuille = await prisma.feuille_route.findUnique({
  include: { courses: true }
});

// ❌ Ancien code frontend attend feuille.course
const totalCourses = feuille.course.length;  // undefined
```

**Solution :**
```javascript
import { mapFeuilleRouteFromDB } from '@/utils/fieldMapper';

const feuilleDB = await prisma.feuille_route.findUnique({
  include: { courses: true }
});

const feuille = mapFeuilleRouteFromDB(feuilleDB);

// ✅ Fonctionne avec les deux versions
const totalCourses = feuille.courses.length;  // ✅
const totalCourses = feuille.course.length;   // ✅ (alias)
```

---

### ❌ ERREUR 3 : Mélanger singulier et pluriel
```javascript
const feuille = await prisma.feuille_route.findUnique({
  include: {
    courses: true,  // ✅ Pluriel
    charge: true    // ❌ Singulier (incohérent)
  }
});
```

**Solution :**
```javascript
const feuille = await prisma.feuille_route.findUnique({
  include: {
    courses: true,  // ✅ Pluriel
    charges: true   // ✅ Pluriel
  }
});
```

---

## 📖 Documentation Officielle Prisma

Pour plus de détails sur les relations Prisma :
- [Relations Prisma](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

---

## 🎯 Résumé

1. **Schéma Prisma** : Nom singulier, type tableau (`charge charge[]`)
2. **Prisma Client >= 6.0** : Utiliser le **pluriel** dans `include` (`courses`, `charges`)
3. **Field Mapper** : Fournit les deux versions pour compatibilité
4. **Frontend** : Peut utiliser `feuille.courses` (moderne) ou `feuille.course` (legacy)

---

**Dernière mise à jour :** {{DATE}}  
**Version Prisma actuelle :** 6.16.2
