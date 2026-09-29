import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('element-plus')) {
            return 'element-plus'
          }
          if (id.includes('vue-router')) {
            return 'vue-router'
          }
          if (id.includes('pinia')) {
            return 'pinia'
          }
        }
      }
    }
  }
})
