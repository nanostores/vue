import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  test: {
    coverage: {
      100: true,
      include: ['use-store/**', 'map-stores/**', 'use-v-model/**']
    },
    environment: 'happy-dom',
    globals: true
  }
})
