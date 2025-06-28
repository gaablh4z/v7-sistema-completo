import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 4174,
    open: true,
    host: true,
    strictPort: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
