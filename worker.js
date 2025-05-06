import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { Client } from 'pg'  // Import spécifique du Client

async function queryDatabase(connection) {
  const client = new Client({
    host: connection.host,
    port: connection.port,
    database: connection.database,
    user: connection.user,
    password: connection.password,
    ssl: true
  })
  
  await client.connect()
  const res = await client.query('SELECT NOW()')
  await client.end()
  return res.rows
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    if (url.pathname.startsWith('/api')) {
      try {
        const data = await queryDatabase(env.HYPERDRIVE_DB.connection)
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (err) {
        return new Response(JSON.stringify({ 
          error: err.message,
          stack: err.stack
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
    
    return await getAssetFromKV({ request, waitUntil: ctx.waitUntil })
  }
}