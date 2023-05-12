import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      include: ['use-store/**', 'map-stores/**', 'use-v-model/**'],
      100: true
    }
  }
})
