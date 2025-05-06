import { getAssetFromKV, serveSinglePageApp } from '@cloudflare/kv-asset-handler'
import postgres from 'postgres'

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // 1. Gestion des routes API
    if (url.pathname.startsWith('/api')) {
      try {
        // Configuration de la connexion Hyperdrive
        const sql = postgres({
          host: env.HYPERDRIVE_DB.connection.host,
          port: env.HYPERDRIVE_DB.connection.port,
          database: env.HYPERDRIVE_DB.connection.database,
          username: env.HYPERDRIVE_DB.connection.user,
          password: env.HYPERDRIVE_DB.connection.password,
          ssl: 'require',
          max: 1 // Important pour éviter les fuites de connexion
        })

        // Exemple de routage API
        let result
        if (url.pathname === '/api/test') {
          result = await sql`SELECT NOW() AS current_time`
        } else if (url.pathname === '/api/users') {
          result = await sql`SELECT * FROM users LIMIT 10`
        } else {
          return new Response('API endpoint not found', { status: 404 })
        }

        await sql.end()
        return new Response(JSON.stringify(result), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        })
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: error.message,
          stack: error.stack 
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    // 2. Gestion des assets statiques (votre app React)
    try {
      return await getAssetFromKV({
        request,
        waitUntil: ctx.waitUntil
      }, {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: JSON.parse(env.__STATIC_CONTENT_MANIFEST || '{}'),
        mapRequestToAsset: serveSinglePageApp // Gère les routes React
      })
    } catch {
      // Fallback pour les routes client-side
      try {
        const notFoundResponse = await getAssetFromKV({
          request: new Request(new URL('/index.html', request.url)),
          waitUntil: ctx.waitUntil
        })
        return new Response(notFoundResponse.body, { 
          ...notFoundResponse,
          status: 200 // Important pour les SPA
        })
      } catch {
        return new Response('Application not found', { 
          status: 404,
          headers: { 'Content-Type': 'text/html' }
        })
      }
    }
  }
}