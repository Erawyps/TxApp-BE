# Guide Extensibilité et Maintenance - TxApp

## 🔧 Extension du Système d'Authentification

### 1. **Ajouter Nouveaux Rôles**

#### A. Mise à Jour Base de Données
```sql
-- migrations/add-new-roles.sql
ALTER TYPE role_enum ADD VALUE 'dispatcher';
ALTER TYPE role_enum ADD VALUE 'supervisor';
ALTER TYPE role_enum ADD VALUE 'accountant';

-- Nouvelles tables si nécessaire
CREATE TABLE dispatcher (
  dispatcher_id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER REFERENCES utilisateur(utilisateur_id),
  zone_assigned TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### B. Mise à Jour Prisma Schema
```prisma
// prisma/schema.prisma
enum Role {
  admin
  manager
  chauffeur
  dispatcher    // NOUVEAU
  supervisor    // NOUVEAU
  accountant    // NOUVEAU
}

model Dispatcher {
  dispatcher_id  Int      @id @default(autoincrement())
  utilisateur_id Int      @unique
  zone_assigned  String?
  created_at     DateTime @default(now())
  
  utilisateur    Utilisateur @relation(fields: [utilisateur_id], references: [utilisateur_id])
  
  @@map("dispatcher")
}
```

#### C. Mise à Jour Middleware
```javascript
// worker.js - Extension authMiddleware
const getRolePermissions = (role) => {
  const permissions = {
    admin: ['*'], // Accès total
    manager: ['dashboard.*', 'reports.*', 'users.read'],
    chauffeur: ['dashboard.courses.own', 'feuilles-route.own'],
    dispatcher: ['dashboard.courses.*', 'assignments.*'],
    supervisor: ['dashboard.*', 'monitoring.*'],
    accountant: ['reports.*', 'billing.*', 'dashboard.read']
  };
  
  return permissions[role] || [];
};

const requirePermission = (permission) => {
  return async (c, next) => {
    const user = c.get('user');
    const userPermissions = getRolePermissions(user.role);
    
    const hasPermission = userPermissions.includes('*') || 
      userPermissions.some(p => {
        if (p.endsWith('.*')) {
          return permission.startsWith(p.slice(0, -2));
        }
        return p === permission;
      });
    
    if (!hasPermission) {
      return c.json({ 
        error: 'Permission denied',
        required: permission,
        userRole: user.role 
      }, 403);
    }
    
    await next();
  };
};
```

### 2. **Ajouter Nouvelles Routes Sécurisées**

#### Template Route Standard
```javascript
// worker.js - Template pour nouvelles routes
app.get('/api/admin/analytics', 
  authMiddleware,
  requirePermission('reports.analytics'),
  async (c) => {
    try {
      const user = c.get('user');
      const { societe_id } = user;
      
      // Validation des paramètres
      const { startDate, endDate, type } = c.req.query();
      
      if (!startDate || !endDate) {
        return c.json({ 
          error: 'Paramètres requis: startDate, endDate' 
        }, 400);
      }
      
      // Logique métier
      const analytics = await prisma.course.findMany({
        where: {
          created_at: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          },
          // Filtrage par société si pas admin
          ...(user.role !== 'admin' && {
            feuille_route: {
              chauffeur: { societe_id }
            }
          })
        },
        include: {
          feuille_route: {
            include: { chauffeur: true, vehicule: true }
          }
        }
      });
      
      // Transformation des données
      const processed = processAnalyticsData(analytics, type);
      
      return c.json({
        success: true,
        data: processed,
        meta: {
          startDate,
          endDate,
          type,
          count: analytics.length
        }
      });
      
    } catch (error) {
      console.error('Analytics error:', error);
      return c.json({ 
        error: 'Erreur lors de la récupération des analytics' 
      }, 500);
    }
  }
);
```

#### Service Frontend Correspondant
```javascript
// src/services/analyticsService.js
import axios from '../utils/axios.js';

export const analyticsService = {
  getAnalytics: async (startDate, endDate, type = 'overview') => {
    const response = await axios.get('/admin/analytics', {
      params: { startDate, endDate, type }
    });
    return response.data;
  },

  getRevenueAnalytics: async (period) => {
    const response = await axios.get('/admin/analytics/revenue', {
      params: { period }
    });
    return response.data;
  },

  exportAnalytics: async (format, filters) => {
    const response = await axios.post('/admin/analytics/export', {
      format,
      filters
    }, {
      responseType: 'blob' // Pour téléchargement fichier
    });
    return response.data;
  }
};
```

### 3. **Extension Frontend Components**

#### Hook Personnalisé pour Permissions
```javascript
// src/hooks/usePermissions.js
import { useAuth } from './useAuth';

const ROLE_PERMISSIONS = {
  admin: ['*'],
  manager: ['dashboard.*', 'reports.*', 'users.read'],
  chauffeur: ['dashboard.courses.own', 'feuilles-route.own'],
  dispatcher: ['dashboard.courses.*', 'assignments.*'],
  supervisor: ['dashboard.*', 'monitoring.*'],
  accountant: ['reports.*', 'billing.*', 'dashboard.read']
};

export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission) => {
    if (!user) return false;
    
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    
    return userPermissions.includes('*') || 
      userPermissions.some(p => {
        if (p.endsWith('.*')) {
          return permission.startsWith(p.slice(0, -2));
        }
        return p === permission;
      });
  };
  
  const canAccess = (component) => {
    const componentPermissions = {
      'Dashboard': 'dashboard.read',
      'UserManagement': 'users.read',
      'Reports': 'reports.read',
      'Analytics': 'reports.analytics',
      'CourseForm': 'dashboard.courses.create'
    };
    
    return hasPermission(componentPermissions[component]);
  };
  
  return { hasPermission, canAccess, userRole: user?.role };
};
```

#### Composant Route Protégée
```javascript
// src/components/ProtectedRoute.jsx
import { usePermissions } from '../hooks/usePermissions';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ 
  children, 
  permission, 
  fallback = '/unauthorized' 
}) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return <Navigate to={fallback} replace />;
  }
  
  return children;
};

// Usage
<Route path="/admin/analytics" element={
  <ProtectedRoute permission="reports.analytics">
    <AnalyticsPage />
  </ProtectedRoute>
} />
```

## 📊 Monitoring et Maintenance

### 1. **Logging Structuré**

#### Configuration Logging Production
```javascript
// worker.js - Logger configuré
const logger = {
  info: (message, data = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...data
    }));
  },
  
  error: (message, error = {}, data = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString(),
      ...data
    }));
  },
  
  auth: (action, user, success, details = {}) => {
    console.log(JSON.stringify({
      level: 'audit',
      category: 'auth',
      action,
      userId: user?.userId,
      email: user?.email,
      success,
      timestamp: new Date().toISOString(),
      ...details
    }));
  }
};

// Usage dans routes
app.post('/api/auth/login', async (c) => {
  try {
    // ... logique login
    
    logger.auth('login', user, true, { 
      ip: c.req.header('CF-Connecting-IP'),
      userAgent: c.req.header('User-Agent')
    });
    
    return c.json({ success: true, token, user });
  } catch (error) {
    logger.auth('login', { email }, false, { 
      error: error.message 
    });
    
    return c.json({ error: 'Échec de connexion' }, 401);
  }
});
```

### 2. **Métriques et Alertes**

#### Collecte Métriques Custom
```javascript
// worker.js - Middleware métriques
const metricsMiddleware = async (c, next) => {
  const start = Date.now();
  const path = c.req.path;
  const method = c.req.method;
  
  await next();
  
  const duration = Date.now() - start;
  const status = c.res.status;
  
  // Envoyer métriques à service externe (DataDog, CloudWatch, etc.)
  await sendMetric('http_request_duration', duration, {
    path,
    method,
    status: status.toString()
  });
  
  // Alertes sur erreurs critiques
  if (status >= 500) {
    await sendAlert('critical_error', {
      path,
      method,
      status,
      duration,
      timestamp: new Date().toISOString()
    });
  }
};

app.use('*', metricsMiddleware);
```

#### Health Check Avancé
```javascript
// worker.js - Health check complet
app.get('/api/health', async (c) => {
  const healthChecks = [];
  
  // Check database
  try {
    await c.env.DB.prepare('SELECT 1').first();
    healthChecks.push({ service: 'database', status: 'ok' });
  } catch (error) {
    healthChecks.push({ 
      service: 'database', 
      status: 'error', 
      error: error.message 
    });
  }
  
  // Check JWT secret
  healthChecks.push({
    service: 'jwt',
    status: c.env.JWT_SECRET ? 'ok' : 'error'
  });
  
  // Check external APIs (si applicable)
  try {
    // Test API externe
    healthChecks.push({ service: 'external_api', status: 'ok' });
  } catch (error) {
    healthChecks.push({ 
      service: 'external_api', 
      status: 'error',
      error: error.message 
    });
  }
  
  const allHealthy = healthChecks.every(check => check.status === 'ok');
  
  return c.json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: healthChecks
  }, allHealthy ? 200 : 503);
});
```

### 3. **Scripts de Maintenance**

#### Script Nettoyage Tokens Expirés
```javascript
// scripts/cleanup-expired-tokens.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cleanupExpiredTokens = async () => {
  // Si vous stockez les refresh tokens en base
  const expiredTokens = await prisma.refreshToken.deleteMany({
    where: {
      expires_at: {
        lt: new Date()
      }
    }
  });
  
  console.log(`Supprimé ${expiredTokens.count} tokens expirés`);
  
  // Nettoyage sessions inactives
  const inactiveSessions = await prisma.userSession.deleteMany({
    where: {
      last_activity: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
      }
    }
  });
  
  console.log(`Supprimé ${inactiveSessions.count} sessions inactives`);
};

// Exécution
cleanupExpiredTokens()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

#### Script Audit Sécurité
```javascript
// scripts/security-audit.mjs
const securityAudit = async () => {
  console.log('🔍 Audit de sécurité TxApp...\n');
  
  // 1. Vérifier longueur JWT secret
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    console.error('❌ JWT_SECRET trop court (minimum 32 caractères)');
  } else {
    console.log('✅ JWT_SECRET valide');
  }
  
  // 2. Vérifier utilisateurs avec mots de passe faibles
  const weakPasswords = await prisma.utilisateur.findMany({
    where: {
      // Critères mots de passe faibles
      OR: [
        { mot_de_passe: { contains: '123' } },
        { mot_de_passe: { contains: 'password' } },
        { mot_de_passe: { equals: 'admin' } }
      ]
    },
    select: { email: true }
  });
  
  if (weakPasswords.length > 0) {
    console.error(`❌ ${weakPasswords.length} utilisateurs avec mots de passe faibles:`);
    weakPasswords.forEach(user => console.log(`  - ${user.email}`));
  } else {
    console.log('✅ Pas de mots de passe faibles détectés');
  }
  
  // 3. Vérifier permissions par défaut
  const adminUsers = await prisma.utilisateur.count({
    where: { role: 'admin' }
  });
  
  if (adminUsers === 0) {
    console.error('❌ Aucun utilisateur admin trouvé');
  } else if (adminUsers > 3) {
    console.warn(`⚠️  Beaucoup d'utilisateurs admin (${adminUsers})`);
  } else {
    console.log(`✅ ${adminUsers} utilisateur(s) admin`);
  }
  
  console.log('\n🔒 Audit terminé');
};
```

## 🚀 Déploiement et CI/CD

### 1. **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
      
      - name: Security audit
        run: npm audit --audit-level=high

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --env production
```

### 2. **Tests Automatisés**
```javascript
// tests/auth.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { sign, verify } from 'hono/jwt';

describe('Authentication', () => {
  const JWT_SECRET = 'test-secret';
  
  it('should generate valid JWT tokens', async () => {
    const payload = {
      userId: 1,
      email: 'test@txapp.be',
      role: 'chauffeur',
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    
    const token = await sign(payload, JWT_SECRET);
    expect(token).toBeTruthy();
    
    const decoded = await verify(token, JWT_SECRET);
    expect(decoded.userId).toBe(1);
    expect(decoded.email).toBe('test@txapp.be');
  });
  
  it('should reject expired tokens', async () => {
    const expiredPayload = {
      userId: 1,
      exp: Math.floor(Date.now() / 1000) - 3600 // Expiré
    };
    
    const expiredToken = await sign(expiredPayload, JWT_SECRET);
    
    await expect(verify(expiredToken, JWT_SECRET))
      .rejects.toThrow();
  });
});
```

Cette documentation couvre l'extensibilité complète du système TxApp ! 🛠️