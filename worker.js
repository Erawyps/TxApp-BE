import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { Client } from 'pg';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Route API pour les requêtes DB
    if (url.pathname.startsWith('/api')) {
      return handleDatabaseRequest(env.HYPERDRIVE_DB);
    }

    // Servir les fichiers statiques
    return await getAssetFromKV(event);
  }
};

async function handleDatabaseRequest(hyperdrive) {
  const client = {
    host: hyperdrive.connection.host,
    port: hyperdrive.connection.port,
    database: hyperdrive.connection.database,
    user: hyperdrive.connection.user,
    password: hyperdrive.connection.password,
    ssl: true
  };

  try {
    const connection = new Client(client);
    await connection.connect();
    const result = await connection.query('SELECT NOW()');
    return new Response(JSON.stringify(result.rows), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}