import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://guno6rd8a7.execute-api.us-west-2.amazonaws.com',
        changeOrigin: true,
        secure: true,
      },
      '/users': {
        target: 'https://guno6rd8a7.execute-api.us-west-2.amazonaws.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})