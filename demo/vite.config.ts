import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@registry': resolve(__dirname, '../registry'),
      // 強制使用 demo/node_modules 中的 React（避免多副本問題）
      'react': resolve(__dirname, './node_modules/react'),
      'react-dom': resolve(__dirname, './node_modules/react-dom'),
      // 為 Registry 中的依賴提供正確的解析路徑
      'clsx': resolve(__dirname, './node_modules/clsx'),
      'tailwind-merge': resolve(__dirname, './node_modules/tailwind-merge'),
      'd3': resolve(__dirname, './node_modules/d3'),
      // D3 子模組 - 確保 Rollup 能正確解析 registry 中的 imports
      'd3-array': resolve(__dirname, './node_modules/d3-array'),
      'd3-axis': resolve(__dirname, './node_modules/d3-axis'),
      'd3-brush': resolve(__dirname, './node_modules/d3-brush'),
      'd3-color': resolve(__dirname, './node_modules/d3-color'),
      'd3-drag': resolve(__dirname, './node_modules/d3-drag'),
      'd3-ease': resolve(__dirname, './node_modules/d3-ease'),
      'd3-force': resolve(__dirname, './node_modules/d3-force'),
      'd3-format': resolve(__dirname, './node_modules/d3-format'),
      'd3-hierarchy': resolve(__dirname, './node_modules/d3-hierarchy'),
      'd3-interpolate': resolve(__dirname, './node_modules/d3-interpolate'),
      'd3-path': resolve(__dirname, './node_modules/d3-path'),
      'd3-scale': resolve(__dirname, './node_modules/d3-scale'),
      'd3-scale-chromatic': resolve(__dirname, './node_modules/d3-scale-chromatic'),
      'd3-selection': resolve(__dirname, './node_modules/d3-selection'),
      'd3-shape': resolve(__dirname, './node_modules/d3-shape'),
      'd3-time-format': resolve(__dirname, './node_modules/d3-time-format'),
      'd3-transition': resolve(__dirname, './node_modules/d3-transition'),
      'd3-zoom': resolve(__dirname, './node_modules/d3-zoom'),
    },
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: [
      // 基礎圖表組件
      '@registry/components/basic/bar-chart',
      '@registry/components/basic/line-chart',
      '@registry/components/basic/area-chart',
      '@registry/components/basic/pie-chart',
      // 統計圖表組件
      '@registry/components/statistical/scatter-plot',
      '@registry/components/statistical/radar-chart',
      '@registry/components/statistical/box-plot',
      '@registry/components/statistical/violin-plot',
      // 核心工具
      '@registry/components/core/d3-utils',
      '@registry/components/core/base-chart',
      '@registry/components/core/data-processor',
      // D3 相關依賴
      'd3-selection',
      'd3-scale',
      'd3-axis',
      'd3-shape',
      'd3-array',
      'd3-format',
      'd3-time-format',
      'd3-transition',
      'd3-ease',
      'd3-color',
      'd3-interpolate'
    ],
    exclude: [
      // 排除一些不需要預構建的模組
      '@registry/components/core/test-utils'
    ]
  },
  esbuild: {
    // 開發時保持 JSX，生產時優化
    jsx: 'automatic',
    target: 'es2020'
  },
  server: {
    port: 3001, // 使用 3001 避免與其他服務衝突
    open: true,
    fs: {
      allow: [
        // Allow serving files from the project directory
        resolve(__dirname, '..'),
      ],
    },
    hmr: {
      // 熱重載配置優化
      overlay: true
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // 構建優化
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        // 分塊策略優化
        manualChunks: {
          // 將 React 相關庫分離
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 將 D3 相關庫分離
          'd3-vendor': ['d3'],
          // 將圖表組件分離
          'chart-components': [
            '@registry/components/basic/bar-chart',
            '@registry/components/basic/line-chart',
            '@registry/components/basic/area-chart',
            '@registry/components/basic/pie-chart'
          ],
          // 統計組件分離
          'statistical-components': [
            '@registry/components/statistical/scatter-plot',
            '@registry/components/statistical/radar-chart'
          ]
        }
      }
    },
    // 構建分析
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000
  },
  // 新增效能監控
  define: {
    __DEMO_VERSION__: JSON.stringify(process.env.npm_package_version || '0.1.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
})