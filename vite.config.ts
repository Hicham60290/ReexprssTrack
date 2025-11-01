
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'node:path'

const base = process.env.BASE_PATH || '/'
// Désactiver le mode preview pour corriger les URLs
const isPreview = false;

export default defineConfig({
  define: {
   __BASE_PATH__: JSON.stringify(base),
   __IS_PREVIEW__: JSON.stringify(isPreview)
  },
  plugins: [
    react({
      // Configuration ultra-compatible
      jsxImportSource: 'react'
    })
  ],
  base,
  build: {
    sourcemap: false,
    outDir: 'out',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Chunking simplifié pour compatibilité
        manualChunks: undefined
      }
    },
    chunkSizeWarningLimit: 3000,
    cssCodeSplit: false, // CSS dans un seul fichier
    assetsInlineLimit: 2048,
    reportCompressedSize: false,
    // Target moderne pour navigateurs récents
    target: 'esnext'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@supabase/supabase-js'
    ],
    // Force pre-bundling pour compatibilité
    force: true
  },
  esbuild: {
    target: 'esnext'
  }
})
