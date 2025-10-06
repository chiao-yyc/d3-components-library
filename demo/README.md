# D3 Components Demo

D3 組件的展示和測試環境，提供互動式的組件預覽和範例。

## 🚀 快速開始

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽建置結果
npm run preview
```

## 📁 目錄結構

```
demo/
├── src/
│   ├── components/ui/     # 複製的 D3 組件
│   ├── pages/            # 示例頁面
│   ├── utils/            # 工具函數
│   ├── data/             # 示例資料
│   └── styles/           # 樣式檔案
├── public/               # 靜態資源
└── package.json          # 依賴設定
```

## 🎯 功能特色

- **組件展示**：可視化的組件預覽
- **互動測試**：即時調整組件屬性
- **範例程式碼**：完整的使用範例
- **響應式設計**：支援各種螢幕尺寸
- **熱重載**：開發時即時更新

## 📊 可用組件

- **BarChart**：長條圖組件
  - 支援垂直和水平方向
  - 動畫效果
  - 互動功能
  - 自訂顏色

## 🛠️ 開發指南

1. 組件檔案位於 `src/components/ui/`
2. 示例頁面位於 `src/pages/`
3. 示例資料位於 `src/data/`
4. 使用 TailwindCSS 進行樣式設計

## 🔧 技術棧

- React 18
- TypeScript
- Vite
- TailwindCSS
- D3.js
- React Router

---

*此 Demo 環境僅供開發和測試使用*