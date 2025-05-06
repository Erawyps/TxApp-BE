import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import postgres from 'postgres'

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // Route API pour les requêtes PostgreSQL
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
          max: 1 // Important pour éviter les fuites de connexion dans Workers
        })

        // Exemple de requête
        const result = await sql`SELECT NOW() AS current_time`
        
        // Fermer la connexion immédiatement
        await sql.end()
        
        return new Response(JSON.stringify(result), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // Pour les requêtes CORS
          }
        })
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: error.message,
          details: error.stack 
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    // Servir les fichiers statiques (votre application React)
    try {
      return await getAssetFromKV({
        request,
        waitUntil: ctx.waitUntil
      })
    } catch {
      return new Response(`Not Found`, { status: 404 })
    }
  }
}