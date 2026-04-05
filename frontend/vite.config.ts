import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  test: {
    environment: 'jsdom',      // simulates a browser DOM
    globals: true,             // no need to import describe/it/expect
    setupFiles: [],
    coverage: {
      reporter: ['text'],      // print coverage table in terminal
      include: ['src/composables/**', 'src/components/**'],
    },
  },
})