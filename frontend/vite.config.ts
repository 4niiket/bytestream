import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Use process.env.VITE_API_URL for the dev proxy target when available.
// Fall back to the local API during development.
const apiProxyTarget = process.env.VITE_API_URL
  ? // Strip any trailing /api path so the proxy targets the host only
    process.env.VITE_API_URL.replace(/\/api\/?$/, "")
  : 'http://localhost:3001'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Proxy /api requests to the backend during development. The target
      // can be configured via `VITE_API_URL` in the environment.
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
})
