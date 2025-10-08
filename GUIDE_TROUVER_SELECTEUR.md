# 🔍 Localisation du Sélecteur de Mode d'Encodage

## 📍 **OÙ TROUVER LE SÉLECTEUR :**

### 1. **Accéder à l'application**
- Ouvrez votre navigateur
- Allez sur **http://localhost:5173**
- Connectez-vous avec vos identifiants

### 2. **Navigation vers le formulaire**
- Cherchez la section **"Nouveau Shift"** ou **"Démarrer un shift"**
- Ou accédez directement à `/new-post-form`

### 3. **Localiser le champ**
Dans le formulaire, vous verrez :
```
┌─────────────────────────────────────┐
│ Démarrer un nouveau shift           │
├─────────────────────────────────────┤
│ Véhicule: [Dropdown]                │
│ Date de service: [Date picker]      │
│ Mode d'encodage: [SÉLECTEUR ICI] ⬅️  │
│ Heure de début: [Time picker]       │
└─────────────────────────────────────┘
```

## 👀 **À QUOI CELA RESSEMBLE :**

### Version Principale (EncodingModeSelector)
- **Bouton visual** avec icônes colorées
- 🟢 **LIVE** avec icône éclair
- 🟠 **ULTÉRIEUR** avec icône horloge

### Version Fallback (Select basique)  
Si le sélecteur principal ne s'affiche pas :
- **Dropdown classique** avec options :
  - `🟢 LIVE - En temps réel`
  - `🟠 ULTÉRIEUR - Différé`

### Informations affichées
- **Mode actuel** : Affichage du mode sélectionné
- **Description** : Explication du comportement du mode

## 🚨 **DÉPANNAGE :**

### Si vous ne voyez RIEN :
1. **Vérifiez l'URL** : Êtes-vous sur la bonne page ?
2. **Rafraîchissez** : Appuyez sur F5 ou Cmd+R
3. **Console** : Ouvrez F12 et regardez les erreurs

### Si seul le Select de fallback apparaît :
✅ **C'est normal !** Le fallback est fonctionnel
- Vous pouvez sélectionner votre mode
- LIVE = champs pré-remplis
- ULTÉRIEUR = champs vides

### Vérifications techniques :
```bash
# Backend opérationnel
curl http://localhost:3001/api/health

# Frontend opérationnel  
curl http://localhost:5173

# API modes d'encodage
curl http://localhost:3001/api/dashboard/modes-encodage
```

## ✅ **CONFIRMATION QUE ÇA MARCHE :**

1. **Vous voyez** le formulaire de nouveau shift
2. **Vous voyez** un champ "Mode d'encodage" 
3. **Vous pouvez** sélectionner entre LIVE et ULTÉRIEUR
4. **Le texte** "Mode actuel: LIVE | Description..." s'affiche
5. **La sélection** change la valeur

**➡️ Si vous voyez ces éléments, le sélecteur fonctionne !**