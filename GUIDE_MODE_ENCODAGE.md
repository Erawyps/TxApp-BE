# Guide du Mode d'Encodage - TxApp

## Vue d'ensemble

Le système de **Mode d'Encodage** permet aux chauffeurs et gestionnaires de choisir comment et quand encoder leurs courses dans l'application TxApp. Cette fonctionnalité améliore la flexibilité et l'expérience utilisateur.

## Modes disponibles

### 🟢 Mode LIVE (En Direct)
- **Description** : Encodage en temps réel des courses
- **Usage** : Mode recommandé pour l'usage quotidien
- **Caractéristiques** :
  - Enregistrement immédiat des courses
  - Suivi en temps réel
  - Synchronisation instantanée
  - Validation immédiate des données

### 🟠 Mode ULTÉRIEUR (Différé)
- **Description** : Encodage après les courses
- **Usage** : Utile pour récupérer des courses oubliées ou encoder en fin de service
- **Caractéristiques** :
  - Permet de saisir les courses plus tard
  - Enregistrement en lot
  - Validation différée
  - Idéal pour la récupération de données

### � Mode ADMIN (Administrateur)
- **Description** : Mode administrateur avec accès complet
- **Usage** : Réservé aux administrateurs et gestionnaires
- **Caractéristiques** :
  - Accès à toutes les fonctionnalités
  - Permissions étendues
  - Gestion avancée des données
  - Supervision complète

## Permissions par rôle

| Rôle | LIVE | ULTÉRIEUR | ADMIN |
|------|------|-----------|-------|
| **Chauffeur** | ✅ | ✅ | ❌ |
| **Gestionnaire** | ✅ | ✅ | ❌ |
| **Administrateur** | ✅ | ✅ | ✅ |

## Interface utilisateur

### Composants disponibles

1. **EncodingModeSelector** : Sélecteur principal avec dropdown
2. **EncodingStatusBar** : Barre de statut complète avec informations
3. **EncodingModeBadge** : Badge compact pour les en-têtes

### Intégration

```jsx
// Badge simple dans un en-tête
<EncodingModeBadge onModeChange={handleModeChange} />

// Barre de statut complète
<EncodingStatusBar 
  onModeChange={handleModeChange}
  showSettings={true}
/>

// Sélecteur avancé
<EncodingModeSelector
  value={currentMode}
  onChange={handleModeChange}
  allowedModes={['LIVE', 'ULTERIEUR']}
/>
```

## Hook personnalisé

Le hook `useEncodingMode` fournit :

```jsx
const {
  currentMode,        // Mode actuel
  allowedModes,       // Modes autorisés selon le rôle
  modeInfo,          // Informations du mode actuel
  changeMode,        // Fonction pour changer de mode
  isLiveMode,        // Boolean : mode LIVE actif
  isDeferredMode,    // Boolean : mode DIFFÉRÉ actif
  isAdminMode        // Boolean : mode ADMIN actif
} = useEncodingMode({
  onModeChange: (newMode, oldMode) => {
    console.log(`Changement : ${oldMode} → ${newMode}`);
  }
});
```

## Logique métier

### Changement de mode
1. Vérification des permissions utilisateur
2. Validation du mode cible
3. Sauvegarde dans localStorage (optionnel)
4. Callback de notification
5. Mise à jour de l'interface

### Persistance
- Sauvegarde automatique du mode sélectionné
- Récupération au rechargement de page
- Respect des permissions utilisateur

## Styling et thèmes

### Variables CSS personnalisées
```css
:root {
  --encoding-live-color: #10b981;     /* Vert (success) */
  --encoding-deferred-color: #f59e0b; /* Orange (warning) */
  --encoding-admin-color: #3b82f6;    /* Bleu (primary) */
}
```

### Classes Tailwind
- Mode LIVE : `bg-green-100 text-green-600` (success)
- Mode DIFFÉRÉ : `bg-orange-100 text-orange-600` (warning)
- Mode ADMIN : `bg-blue-100 text-blue-600` (primary)

## Exemples d'utilisation

### Dashboard chauffeur
```jsx
<EncodingStatusBar 
  onModeChange={(newMode) => {
    // Adapter l'interface selon le mode
    if (newMode === 'LIVE') {
      enableRealTimeSync();
    } else if (newMode === 'ULTERIEUR') {
      enableBatchMode();
    }
  }}
/>
```

### Formulaire de course
```jsx
<div className="form-header">
  <h2>Nouvelle Course</h2>
  <EncodingModeBadge />
</div>
```

## Bonnes pratiques

1. **UX** : Toujours afficher le mode actuel de manière visible
2. **Feedback** : Informer l'utilisateur lors des changements de mode
3. **Cohérence** : Utiliser les mêmes codes couleur partout
4. **Accessibilité** : Prévoir des textes alternatifs pour les icônes
5. **Performance** : Éviter les re-rendus inutiles lors des changements

## Dépannage

### Problèmes courants

1. **Mode non autorisé** : Vérifier les permissions utilisateur
2. **Persistance échouée** : Vérifier le localStorage du navigateur
3. **Interface non mise à jour** : Vérifier les callbacks de changement
4. **Styles incorrects** : Vérifier les imports CSS/Tailwind

### Logs de débogage
```javascript
// Activer les logs détaillés
localStorage.setItem('encoding-mode-debug', 'true');
```

---

*Dernière mise à jour : Octobre 2025*