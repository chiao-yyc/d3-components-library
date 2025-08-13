import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

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
    ],
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})