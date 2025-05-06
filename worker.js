import { getAssetFromKV, serveSinglePageApp } from '@cloudflare/kv-asset-handler';
import { Client } from 'pg';

/**
 * Gère les requêtes API vers PostgreSQL via Hyperdrive
 */
async function handleApiRequest(request, env) {
  try {
    const client = new Client({
      host: env.HYPERDRIVE_DB.connection.host,
      port: env.HYPERDRIVE_DB.connection.port,
      database: env.HYPERDRIVE_DB.connection.database,
      user: env.HYPERDRIVE_DB.connection.user,
      password: env.HYPERDRIVE_DB.connection.password,
      ssl: true
    });

    await client.connect();
    
    // Exemple de requête - adaptez à votre besoin
    const { rows } = await client.query('SELECT NOW() as current_time');
    await client.end();

    return new Response(JSON.stringify(rows), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Vérifiez la configuration Hyperdrive"
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Gère les assets statiques via KV
 */
async function handleStaticAssets(request, env, ctx) {
  try {
    return await getAssetFromKV(
      {
        request,
        waitUntil: ctx.waitUntil,
      },
      {
        ASSET_NAMESPACE: env.ASSETS, // Binding KV existant
        cacheControl: {
          bypassCache: false, // Activez le cache en prod
          edgeTTL: 86400, // Cache 24h
          browserTTL: 86400
        },
        mapRequestToAsset: serveSinglePageApp // Essential pour les SPA
      }
    );
  } catch {
    // Fallback pour les SPA (Renvoie index.html pour les routes inconnues)
    return new Response("Not Found", { status: 404 });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Routes API
    if (pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }

    // Assets statiques (utilise le KV existant)
    return handleStaticAssets(request, env, ctx);
  }
};