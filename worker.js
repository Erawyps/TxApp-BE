import { getAssetFromKV, serveSinglePageApp } from '@cloudflare/kv-asset-handler';
import { Client } from 'pg';

/**
 * Gère les requêtes API vers PostgreSQL via Hyperdrive
 */
async function handleApiRequest(env) {
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

async function handleStaticAssets(request, env, ctx) {
    try {
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil,
        },
        {
          ASSET_NAMESPACE: env.ASSETS,
          cacheControl: {
            bypassCache: false,
            edgeTTL: 86400,
            browserTTL: 86400
          },
          mapRequestToAsset: serveSinglePageApp
        }
      );
    } catch {
      // CORRECTION ICI : Servir index.html pour toutes les routes inconnues
      try {
        const index = await env.ASSETS.get('index.html', { type: 'text' });
        return new Response(index, {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch {
        return new Response('Page Not Found', { 
          status: 404,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }
  }
  
  export default {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      
      // Routes API
      if (url.pathname.startsWith('/api')) {
        return handleApiRequest(request, env);
      }
  
      // Assets statiques avec fallback SPA
      return handleStaticAssets(request, env, ctx);
    }
  };