# D3 Components

一個基於 shadcn/ui 理念的 D3.js 組件庫，提供介於「現成圖表庫」與「純 D3 開發」之間的解決方案。

## 專案結構

```
d3-components/
├── registry/                 # 組件註冊表
│   ├── components/          # 各種圖表組件
│   ├── utils/               # 共用工具函數  
│   ├── types/               # TypeScript 型別定義
│   ├── index.json           # 組件索引
│   └── schema.json          # 結構驗證
├── cli/                     # CLI 工具
├── docs/                    # 文件網站
├── examples/                # 範例專案
├── scripts/                 # 專案腳本
└── tests/                   # 測試檔案
```

## 核心理念

- **Copy & Paste**：直接複製完整的組件程式碼到專案中
- **完全透明**：獲得可讀、可修改的 D3 實作
- **智慧資料處理**：自動偵測資料類型並建議最佳映射
- **漸進式複雜度**：從簡單使用到深度客製化

## 開發環境設定

```bash
# 安裝依賴
npm install

# 設定 CLI 本地連結（用於測試）
npm run cli:link

# 驗證 Registry 結構
npm run registry:validate

# 開發模式
npm run dev
```

## CLI 使用

```bash
# 添加組件
npx d3-components add bar-chart

# 列出可用組件
npx d3-components list

# 初始化專案
npx d3-components init
```

## 📚 文件

詳細文件請參考 [docs/](./docs/) 目錄：

- [專案重構說明](./docs/architecture/project-restructure.md) - 了解專案架構和設計理念
- [Claude 協作開發指南](./docs/guides/Claude%20Development%20Guide.md) - 與 Claude 協作開發流程
- [CLI 工具開發指南](./docs/guides/D3.js%20Component%20Library%20Guide.md) - CLI 工具實作詳細說明

## 貢獻指南

請先閱讀上述開發指南，了解專案架構和開發流程。