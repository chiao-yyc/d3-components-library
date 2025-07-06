# D3 Components 最佳實踐指南

本指南提供使用 D3 Components 的最佳實踐，幫助您創建高品質的資料視覺化應用。

## 目錄

- [資料準備](#資料準備)
- [組件選擇](#組件選擇)
- [效能優化](#效能優化)
- [響應式設計](#響應式設計)
- [無障礙設計](#無障礙設計)
- [錯誤處理](#錯誤處理)
- [測試策略](#測試策略)
- [部署考量](#部署考量)

## 資料準備

### 1. 資料格式標準化

確保資料格式一致且完整：

```tsx
// ✅ 好的做法：標準化資料格式
const cleanData = rawData.map(item => ({
  x: String(item.category || '未知'),
  y: Number(item.value) || 0,
  timestamp: new Date(item.date)
})).filter(item => !isNaN(item.y))

// ❌ 避免：不一致的資料格式
const inconsistentData = [
  { category: 'A', value: 100 },
  { cat: 'B', val: '200' },  // 不同的欄位名稱
  { category: 'C' }          // 缺少 value
]
```

### 2. 資料驗證

實施嚴格的資料驗證：

```tsx
function validateChartData(data: any[]): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('資料必須是非空陣列')
    return false
  }

  const requiredFields = ['x', 'y']
  const isValid = data.every(item => {
    return requiredFields.every(field => 
      item.hasOwnProperty(field) && item[field] != null
    )
  })

  if (!isValid) {
    console.warn('資料缺少必需欄位：', requiredFields)
  }

  return isValid
}

// 使用範例
function SafeChart({ data }) {
  if (!validateChartData(data)) {
    return <div>資料格式錯誤</div>
  }

  return <BarChartSimple data={data} />
}
```

### 3. 資料轉換模式

建立可重用的資料轉換函數：

```tsx
// 通用資料轉換器
const dataTransformers = {
  // 時間序列資料
  timeSeries: (data: any[]) => 
    data.map(item => ({
      x: new Date(item.date),
      y: Number(item.value),
      series: item.category
    })),

  // 分類資料
  categorical: (data: any[]) =>
    data.map(item => ({
      x: String(item.label),
      y: Number(item.count)
    })),

  // 階層資料轉換為平面資料
  hierarchical: (data: any) => {
    const result = []
    function flatten(node: any, prefix = '') {
      const label = prefix ? `${prefix}.${node.name}` : node.name
      if (node.value !== undefined) {
        result.push({ x: label, y: node.value })
      }
      if (node.children) {
        node.children.forEach(child => flatten(child, label))
      }
    }
    flatten(data)
    return result
  }
}

// 使用範例
function FlexibleChart({ rawData, dataType }) {
  const transformedData = dataTransformers[dataType]?.(rawData) || rawData
  return <BarChartSimple data={transformedData} />
}
```

## 組件選擇

### 1. 選擇適當的圖表類型

根據資料特性選擇最適合的圖表：

```tsx
function getRecommendedChart(dataAnalysis: {
  hasTimeData: boolean
  hasCategoricalData: boolean
  hasMultipleSeries: boolean
  dataCount: number
  hasGeographicData: boolean
}) {
  const { hasTimeData, hasCategoricalData, hasMultipleSeries, dataCount } = dataAnalysis

  if (hasTimeData && hasMultipleSeries) {
    return 'SimpleLineChart' // 時間序列多系列
  }
  
  if (hasTimeData) {
    return 'SimpleAreaChart' // 時間序列單系列
  }
  
  if (hasCategoricalData && dataCount <= 10) {
    return 'SimplePieChart' // 少量分類資料
  }
  
  if (hasCategoricalData) {
    return 'BarChartSimple' // 分類比較
  }
  
  return 'SimpleScatterPlot' // 數值關係
}

// 智能圖表選擇器
function SmartChart({ data }) {
  const analysis = useMemo(() => ({
    hasTimeData: data.some(d => d.x instanceof Date),
    hasCategoricalData: data.some(d => typeof d.x === 'string'),
    hasMultipleSeries: data.some(d => d.series),
    dataCount: data.length
  }), [data])

  const ChartComponent = getRecommendedChart(analysis)
  
  return React.createElement(ChartComponent, { data })
}
```

### 2. 簡化 vs 完整組件

選擇指南：

| 使用場景 | 推薦選擇 | 原因 |
|----------|----------|------|
| 快速原型 | 簡化組件 | 快速上手，最少配置 |
| 學習目的 | 簡化組件 | API 簡單，易於理解 |
| 產品環境 | 完整組件 | 更多自定義選項 |
| 複雜資料 | 完整組件 | 高級資料處理功能 |
| 高效能需求 | 完整組件 | 效能優化功能 |

## 效能優化

### 1. 資料記憶化

使用 `useMemo` 避免不必要的資料處理：

```tsx
function OptimizedChart({ rawData, filters }) {
  // ✅ 記憶化資料處理
  const processedData = useMemo(() => {
    return rawData
      .filter(item => filters.categories.includes(item.category))
      .map(item => ({
        x: item.date,
        y: item.value,
        series: item.category
      }))
      .sort((a, b) => a.x.getTime() - b.x.getTime())
  }, [rawData, filters])

  // ✅ 記憶化圖表配置
  const chartConfig = useMemo(() => ({
    width: 800,
    height: 400,
    margin: { top: 20, right: 30, bottom: 40, left: 50 },
    colors: ['#3b82f6', '#ef4444', '#10b981']
  }), [])

  return (
    <SimpleLineChart
      data={processedData}
      {...chartConfig}
    />
  )
}
```

### 2. 資料採樣

對於大型資料集，實施智能採樣：

```tsx
function sampleData(data: any[], maxPoints: number = 1000) {
  if (data.length <= maxPoints) return data

  const step = Math.ceil(data.length / maxPoints)
  const sampled = []
  
  for (let i = 0; i < data.length; i += step) {
    sampled.push(data[i])
  }
  
  // 確保包含最後一個資料點
  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1])
  }
  
  return sampled
}

function LargeDataChart({ data }) {
  const sampledData = useMemo(() => sampleData(data, 500), [data])
  
  return (
    <div>
      <SimpleLineChart data={sampledData} />
      {data.length > 500 && (
        <p className="text-sm text-gray-500 mt-2">
          顯示 {sampledData.length} / {data.length} 個資料點
        </p>
      )}
    </div>
  )
}
```

### 3. 懶載入

實施組件懶載入：

```tsx
import { lazy, Suspense } from 'react'

const HeavyChart = lazy(() => import('./HeavyChart'))

function LazyChartContainer({ shouldLoad, data }) {
  if (!shouldLoad) {
    return (
      <div className="h-64 bg-gray-100 flex items-center justify-center">
        <button onClick={() => setShouldLoad(true)}>
          載入圖表
        </button>
      </div>
    )
  }

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  )
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse h-64 bg-gray-200 rounded">
      <div className="h-8 bg-gray-300 rounded mb-4"></div>
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 rounded" style={{
            width: `${Math.random() * 40 + 60}%`
          }}></div>
        ))}
      </div>
    </div>
  )
}
```

## 響應式設計

### 1. 容器查詢

使用 ResizeObserver 實現真正的容器響應式：

```tsx
import { useState, useEffect, useRef } from 'react'

function useContainerSize() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 800, height: 400 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setSize({
        width: Math.max(300, width - 32), // 減去 padding
        height: Math.max(200, Math.min(height, width * 0.6))
      })
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  return { containerRef, size }
}

function ResponsiveChart({ data }) {
  const { containerRef, size } = useContainerSize()

  return (
    <div ref={containerRef} className="w-full p-4">
      <BarChartSimple
        data={data}
        width={size.width}
        height={size.height}
      />
    </div>
  )
}
```

### 2. 斷點配置

定義響應式配置：

```tsx
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
}

function getResponsiveConfig(width: number) {
  if (width < breakpoints.sm) {
    return {
      margin: { top: 10, right: 20, bottom: 30, left: 40 },
      showLegend: false,
      fontSize: 10
    }
  }
  
  if (width < breakpoints.md) {
    return {
      margin: { top: 15, right: 25, bottom: 35, left: 45 },
      showLegend: true,
      legendPosition: 'bottom',
      fontSize: 11
    }
  }
  
  return {
    margin: { top: 20, right: 30, bottom: 40, left: 50 },
    showLegend: true,
    legendPosition: 'right',
    fontSize: 12
  }
}

function AdaptiveChart({ data }) {
  const { size } = useContainerSize()
  const config = getResponsiveConfig(size.width)

  return (
    <SimplePieChart
      data={data}
      width={size.width}
      height={size.height}
      {...config}
    />
  )
}
```

## 無障礙設計

### 1. 語意化標記

提供適當的 ARIA 標籤和語意化結構：

```tsx
function AccessibleChart({ data, title, description }) {
  const chartId = useId()
  const descriptionId = useId()

  return (
    <section
      role="img"
      aria-labelledby={chartId}
      aria-describedby={descriptionId}
    >
      <h2 id={chartId}>{title}</h2>
      <p id={descriptionId} className="sr-only">
        {description}
      </p>
      
      <BarChartSimple
        data={data}
        onDataClick={(data) => {
          // 宣告選擇的資料點
          announce(`選中 ${data.x}，數值 ${data.y}`)
        }}
      />

      {/* 提供表格格式的替代內容 */}
      <details className="mt-4">
        <summary>查看資料表格</summary>
        <table className="w-full mt-2 border">
          <thead>
            <tr>
              <th className="border p-2">類別</th>
              <th className="border p-2">數值</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.x}</td>
                <td className="border p-2">{item.y}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  )
}

// 螢幕閱讀器宣告功能
function announce(message: string) {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  setTimeout(() => document.body.removeChild(announcement), 1000)
}
```

### 2. 鍵盤導航

實現鍵盤訪問功能：

```tsx
function KeyboardAccessibleChart({ data }) {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const chartRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        setFocusedIndex(prev => Math.min(data.length - 1, prev + 1))
        break
      case 'ArrowLeft':
        event.preventDefault()
        setFocusedIndex(prev => Math.max(0, prev - 1))
        break
      case 'Home':
        event.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        event.preventDefault()
        setFocusedIndex(data.length - 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (focusedIndex >= 0) {
          handleDataClick(data[focusedIndex])
        }
        break
    }
  }

  return (
    <div
      ref={chartRef}
      tabIndex={0}
      role="application"
      aria-label="互動式圖表，使用方向鍵導航"
      onKeyDown={handleKeyDown}
      className="focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <BarChartSimple
        data={data}
        onDataClick={handleDataClick}
      />
      
      {focusedIndex >= 0 && (
        <div className="sr-only" aria-live="polite">
          當前選中：{data[focusedIndex].x}，數值：{data[focusedIndex].y}
        </div>
      )}
    </div>
  )
}
```

### 3. 顏色對比

確保足夠的顏色對比度：

```tsx
// 計算對比度
function getContrastRatio(color1: string, color2: string): number {
  // 簡化的對比度計算
  // 實際應用中應使用完整的 WCAG 對比度算法
  const getLuminance = (color: string) => {
    const rgb = hexToRgb(color)
    return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  }

  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

// 無障礙顏色方案
const accessibleColors = {
  high_contrast: [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', 
    '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'
  ],
  colorblind_friendly: [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
    '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'
  ]
}

function AccessibleColorChart({ data, accessibilityMode = 'normal' }) {
  const colors = accessibilityMode === 'high_contrast' 
    ? accessibleColors.high_contrast
    : accessibilityMode === 'colorblind_friendly'
    ? accessibleColors.colorblind_friendly
    : undefined

  return (
    <BarChartSimple
      data={data}
      colors={colors}
    />
  )
}
```

## 錯誤處理

### 1. 錯誤邊界

建立圖表專用的錯誤邊界：

```tsx
interface ChartErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ChartErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ChartErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('圖表渲染錯誤:', error, errorInfo)
    
    // 發送錯誤報告到監控服務
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track('Chart Error', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-red-200 rounded-lg p-6 bg-red-50">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-red-800 font-medium">圖表載入失敗</h3>
          </div>
          <p className="text-red-700 text-sm mb-4">
            圖表渲染時發生錯誤，請稍後再試或聯繫技術支援。
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
          >
            重新載入
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// 使用範例
function SafeChartWrapper({ data }) {
  return (
    <ChartErrorBoundary>
      <BarChartSimple data={data} />
    </ChartErrorBoundary>
  )
}
```

### 2. 資料驗證錯誤

提供清楚的資料錯誤訊息：

```tsx
function validateAndDisplayChart({ data, chartType }) {
  const validation = validateChartData(data, chartType)
  
  if (!validation.isValid) {
    return (
      <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
        <h4 className="text-yellow-800 font-medium mb-2">資料格式問題</h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          {validation.errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
        {validation.suggestions.length > 0 && (
          <div className="mt-3">
            <p className="text-yellow-800 font-medium text-sm">建議修正：</p>
            <ul className="text-yellow-700 text-sm space-y-1">
              {validation.suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  const ChartComponent = getChartComponent(chartType)
  return <ChartComponent data={data} />
}

function validateChartData(data: any[], chartType: string) {
  const errors = []
  const suggestions = []

  if (!Array.isArray(data)) {
    errors.push('資料必須是陣列格式')
    suggestions.push('確保傳入的資料是陣列：[{x: "A", y: 100}, ...]')
  } else if (data.length === 0) {
    errors.push('資料陣列不能為空')
    suggestions.push('至少提供一筆資料')
  } else {
    // 檢查必需欄位
    const requiredFields = getRequiredFields(chartType)
    const missingFields = requiredFields.filter(field => 
      !data.every(item => item.hasOwnProperty(field))
    )

    if (missingFields.length > 0) {
      errors.push(`缺少必需欄位：${missingFields.join(', ')}`)
      suggestions.push(`確保每筆資料都包含：${requiredFields.join(', ')}`)
    }

    // 檢查資料類型
    const invalidItems = data.filter(item => {
      if (chartType === 'bar' || chartType === 'line') {
        return typeof item.y !== 'number' || isNaN(item.y)
      }
      return false
    })

    if (invalidItems.length > 0) {
      errors.push(`發現 ${invalidItems.length} 筆無效的數值資料`)
      suggestions.push('確保 y 值都是有效數字')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions
  }
}
```

## 測試策略

### 1. 單元測試

測試圖表組件的基本功能：

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BarChartSimple } from '@registry/components/simple'

describe('BarChartSimple', () => {
  const mockData = [
    { x: 'A', y: 100 },
    { x: 'B', y: 200 },
    { x: 'C', y: 150 }
  ]

  test('渲染基本圖表', () => {
    render(<BarChartSimple data={mockData} />)
    
    // 檢查 SVG 元素存在
    const svg = screen.getByRole('img', { hidden: true })
    expect(svg).toBeInTheDocument()
  })

  test('處理點擊事件', () => {
    const handleClick = jest.fn()
    render(
      <BarChartSimple 
        data={mockData} 
        onDataClick={handleClick}
      />
    )

    // 模擬點擊第一個柱子
    const bars = screen.getAllByTestId('bar')
    fireEvent.click(bars[0])
    
    expect(handleClick).toHaveBeenCalledWith(mockData[0])
  })

  test('處理空資料', () => {
    render(<BarChartSimple data={[]} />)
    
    expect(screen.getByText(/無.*資料/)).toBeInTheDocument()
  })

  test('響應尺寸變化', () => {
    const { rerender } = render(
      <BarChartSimple data={mockData} width={400} height={300} />
    )

    let svg = screen.getByRole('img', { hidden: true })
    expect(svg).toHaveAttribute('width', '400')
    expect(svg).toHaveAttribute('height', '300')

    rerender(
      <BarChartSimple data={mockData} width={600} height={400} />
    )

    svg = screen.getByRole('img', { hidden: true })
    expect(svg).toHaveAttribute('width', '600')
    expect(svg).toHaveAttribute('height', '400')
  })
})
```

### 2. 視覺回歸測試

使用 Storybook 和視覺測試工具：

```tsx
// Button.stories.tsx
export default {
  title: 'Charts/BarChartSimple',
  component: BarChartSimple,
  parameters: {
    layout: 'centered',
  },
}

export const Default = {
  args: {
    data: [
      { x: 'A', y: 100 },
      { x: 'B', y: 200 },
      { x: 'C', y: 150 }
    ],
    width: 400,
    height: 300
  }
}

export const WithLargeDataset = {
  args: {
    data: Array.from({ length: 50 }, (_, i) => ({
      x: `Item ${i + 1}`,
      y: Math.random() * 1000
    })),
    width: 800,
    height: 400
  }
}

export const DarkTheme = {
  args: {
    ...Default.args,
    colors: ['#60a5fa', '#34d399', '#fbbf24', '#f87171']
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
}
```

### 3. 整合測試

測試圖表與其他組件的整合：

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from './Dashboard'

describe('Dashboard 整合測試', () => {
  test('篩選器影響圖表顯示', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)

    // 檢查初始狀態
    expect(screen.getByText('全部資料')).toBeInTheDocument()

    // 選擇篩選器
    await user.selectOptions(
      screen.getByLabelText('選擇類別'),
      'category-a'
    )

    // 等待圖表更新
    await waitFor(() => {
      expect(screen.getByText('類別 A 資料')).toBeInTheDocument()
    })
  })

  test('多個圖表同步更新', async () => {
    render(<Dashboard />)

    // 模擬資料變更
    const refreshButton = screen.getByText('重新整理')
    await user.click(refreshButton)

    // 檢查所有圖表都已更新
    await waitFor(() => {
      const charts = screen.getAllByRole('img', { hidden: true })
      expect(charts).toHaveLength(3)
    })
  })
})
```

## 部署考量

### 1. 打包優化

優化圖表庫的打包配置：

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 分離 D3 相關的代碼
        d3: {
          test: /[\\/]node_modules[\\/]d3/,
          name: 'd3-vendor',
          chunks: 'all',
        },
        // 分離圖表組件
        charts: {
          test: /[\\/]src[\\/]components[\\/]charts/,
          name: 'charts',
          chunks: 'all',
        }
      }
    }
  },
  
  // 外部化大型依賴
  externals: {
    'd3': 'D3'  // 如果 D3 從 CDN 載入
  }
}
```

### 2. CDN 策略

對於大型應用，考慮 CDN 部署：

```html
<!-- 在 HTML 中載入 D3 -->
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>

<!-- 然後載入你的圖表庫 -->
<script src="./dist/charts.min.js"></script>
```

### 3. 效能監控

實施圖表效能監控：

```tsx
function PerformanceMonitoredChart({ data, chartType }) {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // 記錄效能指標
      if (typeof window !== 'undefined' && window.analytics) {
        window.analytics.track('Chart Render Performance', {
          chartType,
          dataSize: data.length,
          renderTime,
          isSlowRender: renderTime > 100
        })
      }
      
      // 如果渲染時間過長，發出警告
      if (renderTime > 500) {
        console.warn(`圖表 ${chartType} 渲染時間過長: ${renderTime}ms`)
      }
    }
  }, [data, chartType])

  return <BarChartSimple data={data} />
}
```

### 4. 瀏覽器兼容性

確保跨瀏覽器兼容：

```tsx
// 檢查瀏覽器支援
function checkBrowserSupport() {
  const requiredFeatures = [
    'SVG',
    'ResizeObserver',
    'IntersectionObserver'
  ]

  const unsupported = requiredFeatures.filter(feature => {
    switch (feature) {
      case 'SVG':
        return !document.createElementNS
      case 'ResizeObserver':
        return typeof ResizeObserver === 'undefined'
      case 'IntersectionObserver':
        return typeof IntersectionObserver === 'undefined'
      default:
        return false
    }
  })

  return {
    isSupported: unsupported.length === 0,
    unsupportedFeatures: unsupported
  }
}

function BrowserCompatibleChart({ data }) {
  const { isSupported, unsupportedFeatures } = checkBrowserSupport()

  if (!isSupported) {
    return (
      <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
        <h4 className="text-orange-800 font-medium mb-2">瀏覽器兼容性問題</h4>
        <p className="text-orange-700 text-sm">
          您的瀏覽器不支援以下功能：{unsupportedFeatures.join(', ')}
        </p>
        <p className="text-orange-700 text-sm mt-2">
          請升級到現代瀏覽器以獲得最佳體驗。
        </p>
      </div>
    )
  }

  return <BarChartSimple data={data} />
}
```

## 總結

遵循這些最佳實踐將幫助您：

1. **創建高品質的圖表** - 通過適當的資料準備和組件選擇
2. **確保優秀的效能** - 通過記憶化、採樣和懶載入
3. **提供無障礙體驗** - 通過語意化標記和鍵盤導航
4. **建立穩健的應用** - 通過錯誤處理和測試
5. **優化部署效果** - 通過打包優化和效能監控

記住，好的資料視覺化不僅要美觀，更要實用、可訪問和可維護。始終以用戶需求為中心，持續優化和改進您的圖表實現。