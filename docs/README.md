# D3 Components 文件

歡迎來到 D3 Components 文件庫！這裡包含了專案的完整說明文件。

## 📁 文件結構

```
docs/
├── guides/                    # 開發指南
│   ├── Claude Development Guide.md      # Claude 協作開發指南
│   └── D3.js Component Library Guide.md # CLI 工具開發指南
├── architecture/              # 架構文件
│   └── project-restructure.md           # 專案重構說明
├── api/                       # API 文件
├── examples/                  # 範例文件
└── README.md                  # 本檔案
```

## 📖 文件索引

### 🚀 快速開始
- [專案重構說明](./architecture/project-restructure.md) - 了解專案架構和設計理念

### 🎯 開發指南
- [Claude 協作開發指南](./guides/Claude%20Development%20Guide.md) - 與 Claude 協作開發的完整流程
- [CLI 工具開發指南](./guides/D3.js%20Component%20Library%20Guide.md) - CLI 工具實作詳細說明

### 🏗️ 架構文件
- [專案重構說明](./architecture/project-restructure.md) - 從 monorepo 到 Shadcn 模式的架構演進

### 📚 API 文件
*(待建立)*

### 💡 範例文件
*(待建立)*

## 🎯 專案核心理念

D3 Components 採用 **Shadcn 模式**，提供介於「現成圖表庫」與「純 D3 開發」之間的解決方案：

- **Copy & Paste**：直接複製完整的組件程式碼到專案中
- **完全透明**：獲得可讀、可修改的 D3 實作
- **智慧資料處理**：自動偵測資料類型並建議最佳映射
- **漸進式複雜度**：從簡單使用到深度客製化

## 🔧 快速開始

```bash
# 添加組件到專案
npx d3-components add bar-chart

# 列出可用組件
npx d3-components list

# 初始化專案設定
npx d3-components init
```

## 📋 閱讀順序建議

1. **新手入門**：
   - [專案重構說明](./architecture/project-restructure.md) - 了解專案設計理念

2. **開發者**：
   - [Claude 協作開發指南](./guides/Claude%20Development%20Guide.md) - 了解開發流程
   - [CLI 工具開發指南](./guides/D3.js%20Component%20Library%20Guide.md) - 深入 CLI 實作

3. **貢獻者**：
   - 所有上述文件 + API 文件

## 🤝 文件貢獻

歡迎為文件做出貢獻！請遵循以下原則：

- 使用清晰的標題結構
- 提供具體的程式碼範例
- 包含適當的連結和交叉引用
- 保持內容的時效性

---

*最後更新：2025-01-02*