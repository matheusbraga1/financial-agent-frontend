import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    server: {
      port: parseInt(env.VITE_PORT) || 3000,
      host: true,
      strictPort: true,

      proxy: mode === 'development' ? {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      } : undefined,
    },

    preview: {
      port: 4173,
      host: true,
      strictPort: true,
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode !== 'production',
      minify: 'esbuild',
      target: 'es2020',

      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'markdown-vendor': ['react-markdown', 'react-syntax-highlighter'],
            'ui-vendor': ['framer-motion', 'lucide-react'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'utils-vendor': ['axios', 'date-fns'],
          },

          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]

            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`
            } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },

          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },

      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      emptyOutDir: true,
      reportCompressedSize: true,
    },

    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@features': '/src/features',
        '@services': '/src/services',
        '@utils': '/src/utils',
        '@contexts': '/src/contexts',
        '@hooks': '/src/hooks',
        '@assets': '/src/assets',
        '@styles': '/src/styles',
      },
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
      ],
    },
  }
})