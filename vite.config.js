import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import jsconfigPaths from 'vite-jsconfig-paths'
import eslint from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr'
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    jsconfigPaths(),
    svgr(),
    eslint({
      exclude: ['**/worker.js', '**/server/**'] // Exclure worker.js et server/ du linting
    }),
    tailwindcss()
  ],
  // Exclure les fichiers serveur de la compilation frontend
  build: {
    rollupOptions: {
      external: ['worker.js', './server/api.js']
    }
  },
  // Optimiser les dépendances en excluant Prisma
  optimizeDeps: {
    exclude: ['@prisma/client', 'bcryptjs']
  }
})