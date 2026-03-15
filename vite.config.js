import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    chunkSizeWarningLimit: 600,
    sourcemap: false,
    // Ensures each lazy-loaded route gets its own CSS file (no flash of unstyled content)
    cssCodeSplit: true,
    // Use Vite's built-in esbuild minifier; drop console/debugger in production
    minify: 'esbuild',
    esbuildOptions: {
      drop: ['console', 'debugger'],
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Group React core libraries (almost never change — long cache TTL)
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // Group React Router
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          // Group Supabase (large SDK)
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          // Group all react-icons (large icon set)
          if (id.includes('node_modules/react-icons')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },
})
