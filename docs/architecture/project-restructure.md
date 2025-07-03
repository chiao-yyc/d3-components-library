# D3 Components 專案架構重構指南

## 重構目標

將專案從複雜的 monorepo 結構調整為適合 **Shadcn 模式**的簡化架構，符合「Copy & Paste」的組件分發理念。

## 核心理念對比

### Before: 傳統 npm 套件模式
```bash
npm install d3-components
import { BarChart } from 'd3-components'
```

### After: Shadcn 模式
```bash
npx d3-components add bar-chart
# 直接複製組件程式碼到專案中
```

## 專案架構演進

### 舊架構 (Monorepo)
```
d3-components/
├── packages/
│   ├── cli/                    # CLI 工具套件
│   └── registry/               # Registry 套件
├── pnpm-workspace.yaml         # Monorepo 配置
├── .changeset/                 # 版本管理
└── package.json                # 根套件配置
```

**問題：**
- 不符合 Shadcn 模式的「非套件」理念
- Registry 不需要發布為 npm 套件
- Changesets 對純程式碼倉庫意義不大
- 複雜的 monorepo 配置增加維護成本

### 新架構 (Shadcn 模式)
```
d3-components/
├── registry/                   # 組件註冊表（純程式碼倉庫）
│   ├── components/            # 圖表組件原始碼
│   │   ├── bar-chart/
│   │   │   ├── bar-chart.tsx
│   │   │   ├── bar-chart.css
│   │   │   └── config.json
│   │   └── line-chart/
│   ├── utils/                 # 共用工具函數
│   ├── types/                 # TypeScript 型別定義
│   ├── index.json             # 組件索引
│   └── schema.json            # 結構驗證
├── cli/                       # CLI 工具（唯一的 npm 套件）
│   ├── src/
│   │   ├── commands/
│   │   ├── utils/
│   │   └── types/
│   └── package.json
├── docs/                      # 文件
│   ├── guides/               # 開發指南
│   ├── architecture/         # 架構文件
│   ├── api/                  # API 文件
│   └── examples/             # 範例文件
├── examples/                  # 範例專案
├── scripts/                   # 專案腳本
├── tests/                     # 測試檔案
└── package.json               # 簡化的根目錄配置
```

## 重構執行步驟

### 1. 移除 Monorepo 配置

```bash
# 移除不必要的檔案
rm pnpm-workspace.yaml
rm -rf .changeset/
rm -rf packages/registry/
```

**理由：**
- Registry 不需要作為 npm 套件發布
- 不需要複雜的版本管理機制
- 簡化專案結構和維護成本

### 2. 重新組織 Registry 結構

```bash
# 建立新的 Registry 結構
mkdir -p registry/{components,utils,types}
```

**變更：**
- `packages/registry/` → `registry/`
- 移除 package.json（不再是 npm 套件）
- 保留純粹的程式碼和配置檔案

### 3. 調整 CLI 工具配置

```bash
# 移動 CLI 到根目錄層級
mv packages/cli/ cli/
rmdir packages/
```

**調整重點：**
- `packages/cli/` → `cli/`
- 修改 package.json name: `d3-components` → `d3-components-cli`
- 調整模組類型: `"type": "module"` → `"type": "commonjs"`
- CLI 工具是唯一需要發布的 npm 套件

### 4. 簡化根目錄配置

**package.json 變更：**
```json
{
  "name": "d3-components",
  "private": true,
  "scripts": {
    "build": "cd cli && npm run build",
    "dev": "cd cli && npm run dev",
    "cli:link": "cd cli && npm link",
    "registry:validate": "node scripts/validate-registry.js"
  }
}
```

**移除：**
- workspaces 配置
- changesets 相關腳本
- 複雜的 monorepo 管理指令

### 5. 建立文件架構

```bash
mkdir -p docs/{guides,architecture,api,examples}
mv "Claude Development Guide.md" docs/guides/
mv "D3.js Component Library Guide.md" docs/guides/
```

## 核心組件運作模式

### Registry 系統
```
registry/
├── index.json              # 組件索引清單
├── schema.json             # 結構驗證規則
├── components/
│   └── bar-chart/
│       ├── bar-chart.tsx   # React 組件
│       ├── bar-chart.css   # 樣式檔案
│       └── config.json     # 組件配置
└── utils/                  # 共用工具
    └── data-detector.ts
```

### CLI 工具流程
1. 使用者執行: `npx d3-components add bar-chart`
2. CLI 從 Registry 下載組件檔案
3. 處理模板變數替換
4. 複製到使用者專案的指定目錄
5. 使用者可自由修改複製的程式碼

### 資料流向
```
Registry (GitHub) → CLI Tool → User Project
     ↓                ↓            ↓
組件原始碼        下載&處理      複製到本地
```

## 技術決策說明

### 為什麼選擇 Shadcn 模式？

1. **完全透明**：使用者獲得完整的程式碼控制權
2. **零依賴**：不增加專案的 npm 依賴
3. **易於客製化**：可以直接修改複製的程式碼
4. **版本無關**：不受套件版本更新影響

### 為什麼移除 Changesets？

1. **不發布 Registry**：Registry 是程式碼倉庫，不是 npm 套件
2. **CLI 獨立版本管理**：只有 CLI 工具需要版本控制
3. **簡化工作流程**：減少不必要的版本管理複雜度

### 為什麼簡化 Monorepo？

1. **單一職責**：CLI 工具是唯一的可安裝套件
2. **降低複雜度**：避免過度工程化
3. **易於維護**：減少配置檔案和腳本

## 新架構的優勢

### 1. 符合 Shadcn 理念
- ✅ Copy & Paste 工作流程
- ✅ 完全的程式碼控制權
- ✅ 零套件依賴

### 2. 簡化維護成本
- ✅ 單一 CLI 套件需要發布
- ✅ Registry 純粹是程式碼倉庫
- ✅ 減少配置檔案和腳本

### 3. 提升開發體驗
- ✅ 清晰的目錄結構
- ✅ 明確的職責分工
- ✅ 簡單的開發工作流程

### 4. 易於擴展
- ✅ 新增組件只需要加入 Registry
- ✅ CLI 功能獨立開發
- ✅ 文件結構清晰

## 下一步開發重點

1. **完善 CLI 工具**：實作 add、list、init 等核心命令
2. **建立第一個組件**：開發 BarChart 作為範例
3. **設定 CI/CD**：自動化測試和發布流程
4. **撰寫文件**：完善使用說明和 API 文件

---

*本文件記錄了 D3 Components 專案從 monorepo 架構重構為 Shadcn 模式的完整過程和技術決策。*