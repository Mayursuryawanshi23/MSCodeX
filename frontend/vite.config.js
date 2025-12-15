import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Code splitting for better caching and lazy loading
    rollupOptions: {
      output: {
        manualChunks: {
          'monaco-editor': ['@monaco-editor/react'],
          'vendor': ['react', 'react-router-dom', 'react-toastify'],
        }
      }
    },
    // Increase chunk size warning limit for Monaco Editor
    chunkSizeWarningLimit: 1500,
  },
  server: {
    // Enable HMR for faster dev experience
    hmr: true,
  },
})
