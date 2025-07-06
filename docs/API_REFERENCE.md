# D3 Components API 參考文檔

本文檔提供所有圖表組件的詳細 API 參考資訊。

## 目錄

- [簡化組件](#簡化組件)
- [完整組件](#完整組件)
- [核心模組](#核心模組)
- [資料適配器](#資料適配器)
- [通用類型](#通用類型)

## 簡化組件

簡化組件專為快速使用和學習而設計，提供最基本但完整的功能。

### BarChartSimple

基礎長條圖組件，支援垂直和水平佈局。

#### Props

| 屬性 | 類型 | 預設值 | 描述 |
|------|------|--------|------|
| `data` | `Array<{x: any, y: number}>` | 必填 | 圖表資料 |
| `width` | `number` | `800` | 圖表寬度 |
| `height` | `number` | `400` | 圖表高度 |
| `margin` | `Margin` | `{top: 20, right: 30, bottom: 40, left: 40}` | 圖表邊距 |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | 圖表方向 |
| `colors` | `string[]` | `['#3b82f6', ...]` | 顏色方案 |
| `animate` | `boolean` | `false` | 啟用動畫 |
| `interactive` | `boolean` | `true` | 啟用互動 |
| `showTooltip` | `boolean` | `true` | 顯示提示框 |
| `className` | `string` | - | 自定義 CSS 類別 |
| `onDataClick` | `(data: any) => void` | - | 資料點擊事件 |
| `onHover` | `(data: any) => void` | - | 滑鼠懸停事件 |

#### 使用範例

```tsx
import { BarChartSimple } from '@registry/components/simple'

const data = [
  { x: 'A', y: 100 },
  { x: 'B', y: 200 },
  { x: 'C', y: 150 }
]

function MyChart() {
  return (
    <BarChartSimple
      data={data}
      width={600}
      height={400}
      onDataClick={(data) => console.log('點擊:', data)}
    />
  )
}
```

### SimpleLineChart

基礎線圖組件，支援多系列和時間序列資料。

#### Props

| 屬性 | 類型 | 預設值 | 描述 |
|------|------|--------|------|
| `data` | `SimpleLineChartData[]` | 必填 | 圖表資料 |
| `width` | `number` | `800` | 圖表寬度 |
| `height` | `number` | `400` | 圖表高度 |
| `margin` | `Margin` | `{top: 20, right: 30, bottom: 40, left: 50}` | 圖表邊距 |
| `colors` | `string[]` | `['#3b82f6', ...]` | 顏色方案 |
| `strokeWidth` | `number` | `2` | 線條寬度 |
| `showDots` | `boolean` | `false` | 顯示資料點 |
| `dotRadius` | `number` | `4` | 資料點半徑 |
| `showArea` | `boolean` | `false` | 顯示面積填充 |
| `showGrid` | `boolean` | `true` | 顯示網格線 |
| `curve` | `'linear' \| 'monotone' \| 'step'` | `'monotone'` | 曲線類型 |
| `className` | `string` | - | 自定義 CSS 類別 |
| `onDataClick` | `(data: SimpleLineChartData) => void` | - | 資料點擊事件 |

#### 資料格式

```typescript
interface SimpleLineChartData {
  x: string | number | Date
  y: number
  series?: string  // 系列名稱，用於多系列圖表
}
```

#### 使用範例

```tsx
import { SimpleLineChart } from '@registry/components/simple'

const data = [
  { x: new Date('2024-01-01'), y: 100 },
  { x: new Date('2024-01-02'), y: 120 },
  { x: new Date('2024-01-03'), y: 90 }
]

function MyChart() {
  return (
    <SimpleLineChart
      data={data}
      showDots={true}
      showArea={false}
      curve="monotone"
    />
  )
}
```

### SimplePieChart

基礎餅圖組件，支援圓環圖和圖例。

#### Props

| 屬性 | 類型 | 預設值 | 描述 |
|------|------|--------|------|
| `data` | `SimplePieChartData[]` | 必填 | 圖表資料 |
| `width` | `number` | `400` | 圖表寬度 |
| `height` | `number` | `400` | 圖表高度 |
| `margin` | `Margin` | `{top: 20, right: 20, bottom: 20, left: 20}` | 圖表邊距 |
| `colors` | `string[]` | `['#3b82f6', ...]` | 顏色方案 |
| `innerRadius` | `number` | `0` | 內圓半徑（設為 > 0 創建圓環圖） |
| `outerRadius` | `number` | 自動計算 | 外圓半徑 |
| `showLabels` | `boolean` | `true` | 顯示標籤 |
| `showValues` | `boolean` | `false` | 顯示數值 |
| `showPercentages` | `boolean` | `true` | 顯示百分比 |
| `showLegend` | `boolean` | `true` | 顯示圖例 |
| `legendPosition` | `'right' \| 'bottom'` | `'right'` | 圖例位置 |
| `className` | `string` | - | 自定義 CSS 類別 |
| `onSliceClick` | `(data: SimplePieChartData) => void` | - | 切片點擊事件 |

#### 資料格式

```typescript
interface SimplePieChartData {
  label: string
  value: number
  color?: string  // 可選的自定義顏色
}
```

#### 使用範例

```tsx
import { SimplePieChart } from '@registry/components/simple'

const data = [
  { label: 'Chrome', value: 60 },
  { label: 'Firefox', value: 25 },
  { label: 'Safari', value: 10 },
  { label: 'Edge', value: 5 }
]

function MyChart() {
  return (
    <SimplePieChart
      data={data}
      innerRadius={50}  // 創建圓環圖
      showLegend={true}
      legendPosition="bottom"
    />
  )
}
```

### SimpleScatterPlot

基礎散佈圖組件，支援趨勢線和氣泡圖功能。

#### Props

| 屬性 | 類型 | 預設值 | 描述 |
|------|------|--------|------|
| `data` | `SimpleScatterPlotData[]` | 必填 | 圖表資料 |
| `width` | `number` | `600` | 圖表寬度 |
| `height` | `number` | `400` | 圖表高度 |
| `margin` | `Margin` | `{top: 20, right: 30, bottom: 50, left: 60}` | 圖表邊距 |
| `colors` | `string[]` | `['#3b82f6', ...]` | 顏色方案 |
| `dotRadius` | `number` | `5` | 預設點半徑 |
| `minRadius` | `number` | `3` | 最小點半徑（氣泡圖） |
| `maxRadius` | `number` | `15` | 最大點半徑（氣泡圖） |
| `showTrendLine` | `boolean` | `false` | 顯示趨勢線 |
| `showGrid` | `boolean` | `true` | 顯示網格線 |
| `xLabel` | `string` | `'X 軸'` | X 軸標籤 |
| `yLabel` | `string` | `'Y 軸'` | Y 軸標籤 |
| `className` | `string` | - | 自定義 CSS 類別 |
| `onDotClick` | `(data: SimpleScatterPlotData) => void` | - | 資料點擊事件 |

#### 資料格式

```typescript
interface SimpleScatterPlotData {
  x: number
  y: number
  size?: number    // 可選的點大小（氣泡圖）
  color?: string   // 可選的自定義顏色
  label?: string   // 可選的標籤
}
```

#### 使用範例

```tsx
import { SimpleScatterPlot } from '@registry/components/simple'

const data = [
  { x: 10, y: 20, size: 5, label: '點 A' },
  { x: 20, y: 30, size: 8, label: '點 B' },
  { x: 30, y: 25, size: 6, label: '點 C' }
]

function MyChart() {
  return (
    <SimpleScatterPlot
      data={data}
      showTrendLine={true}
      xLabel="溫度 (°C)"
      yLabel="銷量"
      onDotClick={(data) => alert(`點擊了: ${data.label}`)}
    />
  )
}
```

### SimpleAreaChart

基礎面積圖組件，支援堆疊和百分比模式。

#### Props

| 屬性 | 類型 | 預設值 | 描述 |
|------|------|--------|------|
| `data` | `SimpleAreaChartData[]` | 必填 | 圖表資料 |
| `width` | `number` | `800` | 圖表寬度 |
| `height` | `number` | `400` | 圖表高度 |
| `margin` | `Margin` | `{top: 20, right: 30, bottom: 40, left: 50}` | 圖表邊距 |
| `colors` | `string[]` | `['#3b82f6', ...]` | 顏色方案 |
| `stackMode` | `'none' \| 'stack' \| 'percent'` | `'none'` | 堆疊模式 |
| `curve` | `'linear' \| 'monotone' \| 'step'` | `'monotone'` | 曲線類型 |
| `showLine` | `boolean` | `true` | 顯示邊界線 |
| `lineWidth` | `number` | `2` | 線條寬度 |
| `areaOpacity` | `number` | `0.6` | 面積透明度 |
| `showGrid` | `boolean` | `true` | 顯示網格線 |
| `className` | `string` | - | 自定義 CSS 類別 |
| `onAreaClick` | `(data: SimpleAreaChartData) => void` | - | 面積點擊事件 |

#### 資料格式

```typescript
interface SimpleAreaChartData {
  x: string | number | Date
  y: number
  series?: string  // 系列名稱，用於多系列圖表
}
```

#### 使用範例

```tsx
import { SimpleAreaChart } from '@registry/components/simple'

const data = [
  { x: new Date('2024-01-01'), y: 100, series: 'A' },
  { x: new Date('2024-01-02'), y: 120, series: 'A' },
  { x: new Date('2024-01-01'), y: 80, series: 'B' },
  { x: new Date('2024-01-02'), y: 90, series: 'B' }
]

function MyChart() {
  return (
    <SimpleAreaChart
      data={data}
      stackMode="stack"  // 堆疊模式
      areaOpacity={0.7}
    />
  )
}
```

### SimpleHeatmap

基礎熱力圖組件，支援多種顏色方案。

#### Props

| 屬性 | 類型 | 預設值 | 描述 |
|------|------|--------|------|
| `data` | `SimpleHeatmapData[]` | 必填 | 圖表資料 |
| `width` | `number` | `600` | 圖表寬度 |
| `height` | `number` | `400` | 圖表高度 |
| `margin` | `Margin` | `{top: 40, right: 20, bottom: 60, left: 80}` | 圖表邊距 |
| `colorScheme` | `'blues' \| 'reds' \| 'greens' \| 'purples' \| 'oranges' \| 'viridis'` | `'blues'` | 顏色方案 |
| `showValues` | `boolean` | `true` | 顯示數值 |
| `showAxisLabels` | `boolean` | `true` | 顯示軸標籤 |
| `cellPadding` | `number` | `1` | 格子間距 |
| `className` | `string` | - | 自定義 CSS 類別 |
| `onCellClick` | `(data: SimpleHeatmapData) => void` | - | 格子點擊事件 |

#### 資料格式

```typescript
interface SimpleHeatmapData {
  x: string | number
  y: string | number
  value: number
  label?: string  // 可選的標籤
}
```

#### 使用範例

```tsx
import { SimpleHeatmap } from '@registry/components/simple'

const data = [
  { x: 'Mon', y: 'Morning', value: 5 },
  { x: 'Mon', y: 'Afternoon', value: 8 },
  { x: 'Tue', y: 'Morning', value: 7 },
  { x: 'Tue', y: 'Afternoon', value: 9 }
]

function MyChart() {
  return (
    <SimpleHeatmap
      data={data}
      colorScheme="viridis"
      showValues={true}
      onCellClick={(data) => console.log(`${data.x}, ${data.y}: ${data.value}`)}
    />
  )
}
```

### SimpleCandlestick

基礎 K線圖組件，支援台股和美股顏色模式。

#### Props

| 屬性 | 類型 | 預設值 | 描述 |
|------|------|--------|------|
| `data` | `SimpleCandlestickData[]` | 必填 | 圖表資料 |
| `width` | `number` | `800` | 圖表寬度 |
| `height` | `number` | `400` | 圖表高度 |
| `margin` | `Margin` | `{top: 20, right: 30, bottom: 40, left: 60}` | 圖表邊距 |
| `colorMode` | `'tw' \| 'us' \| 'custom'` | `'tw'` | 顏色模式 |
| `upColor` | `string` | 依模式而定 | 上漲顏色 |
| `downColor` | `string` | 依模式而定 | 下跌顏色 |
| `showVolume` | `boolean` | `false` | 顯示成交量 |
| `className` | `string` | - | 自定義 CSS 類別 |
| `onCandleClick` | `(data: SimpleCandlestickData) => void` | - | K線點擊事件 |

#### 資料格式

```typescript
interface SimpleCandlestickData {
  date: string | Date
  open: number
  high: number
  low: number
  close: number
  volume?: number  // 可選的成交量
}
```

#### 使用範例

```tsx
import { SimpleCandlestick } from '@registry/components/simple'

const data = [
  { date: '2024-01-01', open: 100, high: 110, low: 95, close: 105 },
  { date: '2024-01-02', open: 105, high: 115, low: 100, close: 108 },
  { date: '2024-01-03', open: 108, high: 112, low: 102, close: 107 }
]

function MyChart() {
  return (
    <SimpleCandlestick
      data={data}
      colorMode="tw"  // 台股模式：紅漲綠跌
      showVolume={false}
      onCandleClick={(data) => console.log('選擇日期:', data.date)}
    />
  )
}
```

## 通用類型

### Margin

```typescript
interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}
```

### 顏色方案

內建顏色方案包括：

```typescript
const colorSchemes = {
  default: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  blues: ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
  greens: ['#166534', '#16a34a', '#22c55e', '#4ade80', '#86efac'],
  reds: ['#991b1b', '#dc2626', '#ef4444', '#f87171', '#fca5a5'],
  purples: ['#581c87', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd'],
  oranges: ['#9a3412', '#ea580c', '#f97316', '#fb923c', '#fed7aa']
}
```

## 最佳實踐

### 1. 資料準備

確保資料格式正確且完整：

```tsx
// ✅ 好的做法
const data = [
  { x: 'A', y: 100 },
  { x: 'B', y: 200 },
  { x: 'C', y: 150 }
]

// ❌ 避免缺失值
const badData = [
  { x: 'A', y: 100 },
  { x: 'B' },  // 缺少 y 值
  { x: 'C', y: 150 }
]
```

### 2. 響應式設計

使用容器查詢或視窗監聽來實現響應式圖表：

```tsx
import { useState, useEffect } from 'react'

function ResponsiveChart() {
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

  useEffect(() => {
    function updateSize() {
      const container = document.getElementById('chart-container')
      if (container) {
        setDimensions({
          width: container.offsetWidth,
          height: Math.min(400, container.offsetWidth * 0.6)
        })
      }
    }

    window.addEventListener('resize', updateSize)
    updateSize()
    
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return (
    <div id="chart-container">
      <BarChartSimple
        data={data}
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  )
}
```

### 3. 效能優化

對於大量資料，考慮使用 useMemo 優化：

```tsx
import { useMemo } from 'react'

function OptimizedChart({ rawData }) {
  const processedData = useMemo(() => {
    return rawData.map(item => ({
      x: item.category,
      y: item.value
    }))
  }, [rawData])

  return <BarChartSimple data={processedData} />
}
```

### 4. 無障礙設計

確保圖表對所有用戶都可訪問：

```tsx
function AccessibleChart() {
  return (
    <div>
      <h2>銷售數據圖表</h2>
      <p>此圖表顯示 2024 年各季度的銷售數據</p>
      <BarChartSimple
        data={data}
        className="chart"
        onDataClick={(data) => {
          // 提供鍵盤訪問
          console.log(`選中 ${data.x}：${data.y}`)
        }}
      />
      {/* 提供表格形式的替代內容 */}
      <table className="sr-only">
        <caption>銷售數據表</caption>
        <thead>
          <tr>
            <th>季度</th>
            <th>銷售額</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.x}>
              <td>{item.x}</td>
              <td>{item.y}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### 5. 錯誤處理

始終處理可能的錯誤情況：

```tsx
function RobustChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        無資料可顯示
      </div>
    )
  }

  try {
    return <BarChartSimple data={data} />
  } catch (error) {
    console.error('圖表渲染錯誤:', error)
    return (
      <div className="text-center py-8 text-red-500">
        圖表載入失敗，請稍後再試
      </div>
    )
  }
}
```

## 常見問題

### Q: 如何自定義圖表顏色？

A: 使用 `colors` 屬性傳入自定義顏色陣列：

```tsx
<BarChartSimple
  data={data}
  colors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24']}
/>
```

### Q: 如何處理大量資料？

A: 對於超過 1000 個資料點的情況，建議：

1. 使用資料採樣或聚合
2. 實施虛擬化滾動
3. 考慮使用完整版組件的效能優化功能

### Q: 簡化組件與完整組件的差異？

A: 簡化組件專注於易用性和學習，完整組件提供更多高級功能：

| 特性 | 簡化組件 | 完整組件 |
|------|----------|----------|
| 學習曲線 | 低 | 中等 |
| 自定義程度 | 基本 | 高度 |
| 效能優化 | 基本 | 高級 |
| 資料處理 | 簡單 | 複雜 |
| 動畫效果 | 基本 | 豐富 |

### Q: 如何升級到完整組件？

A: 簡化組件的 API 設計與完整組件相容，升級步驟：

1. 更改 import 路徑
2. 根據需要添加高級配置
3. 測試確保功能正常

```tsx
// 從簡化組件
import { BarChartSimple } from '@registry/components/simple'

// 升級到完整組件
import { BarChart } from '@registry/components/bar-chart/bar-chart'
```