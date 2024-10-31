import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    coverage: {
      include: [
        'use-store/index.js',
        'map-stores/index.js',
        'use-v-model/index.js'
      ],
      thresholds: {
        lines: 100
      }
    },
    environment: 'happy-dom'
  }
})
