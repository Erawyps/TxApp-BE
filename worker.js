import { getAssetFromKV, serveSinglePageApp } from '@cloudflare/kv-asset-handler';
import postgres from 'postgres';

async function handleAssetRequest(event) {
  try {
    return await getAssetFromKV(event, {
      ASSET_MANIFEST: {},  // Laissez vide si vous n'utilisez pas de manifest
      mapRequestToAsset: serveSinglePageApp
    });
  } catch (e) {
    return new Response(`App loading failed: ${e.message}`, { status: 500 });
  }
}

async function handleApiRequest(request, env) {
  // Configuration optimisée pour Cloudflare
  const sql = postgres(env.HYPERDRIVE.connectionString, {
    ssl: 'require',
    max: 1,
    idle_timeout: 20,
    connect_timeout: 30
  });

  try {
    const [result] = await sql`SELECT NOW() as db_time`;
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  } finally {
    await sql.end();
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }
    
    return handleAssetRequest({
      request,
      waitUntil: ctx.waitUntil.bind(ctx)
    });
  }
}