import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'
import { verifyToken } from '@clerk/backend'

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

// Verify Clerk session (optional) - expects Authorization: Bearer <token>
app.get('/api/me', async (c) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const secret = c.env.CLERK_SECRET_KEY
  if (!token) return c.json({ error: 'Missing bearer token' }, 401)
  if (!secret) return c.json({ error: 'Clerk not configured' }, 501)
  try {
    const payload = await verifyToken(token, { secretKey: secret })
    return c.json({ sub: payload.sub, sid: payload.sid })
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
})

// Static assets and SPA fallback are served automatically by Wrangler's assets binding
// (see wrangler.jsonc: assets.not_found_handling = "single-page-application").

export default app