import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    try {
      return await getAssetFromKV({
        request,
        waitUntil: ctx.waitUntil.bind(ctx)
      }, {
        ASSET_NAMESPACE: env.ASSETS,
        ASSET_MANIFEST: {}
      });
    } catch (e) {
      return new Response(e.message, { status: 500 });
    }
  }
}