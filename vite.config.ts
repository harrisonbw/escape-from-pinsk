import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Base path for assets:
 * - GitHub Pages project site: /escape-from-pinsk/
 * - Replit / custom domain at root: /
 *
 * Override anytime: VITE_BASE=/ npm run build
 *                  VITE_BASE=/escape-from-pinsk/ npm run build
 */
function resolveBase(): string {
  if (process.env.VITE_BASE != null && process.env.VITE_BASE !== '') {
    return process.env.VITE_BASE
  }
  // Replit always sets REPL_ID in the workspace / deploy environment
  if (process.env.REPL_ID || process.env.REPLIT_DEPLOYMENT) {
    return '/'
  }
  // Default: GitHub Pages project URL
  return '/escape-from-pinsk/'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: resolveBase(),
})
