import postgres from 'postgres';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 1. Servir les fichiers statiques
    if (url.pathname === '/' || url.pathname.match(/\.(html|js|css|png)$/)) {
      try {
        const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
        const asset = await env.__STATIC_CONTENT.get(filePath);
        return new Response(asset, {
          headers: { 'Content-Type': filePath.endsWith('.css') ? 'text/css' : 'text/html' }
        });
      } catch {
        return new Response('Asset not found', { status: 404 });
      }
    }

    // 2. API PostgreSQL
    if (url.pathname === '/api') {
      const sql = postgres(env.HYPERDRIVE.connectionString, { ssl: 'require' });
      try {
        const [result] = await sql`SELECT NOW() as time`;
        return Response.json(result);
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      } finally {
        await sql.end();
      }
    }

    return new Response('Not Found', { status: 404 });
  }
}