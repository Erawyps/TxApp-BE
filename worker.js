import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

export default {
  async fetch(request, env, ctx) {
    try {
      return await getAssetFromKV({
        request,
        waitUntil: ctx.waitUntil.bind(ctx)
      }, {
        ASSET_NAMESPACE: env.STATIC_CONTENT, // Utilisation du nouveau binding
        ASSET_MANIFEST: {}
      })
    } catch {
      // Fallback vers l'ancien namespace si nécessaire
      try {
        return await getAssetFromKV({
          request,
          waitUntil: ctx.waitUntil.bind(ctx)
        }, {
          ASSET_NAMESPACE: env.WORKERS_SITES,
          ASSET_MANIFEST: {}
        })
      } catch (e2) {
        return new Response(`Error: ${e2.message}`, { status: 500 })
      }
    }
  }
}