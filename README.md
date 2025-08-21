# TxApp-BE

Stack: React (Vite) + Hono + Cloudflare Workers + Supabase

Overview
- Frontend: React built with Vite. Build output is served automatically via Wrangler assets binding (with SPA fallback configured).
- Backend: Hono-based API in a single Worker (see worker.js). Static assets are served by Wrangler assets routing. Example routes: GET /api/health, GET /api/profile.
- Database: Supabase (Postgres). Use @supabase/supabase-js from the Worker for server-side calls, or from React for client-side.

Prisma vs Supabase on Workers
- Prisma is not required for this stack. Cloudflare Workers do not support native Node engines used by Prisma without Prisma Accelerate (HTTP). Given Supabase is used and @supabase/supabase-js works natively on Workers, Prisma is unnecessary and has been removed from package.json. Database access should be done via Supabase queries or an edge-friendly ORM (e.g., Drizzle with HTTP/Supabase driver) if desired.
- Note: The repository still contains prisma/ and src/generated/prisma/ as legacy artifacts. They are not used at runtime. You can remove them safely to reduce repo size; they are kept temporarily for reference/migration.

Local development
1. Install deps: npm install
2. Run Vite dev for the frontend: npm run dev
3. Run the Worker (serves built assets or APIs):
   - Build the app once: npm run build
   - Start worker: npm run dev:worker
   Note: For full-stack dev with live assets under Wrangler, you can run Vite dev on a separate port and proxy, or use a two-terminal workflow (Vite for UI, Wrangler for APIs). The worker serves built assets from dist.

Environment variables (Wrangler)
Set these as Wrangler secrets or vars:
- SUPABASE_URL
- SUPABASE_ANON_KEY (or SERVICE_ROLE_KEY if you need elevated access)
Note: Do not expose SERVICE_ROLE_KEY to the browser. Keep it only in the Worker environment if needed.

CORS
- Default CORS is permissive (*) in worker.js for /api/* during development. In production, set origin to your real frontend domain(s).

Example
- Health: GET /api/health -> { ok: true }
- Sample Supabase call: GET /api/profile (expects a 'profiles' table). Replace with your own routes.

Build and deploy
- Build: npm run build
- Deploy: npm run deploy

Notes
- Hyperdrive binding is present in wrangler.jsonc but not used by the Worker. It’s optional and only needed if you plan to connect directly to Postgres over Cloudflare’s network. With Supabase via @supabase/supabase-js, it’s not required.
