# D3 Components 專案開發指南

## 專案概述

D3 Components 是一個基於 Shadcn/ui 理念的 D3.js 組件庫，提供介於「現成圖表庫」與「純 D3 開發」之間的解決方案。

### 核心理念
- **Copy & Paste**：直接複製完整的組件程式碼到專案中
- **完全透明**：獲得可讀、可修改的 D3 實作
- **智慧資料處理**：自動偵測資料類型並建議最佳映射
- **漸進式複雜度**：從簡單使用到深度客製化
- **疊圖支援**：支援多圖層組合和不同資料源

## 技術架構

### 技術選型
- **前端框架**：React + TypeScript
- **建構工具**：Vite (CLI), ES modules
- **樣式系統**：CSS Variables + Tailwind CSS
- **包管理**：npm (單一 CLI 套件)
- **測試框架**：Vitest + React Testing Library
- **程式碼品質**：ESLint 9.x (flat config) + Prettier 3.x

### 專案結構
```
d3-components/
├── cli/                        # CLI 工具 (唯一的 npm 套件)
│   ├── src/
│   │   ├── commands/
│   │   │   ├── add.ts          # 添加組件
│   │   │   ├── import.ts       # 資料匯入
│   │   │   ├── init.ts         # 專案初始化
│   │   │   └── list.ts         # 列出組件
│   │   ├── utils/
│   │   │   ├── registry.ts     # Registry API
│   │   │   ├── project.ts      # 專案管理
│   │   │   └── templates.ts    # 模板處理
│   │   ├── types/
│   │   └── index.ts            # CLI 入口點
│   ├── package.json            # ES modules, 現代工具鏈
│   └── eslint.config.js        # Flat config 格式
├── registry/                   # 組件註冊表（純程式碼倉庫）
│   ├── components/
│   │   ├── bar-chart/
│   │   │   ├── bar-chart.tsx
│   │   │   ├── bar-chart.css
│   │   │   ├── types.ts
│   │   │   └── config.json
│   │   └── line-chart/
│   ├── utils/                  # 共用工具函數
│   │   ├── data-detector.ts
│   │   └── cn.ts
│   ├── types/                  # TypeScript 型別定義
│   ├── index.json              # 組件索引
│   └── schema.json             # 結構驗證
├── docs/                       # 文件
├── examples/                   # 範例專案
├── scripts/                    # 專案腳本
├── tests/                      # 測試檔案
└── package.json                # 根目錄配置 (private)
```

## 程式語言規範與架構

### TypeScript 規範

#### 1. 型別定義
```typescript
// 嚴格型別，避免 any
interface ComponentConfig {
  name: string
  description: string
  version: string
  dependencies: string[]
  files: FileConfig[]
  variants: string[]
}

// 使用聯合型別而非字串
type ChartType = 'bar' | 'line' | 'area' | 'scatter'
type DataType = 'number' | 'string' | 'date' | 'boolean'
```

#### 2. 函數設計
```typescript
// 使用明確的參數型別和回傳型別
export async function fetchComponentConfig(
  name: string
): Promise<ComponentConfig | null> {
  // 實作...
}

// 使用 Record 型別處理物件映射
export function processTemplateFiles(
  targetDir: string, 
  variables: Record<string, string>
): Promise<void> {
  // 實作...
}
```

#### 3. 錯誤處理
```typescript
// 明確的錯誤型別
class RegistryError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'RegistryError'
  }
}

// 統一錯誤處理模式
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  if (error instanceof RegistryError) {
    // 處理特定錯誤
  } else {
    // 重新拋出未知錯誤
    throw new Error(`操作失敗: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
```

### React 組件架構

#### 1. 組件結構模式
```typescript
export interface BarChartProps {
  data: any[]
  xKey?: string
  yKey?: string
  width?: number
  height?: number
  margin?: Margin
  className?: string
  
  // 資料映射 (多種方式)
  xAccessor?: (d: any) => any
  yAccessor?: (d: any) => any
  mapping?: DataMapping
  
  // 樣式和行為
  colors?: string[]
  animate?: boolean
  interactive?: boolean
  
  // 事件處理
  onDataClick?: (data: any) => void
  onHover?: (data: any) => void
}

export function BarChart({
  data,
  xKey,
  yKey,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 40 },
  className,
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

#### 2. Hook 設計原則
```typescript
// 自訂 Hook 遵循單一職責
export function useChartData(data: any[], mapping: DataMapping) {
  return useMemo(() => {
    return processDataWithMapping(data, mapping)
  }, [data, mapping])
}

export function useChartScales(data: any[], dimensions: ChartDimensions) {
  return useMemo(() => {
    return calculateScales(data, dimensions)
  }, [data, dimensions])
}
```

### D3 整合規範

#### 1. DOM 操作分離
```typescript
// React 負責 SVG 容器，D3 負責內容渲染
function renderChart(
  svg: SVGSVGElement, 
  data: any[], 
  scales: ChartScales
) {
  const d3Svg = select(svg)
  
  // 清除舊內容
  d3Svg.selectAll('*').remove()
  
  // D3 渲染邏輯
  const bars = d3Svg
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    // ... 其他屬性
}
```

#### 2. 響應式設計
```typescript
// 使用 ResizeObserver 處理容器大小變化
export function useChartResize(ref: RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  
  useEffect(() => {
    if (!ref.current) return
    
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })
    
    resizeObserver.observe(ref.current)
    return () => resizeObserver.disconnect()
  }, [ref])
  
  return dimensions
}
```

### CLI 工具架構

#### 1. 命令結構
```typescript
// 使用 Commander.js 的標準模式
program
  .command('add <component>')
  .description('添加組件到專案中')
  .option('-v, --variant <variant>', '選擇組件變體')
  .option('-d, --dir <directory>', '目標目錄', './src/components/ui')
  .option('--dry-run', '預覽變更但不實際執行')
  .action(addCommand)
```

#### 2. 非同步錯誤處理
```typescript
export async function addCommand(componentName: string, options: AddOptions) {
  try {
    const spinner = ora('檢查專案環境...').start()
    
    await validateProject()
    spinner.succeed('專案環境檢查完成')
    
    // 其他操作...
    
  } catch (error) {
    const errorSpinner = ora().start()
    errorSpinner.fail('添加組件失敗')
    
    console.error(chalk.red(`錯誤: ${error instanceof Error ? error.message : 'Unknown error'}`))
    
    if (process.env.DEBUG) {
      console.error(error)
    }
    
    process.exit(1)
  }
}
```

## 功能與技術需求

### 核心功能需求

#### 1. CLI 工具功能
- **add 命令**：從 Registry 下載組件到本地專案
- **list 命令**：列出所有可用組件
- **init 命令**：初始化專案設定
- **import 命令**：資料匯入和圖表生成

#### 2. 組件功能
- **基礎圖表**：BarChart, LineChart, ScatterPlot, AreaChart
- **資料處理**：自動型別偵測、映射建議、資料清理
- **互動功能**：Hover, Click, Zoom, Brush
- **響應式**：支援容器大小變化
- **客製化**：樣式、顏色、動畫

#### 3. 資料適配器
- **CSV 適配器**：處理 CSV 檔案匯入
- **JSON 適配器**：處理 JSON 資料格式
- **時間序列適配器**：處理時間相關資料
- **巢狀資料適配器**：處理複雜物件結構

### 技術需求

#### 1. 效能要求
- **建構時間**：CLI 建構時間 < 5 秒
- **執行時間**：add 命令執行時間 < 3 秒
- **記憶體使用**：渲染 1000 個資料點 < 100MB
- **檔案大小**：單一組件 bundle < 50KB

#### 2. 相容性要求
- **Node.js**：>= 18.0.0
- **React**：>= 18.0.0
- **TypeScript**：>= 5.0.0
- **瀏覽器**：現代瀏覽器 (ES2020+)

#### 3. 品質要求
- **型別安全**：100% TypeScript 覆蓋率
- **測試覆蓋率**：> 80%
- **程式碼品質**：ESLint 0 錯誤、0 警告
- **文件完整性**：所有公開 API 都有文件

## 錯誤處理與測試標準

### 錯誤處理標準

#### 1. 錯誤分類
```typescript
// 網路錯誤
class NetworkError extends Error {
  constructor(message: string, public url: string) {
    super(`網路請求失敗: ${message}`)
    this.name = 'NetworkError'
  }
}

// 驗證錯誤
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(`驗證失敗: ${message}`)
    this.name = 'ValidationError'
  }
}

// 檔案系統錯誤
class FileSystemError extends Error {
  constructor(message: string, public path: string) {
    super(`檔案操作失敗: ${message}`)
    this.name = 'FileSystemError'
  }
}
```

#### 2. 錯誤處理模式
```typescript
// 統一錯誤處理函數
export function handleError(error: unknown, context: string): never {
  if (error instanceof NetworkError) {
    console.error(chalk.red(`網路錯誤 (${context}): ${error.message}`))
    console.error(chalk.gray(`URL: ${error.url}`))
  } else if (error instanceof ValidationError) {
    console.error(chalk.red(`驗證錯誤 (${context}): ${error.message}`))
    console.error(chalk.gray(`欄位: ${error.field}`))
  } else {
    console.error(chalk.red(`未知錯誤 (${context}): ${error instanceof Error ? error.message : String(error)}`))
  }
  
  if (process.env.DEBUG && error instanceof Error) {
    console.error(chalk.gray('詳細錯誤:'), error.stack)
  }
  
  process.exit(1)
}
```

#### 3. 優雅降級
```typescript
// 快取機制處理網路問題
export async function fetchWithFallback<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string
): Promise<T> {
  try {
    const result = await fetchFn()
    await setCacheItem(cacheKey, result)
    return result
  } catch (error) {
    console.warn(chalk.yellow('使用快取資料 (網路連線問題)'))
    const cached = await getCacheItem<T>(cacheKey)
    if (cached) {
      return cached
    }
    throw error
  }
}
```

### 測試標準

#### 1. 單元測試
```typescript
// 工具函數測試
describe('dataProcessor', () => {
  test('should process simple CSV data correctly', () => {
    const input = [
      { name: 'A', value: '10' },
      { name: 'B', value: '20' }
    ]
    const result = processDataWithMapping(input, { x: 'name', y: 'value' })
    
    expect(result).toEqual([
      { x: 'A', y: 10, originalData: input[0] },
      { x: 'B', y: 20, originalData: input[1] }
    ])
  })
  
  test('should handle missing data gracefully', () => {
    const input = [
      { name: 'A', value: null },
      { name: 'B', value: '20' }
    ]
    const result = processDataWithMapping(input, { x: 'name', y: 'value' })
    
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ x: 'B', y: 20, originalData: input[1] })
  })
})
```

#### 2. 組件測試
```typescript
// React 組件測試
import { render, screen } from '@testing-library/react'
import { BarChart } from './bar-chart'

describe('BarChart', () => {
  const mockData = [
    { category: 'A', value: 10 },
    { category: 'B', value: 20 }
  ]
  
  test('renders chart with correct dimensions', () => {
    render(
      <BarChart 
        data={mockData} 
        xKey="category" 
        yKey="value" 
        width={400} 
        height={300} 
      />
    )
    
    const svg = screen.getByRole('img')
    expect(svg).toHaveAttribute('width', '400')
    expect(svg).toHaveAttribute('height', '300')
  })
  
  test('handles data updates correctly', () => {
    const { rerender } = render(
      <BarChart data={mockData} xKey="category" yKey="value" />
    )
    
    const newData = [...mockData, { category: 'C', value: 30 }]
    rerender(
      <BarChart data={newData} xKey="category" yKey="value" />
    )
    
    // 驗證圖表更新
    expect(screen.getByText('C')).toBeInTheDocument()
  })
})
```

#### 3. 整合測試
```typescript
// CLI 命令測試
import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'

describe('CLI Integration', () => {
  const testDir = '/tmp/d3-components-test'
  
  beforeEach(async () => {
    await fs.ensureDir(testDir)
    process.chdir(testDir)
    
    // 建立 package.json
    await fs.writeJSON('package.json', {
      name: 'test-project',
      dependencies: { react: '^18.0.0' }
    })
  })
  
  afterEach(async () => {
    await fs.remove(testDir)
  })
  
  test('add command should download component files', () => {
    const result = execSync('d3-components add bar-chart --dry-run', {
      encoding: 'utf8'
    })
    
    expect(result).toContain('預覽模式')
    expect(result).toContain('bar-chart.tsx')
  })
})
```

#### 4. 測試覆蓋率要求
- **函數覆蓋率**：> 90%
- **分支覆蓋率**：> 80%
- **語句覆蓋率**：> 85%
- **關鍵路徑**：100% (錯誤處理、資料處理)

#### 5. 效能測試
```typescript
// 效能基準測試
describe('Performance', () => {
  test('should render 1000 data points within 100ms', async () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      x: i,
      y: Math.random() * 100
    }))
    
    const start = performance.now()
    
    render(<BarChart data={largeData} xKey="x" yKey="y" />)
    
    const end = performance.now()
    expect(end - start).toBeLessThan(100)
  })
})
```

## 開發工作流程

### 1. Git 工作流程
- 使用 Conventional Commits 格式
- 主分支：`main`
- 功能分支：`feature/[component-name]`
- 修復分支：`fix/[issue-description]`

### 2. 程式碼審查標準
- 所有 PR 必須通過 CI/CD
- 程式碼必須有對應測試
- ESLint 和 Prettier 檢查通過
- 至少一位核心成員審查

### 3. 發布流程
- CLI 工具使用語意化版本
- Registry 組件使用日期版本 (YYYY-MM-DD)
- 自動化建構和發布

### 4. 文件維護
- API 文件隨程式碼更新
- 範例程式碼保持最新
- 架構決策記錄在 ADR 中

---

**此文件為 D3 Components 專案的核心開發指南，所有開發活動都應遵循此規範。**