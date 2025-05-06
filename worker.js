import { Client } from '@cloudflare/pg';

export default {
  async fetch(request, env) {
    const client = new Client({
      connectionString: env.HYPERDRIVE.connectionString,
      connection: {
        application_name: "cabma"
      }
    });

    try {
      await client.connect();
      const query = {
        text: 'SELECT * FROM users WHERE id = $1',
        values: [request.params.id]
      };
      const res = await client.query(query);
      
      return Response.json(res.rows);
    } catch (err) {
      return Response.json(
        { error: err.message },
        { status: 500 }
      );
    } finally {
      await client.end();
    }
  }
}