import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import { demoCompliancePlugin } from './eslint-rules/index.js';

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactPlugin,
      'react-refresh': reactRefreshPlugin,
      'demo-compliance': demoCompliancePlugin,
    },
    rules: {
      // 🟢 寬鬆模式：Demo 環境允許實驗性程式碼
      
      // TypeScript 寬鬆規則
      '@typescript-eslint/no-unused-vars': 'warn',          // 警告但不阻止
      '@typescript-eslint/no-explicit-any': 'off',          // 允許 any 使用
      'prefer-const': 'warn',                               // 建議但不強制
      'no-var': 'warn',                                     // 建議但不強制
      'no-console': 'off',                                  // 允許 console
      
      // React 基本規則（保持錯誤級別以確保功能正確）
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // 🎯 重點：架構合規性檢查（這是 Demo 的核心要求）
      'demo-compliance/require-demo-page-template': 'error',
      'demo-compliance/require-standard-grid-layout': 'warn',
      
      // 基礎規則（移除過於嚴格的推薦規則）
      'no-unused-expressions': 'off',
      'no-unreachable': 'warn',
    },
  },
];