# 🚗 Chauffeurs de test avec feuilles de route COMPLÈTES

Ces chauffeurs ont des feuilles de route avec **courses, charges et taximètre** pour tester la génération PDF.

## 📋 Liste des chauffeurs disponibles

### 1. **Hasler TEHOU** ⭐ (Recommandé)
- **Email** : `hasler.tehou@txapp.be`
- **Mot de passe** : `Azerty123!`
- **Feuilles de route complètes** :
  - Feuille #1 : 4 courses, 2 charges, taximètre ✅ (22/09/2024)
  - Feuille #7 : 4 courses, 1 charge, taximètre ✅ (24/09/2024)
  - Feuille #22 : 2 courses (05/10/2024)
- **Véhicules** : TXAA-751, TXAA-752

### 2. **Ismail DRISSI**
- **Email** : `ismail.drissi@txapp.be`
- **Mot de passe** : `Azerty123!`
- **Feuilles de route complètes** :
  - Feuille #2 : 4 courses, 1 charge, taximètre ✅ (22/09/2024)
  - Feuille #8 : 4 courses, 1 charge, taximètre ✅ (24/09/2024)
- **Véhicules** : TXAA-752

### 3. **Ahmed BENZEMA**
- **Email** : `ahmed.benzema@txapp.be`
- **Mot de passe** : `Azerty123!`
- **Feuilles de route complètes** :
  - Feuille #3 : 4 courses, 1 charge, taximètre ✅ (22/09/2024)
  - Feuille #9 : 4 courses, 1 charge, taximètre ✅ (24/09/2024)
- **Véhicules** : TXAA-753, TXAA-754

### 4. **Mohamed HASSAN**
- **Email** : `mohamed.hassan@txapp.be`
- **Mot de passe** : `Azerty123!`
- **Feuilles de route complètes** :
  - Feuille #4 : 4 courses, 1 charge, taximètre ✅ (23/09/2024)
  - Feuille #10 : 4 courses, 1 charge, taximètre ✅ (24/09/2024)
- **Véhicules** : TXBB-801, TXBB-803

### 5. **Pierre DUBOIS**
- **Email** : `pierre.dubois@txapp.be`
- **Mot de passe** : `Azerty123!`
- **Feuilles de route complètes** :
  - Feuille #5 : 4 courses, 1 charge, taximètre ✅ (23/09/2024)
- **Véhicules** : TXBB-802

### 6. **Hassan ALAMI**
- **Email** : `hassan.alami@txapp.be`
- **Mot de passe** : `Azerty123!`
- **Feuilles de route complètes** :
  - Feuille #6 : 4 courses, 1 charge, taximètre ✅ (23/09/2024)
- **Véhicules** : TXAA-755

## 🎯 Comment tester

1. **Se déconnecter** si vous êtes connecté

2. **Se connecter** avec un des comptes ci-dessus (exemple : `hasler.tehou@txapp.be` / `Azerty123!`)

3. **Aller dans "Nouvelle feuille"** ou **Dashboard chauffeur**

4. **Sélectionner une feuille de route existante** (dates 22/09, 23/09 ou 24/09/2024)
   - Ou utilisez le sélecteur d'historique si disponible
   - Les feuilles avec courses apparaîtront avec des données

5. **Générer le PDF** : Cliquer sur le bouton de téléchargement

6. **Vérifier le PDF** :
   - ✅ Nom exploitant affiché
   - ✅ Informations chauffeur complètes
   - ✅ 4 courses détaillées
   - ✅ Charges affichées
   - ✅ Taximètre complet (Prise en charge, Index km, Km charge, Chutes)
   - ✅ Recettes totales
   - ✅ Résumé financier

## ⚠️ Note importante

Si vous créez une **nouvelle feuille de route** (aujourd'hui), elle sera **vide** au début (aucune course).
Vous devez d'abord **ajouter des courses** avant de pouvoir générer un PDF complet.

Pour tester immédiatement avec des données complètes, utilisez les **feuilles existantes** listées ci-dessus.

## 🔐 Tous les mots de passe

Tous les chauffeurs de test utilisent le même mot de passe : **`Azerty123!`**

## 📊 Statistiques des feuilles complètes

- **Total feuilles avec courses** : 11
- **Chauffeurs disponibles** : 6
- **Feuilles avec taximètre** : 10
- **Dates disponibles** : 22/09, 23/09, 24/09, 05/10/2024

## 🚀 Recommandation

**Utilisez Hasler TEHOU** (`hasler.tehou@txapp.be`) qui a :
- 3 feuilles de route
- La feuille #1 la plus complète (4 courses + 2 charges + taximètre)
- Plusieurs véhicules différents

## 🐛 Si le PDF est vide

Si vous générez un PDF et qu'il est vide (pas de courses), c'est probablement parce que :

1. **Vous avez créé une nouvelle feuille aujourd'hui** → Elle n'a pas encore de courses
2. **Solution** : Ajoutez des courses manuellement OU utilisez une feuille existante (voir dates ci-dessus)

## 📝 Nettoyage des logs de débogage

Une fois les tests terminés, pensez à retirer les `console.log()` de :
- `/src/app/pages/forms/new-post-form/utils/printUtils.js`
- `/src/app/pages/forms/new-post-form/index.jsx`
