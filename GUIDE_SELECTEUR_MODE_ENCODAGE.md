# 🎯 Guide Utilisateur - Sélecteur de Mode d'Encodage

## 📍 Où trouver le sélecteur de mode ?

Le sélecteur de mode d'encodage se trouve dans le **formulaire de création d'un nouveau shift** :

### Accès via l'interface web
1. **Connectez-vous** à l'application TxApp (http://localhost:5173)
2. **Accédez** à la section "Nouveau Shift" ou "Démarrer un shift"
3. **Localisez** le champ **"Mode d'encodage"** dans le formulaire

### Emplacement exact
```
Formulaire de Nouveau Shift
├── Véhicule *
├── Date de service *
├── [MODE D'ENCODAGE] * ← ICI
│   ├── 🟢 LIVE - En Direct
│   └── 🟠 ULTÉRIEUR - Différé
└── Heure de début *
```

## 🎮 Comment utiliser le sélecteur ?

### Interface Visuelle
Le sélecteur apparaît comme un **bouton avec icônes** :
- **🟢 LIVE** (icône éclair) - Encodage en temps réel  
- **🟠 ULTÉRIEUR** (icône horloge) - Encodage différé

### Sélection du Mode
1. **Cliquez** sur le sélecteur de mode
2. **Choisissez** entre :
   - **LIVE** : Pour encoder en temps réel pendant votre shift
   - **ULTÉRIEUR** : Pour encoder après votre shift (champs vides)
3. **Confirmez** votre choix en cliquant sur le mode désiré

## 🔧 Comportement des Modes

### Mode LIVE 🟢
- **Quand utiliser** : Encodage pendant le shift
- **Comportement** : Les données persistent automatiquement
- **Avantage** : Récupération en cas de perte de connexion
- **Utilisateurs concernés** : Chauffeurs actifs en temps réel

### Mode ULTÉRIEUR 🟠  
- **Quand utiliser** : Encodage après le shift
- **Comportement** : Champs toujours vides au démarrage
- **Avantage** : Saisie propre sans données précédentes
- **Utilisateurs concernés** : Encodage différé ou administratif

## 🐛 Dépannage

### Le sélecteur ne s'affiche pas ?
1. **Vérifiez** que vous êtes sur la bonne page (/new-post-form)
2. **Rafraîchissez** la page (F5 ou Cmd+R)
3. **Vérifiez** la console du navigateur (F12) pour les erreurs

### Modes non disponibles ?
1. **Vérifiez** la connexion backend (http://localhost:3001)
2. **Testez** l'endpoint : `curl http://localhost:3001/api/dashboard/modes-encodage`
3. **Contactez** l'équipe technique si le problème persiste

### Fallback disponible
En cas de problème avec le sélecteur visuel, un **Select classique** est disponible comme solution de secours avec les mêmes options.

## 📋 Informations Techniques

### Endpoints API
- **Modes disponibles** : `GET /api/dashboard/modes-encodage`
- **Comportement par mode** : `GET /api/dashboard/feuilles-route/defaults/:id?mode=MODE`

### Fichiers Concernés
- **Frontend** : `src/app/pages/forms/new-post-form/components/NewShiftForm.jsx`
- **Backend** : `server-dev.js` (endpoints modes-encodage et defaults)

### Validation
- Mode requis pour créer un shift
- Valeurs acceptées : 'LIVE', 'ULTERIEUR'
- Validation côté client (Yup) et serveur

---
**💡 Astuce** : Le mode sélectionné détermine automatiquement si vos données précédentes seront pré-remplies (LIVE) ou si vous aurez des champs vides (ULTÉRIEUR).