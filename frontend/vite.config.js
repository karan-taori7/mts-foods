import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/products':      BACKEND,
      '/orders':        BACKEND,
      '/business-info': BACKEND,
      '/chat':          BACKEND,
      '/auth':          BACKEND,
      '/payment':       BACKEND,
      '/admin':         BACKEND,
    },
  },
})
