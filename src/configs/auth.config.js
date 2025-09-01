/**
 * Configuration pour l'API d'authentification avec Hono/Cloudflare Workers
**/

// URL de base pour l'API locale (development)
export const JWT_HOST_API = "http://localhost:8787/api";

// Pour la production, utilisez l'URL de votre worker Cloudflare
// export const JWT_HOST_API = "https://your-worker.your-subdomain.workers.dev/api";
