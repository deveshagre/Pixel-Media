import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { pixelMediaApiPlugin } from './src/server/vitePlugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pixelMediaApiPlugin()],
  server: {
    port: 5180,
    strictPort: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})


