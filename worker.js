import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import postgres from 'postgres';

async function handleAssetRequest(event) {
  try {
    return await getAssetFromKV(event);
  } catch (e) {
    return new Response(`App loading failed: ${e.message}`, { status: 500 });
  }
}

async function handleApiRequest(request, env) {
  const sql = postgres(env.HYPERDRIVE.connectionString, {
    ssl: 'require',
    max: 1
  });

  try {
    const [result] = await sql`SELECT NOW() as db_time`;
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(`DB Error: ${err.message}`, { status: 500 });
  } finally {
    await sql.end();
  }
}

addEventListener('fetch', (event, env) => {
  const url = new URL(event.request.url);
  
  // Route API
  if (url.pathname.startsWith('/api/')) {
    return event.respondWith(handleApiRequest(event.request, env));
  }
  
  // Tous les autres chemins -> Assets statiques
  return event.respondWith(handleAssetRequest(event));
});