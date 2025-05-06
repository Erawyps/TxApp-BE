import postgres from 'postgres';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const sql = postgres(env.HYPERDRIVE.connectionString, {
      ssl: 'require',
      max: 1
    });

    try {
      // Route pour l'application frontend
      if (url.pathname === '/' || url.pathname.startsWith('/assets/')) {
        return await fetch(env.ASSETS.fetch(request));
      }

      // Route pour l'API PostgreSQL
      if (url.pathname === '/api/query') {
        const { query, params } = await request.json().catch(() => ({}));
        
        const result = query 
          ? await (params ? sql(query, params) : sql.unsafe(query))
          : await sql`SELECT NOW() as server_time`;
        
        return Response.json(result);
      }

      // Route par défaut
      return new Response('Not Found', { status: 404 });

    } catch (err) {
      return Response.json(
        { error: err.message.split('\n')[0] },
        { status: 500 }
      );
    } finally {
      await sql.end().catch(() => {});
    }
  }
}