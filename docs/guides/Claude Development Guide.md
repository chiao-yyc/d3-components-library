# D3 Components - Claude 協作開發指南

## 專案概述

D3 Components 是一個基於 shadcn/ui 理念的 D3.js 組件庫，提供介於「現成圖表庫」與「純 D3 開發」之間的解決方案。

### 核心理念
- **Copy & Paste**：直接複製完整的組件程式碼到專案中
- **完全透明**：獲得可讀、可修改的 D3 實作
- **智慧資料處理**：自動偵測資料類型並建議最佳映射
- **漸進式複雜度**：從簡單使用到深度客製化
- **疊圖支援**：支援多圖層組合和不同資料源

## 技術架構

### 技術選型
- **前端框架**：React + TypeScript
- **建構工具**：Vite
- **樣式系統**：CSS Variables + Tailwind CSS
- **包管理**：pnpm (monorepo)
- **測試框架**：Vitest + React Testing Library

### 專案結構
```
d3-components/
├── packages/
│   ├── cli/                    # CLI 工具
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── add.ts     # 添加組件
│   │   │   │   ├── import.ts  # 資料匯入
│   │   │   │   ├── init.ts    # 專案初始化
│   │   │   │   └── compose.ts # 組合圖表
│   │   │   ├── utils/
│   │   │   └── templates/
│   │   └── package.json
│   └── registry/               # 組件註冊表
│       ├── components/
│       │   ├── bar-chart/
│       │   │   ├── bar-chart.tsx
│       │   │   ├── bar-chart.css
│       │   │   └── config.json
│       │   ├── line-chart/
│       │   ├── composite-chart/
│       │   └── data-mapper/
│       ├── adapters/          # 資料適配器
│       │   ├── csv-adapter.ts
│       │   ├── time-series-adapter.ts
│       │   ├── nested-adapter.ts
│       │   └── pivot-adapter.ts
│       └── utils/
│           ├── data-detector.ts
│           ├── layer-renderers.ts
│           └── scales.ts
├── docs/                       # 文件網站 (Vitepress)
├── examples/                   # 範例專案
└── tests/                      # 測試檔案
```

## 核心組件設計

### 1. 基礎圖表組件架構

```typescript
// 標準組件介面
interface BaseChartProps {
  data: any[]
  width?: number
  height?: number
  margin?: Margin
  className?: string
  
  // 資料映射 (多種方式)
  xKey?: string
  yKey?: string
  xAccessor?: (d: any) => any
  yAccessor?: (d: any) => any
  mapping?: DataMapping
  dataAdapter?: DataAdapter
  
  // 樣式和行為
  colors?: string[]
  animate?: boolean
  interactive?: boolean
  
  // 事件處理
  onDataClick?: (data: any) => void
  onHover?: (data: any) => void
}

// 資料映射配置
interface DataMapping {
  x: string | ((d: any) => any)
  y: string | ((d: any) => any)
  color?: string | ((d: any) => any)
  size?: string | ((d: any) => any)
}

// 資料適配器介面
interface DataAdapter<T = any> {
  transform(data: T[], config: MappingConfig): ChartDataPoint[]
  validate(data: T[]): ValidationResult
  suggest(data: T[]): SuggestedMapping[]
}
```

### 2. 疊圖系統架構

```typescript
// 圖層定義
interface ChartLayer {
  id: string
  type: 'bar' | 'line' | 'area' | 'scatter'
  data: any[]
  mapping: DataMapping
  yAxis?: 'left' | 'right'
  zIndex?: number
  opacity?: number
  color?: string
  visible?: boolean
}

// 疊圖組件
interface CompositeChartProps {
  layers: ChartLayer[]
  width?: number
  height?: number
  margin?: Margin
  sharedXAxis?: boolean
  dualYAxis?: boolean
  syncZoom?: boolean
  syncBrush?: boolean
}
```

## 開發規範

### 1. 組件開發原則

- **完整性**：每個組件都是完整的 D3 實作，不依賴外部黑盒
- **可讀性**：程式碼結構清晰，變數命名有意義
- **可修改性**：關鍵邏輯分離，容易客製化
- **響應式**：支援資料更新和視窗大小變化
- **型別安全**：完整的 TypeScript 支援

### 2. 程式碼結構

```typescript
// 標準組件結構
export function BarChart({
  data,
  xKey,
  yKey,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 40 },
  ...props
}: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  
  // 1. 資料處理
  const processedData = useMemo(() => {
    return processDataWithMapping(data, { x: xKey, y: yKey })
  }, [data, xKey, yKey])
  
  // 2. 比例尺計算
  const scales = useMemo(() => {
    return calculateScales(processedData, { width, height, margin })
  }, [processedData, width, height, margin])
  
  // 3. D3 渲染
  useEffect(() => {
    if (!svgRef.current) return
    renderChart(svgRef.current, processedData, scales)
  }, [processedData, scales])
  
  return (
    <div className={cn("chart-container", className)}>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  )
}
```

### 3. 檔案命名規範

- 組件檔案：`kebab-case.tsx` (例如：`bar-chart.tsx`)
- 工具函數：`camelCase.ts` (例如：`dataProcessor.ts`)
- 類型定義：`types.ts` 或與組件同名
- 測試檔案：`*.test.tsx` 或 `*.spec.tsx`

## 資料處理系統

### 1. 資料適配器

```typescript
// CSV 適配器
export const csvAdapter: DataAdapter = {
  transform: (data, config) => {
    return data.map(row => ({
      x: parseValue(row[config.x]),
      y: parseValue(row[config.y]),
      ...row
    }))
  },
  validate: (data) => {
    // 驗證資料完整性
  },
  suggest: (data) => {
    // 自動建議欄位映射
  }
}
```

### 2. 智慧偵測

```typescript
// 自動偵測資料類型和建議映射
export function suggestMapping(data: any[]): SuggestedMapping[] {
  // 實作邏輯...
}

// 資料型別偵測
export function detectDataType(values: any[]): DataType {
  // 'number' | 'string' | 'date' | 'boolean'
}
```

## CLI 工具設計

### 運作原理

CLI 工具透過 NPM 的 `bin` 機制讓使用者執行命令：

1. **NPX 執行流程**：
   ```bash
   npx d3-components add bar-chart
   # 1. NPX 下載 d3-components-cli 套件
   # 2. 讀取 package.json 的 bin 欄位
   # 3. 執行 ./dist/index.js
   # 4. 解析 "add bar-chart" 命令
   # 5. 執行對應的處理邏輯
   ```

2. **套件結構**：
   ```json
   // package.json
   {
     "name": "d3-components-cli",
     "bin": {
       "d3-components": "./dist/index.js"  // 定義可執行檔案
     },
     "files": ["dist/**/*", "templates/**/*"]  // 發布時包含的檔案
   }
   ```

### 命令結構

```bash
# 初始化專案
npx d3-components init

# 添加組件
npx d3-components add bar-chart
npx d3-components add line-chart --variant animated

# 資料匯入
npx d3-components import data.csv --chart bar --auto-detect
npx d3-components import data.json --chart line --interactive

# 組合圖表
npx d3-components compose sales.csv targets.csv --chart bar-line

# 列出可用組件
npx d3-components list

# 更新組件
npx d3-components update bar-chart
```

### CLI 實作架構

```typescript
// cli/src/index.ts - 入口點
#!/usr/bin/env node  // Shebang: 告訴系統用 Node.js 執行

import { Command } from 'commander'

const program = new Command()
program
  .command('add <component>')
  .action(addCommand)  // 當使用者執行 "add" 時呼叫此函數

// cli/src/commands/add.ts - 實際邏輯
export async function addCommand(componentName: string, options: AddOptions) {
  // 1. 從遠端 Registry 獲取組件配置
  // 2. 檢查專案環境和依賴
  // 3. 下載組件檔案到本地
  // 4. 處理模板變數替換
  // 5. 更新專案配置檔案
}
```

### Registry 系統

```typescript
// Registry 是遠端的組件倉庫
const REGISTRY_URL = 'https://registry.d3-components.com'

// 組件配置範例
interface ComponentConfig {
  name: 'bar-chart',
  files: [
    { name: 'bar-chart.tsx', type: 'component' },
    { name: 'bar-chart.css', type: 'style' }
  ],
  dependencies: ['react', 'd3'],
  variants: ['default

## 測試策略

### 1. 單元測試
- 資料處理函數
- 比例尺計算
- 工具函數

### 2. 組件測試
- 渲染測試
- 互動測試
- 資料更新測試

### 3. 整合測試
- CLI 命令測試
- 端到端流程測試

## 開發流程

### 1. 新增組件流程

```bash
# 1. 創建組件資料夾
mkdir registry/components/new-chart

# 2. 實作組件
# - new-chart.tsx (主要組件)
# - new-chart.css (樣式)
# - config.json (配置)
# - new-chart.test.tsx (測試)

# 3. 更新註冊表
# - 添加到 registry/index.json

# 4. 添加文件和範例
# - docs/components/new-chart.md
# - examples/new-chart-example.tsx
```

### 2. 發布流程

```bash
# 1. 測試
pnpm test

# 2. 建構
pnpm build

# 3. 版本管理
pnpm changeset

# 4. 發布
pnpm publish
```

## 常見問題與解決方案

### Q: 如何處理 React 與 D3 的 DOM 操作衝突？
A: 使用 `useRef` 獲取 DOM 元素，讓 D3 完全控制該元素，React 不直接操作。

### Q: 如何優化大資料集的渲染性能？
A: 使用 `useMemo` 快取計算結果，考慮虛擬化或資料取樣。

### Q: 如何支援 SSR？
A: 使用 `useEffect` 確保 D3 操作只在客戶端執行，提供 fallback UI。

### Q: 如何處理響應式設計？
A: 使用 `ResizeObserver` 監聽容器大小變化，動態調整圖表尺寸。

## 貢獻指南

### 1. 開發環境設定

```bash
# 複製專案
git clone <repo-url>
cd d3-components

# 安裝依賴
pnpm install

# 啟動開發環境
pnpm dev

# 運行測試
pnpm test
```

### 2. 提交規範

使用 Conventional Commits 格式：
```
feat: 新增 scatter-plot 組件
fix: 修復 bar-chart 的資料更新問題
docs: 更新 README
test: 新增 line-chart 測試
```

### 3. Pull Request 流程

1. Fork 專案
2. 創建功能分支：`git checkout -b feature/new-component`
3. 提交變更：`git commit -m "feat: add new component"`
4. 推送分支：`git push origin feature/new-component`
5. 創建 Pull Request

## 路線圖

### Phase 1: 核心功能 (Q3 2025)
- [x] 基礎架構和 CLI 工具
- [ ] BarChart 組件
- [ ] 智慧資料偵測系統
- [ ] 基本資料適配器

### Phase 2: 進階功能 (Q4 2025)
- [ ] LineChart 和 ScatterPlot 組件
- [ ] CompositeChart 系統
- [ ] 更多資料適配器
- [ ] 動畫和互動增強

### Phase 3: 生態系統 (2026)
- [ ] Vue 支援
- [ ] 外掛系統
- [ ] 視覺化建構器
- [ ] 社群組件市場

---

**開發愉快！讓我們一起打造最好用的 D3 組件庫** 🚀