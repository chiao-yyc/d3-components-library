import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'D3ComponentsCLI',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: [
        // Node.js 內建模組
        'fs', 'path', 'os', 'child_process', 'url',
        // 依賴套件（不打包進去）
        'commander', 'inquirer', 'chalk', 'ora', 
        'fs-extra', 'axios', 'handlebars', 'semver',
        'fast-glob', 'execa'
      ],
      output: {
        banner: '#!/usr/bin/env node'  // 添加 shebang
      }
    },
    target: 'node18',
    minify: false  // CLI 工具通常不需要壓縮
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})