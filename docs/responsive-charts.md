# 響應式圖表系統指南

## 概述

D3 Components 圖表庫現已支援響應式設計，能夠自動適應不同容器尺寸和設備屏幕大小，為移動端、平板和桌面提供最佳的視覺效果。

## 核心組件

### ResponsiveChartContainer

核心響應式容器組件，負責監聽容器尺寸變化並自動調整圖表大小。

```tsx
import { ResponsiveChartContainer } from '@registry/components/primitives/canvas/responsive-chart-container'

<ResponsiveChartContainer
  aspect={16/9}
  minWidth={300}
  maxWidth={1200}
  minHeight={200}
  debounceMs={100}
>
  {(dimensions) => (
    <YourChart 
      width={dimensions.width} 
      height={dimensions.height} 
      data={data} 
    />
  )}
</ResponsiveChartContainer>
```

### 響應式 Props

所有圖表組件現已支援以下響應式屬性：

- `responsive?: boolean` - 啟用響應式模式
- `aspect?: number` - 寬高比（如 16/9 = 1.78）
- `minWidth?: number` - 最小寬度（像素）
- `maxWidth?: number` - 最大寬度（像素）
- `minHeight?: number` - 最小高度（像素）
- `maxHeight?: number` - 最大高度（像素）

## 使用方式

### 1. 響應式模式

```tsx
import { BarChart } from '@registry/components/basic/bar-chart'

<BarChart
  data={data}
  xKey="month"
  yKey="revenue"
  responsive={true}
  aspect={16/9}
  minWidth={300}
  maxWidth={1200}
  minHeight={200}
/>
```

### 2. 固定尺寸模式（默認）

```tsx
<BarChart
  data={data}
  xKey="month"
  yKey="revenue"
  width={800}
  height={400}
/>
```

### 3. 手動使用 ResponsiveChartContainer

```tsx
<ResponsiveChartContainer aspect={2.5} minWidth={250} maxWidth={1000}>
  {({ width, height }) => (
    <BarChart
      data={data}
      xKey="month"
      yKey="revenue"
      width={width}
      height={height}
    />
  )}
</ResponsiveChartContainer>
```

## 最佳實踐

### 寬高比選擇

| 用途 | 推薦比例 | 說明 |
|------|----------|------|
| 儀表板 | 16:9 (1.78) | 適合大多數屏幕 |
| 時間序列 | 2.5:1 (2.5) | 強調水平趨勢 |
| 分類數據 | 4:3 (1.33) | 平衡的視覺效果 |
| 手機優先 | 1.2:1 (1.2) | 適合窄屏幕 |

### 尺寸限制建議

```tsx
// 手機優先設計
<Chart 
  responsive={true}
  aspect={1.2}
  minWidth={280}
  maxWidth={768}
  minHeight={200}
/>

// 桌面優先設計  
<Chart
  responsive={true} 
  aspect={1.78}
  minWidth={400}
  maxWidth={1400}
  minHeight={250}
/>

// 通用設計
<Chart
  responsive={true}
  aspect={1.6}
  minWidth={320}
  maxWidth={1200} 
  minHeight={200}
/>
```

### CSS Grid/Flexbox 整合

```css
.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1rem;
}

.chart-container {
  width: 100%;
  min-height: 300px;
}
```

```tsx
<div className="chart-grid">
  <div className="chart-container">
    <BarChart responsive={true} aspect={1.5} data={data1} />
  </div>
  <div className="chart-container">
    <LineChart responsive={true} aspect={1.5} data={data2} />
  </div>
</div>
```

## 技術實現細節

### ResizeObserver

系統使用現代 ResizeObserver API 監聽容器尺寸變化：

```tsx
useEffect(() => {
  if (!containerRef.current) return

  const resizeObserver = new ResizeObserver(debouncedUpdateDimensions)
  resizeObserver.observe(containerRef.current)

  return () => resizeObserver.disconnect()
}, [debouncedUpdateDimensions])
```

### 防抖優化

為避免頻繁重新渲染，系統實現了防抖機制：

```tsx
const debouncedUpdateDimensions = useCallback(() => {
  if (resizeTimeoutRef.current) {
    clearTimeout(resizeTimeoutRef.current)
  }
  
  resizeTimeoutRef.current = setTimeout(updateDimensions, debounceMs)
}, [updateDimensions, debounceMs])
```

### 尺寸計算邏輯

```tsx
const updateDimensions = useCallback(() => {
  const containerRect = containerRef.current.getBoundingClientRect()
  let width = Math.max(minWidth, Math.min(maxWidth, containerRect.width))
  let height: number

  if (aspect) {
    height = width / aspect
  } else {
    height = Math.max(minHeight, Math.min(maxHeight, containerRect.height || width * 0.6))
  }

  height = Math.max(minHeight, Math.min(maxHeight, height))
  setDimensions({ width, height })
}, [aspect, minWidth, maxWidth, minHeight, maxHeight])
```

## 支援的圖表類型

所有基礎圖表組件均已支援響應式：

- ✅ BarChart - 長條圖
- ✅ LineChart - 折線圖  
- ✅ AreaChart - 區域圖
- ✅ ScatterPlot - 散點圖
- ✅ PieChart - 圓餅圖
- ✅ Heatmap - 熱力圖
- ✅ 其他統計圖表...

## 遷移指南

### 從固定尺寸遷移

**之前：**
```tsx
<BarChart width={800} height={400} data={data} />
```

**之後：**
```tsx
<BarChart responsive={true} aspect={2} data={data} />
```

### 向下兼容

響應式功能完全向下兼容，現有代碼無需修改：

```tsx
// 舊代碼依然正常工作
<BarChart width={800} height={400} data={data} />

// 可選擇性啟用響應式
<BarChart responsive={true} aspect={2} data={data} />
```

## 性能考慮

1. **防抖延遲**: 默認 100ms，可根據需求調整
2. **尺寸變化頻率**: ResizeObserver 僅在實際尺寸改變時觸發
3. **重繪優化**: 使用 React.memo 和 useMemo 避免不必要的重新渲染
4. **內存清理**: 組件卸載時自動清理 ResizeObserver

## Demo 和測試

訪問 `/responsive-chart` 頁面體驗完整的響應式功能：

- 實時容器寬度調整
- 不同設備尺寸模擬
- 多種圖表類型測試
- 固定 vs 響應式對比

## 常見問題

### Q: 如何在 CSS Grid 中使用？
A: 設置 `minWidth` 確保在網格收縮時保持可讀性。

### Q: 響應式模式下能否設置固定高度？
A: 不建議，這會破壞寬高比。可透過 `minHeight/maxHeight` 限制範圍。

### Q: 性能影響如何？
A: 非常小，ResizeObserver 是高效的原生 API，加上防抖優化。

### Q: 支援服務器端渲染（SSR）嗎？
A: 是的，會降級為固定尺寸直到客戶端 hydration。

## 未來計劃

- [ ] 支援容器查詢（Container Queries）
- [ ] 自動字體縮放
- [ ] 響應式動畫參數
- [ ] 更多設備預設配置