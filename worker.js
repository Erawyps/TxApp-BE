import { getAssetFromKV, serveSinglePageApp } from '@cloudflare/kv-asset-handler'
import postgres from 'postgres'

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // Route API
    if (url.pathname.startsWith('/api')) {
      try {
        const sql = postgres({
          host: env.HYPERDRIVE_DB.connection.host,
          port: env.HYPERDRIVE_DB.connection.port,
          database: env.HYPERDRIVE_DB.connection.database,
          username: env.HYPERDRIVE_DB.connection.user,
          password: env.HYPERDRIVE_DB.connection.password,
          ssl: 'require',
          max: 1
        })

        const result = await sql`SELECT NOW()`
        await sql.end()
        
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    // Gestion des assets statiques avec fallback SPA
    try {
      return await getAssetFromKV({
        request,
        waitUntil: ctx.waitUntil
      }, {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: JSON.parse(env.__STATIC_CONTENT_MANIFEST),
        mapRequestToAsset: serveSinglePageApp // Ceci est crucial pour les routes React
      })
    } catch {
      // Fallback pour les routes client-side
      const notFoundResponse = await getAssetFromKV({
        request: new Request(new URL('/index.html', request.url)),
        waitUntil: ctx.waitUntil
      })
      return new Response(notFoundResponse.body, { 
        ...notFoundResponse,
        status: 200 
      })
    }
  }
}