import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import pg from 'pg'

const { Client } = pg

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // Route API
    if (url.pathname.startsWith('/api')) {
      try {
        const client = new Client({
          connectionString: env.HYPERDRIVE_DB.connectionString
        })
        
        await client.connect()
        const res = await client.query('SELECT NOW()')
        await client.end()
        
        return new Response(JSON.stringify(res.rows), {
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