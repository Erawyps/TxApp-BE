import { Client } from 'pg';

export default {
  async fetch(request, env) {
    // Vérifiez que la requête est une GET
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return Response.json(
        { error: "Missing 'id' parameter" },
        { status: 400 }
      );
    }

    const client = new Client({
      connectionString: env.HYPERDRIVE.connectionString,
      connection: {
        application_name: "cabma"
      }
    });

    try {
      await client.connect();
      const res = await client.query({
        text: 'SELECT * FROM users WHERE id = $1',
        values: [id]
      });
      
      return Response.json(res.rows[0] || { error: "User not found" });
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