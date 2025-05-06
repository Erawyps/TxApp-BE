import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { Client } from 'pg'

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
    try {
      const url = new URL(request.url)
      
      if (url.pathname.startsWith('/api')) {
        const data = await queryDatabase(env.HYPERDRIVE_DB.connection)
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil
        },
        {
          ASSET_NAMESPACE: env.ASSETS  // Utilisez le nouveau nom de binding
        }
      )
    } catch (err) {
      return new Response(err.message, { status: 500 })
    }
  }
}