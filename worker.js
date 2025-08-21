import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-assets'
import { createClient } from '@supabase/supabase-js'

// Create Hono app for API routes and static assets
const app = new Hono()

// CORS for API routes (adjust origin to your frontend domain in production)
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// Health check
app.get('/api/health', (c) => c.json({ ok: true, env: 'worker' }))

// Example Supabase route demonstrating server-side usage
app.get('/api/profile', async (c) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = c.env
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return c.json({ error: 'Supabase env not configured' }, 500)
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  })
  // This is just a placeholder query. Replace with your table.
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ data })
})

// Serve static assets from Wrangler's ASSETS binding
app.get('*', serveStatic())

// SPA fallback to index.html for unknown routes
app.notFound((c) => serveStatic({ path: '/index.html' })(c))

export default app