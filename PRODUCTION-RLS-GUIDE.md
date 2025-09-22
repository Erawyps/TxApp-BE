# Guide RLS Production - TxApp

## Contexte
Votre application utilise un système d'authentification JWT local plutôt que l'authentification Supabase native. Les politiques RLS (Row Level Security) de Supabase nécessitent normalement une authentification Supabase, ce qui crée un conflit.

## Solution Adoptée
Nous utilisons une approche hybride :
- **RLS activé** : Protection de base au niveau base de données
- **Sécurité applicative** : Contrôle des permissions au niveau API/middleware
- **Politiques permissives** : Autoriser les utilisateurs authentifiés à accéder aux données

## Implémentation

### 1. Appliquer les Politiques RLS

Exécutez le script `production-rls-simple.sql` dans Supabase Dashboard > SQL Editor :

```sql
-- Le script configure RLS sur toutes les tables avec des politiques permissives
-- pour les utilisateurs authentifiés
```

### 2. Vérifier l'Installation

Exécutez le script de test :
```bash
node test-production-rls.js
```

### 3. Sécurité Applicative

Implémentez ces contrôles dans vos contrôleurs/middlewares :

#### Middleware d'Authentification
```javascript
// Vérifier le token JWT avant chaque requête
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};
```

#### Contrôle des Permissions
```javascript
// Vérifier les permissions selon le type d'utilisateur
const checkPermissions = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });

    // Récupérer l'utilisateur depuis la base
    const user = await getUserById(req.user.id);

    if (user.type_utilisateur !== requiredRole && user.type_utilisateur !== 'ADMIN') {
      return res.status(403).json({ error: 'Permissions insuffisantes' });
    }

    next();
  };
};
```

#### Utilisation dans les Routes
```javascript
// Routes protégées
app.get('/api/users', authenticateUser, checkPermissions('ADMIN'), getUsers);
app.put('/api/users/:id', authenticateUser, updateUserProfile);
app.get('/api/drivers', authenticateUser, getDrivers);
```

### 4. Types d'Utilisateurs et Permissions

| Type | Permissions |
|------|-------------|
| `ADMIN` | Accès complet à toutes les données |
| `CHAUFFEUR` | Ses propres données chauffeur + courses |
| `CLIENT` | Ses propres factures + profil |

### 5. Validation des Données

Assurez-vous que les contrôleurs valident :

```javascript
// Exemple : Un chauffeur ne peut modifier que ses propres données
const updateDriverProfile = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Vérifier que le chauffeur appartient à l'utilisateur
  const driver = await getDriverById(id);
  if (driver.utilisateur_id !== userId && req.user.type !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  // Mise à jour autorisée
  const updatedDriver = await updateDriver(id, req.body);
  res.json(updatedDriver);
};
```

## Avantages de cette Approche

✅ **Sécurité maintenue** : RLS empêche l'accès anonyme
✅ **Flexibilité** : Contrôle granulaire des permissions
✅ **Performance** : Filtrage au niveau base de données
✅ **Compatibilité** : Fonctionne avec votre système JWT existant

## Tests de Sécurité

Après implémentation, testez :

1. **Accès anonyme** : Devrait être bloqué
2. **Accès utilisateur normal** : Ses propres données uniquement
3. **Accès admin** : Toutes les données
4. **Modification non autorisée** : Devrait être rejetée

## Monitoring

Surveillez les logs pour détecter :
- Tentatives d'accès non autorisées
- Erreurs de permissions
- Performances des requêtes

Cette approche vous donne une sécurité robuste tout en maintenant la compatibilité avec votre architecture existante.