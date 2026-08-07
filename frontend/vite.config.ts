import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const apiProxyTarget = process.env.VITE_API_URL
  ? process.env.VITE_API_URL.replace(/\/api\/?$/, "")
  : "http://localhost:3001"

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [
      "web.byte-stream.dev"
    ],

    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
})