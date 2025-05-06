import postgres from 'postgres';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Serveur les fichiers statiques directement
    if (url.pathname !== '/api/query') {
      return new Response(env.ASSETS, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Gestion des requêtes SQL
    const sql = postgres(env.HYPERDRIVE.connectionString);
    try {
      const result = await sql`SELECT NOW() as time`;
      return Response.json(result);
    } finally {
      await sql.end();
    }
  }
}