import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        // 移除嚴格的 project 配置，避免解析問題
        // project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // 🔴 嚴格模式：核心套件品質最高要求
      
      // TypeScript 嚴格規則 (不依賴 type-checking)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'error',
      // 移除需要 type-checking 的規則
      // '@typescript-eslint/prefer-optional-chain': 'error',
      // '@typescript-eslint/prefer-nullish-coalescing': 'error',
      // '@typescript-eslint/strict-boolean-expressions': 'warn',
      
      // 程式碼品質
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      
      // 函數和類別設計
      'max-params': ['warn', 4],
      'max-lines-per-function': ['warn', 100],
      'complexity': ['warn', 10],
      
      // 記憶體和性能
      'no-unused-expressions': 'error',
      'no-unreachable': 'error',
      
      // D3 和圖表專用規則
      'no-magic-numbers': ['warn', { 
        ignore: [0, 1, -1, 100, 360], 
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true 
      }],
      
      // 導入和模組
      'no-duplicate-imports': 'error',
      
      // 基礎 TypeScript 推薦規則 (不依賴 type-checking)
      ...tseslint.configs.recommended.rules,
    },
  },
  
  // 測試檔案特殊規則
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn', // 測試中允許部分 any
      'max-lines-per-function': 'off', // 測試函數可以較長
      'no-magic-numbers': 'off', // 測試中允許魔術數字
    },
  },
  
  // 型別定義檔案
  {
    files: ['**/*.d.ts', '**/types.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn', // 型別定義中有時需要 any
      '@typescript-eslint/no-unused-vars': 'off', // 型別定義可能看起來未使用
    },
  },
];