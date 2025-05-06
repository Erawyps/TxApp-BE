import postgres from 'postgres';

export default {
    async fetch(request, env) {
      const sql = postgres(env.HYPERDRIVE.connectionString);
      
      try {
        const { query } = await request.json().catch(() => ({}));
        const safeQuery = query || 'SELECT NOW() as current_time';
        
        const result = await sql.unsafe(safeQuery);
        return Response.json(result);
        
      } catch (err) {
        return Response.json(
          { error: err.message.split('\n')[0] }, 
          { status: 500 }
        );
      } finally {
        await sql.end();
      }
    }
  }