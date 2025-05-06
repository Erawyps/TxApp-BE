import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { Client } from 'pg'

async function queryDatabase(hyperdrive) {
  const client = new Client({
    host: hyperdrive.connection.host,
    port: hyperdrive.connection.port,
    database: hyperdrive.connection.database,
    user: hyperdrive.connection.user,
    password: hyperdrive.connection.password,
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
    
    // Route API
    if (url.pathname.startsWith('/api')) {
      try {
        const data = await queryDatabase(env.HYPERDRIVE_DB)
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
    
    // Assets statiques
    return await getAssetFromKV({ request, waitUntil: ctx.waitUntil })
  }
}