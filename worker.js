import postgres from 'postgres';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Servir les fichiers statiques depuis le bucket
    if (url.pathname === '/' || url.pathname.match(/\.(js|css|png|jpg|json)$/)) {
      return await env.ASSETS.fetch(request);
    }

    // Gestion des requêtes API
    if (url.pathname === '/api') {
      const sql = postgres(env.HYPERDRIVE.connectionString, { ssl: 'require' });
      try {
        const result = await sql`SELECT NOW() as current_time`;
        return Response.json(result);
      } finally {
        await sql.end();
      }
    }

    return new Response('Not Found', { status: 404 });
  }
}