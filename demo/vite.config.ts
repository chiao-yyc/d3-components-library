import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@registry': resolve(__dirname, '../registry'),
      // 為 Registry 中的依賴提供正確的解析路徑
      'clsx': resolve(__dirname, './node_modules/clsx'),
      'tailwind-merge': resolve(__dirname, './node_modules/tailwind-merge'),
      'd3': resolve(__dirname, './node_modules/d3'),
    },
  },
  optimizeDeps: {
    include: [
      '@registry/components/basic/bar-chart',
      '@registry/components/basic/line-chart',
    ],
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: [
        // Allow serving files from the project directory
        resolve(__dirname, '..'),
      ],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})