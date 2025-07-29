# D3 Components 常見問題

本文檔回答使用 D3 Components 時的常見問題和疑難排解。

## 目錄

- [安裝和設置](#安裝和設置)
- [組件使用](#組件使用)
- [資料格式](#資料格式)
- [樣式和自定義](#樣式和自定義)
- [效能問題](#效能問題)
- [錯誤排除](#錯誤排除)
- [瀏覽器兼容性](#瀏覽器兼容性)
- [進階功能](#進階功能)

## 安裝和設置

### Q: 如何安裝 D3 Components？

A: 目前 D3 Components 是作為項目的一部分提供。您可以：

1. **克隆整個項目**：
```bash
git clone [repository-url]
cd d3-components
npm install
```

2. **複製所需組件**：
將 `registry/components` 目錄中的組件複製到您的項目中。

3. **確保依賴項**：
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "d3": "^7.0.0"
  }
}
```

### Q: 是否需要單獨安裝 D3？

A: 是的，D3 是對等依賴項。您需要單獨安裝：

```bash
npm install d3 @types/d3
```

### Q: 如何設置 TypeScript 支援？

A: 確保您的 `tsconfig.json` 包含：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

## 組件使用

### Q: 如何選擇適合的圖表組件？

A: 根據數據類型和使用場景選擇：

| 組件類型 | 適用場景 | 推薦組件 |
|----------|----------|----------|
| **基礎圖表** | 一般數據視覺化、商業報表 | bar-chart, line-chart, pie-chart |
| **統計圖表** | 統計分析、數據探索 | box-plot, violin-plot, scatter-plot |
| **金融圖表** | 金融數據、股票分析 | candlestick-chart, gauge-chart |
| **複合圖表** | 多維度數據展示 | combo-chart, enhanced-combo-chart |

**建議**：
- 商業報表使用基礎圖表組件
- 統計分析使用統計圖表組件
- 金融應用使用金融圖表組件

### Q: 如何使用不同類型的圖表組件？

A: 使用步驟：

1. **選擇合適的組件**：
```tsx
// 基礎圖表
import { BarChart } from '@registry/components/basic/bar-chart'

// 統計圖表
import { BoxPlot } from '@registry/components/statistical/box-plot'

// 金融圖表
import { CandlestickChart } from '@registry/components/financial/candlestick-chart'
```

2. **配置組件屬性**：
```tsx
<BarChart 
  data={data}
  width={800}
  height={400}
  xKey="category"
  yKey="value"
/>
```

3. **添加互動功能**（可選）：
```tsx
<BarChart 
  data={data}
  onDataClick={(data) => console.log('點擊:', data)}
  showTooltip={true}
  animate={true}
/>
```

### Q: 如何選擇合適的圖表類型？

A: 根據資料特性選擇：

```tsx
function getChartRecommendation(data) {
  // 時間序列資料
  if (data.some(d => d.x instanceof Date)) {
    return data.some(d => d.series) ? 'SimpleLineChart' : 'SimpleAreaChart'
  }
  
  // 分類資料
  if (data.some(d => typeof d.x === 'string')) {
    return data.length <= 8 ? 'SimplePieChart' : 'BarChartSimple'
  }
  
  // 數值關係
  if (data.some(d => typeof d.x === 'number' && typeof d.y === 'number')) {
    return 'SimpleScatterPlot'
  }
  
  return 'BarChartSimple' // 預設選擇
}
```

## 資料格式

### Q: 資料格式要求是什麼？

A: 每種圖表的基本資料格式：

**長條圖**：
```tsx
const data = [
  { x: 'Category A', y: 100 },
  { x: 'Category B', y: 200 }
]
```

**線圖**：
```tsx
const data = [
  { x: new Date('2024-01-01'), y: 100, series: 'Series 1' },
  { x: new Date('2024-01-02'), y: 120, series: 'Series 1' }
]
```

**餅圖**：
```tsx
const data = [
  { label: 'Chrome', value: 60 },
  { label: 'Firefox', value: 25 }
]
```

### Q: 如何處理缺失資料？

A: 提供幾種策略：

```tsx
// 1. 過濾掉缺失值
const cleanData = rawData.filter(d => d.value != null && !isNaN(d.value))

// 2. 填補缺失值
const filledData = rawData.map(d => ({
  ...d,
  value: d.value ?? 0  // 用 0 填補
}))

// 3. 插值填補（適用於時間序列）
function interpolateMissingValues(data) {
  const result = [...data]
  for (let i = 1; i < result.length - 1; i++) {
    if (result[i].value == null) {
      const prev = result[i - 1].value
      const next = result[i + 1].value
      if (prev != null && next != null) {
        result[i].value = (prev + next) / 2
      }
    }
  }
  return result
}
```

### Q: 如何處理大型資料集？

A: 對於超過 1000 個資料點：

```tsx
// 1. 資料採樣
function sampleData(data, maxPoints = 500) {
  if (data.length <= maxPoints) return data
  
  const step = Math.ceil(data.length / maxPoints)
  return data.filter((_, index) => index % step === 0)
}

// 2. 聚合資料
function aggregateByTime(data, interval = 'hour') {
  const grouped = d3.group(data, d => {
    const date = new Date(d.timestamp)
    if (interval === 'hour') {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours())
    }
    // 其他間隔...
  })
  
  return Array.from(grouped, ([key, values]) => ({
    x: key,
    y: d3.mean(values, d => d.value)
  }))
}

// 3. 虛擬化（僅顯示可見部分）
function useVirtualizedData(data, visibleRange) {
  return useMemo(() => 
    data.slice(visibleRange.start, visibleRange.end),
    [data, visibleRange]
  )
}
```

## 樣式和自定義

### Q: 如何自定義圖表顏色？

A: 多種方式自定義顏色：

```tsx
// 1. 使用預設顏色方案
<BarChart 
  data={data}
  colors={['#ff6b6b', '#4ecdc4', '#45b7d1']}
/>

// 2. 為每個資料點指定顏色
const dataWithColors = [
  { x: 'A', y: 100, color: '#ff6b6b' },
  { x: 'B', y: 200, color: '#4ecdc4' }
]

// 3. 使用 CSS 變量
<BarChart 
  data={data}
  className="custom-chart"
/>

// CSS
.custom-chart {
  --chart-color-1: #your-color;
  --chart-color-2: #your-color;
}
```

### Q: 如何調整圖表大小？

A: 響應式大小調整：

```tsx
import { useState, useEffect } from 'react'

function ResponsiveChart({ data }) {
  const [size, setSize] = useState({ width: 800, height: 400 })
  
  useEffect(() => {
    function updateSize() {
      const container = document.getElementById('chart-container')
      if (container) {
        const { width } = container.getBoundingClientRect()
        setSize({
          width: Math.max(300, width - 32),
          height: Math.max(200, width * 0.5)
        })
      }
    }
    
    window.addEventListener('resize', updateSize)
    updateSize()
    
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  
  return (
    <div id="chart-container">
      <BarChart 
        data={data}
        width={size.width}
        height={size.height}
      />
    </div>
  )
}
```

### Q: 如何添加自定義 CSS 樣式？

A: 使用 className 和 CSS：

```tsx
<BarChart 
  data={data}
  className="my-custom-chart"
/>
```

```css
.my-custom-chart {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.my-custom-chart .bar {
  transition: opacity 0.2s ease;
}

.my-custom-chart .bar:hover {
  opacity: 0.8;
}

.my-custom-chart .axis text {
  font-size: 12px;
  fill: #6b7280;
}
```

## 效能問題

### Q: 圖表渲染很慢，如何優化？

A: 效能優化策略：

```tsx
// 1. 使用 React.memo 避免不必要的重新渲染
const OptimizedChart = React.memo(function Chart({ data, config }) {
  return <BarChart data={data} {...config} />
})

// 2. 記憶化資料處理
function DataProcessingChart({ rawData, filters }) {
  const processedData = useMemo(() => {
    return rawData
      .filter(item => filters.includes(item.category))
      .map(item => ({ x: item.name, y: item.value }))
  }, [rawData, filters])
  
  return <BarChart data={processedData} />
}

// 3. 延遲載入
const LazyChart = lazy(() => import('./HeavyChart'))

function ConditionalChart({ shouldLoad, data }) {
  if (!shouldLoad) {
    return <div>點擊載入圖表</div>
  }
  
  return (
    <Suspense fallback={<div>載入中...</div>}>
      <LazyChart data={data} />
    </Suspense>
  )
}
```

### Q: 記憶體使用量過高怎麼辦？

A: 記憶體優化方法：

```tsx
// 1. 及時清理事件監聽器
useEffect(() => {
  function handleResize() {
    // 處理大小變化
  }
  
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])

// 2. 避免在 render 中創建新物件
const chartConfig = useMemo(() => ({
  margin: { top: 20, right: 30, bottom: 40, left: 40 },
  colors: ['#3b82f6', '#ef4444', '#10b981']
}), [])

// 3. 適當的資料採樣
const sampledData = useMemo(() => {
  if (data.length > 1000) {
    return data.filter((_, index) => index % Math.ceil(data.length / 1000) === 0)
  }
  return data
}, [data])
```

## 錯誤排除

### Q: 圖表不顯示或顯示空白？

A: 常見原因和解決方法：

```tsx
// 1. 檢查資料格式
console.log('資料:', data)
console.log('資料類型:', typeof data)
console.log('是否為陣列:', Array.isArray(data))

// 2. 檢查容器大小
function DebugChart({ data }) {
  const containerRef = useRef()
  
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      console.log('容器大小:', { width, height })
    }
  }, [])
  
  return (
    <div ref={containerRef}>
      <BarChart data={data} />
    </div>
  )
}

// 3. 添加錯誤邊界
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('圖表錯誤:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <div>圖表載入失敗</div>
    }
    return this.props.children
  }
}
```

### Q: 提示框位置不正確？

A: 提示框定位問題：

```tsx
// 1. 確保父容器有正確的定位
.chart-container {
  position: relative; /* 重要！ */
}

// 2. 處理邊界溢出
function adjustTooltipPosition(x, y, tooltipWidth, tooltipHeight, containerRect) {
  let adjustedX = x
  let adjustedY = y
  
  // 右邊界檢查
  if (x + tooltipWidth > containerRect.width) {
    adjustedX = x - tooltipWidth - 10
  }
  
  // 底邊界檢查
  if (y + tooltipHeight > containerRect.height) {
    adjustedY = y - tooltipHeight - 10
  }
  
  return { x: adjustedX, y: adjustedY }
}
```

### Q: 動畫效果不工作？

A: 動畫問題排查：

```tsx
// 1. 檢查瀏覽器支援
if (!window.requestAnimationFrame) {
  console.warn('瀏覽器不支援 requestAnimationFrame')
}

// 2. 確保資料穩定性
const stableData = useMemo(() => data, [JSON.stringify(data)])

// 3. 檢查 CSS 動畫設置
.chart-element {
  transition: all 0.3s ease;
}

/* 確保沒有 prefers-reduced-motion 干擾 */
@media (prefers-reduced-motion: reduce) {
  .chart-element {
    transition: none;
  }
}
```

## 瀏覽器兼容性

### Q: 支援哪些瀏覽器？

A: 支援的瀏覽器版本：

| 瀏覽器 | 最低版本 | 建議版本 |
|--------|----------|----------|
| Chrome | 88+ | 最新版本 |
| Firefox | 85+ | 最新版本 |
| Safari | 14+ | 最新版本 |
| Edge | 88+ | 最新版本 |

**必需功能**：
- SVG 支援
- ES2018+ 語法
- ResizeObserver API
- IntersectionObserver API

### Q: 如何處理舊瀏覽器？

A: 提供降級方案：

```tsx
function BrowserCompatibleChart({ data }) {
  const [isSupported, setIsSupported] = useState(true)
  
  useEffect(() => {
    const checkSupport = () => {
      return !!(
        document.createElementNS &&
        window.ResizeObserver &&
        window.IntersectionObserver
      )
    }
    
    setIsSupported(checkSupport())
  }, [])
  
  if (!isSupported) {
    return (
      <table className="w-full border">
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
    )
  }
  
  return <BarChart data={data} />
}
```

## 進階功能

### Q: 如何添加自定義互動？

A: 實現自定義互動：

```tsx
function InteractiveChart({ data }) {
  const [selectedData, setSelectedData] = useState(null)
  const [brushSelection, setBrushSelection] = useState(null)
  
  const handleBrushEnd = useCallback((selection) => {
    if (selection) {
      const [x0, x1] = selection
      const filteredData = data.filter(d => {
        const xPos = xScale(d.x)
        return xPos >= x0 && xPos <= x1
      })
      setBrushSelection(filteredData)
    }
  }, [data])
  
  return (
    <div>
      <BarChart 
        data={data}
        onDataClick={setSelectedData}
      />
      
      {selectedData && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h3>選中項目：{selectedData.x}</h3>
          <p>數值：{selectedData.y}</p>
        </div>
      )}
      
      {brushSelection && (
        <div className="mt-4">
          <h3>選中範圍內的資料：</h3>
          <ul>
            {brushSelection.map((item, index) => (
              <li key={index}>{item.x}: {item.y}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

### Q: 如何整合第三方庫？

A: 與其他庫的整合：

```tsx
// 與 React Query 整合
function DataDrivenChart() {
  const { data, isLoading, error } = useQuery(
    'chartData',
    fetchChartData,
    {
      refetchInterval: 30000, // 30 秒重新取得
      staleTime: 10000
    }
  )
  
  if (isLoading) return <ChartSkeleton />
  if (error) return <div>載入失敗：{error.message}</div>
  
  return <BarChart data={data} />
}

// 與狀態管理整合
function ConnectedChart() {
  const data = useSelector(state => state.charts.data)
  const dispatch = useDispatch()
  
  const handleDataClick = useCallback((clickedData) => {
    dispatch(selectChartData(clickedData))
  }, [dispatch])
  
  return (
    <BarChart 
      data={data}
      onDataClick={handleDataClick}
    />
  )
}
```

### Q: 如何實現資料匯出？

A: 資料匯出功能：

```tsx
function ExportableChart({ data }) {
  const chartRef = useRef()
  
  const exportAsPNG = useCallback(() => {
    const svg = chartRef.current.querySelector('svg')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'chart.png'
        a.click()
        URL.revokeObjectURL(url)
      })
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }, [])
  
  const exportAsCSV = useCallback(() => {
    const csv = [
      ['Category', 'Value'],
      ...data.map(d => [d.x, d.y])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chart-data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [data])
  
  return (
    <div>
      <div className="mb-4 space-x-2">
        <button onClick={exportAsPNG} className="btn">
          匯出為 PNG
        </button>
        <button onClick={exportAsCSV} className="btn">
          匯出為 CSV
        </button>
      </div>
      
      <div ref={chartRef}>
        <BarChart data={data} />
      </div>
    </div>
  )
}
```

## 還有其他問題？

如果您的問題沒有在此文檔中找到答案，請：

1. **查看 API 參考文檔**：詳細的組件屬性說明
2. **查看最佳實踐指南**：深入的使用建議
3. **查看示例代碼**：demo 目錄中的實際應用
4. **提出 Issue**：在 GitHub 上提出具體問題
5. **查看源碼**：registry 目錄中的組件實現

我們會持續更新此文檔，添加更多常見問題的解答。