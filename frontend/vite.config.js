import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Fixed: was 'build', but backend/server.js references '../frontend/dist'.
    // Changed to 'dist' to match, otherwise static serving would fail even when enabled.
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/api': {
        // Use environment variable for backend URL, fallback to default localhost
        target: process.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
