import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['loadgo.js', 'loadgo-vanilla.js'],
      reporter: ['text', 'html'],
    },
  },
})
