# Guide des Environnements TxApp

## 🚀 Production

**URL**: `https://api.txapp.be`
**Caractéristiques**:
- Cloudflare Workers
- Protection Cloudflare avec challenge
- Header `X-API-Key: TxApp-API-Key-2025` requis
- CORS strict pour domaines de production
- Base de données Supabase via Hyperdrive

**Frontend CORS autorisés**:
- `https://txapp.be`
- `https://admin.txapp.be` 
- `https://driver.txapp.be`

**Test**:
```bash
curl -X POST "https://api.txapp.be/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: TxApp-API-Key-2025" \
  -d '{"username":"test@example.com","password":"password"}'
```

---

## 🛠️ Développement Local

**URL**: `http://localhost:3001`
**Caractéristiques**:
- Serveur Node.js local
- Pas de protection Cloudflare
- **AUCUN** header `X-API-Key` requis
- CORS permissif pour localhost
- Base de données Supabase directe

**Frontend CORS autorisés**:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (React dev server)
- `http://127.0.0.1:*`

### Démarrage

```bash
# Terminal 1: API de développement
npm run dev:api

# Terminal 2: Frontend
npm run dev
```

### Configuration Frontend Dev

Dans votre fichier de config frontend, utilisez:
```javascript
// Pour développement
const API_URL = "http://localhost:3001/api";

// Pour production  
const API_URL = "https://api.txapp.be/api";
```

### Test Développement:
```bash
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"ismail.drissi@txapp.be","password":"ismail2024"}'
```

---

## 🔧 Configuration des Variables d'Environnement

### Production (.env.production)
```bash
NODE_ENV=production
VITE_API_URL=https://api.txapp.be/api
```

### Développement (.env.development)
```bash
NODE_ENV=development
VITE_API_URL=http://localhost:3001/api
```

---

## ⚠️ Points Importants

1. **X-API-Key**: Requis UNIQUEMENT en production
2. **CORS**: Automatiquement configuré selon l'environnement
3. **Base de données**: Même DB pour dev et prod (attention aux modifications)
4. **JWT**: Secrets différents entre dev et prod

---

## 🔍 Debug CORS

Si vous avez des erreurs CORS:

### Développement:
- Vérifiez que vous utilisez `http://localhost:3001` (pas https://api.txapp.be)
- Vérifiez que `npm run dev:api` est démarré
- **NE PAS** inclure le header `X-API-Key`

### Production:
- Vérifiez que vous utilisez `https://api.txapp.be`
- **INCLURE** le header `X-API-Key: TxApp-API-Key-2025`
- Vérifiez que votre domaine est dans la liste CORS

---

## 📝 Scripts NPM

```bash
npm run dev:api      # Serveur de développement local
npm run dev          # Frontend Vite
npm run dev:full     # Dev API + Frontend simultanément
npm run deploy       # Déployer en production
```