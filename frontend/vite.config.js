import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        unused: true,
        dead_code: true,
        passes: 2
      },
      mangle: true
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('monaco-editor') || id.includes('@monaco-editor')) {
            return 'monaco-editor';
          }
          if (id.includes('/pages/Editor')) {
            return 'page-editor';
          }
          if (id.includes('/pages/Home')) {
            return 'page-home';
          }
        },
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    },
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1500,
    sourcemap: false,
    reportCompressedSize: false
  },
  server: {
    hmr: true,
    middlewareMode: false,
    preTransformRequests: ['/src/pages/Login.jsx', '/src/pages/SignUp.jsx']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-toastify'],
    exclude: ['@monaco-editor/react', 'monaco-editor', 'jspdf'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
