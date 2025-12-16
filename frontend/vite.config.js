import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable minification for smaller bundle sizes
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true
      }
    },
    // Code splitting for better caching and lazy loading
    rollupOptions: {
      output: {
        manualChunks: {
          'monaco-editor': ['@monaco-editor/react'],
          'vendor': ['react', 'react-router-dom', 'react-toastify'],
        }
      }
    },
    // Optimize assets
    assetsInlineLimit: 4096, // Inline small assets
    // CSS code split
    cssCodeSplit: true,
    // Increase chunk size warning limit for Monaco Editor
    chunkSizeWarningLimit: 1500,
    // Production source maps (set to false to disable)
    sourcemap: false,
  },
  server: {
    // Enable HMR for faster dev experience
    hmr: true,
    // Compression during dev
    middlewareMode: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  }
})
