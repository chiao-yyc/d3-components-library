/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    // 增加測試超時和重試機制
    testTimeout: 10000,
    hookTimeout: 10000,
    // 確保測試穩定性
    retry: 1,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test-setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/build/**',
        '**/.{idea,git,cache,output,temp}/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    // Test file patterns
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    // Mock DOM APIs for D3 testing
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    // 設置更穩定的測試環境
    isolate: true,
    // 為 D3 和 React 組合設置特殊的 jsdom 選項
    environmentOptions: {
      jsdom: {
        resources: 'usable'
      }
    }
  },
  resolve: {
    alias: {
      '@': '/components',
      '@core': '/components/core',
      '@basic': '/components/basic',
      '@statistical': '/components/statistical',
      '@financial': '/components/financial',
      '@primitives': '/components/primitives',
      '@composite': '/components/composite'
    }
  }
});