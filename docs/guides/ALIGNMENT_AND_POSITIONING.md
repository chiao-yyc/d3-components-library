# 🎯 對齊與定位技術指南

*解決 D3 Components 中圖表元素對齊不一致的完整技術指南*

## 📋 問題概述

在組合多種圖表元素（如條形圖、線圖、散點圖）時，經常會遇到對齊問題：

### 🚨 常見對齊問題

```tsx
// 問題場景：在同一個圖表中
<ChartCanvas>
  <Bar data={data} />      // 條形圖顯示在 band 的完整寬度
  <Line data={data} />     // 線圖點可能在 band 中心
  <Scatter data={data} />  // 散點可能在 band 左邊緣
</ChartCanvas>

// 結果：視覺上不對齊，用戶困惑
```

### 🎯 根本原因分析

不同的圖表組件對於 **Band Scale** 的處理方式不一致：

```typescript
// 當前實現的問題 ❌
Line 組件:     x + xScale.bandwidth() / 2  // 中心對齊
Scatter 組件:  xScale(d.x)                // 左對齊  
Bar 組件:      x, width = bandwidth()     // 左起始，佔滿寬度
Area 組件:     x + bandwidth() / 2        // 中心對齊（部分）
```

---

## 🔧 技術解決方案

### 1. 統一對齊策略設計

我們採用 **可配置對齊策略** 來解決這個問題：

```typescript
// 新的統一對齊介面
type AlignmentStrategy = 'start' | 'center' | 'end'

interface PositionConfig {
  alignment: AlignmentStrategy
  offset?: number  // 額外偏移量
}
```

### 2. 統一定位計算函數

```typescript
/**
 * 統一的位置計算工具函數
 * @param value - 數據值
 * @param scale - D3 比例尺
 * @param alignment - 對齊策略
 * @param offset - 額外偏移量
 */
export const calculateAlignedPosition = (
  value: any,
  scale: any,
  alignment: AlignmentStrategy = 'center',
  offset: number = 0
): number => {
  const basePosition = scale(value)
  
  // Linear 或 Time Scale：直接返回
  if (!scale.bandwidth) {
    return basePosition + offset
  }
  
  // Band Scale：根據對齊策略計算
  const bandwidth = scale.bandwidth()
  
  switch (alignment) {
    case 'start':
      return basePosition + offset
      
    case 'center':
      return basePosition + bandwidth / 2 + offset
      
    case 'end':
      return basePosition + bandwidth + offset
      
    default:
      return basePosition + bandwidth / 2 + offset
  }
}
```

### 3. 各組件的標準化實現

#### Bar 組件的對齊處理

```typescript
// Bar 組件內部實現
const Bar: React.FC<BarProps> = ({
  data,
  xScale,
  yScale,
  alignment = 'center', // 新增對齊參數
  barWidthRatio = 0.8,  // 條形寬度比例
  ...props
}) => {
  useEffect(() => {
    // ...
    
    const barWidth = xScale.bandwidth 
      ? xScale.bandwidth() * barWidthRatio
      : defaultBarWidth
    
    bars.attr('x', d => {
      const alignedX = calculateAlignedPosition(d.x, xScale, alignment)
      // Bar 特殊處理：需要向左偏移寬度的一半以實現中心對齊
      return alignment === 'center' 
        ? alignedX - barWidth / 2
        : alignedX
    })
    .attr('width', barWidth)
    
    // ...
  }, [data, xScale, alignment, barWidthRatio])
}
```

#### Line 組件的對齊處理

```typescript
// Line 組件內部實現  
const Line: React.FC<LineProps> = ({
  data,
  xScale,
  yScale,
  pointAlignment = 'center', // 新增點對齊參數
  ...props
}) => {
  useEffect(() => {
    // ...
    
    const lineGenerator = d3.line<LineShapeData>()
      .x(d => calculateAlignedPosition(d.x, xScale, pointAlignment))
      .y(d => yScale(d.y))
      .curve(curve)
    
    // 如果顯示點
    if (showPoints) {
      points.attr('cx', d => calculateAlignedPosition(d.x, xScale, pointAlignment))
    }
    
    // ...
  }, [data, xScale, pointAlignment])
}
```

#### Scatter 組件的對齊處理

```typescript
// Scatter 組件內部實現
const Scatter: React.FC<ScatterProps> = ({
  data,
  xScale,
  yScale,
  pointAlignment = 'center', // 統一對齊參數
  ...props
}) => {
  useEffect(() => {
    // ...
    
    circles.attr('cx', d => calculateAlignedPosition(d.x, xScale, pointAlignment))
           .attr('cy', d => yScale(d.y))
    
    // ...
  }, [data, xScale, pointAlignment])
}
```

---

## 🎨 實際應用範例

### 範例 1: 完美對齊的組合圖表

```tsx
import React from 'react'
import { ChartCanvas, ScaleManager, XAxis, YAxis, Bar, Line, Scatter } from '@/components/primitives'

const AlignedComboChart = ({ data }) => {
  return (
    <ChartCanvas width={800} height={500}>
      <ScaleManager>
        <XAxis scale="band" position="bottom" />
        <YAxis scale="linear" position="left" />
        
        {/* 所有組件使用相同的對齊策略 */}
        <Bar 
          data={data}
          xScale="x"
          yScale="y"
          alignment="center"  // 🎯 統一中心對齊
          barWidthRatio={0.6}
          color="#3b82f6"
        />
        
        <Line 
          data={data}
          xScale="x"
          yScale="y"
          pointAlignment="center"  // 🎯 統一中心對齊
          showPoints={true}
          color="#ef4444"
        />
        
        <Scatter 
          data={data}
          xScale="x"
          yScale="y"
          pointAlignment="center"  // 🎯 統一中心對齊
          color="#10b981"
        />
      </ScaleManager>
    </ChartCanvas>
  )
}
```

### 範例 2: 靈活的對齊控制

```tsx
const FlexibleAlignmentChart = ({ data, alignmentStrategy }) => {
  return (
    <ChartCanvas width={800} height={500}>
      <ScaleManager>
        <XAxis scale="band" position="bottom" />
        <YAxis scale="linear" position="left" />
        
        {/* 用戶可控制的對齊策略 */}
        <Bar 
          data={data}
          alignment={alignmentStrategy}
          barWidthRatio={0.8}
        />
        
        <Line 
          data={data}
          pointAlignment={alignmentStrategy}
          showPoints={true}
        />
      </ScaleManager>
    </ChartCanvas>
  )
}

// 使用範例
<FlexibleAlignmentChart 
  data={salesData}
  alignmentStrategy="center"  // 或 "start", "end"
/>
```

### 範例 3: 分組條形圖的精確對齊

```tsx
const GroupedBarChart = ({ data, groups }) => {
  return (
    <ChartCanvas width={800} height={500}>
      <ScaleManager>
        <XAxis scale="band" position="bottom" />
        <YAxis scale="linear" position="left" />
        
        {groups.map((group, groupIndex) => (
          <Bar
            key={group.id}
            data={data}
            alignment="center"
            barWidthRatio={0.8 / groups.length}  // 調整寬度
            offset={groupIndex * (bandwidth / groups.length) - bandwidth / 2 + bandwidth / (groups.length * 2)}
            color={group.color}
          />
        ))}
      </ScaleManager>
    </ChartCanvas>
  )
}
```

---

## 🛠️ 實用工具函數

### 1. 對齊檢查工具

```typescript
/**
 * 檢查多個組件是否對齊的工具函數
 */
export const checkAlignment = (
  elements: Array<{ type: string, positions: number[] }>,
  tolerance: number = 1
): boolean => {
  if (elements.length < 2) return true
  
  const referencePositions = elements[0].positions
  
  return elements.every(element => 
    element.positions.every((pos, index) => 
      Math.abs(pos - referencePositions[index]) <= tolerance
    )
  )
}

// 使用範例
const isAligned = checkAlignment([
  { type: 'bar', positions: barPositions },
  { type: 'line', positions: linePointPositions },
  { type: 'scatter', positions: scatterPositions }
], 2) // 允許 2px 誤差
```

### 2. 批量對齊工具

```typescript
/**
 * 為多個組件設置統一對齊的 HOC
 */
export const withUnifiedAlignment = <T extends object>(
  WrappedComponent: React.ComponentType<T>,
  defaultAlignment: AlignmentStrategy = 'center'
) => {
  return React.forwardRef<any, T & { alignment?: AlignmentStrategy }>((props, ref) => {
    const { alignment = defaultAlignment, ...restProps } = props
    
    return (
      <WrappedComponent
        ref={ref}
        {...restProps as T}
        alignment={alignment}
        pointAlignment={alignment}  // 為 Line, Scatter 組件
        barAlignment={alignment}    // 為 Bar 組件
      />
    )
  })
}

// 使用範例
const AlignedBar = withUnifiedAlignment(Bar, 'center')
const AlignedLine = withUnifiedAlignment(Line, 'center')
```

### 3. 視覺除錯工具

```typescript
/**
 * 顯示對齊輔助線的組件
 */
const AlignmentGuides: React.FC<{
  xScale: any
  height: number
  showVerticalGuides?: boolean
}> = ({ xScale, height, showVerticalGuides = true }) => {
  if (!showVerticalGuides || !xScale.domain) return null
  
  return (
    <g className="alignment-guides">
      {xScale.domain().map((value: any) => {
        const x = calculateAlignedPosition(value, xScale, 'center')
        return (
          <line
            key={value}
            x1={x}
            x2={x}
            y1={0}
            y2={height}
            stroke="#ff0000"
            strokeWidth={1}
            strokeDasharray="2,2"
            opacity={0.5}
          />
        )
      })}
    </g>
  )
}
```

---

## 🚀 性能最佳化

### 1. 位置快取機制

```typescript
/**
 * 快取位置計算結果，避免重複計算
 */
const usePositionCache = (data: any[], xScale: any, alignment: AlignmentStrategy) => {
  return useMemo(() => {
    return data.map(d => ({
      ...d,
      _cachedX: calculateAlignedPosition(d.x, xScale, alignment)
    }))
  }, [data, xScale, alignment])
}
```

### 2. 批量位置更新

```typescript
/**
 * 批量更新位置，減少 DOM 操作
 */
const updatePositionsBatch = (
  selection: d3.Selection<any, any, any, any>,
  positions: number[]
) => {
  // 使用 requestAnimationFrame 批量更新
  requestAnimationFrame(() => {
    selection.each(function(d, i) {
      d3.select(this).attr('cx', positions[i])
    })
  })
}
```

---

## 🧪 測試驗證

### 1. 對齊精度測試

```typescript
describe('Alignment Accuracy', () => {
  test('Bar and Line points should align perfectly', () => {
    const xScale = d3.scaleBand()
      .domain(['A', 'B', 'C'])
      .range([0, 300])
      .padding(0.1)
    
    const barX = calculateAlignedPosition('A', xScale, 'center') - barWidth / 2
    const lineX = calculateAlignedPosition('A', xScale, 'center')
    const scatterX = calculateAlignedPosition('A', xScale, 'center')
    
    expect(Math.abs(barX + barWidth / 2 - lineX)).toBeLessThan(1)
    expect(Math.abs(lineX - scatterX)).toBeLessThan(1)
  })
})
```

### 2. 視覺回歸測試

```typescript
/**
 * 使用 Jest + Puppeteer 進行視覺測試
 */
test('Combo chart alignment visual regression', async () => {
  const page = await browser.newPage()
  await page.goto('http://localhost:3000/alignment-test')
  
  const screenshot = await page.screenshot({
    clip: { x: 0, y: 0, width: 800, height: 500 }
  })
  
  expect(screenshot).toMatchImageSnapshot({
    threshold: 0.01,
    customSnapshotsDir: './alignment-snapshots'
  })
})
```

---

## 📊 遷移指南

### 從舊版本升級

```typescript
// 🟡 舊版本 (v1.x)
<Bar data={data} xScale="x" yScale="y" />
<Line data={data} xScale="x" yScale="y" showPoints={true} />

// 🟢 新版本 (v2.x) - 自動對齊
<Bar data={data} xScale="x" yScale="y" alignment="center" />
<Line data={data} xScale="x" yScale="y" pointAlignment="center" showPoints={true} />

// 🚀 最佳實踐 - 使用統一對齊 HOC
<AlignedBar data={data} xScale="x" yScale="y" />
<AlignedLine data={data} xScale="x" yScale="y" showPoints={true} />
```

### 向下兼容

```typescript
// 確保向下兼容
const Bar: React.FC<BarProps> = ({
  alignment = 'center', // 新參數，預設為中心對齊
  ...props
}) => {
  // 如果沒有指定 alignment，使用舊版本的行為
  const effectiveAlignment = props.legacy ? 'start' : alignment
  
  // ... 實現
}
```

---

## 🎯 最佳實踐總結

1. **🎯 統一對齊策略**：在同一個圖表中，所有組件使用相同的對齊策略
2. **🔧 明確指定對齊**：不要依賴隱式的對齊行為，明確指定 `alignment` 參數
3. **🧪 視覺驗證**：使用對齊輔助線進行開發時的視覺驗證
4. **⚡ 性能考量**：使用位置快取避免重複計算
5. **📏 容錯設計**：允許小範圍的對齊誤差（1-2px）
6. **🔄 批量更新**：在動畫或大數據集時使用批量位置更新

---

## 📚 相關資源

- [完全組合式圖表模式](../examples/COMPOSABLE_CHART_PATTERNS.md)
- [Primitives API 參考](../api/primitives.md)
- [D3 Scale 深度指南](../guides/D3_SCALES_DEEP_DIVE.md)

---

*這份指南確保您的圖表組件始終保持完美對齊，提供專業級的視覺體驗。*