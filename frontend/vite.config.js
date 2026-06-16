import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const auth = req.headers.authorization
            if (!auth?.startsWith('Bearer ')) return
            const accessToken = auth.slice(7).trim()
            if (!accessToken) return
            const existing = String(proxyReq.getHeader('cookie') || '')
            const withoutToken = existing
              .split(';')
              .map((part) => part.trim())
              .filter((part) => part && !part.startsWith('token='))
              .join('; ')
            const next = withoutToken ? `${withoutToken}; token=${accessToken}` : `token=${accessToken}`
            proxyReq.setHeader('cookie', next)
          })
        },
      },
    },
  },
})
