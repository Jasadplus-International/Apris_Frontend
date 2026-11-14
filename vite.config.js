import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // A visitor on another device (demo client, LAN user) opens the app at this
  // PC's IP: the app then calls its own origin for the API — this proxy passes
  // those calls to the Python backend on port 8000.
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
