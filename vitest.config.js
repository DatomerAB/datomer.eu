import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}', 'functions/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    setupFiles: ['./vitest.setup.js'],
  },
})
