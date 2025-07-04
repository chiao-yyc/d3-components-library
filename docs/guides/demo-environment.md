# Demo 環境使用指南

## 概述

Demo 環境是一個基於 React + Vite 的開發預覽環境，讓您在開發 D3 組件時能夠即時檢視和測試圖表效果。

## 主要特色

- **即時預覽**：直接引用 Registry 中的組件，修改後立即看到效果
- **熱重載**：支援 Vite 熱重載功能，無需手動重新整理
- **互動控制**：提供完整的 props 控制面板，即時調整參數
- **多資料測試**：內建多種測試資料集，驗證組件在不同情境下的表現

## 快速開始

### 1. 安裝依賴

```bash
# 在專案根目錄執行
npm run demo:install
```

### 2. 啟動開發服務

```bash
# 啟動 Demo 環境
npm run demo:dev
```

服務將在 http://localhost:3000 啟動，並自動開啟瀏覽器。

### 3. 建置生產版本

```bash
# 建置 Demo 環境
npm run demo:build
```

## 目錄結構

```
demo/
├── src/
│   ├── components/
│   │   ├── Layout.tsx         # 整體佈局組件
│   │   └── ui/
│   │       └── bar-chart.tsx  # Registry 組件的封裝
│   ├── pages/
│   │   ├── Home.tsx          # 首頁
│   │   ├── BarChartDemo.tsx  # 長條圖 Demo 頁面
│   │   └── Gallery.tsx       # 組件庫展示頁面
│   ├── data/
│   │   └── sample-data.ts    # 測試資料集
│   ├── utils/
│   │   ├── cn.ts            # 樣式工具函數
│   │   └── data-detector.ts  # 資料檢測工具
│   └── styles/
│       └── index.css         # 全域樣式
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 技術架構

### 路徑別名配置

Demo 環境使用路徑別名來直接引用 Registry 中的組件：

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': resolve(__dirname, './src'),
    '@registry': resolve(__dirname, '../registry'),
  },
}
```

### 組件引用方式

```typescript
// 直接引用 Registry 組件
import { BarChart } from '@registry/components/bar-chart/bar-chart'
import type { BarChartProps } from '@registry/components/bar-chart/types'
```

## 使用方式

### 1. 開發新組件

1. 在 `registry/components/` 中建立新組件
2. 在 `demo/src/components/ui/` 中建立對應的封裝組件
3. 建立新的 Demo 頁面展示組件功能
4. 在 `demo/src/data/sample-data.ts` 中新增測試資料

### 2. 測試現有組件

1. 修改 Registry 中的組件程式碼
2. Demo 環境會自動重新載入顯示變更
3. 使用控制面板調整不同參數
4. 測試各種資料集和配置

### 3. 新增測試資料

在 `demo/src/data/sample-data.ts` 中新增資料集：

```typescript
export const yourData = [
  { category: 'A', value: 30 },
  { category: 'B', value: 80 },
  // ...
]

// 新增到資料集選項
export const datasetOptions = [
  // ...
  { 
    label: '您的資料', 
    value: 'your-data', 
    data: yourData, 
    xKey: 'category', 
    yKey: 'value' 
  },
]
```

## 頁面說明

### 首頁 (Home.tsx)
- 專案介紹和功能概述
- 快速導航到各個 Demo 頁面
- 開發環境特色說明

### 長條圖 Demo (BarChartDemo.tsx)
- 互動式控制面板
- 即時參數調整
- 多種資料集測試
- 資料表格預覽

### 組件庫 (Gallery.tsx)
- 所有組件的展示
- 不同配置的範例
- 組件特性說明
- 使用方式說明

## 開發工作流程

1. **修改組件**：在 `registry/components/` 中修改組件程式碼
2. **即時預覽**：Demo 環境自動重新載入顯示變更
3. **測試調整**：使用控制面板測試不同參數和資料
4. **驗證效果**：確認組件在各種情境下的表現
5. **文件更新**：在 Gallery 頁面更新組件說明

## 注意事項

- Demo 環境僅供開發時使用，不是最終用戶的使用方式
- 確保 Registry 組件遵循規範，才能正確在 Demo 環境中顯示
- 新增組件時，記得同步更新 Demo 環境的相關頁面
- 建議在提交組件之前，先在 Demo 環境中充分測試

## 故障排除

### 組件無法載入
- 檢查 Registry 組件的路徑是否正確
- 確認組件有正確的匯出語法
- 檢查 TypeScript 型別定義是否正確

### 熱重載不生效
- 重新啟動開發服務
- 檢查檔案是否正確儲存
- 確認沒有語法錯誤

### 樣式問題
- 確認 TailwindCSS 類別名稱正確
- 檢查 CSS 檔案是否正確載入
- 驗證組件的樣式依賴是否完整