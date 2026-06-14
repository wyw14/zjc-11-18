import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 4517,
    proxy: {
      '/api': {
        target: 'http://localhost:4017',
        changeOrigin: true
      }
    }
  }
})
