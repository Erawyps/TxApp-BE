# Résolution : Problème d'Authentification Production TxApp

## 📋 Problème Identifié

### Symptômes
- Interface chauffeur `new-post-form` causait une déconnexion de session en production
- Dashboard affichait "Inconnu/N/A" pour les chauffeurs et véhicules
- Erreurs 404 avec double path `/api/api/` en production
- Authentification échouait avec `ismail.drissi@txapp.be` / `ismail2024`

### Erreur Critique
```javascript
// ERREUR EN PRODUCTION
POST http://localhost:3001/api/api/auth/login 404 (Not Found)
```

## 🔍 Analyse des Causes Racines

### 1. **Incompatibilité Authentification Local vs Production**
- **Local** : Utilise bcrypt pour hasher les mots de passe
- **Production** : Utilise SHA-256 + salt 'TxApp-Salt-2025'
- **Problème** : Même mot de passe = hash différent selon l'environnement

### 2. **URLs des Services Incorrectes**
```javascript
// PROBLÉMATIQUE
// Dans src/services/auth.js, courses.js, etc.
const response = await axios.post('/api/auth/login', data);
// Avec baseURL = 'https://api.txapp.be'
// Résultat : https://api.txapp.be/api/auth/login ❌

// SOLUTION
const response = await axios.post('/auth/login', data);
// Résultat : https://api.txapp.be/auth/login ✅
```

### 3. **Inconsistance des Instances Axios**
- Certains services importaient directement `axios`
- D'autres utilisaient l'instance configurée `../utils/axios.js`

## ✅ Solutions Implémentées

### 1. **Authentification Bifurquée**

#### A. Fonction de Hachage Unifiée
```javascript
// worker.js - Production
function hashPassword(password, email) {
  // Logique pour détecter les anciens utilisateurs (SHA-256)
  if (isExistingUser(email)) {
    return crypto.subtle.digest('SHA-256', 
      new TextEncoder().encode(password + 'TxApp-Salt-2025')
    ).then(buffer => 
      Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    );
  }
  // Nouveaux utilisateurs (bcrypt)
  return bcrypt.hash(password, 10);
}
```

#### B. Vérification Adaptative
```javascript
// Vérification avec les deux méthodes
async function verifyPassword(inputPassword, storedHash, email) {
  // 1. Essai bcrypt (nouveaux comptes)
  const bcryptValid = await bcrypt.compare(inputPassword, storedHash);
  if (bcryptValid) return true;

  // 2. Essai SHA-256 + salt (anciens comptes)
  const sha256Hash = await generateSHA256Hash(inputPassword);
  return sha256Hash === storedHash;
}
```

### 2. **Correction des URLs des Services**

#### Avant (Problématique)
```javascript
// src/services/auth.js
export const loginUser = async (credentials) => {
  const response = await axios.post('/api/auth/login', credentials);
  //                                 ^^^^^ DOUBLE /api/
  return response.data;
};
```

#### Après (Corrigé)
```javascript
// src/services/auth.js
import axios from '../utils/axios.js';

export const loginUser = async (credentials) => {
  const response = await axios.post('/auth/login', credentials);
  //                                 ^^^^^^^^^^^ PATH CORRECT
  return response.data;
};
```

### 3. **Instance Axios Centralisée**

#### Configuration Unifiée
```javascript
// src/utils/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://api.txapp.be' 
    : 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour JWT
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
```

#### Services Mis à Jour
```javascript
// TOUS les services utilisent maintenant :
import axios from '../utils/axios.js';

// URLs CORRIGÉES :
// ✅ /auth/login          (au lieu de /api/auth/login)
// ✅ /courses             (au lieu de /api/courses)
// ✅ /feuilles-route      (au lieu de /api/feuilles-route)
// ✅ /dashboard/courses   (au lieu de /api/dashboard/courses)
```

### 4. **Routes Dashboard Complètes**

#### Routes Sécurisées Ajoutées
```javascript
// worker.js - Routes Dashboard avec authMiddleware
app.get('/api/dashboard/courses', authMiddleware, async (c) => {
  // Filtrage par rôle chauffeur
  const courses = await prisma.course.findMany({
    where: user.role === 'chauffeur' ? {
      feuille_route: { chauffeur_id: user.chauffeur_id }
    } : {},
    include: {
      feuille_route: {
        include: { chauffeur: { include: { utilisateur: true }}, vehicule: true }
      },
      client: true,
      mode_paiement: true,
      detail_facture_complexe: true
    }
  });
  
  return c.json({ data: courses });
});
```

## 🚀 Procédure de Déploiement

### 1. **Tests Locaux**
```bash
# Serveur développement
npm run dev:api

# Test authentification
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ismail.drissi@txapp.be","password":"ismail2024"}'

# Test dashboard avec token
TOKEN=$(curl -s ... | jq -r '.token')
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/dashboard/courses
```

### 2. **Déploiement Production**
```bash
# Build et déploiement
npm run build
npx wrangler deploy

# Vérification production
curl -X POST https://api.txapp.be/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ismail.drissi@txapp.be","password":"ismail2024"}'
```

## 🔧 Gestion des Tokens JWT

### 1. **Configuration des Tokens**
```javascript
// Génération JWT
const token = await sign({
  userId: user.utilisateur_id,
  email: user.email,
  role: user.role,
  chauffeur_id: user.chauffeur_id,
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
}, JWT_SECRET);
```

### 2. **Middleware d'Authentification**
```javascript
const authMiddleware = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Token manquant' }, 401);
    }

    const token = authHeader.substring(7);
    const payload = await verify(token, c.env.JWT_SECRET);
    
    // Vérifier expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return c.json({ error: 'Token expiré' }, 401);
    }

    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Token invalide' }, 401);
  }
};
```

### 3. **Gestion Expiration Frontend**
```javascript
// src/utils/axios.js - Intercepteur réponse
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré, rediriger vers login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 4. **Refresh Token (Optionnel)**
```javascript
// Pour étendre automatiquement les sessions
const refreshToken = async () => {
  try {
    const response = await axios.post('/auth/refresh');
    const { token } = response.data;
    localStorage.setItem('token', token);
    return token;
  } catch (error) {
    // Rediriger vers login si refresh échoue
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};
```

## 🔍 Debugging et Diagnostic

### 1. **Vérification Authentification**
```javascript
// Script de diagnostic : debug-user-auth.mjs
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const testPassword = 'ismail2024';
const email = 'ismail.drissi@txapp.be';

// Test bcrypt
const bcryptHash = await bcrypt.hash(testPassword, 10);
console.log('Bcrypt:', await bcrypt.compare(testPassword, bcryptHash));

// Test SHA-256
const sha256Hash = crypto.createHash('sha256')
  .update(testPassword + 'TxApp-Salt-2025')
  .digest('hex');
console.log('SHA-256:', sha256Hash);
```

### 2. **Vérification URLs**
```bash
# Checker les doubles paths
grep -r "/api/api/" src/

# Vérifier imports axios
grep -r "import.*axios" src/
```

### 3. **Logs Production Cloudflare**
```bash
# Voir les logs en temps réel
npx wrangler tail

# Logs d'erreurs spécifiques
npx wrangler tail --format=pretty --grep="error"
```

## 🚨 Cas d'Usage de Réapparition

### Symptôme : "Double /api/ path"
1. **Vérifier** : `src/services/*.js` - URLs commencent par `/` pas `/api/`
2. **Vérifier** : Imports utilisent `../utils/axios.js`
3. **Corriger** : `axios.post('/auth/login')` pas `axios.post('/api/auth/login')`

### Symptôme : "Authentification échoue"
1. **Vérifier** : Hash du mot de passe en base
2. **Tester** : Script `debug-user-auth.mjs`
3. **Corriger** : Fonction `verifyPassword` avec double logique

### Symptôme : "Dashboard vide"
1. **Vérifier** : Token JWT valide et non expiré
2. **Vérifier** : Middleware `authMiddleware` appliqué
3. **Vérifier** : Requête inclut relations Prisma

### Symptôme : "Session déconnecte"
1. **Vérifier** : Intercepteur axios gère 401
2. **Vérifier** : Token stocké correctement localStorage
3. **Vérifier** : Headers Authorization bien envoyés

## 📋 Checklist Maintenance

### Avant Modification Services
- [ ] Vérifier URLs relatives (pas de `/api/` en préfixe)
- [ ] Utiliser instance axios configurée
- [ ] Tester en local avant déploiement

### Avant Déploiement Production
- [ ] Tests authentification local passent
- [ ] Tests dashboard local passent
- [ ] Build frontend sans erreurs
- [ ] Wrangler deploy sans erreurs

### Après Déploiement
- [ ] Test authentification production
- [ ] Test dashboard production
- [ ] Interface web accessible
- [ ] Pas d'erreurs 404 dans logs

## 🎯 Version Finale Fonctionnelle

**Version déployée** : `be68a7fc-66ab-400f-9627-8864db9c0d90`  
**Date** : 6 octobre 2025  
**Status** : ✅ Authentification bifurquée + URLs corrigées + Dashboard complet

Cette résolution garantit la **réciprocité totale** entre l'interface chauffeur et le backend en production ! 🚀