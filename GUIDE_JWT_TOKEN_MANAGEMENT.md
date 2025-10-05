# Guide JWT Token Management - TxApp

## 🔐 Configuration JWT

### Variables d'Environnement
```bash
# .env / wrangler.toml
JWT_SECRET="TxApp-2025-Super-Secure-JWT-Secret-Key-For-Production"
```

### Durée de Vie des Tokens
```javascript
// worker.js - Configuration par défaut
const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 24 * 60 * 60,      // 24 heures
  REFRESH_TOKEN: 7 * 24 * 60 * 60,  // 7 jours
  REMEMBER_ME: 30 * 24 * 60 * 60    // 30 jours
};
```

## 🎫 Génération des Tokens

### Token Principal (Access Token)
```javascript
// worker.js - Route /auth/login
const generateAccessToken = async (user, rememberMe = false) => {
  const expiry = rememberMe ? 
    Math.floor(Date.now() / 1000) + TOKEN_EXPIRY.REMEMBER_ME :
    Math.floor(Date.now() / 1000) + TOKEN_EXPIRY.ACCESS_TOKEN;

  return await sign({
    userId: user.utilisateur_id,
    email: user.email,
    role: user.role,
    chauffeur_id: user.chauffeur_id,
    societe_id: user.societe_id,
    iat: Math.floor(Date.now() / 1000),
    exp: expiry
  }, JWT_SECRET);
};

// Usage
const token = await generateAccessToken(user, credentials.rememberMe);
```

### Token de Rafraîchissement (Optionnel)
```javascript
const generateRefreshToken = async (userId) => {
  return await sign({
    userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY.REFRESH_TOKEN
  }, JWT_SECRET);
};
```

## 🔍 Validation des Tokens

### Middleware d'Authentification
```javascript
// worker.js - authMiddleware
const authMiddleware = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    // Vérifier format Bearer token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ 
        error: 'Token d\'accès requis',
        code: 'MISSING_TOKEN' 
      }, 401);
    }

    const token = authHeader.substring(7);
    
    // Décoder et vérifier le token
    const payload = await verify(token, c.env.JWT_SECRET);
    
    // Vérifier expiration manuelle (sécurité supplémentaire)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return c.json({ 
        error: 'Token expiré',
        code: 'TOKEN_EXPIRED',
        expiredAt: new Date(payload.exp * 1000).toISOString()
      }, 401);
    }

    // Vérifier si l'utilisateur existe toujours
    const user = await prisma.utilisateur.findUnique({
      where: { utilisateur_id: payload.userId },
      include: { chauffeur: true }
    });

    if (!user) {
      return c.json({ 
        error: 'Utilisateur introuvable',
        code: 'USER_NOT_FOUND' 
      }, 401);
    }

    // Ajouter infos utilisateur au contexte
    c.set('user', {
      ...payload,
      utilisateur: user
    });

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JwtTokenExpired') {
      return c.json({ 
        error: 'Token expiré',
        code: 'TOKEN_EXPIRED' 
      }, 401);
    }
    
    return c.json({ 
      error: 'Token invalide',
      code: 'INVALID_TOKEN',
      details: error.message 
    }, 401);
  }
};
```

### Vérification Niveau Route
```javascript
// Pour routes spécifiques nécessitant permissions supplémentaires
const requireRole = (allowedRoles) => {
  return async (c, next) => {
    const user = c.get('user');
    
    if (!allowedRoles.includes(user.role)) {
      return c.json({ 
        error: 'Permissions insuffisantes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: user.role
      }, 403);
    }
    
    await next();
  };
};

// Usage
app.get('/api/admin/users', 
  authMiddleware, 
  requireRole(['admin', 'manager']), 
  async (c) => {
    // Route réservée aux admins/managers
  }
);
```

## 🔄 Rafraîchissement des Tokens

### Route de Refresh
```javascript
// worker.js
app.post('/api/auth/refresh', async (c) => {
  try {
    const { refreshToken } = await c.req.json();
    
    if (!refreshToken) {
      return c.json({ error: 'Token de rafraîchissement requis' }, 400);
    }

    // Vérifier refresh token
    const payload = await verify(refreshToken, c.env.JWT_SECRET);
    
    if (payload.type !== 'refresh') {
      return c.json({ error: 'Type de token invalide' }, 400);
    }

    // Récupérer utilisateur
    const user = await prisma.utilisateur.findUnique({
      where: { utilisateur_id: payload.userId },
      include: { chauffeur: true }
    });

    if (!user) {
      return c.json({ error: 'Utilisateur introuvable' }, 401);
    }

    // Générer nouveau access token
    const newAccessToken = await generateAccessToken(user);
    
    return c.json({
      success: true,
      token: newAccessToken,
      user: {
        id: user.utilisateur_id,
        email: user.email,
        role: user.role,
        chauffeur_id: user.chauffeur_id
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return c.json({ error: 'Échec du rafraîchissement' }, 401);
  }
});
```

### Frontend - Auto-refresh
```javascript
// src/utils/axios.js
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Intercepteur pour gérer expiration automatiquement
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Attendre que le refresh en cours se termine
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post('/auth/refresh', { 
          refreshToken 
        });
        
        const { token } = response.data;
        localStorage.setItem('token', token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        processQueue(null, token);
        
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Refresh échoué, déconnecter
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

## 📱 Frontend - Gestion des Tokens

### Stockage Sécurisé
```javascript
// src/utils/tokenStorage.js
export const tokenStorage = {
  // Stocker token avec expiration
  setToken: (token, refreshToken) => {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    // Décoder pour stocker expiration
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem('tokenExpiry', payload.exp);
    } catch (error) {
      console.warn('Could not decode token expiry');
    }
  },

  // Récupérer token valide
  getToken: () => {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (!token) return null;
    
    // Vérifier expiration (5 min de marge)
    if (expiry && Date.now() / 1000 > (parseInt(expiry) - 300)) {
      return null; // Token expiré ou proche de l'expiration
    }
    
    return token;
  },

  // Nettoyer tokens
  clearTokens: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
  },

  // Vérifier si token existe et valide
  isAuthenticated: () => {
    return !!tokenStorage.getToken();
  }
};
```

### Hook React d'Authentification
```javascript
// src/hooks/useAuth.js
import { useState, useEffect, useContext, createContext } from 'react';
import { tokenStorage } from '../utils/tokenStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier token au chargement
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getToken();
      
      if (token) {
        try {
          // Vérifier token avec backend
          const response = await axios.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          tokenStorage.clearTokens();
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const response = await axios.post('/auth/login', credentials);
    const { token, refreshToken, user } = response.data;
    
    tokenStorage.setToken(token, refreshToken);
    setUser(user);
    
    return user;
  };

  const logout = () => {
    tokenStorage.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## 🔧 Debugging JWT

### Décoder Token
```javascript
// Utilitaire pour decoder JWT (debug uniquement)
const decodeJWT = (token) => {
  try {
    const [header, payload, signature] = token.split('.');
    
    return {
      header: JSON.parse(atob(header)),
      payload: JSON.parse(atob(payload)),
      signature: signature
    };
  } catch (error) {
    console.error('Invalid JWT token:', error);
    return null;
  }
};

// Usage en console browser
console.log(decodeJWT(localStorage.getItem('token')));
```

### Vérifier Expiration
```javascript
const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.payload.exp) return true;
  
  return Date.now() / 1000 > decoded.payload.exp;
};
```

### Script de Test Complet
```javascript
// test-jwt.mjs
import { sign, verify } from 'hono/jwt';

const JWT_SECRET = 'test-secret';

// Test génération
const testToken = await sign({
  userId: 1,
  email: 'test@example.com',
  exp: Math.floor(Date.now() / 1000) + 3600
}, JWT_SECRET);

console.log('Generated token:', testToken);

// Test vérification
try {
  const payload = await verify(testToken, JWT_SECRET);
  console.log('Valid token payload:', payload);
} catch (error) {
  console.error('Invalid token:', error);
}
```

## 🚨 Sécurité et Bonnes Pratiques

### 1. **Stockage Côté Client**
- ✅ `localStorage` pour applications web classiques
- ✅ `sessionStorage` pour sessions temporaires
- ❌ Éviter cookies pour JWT si pas de httpOnly
- ✅ Considérer `secure` cookies pour production

### 2. **Validation Stricte**
```javascript
// Toujours valider les claims critiques
const validateTokenClaims = (payload) => {
  const required = ['userId', 'email', 'role'];
  
  for (const claim of required) {
    if (!payload[claim]) {
      throw new Error(`Missing required claim: ${claim}`);
    }
  }
  
  // Valider format email
  if (!/\S+@\S+\.\S+/.test(payload.email)) {
    throw new Error('Invalid email format');
  }
  
  return true;
};
```

### 3. **Rotation des Secrets**
```javascript
// Support multi-secrets pour rotation
const verifyWithMultipleSecrets = async (token, secrets) => {
  for (const secret of secrets) {
    try {
      return await verify(token, secret);
    } catch (error) {
      continue; // Essayer secret suivant
    }
  }
  throw new Error('Token invalid with all secrets');
};
```

Cette documentation couvre tous les aspects critiques de la gestion JWT pour TxApp ! 🔐