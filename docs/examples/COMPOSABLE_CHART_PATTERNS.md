# 🎨 完全組合式圖表模式指南

*從零開始構建複雜圖表的完整指南*

## 📖 概述

本指南展示如何使用 D3 Components 的 **Layer 2: 組合平台** 來構建高度客製化的圖表。透過組合基礎的 Primitives，您可以建立任何複雜的視覺化需求。

## 🎯 核心概念

### 組合式架構的優勢

```tsx
// ❌ 傳統方式：受限於預設功能
<ComboChart 
  data={data}
  showBars={true}
  showLines={true}
  // 如果需要新功能，需要等待庫更新
/>

// ✅ 組合式：無限可能
<ChartCanvas>
  <Bar data={barData} />
  <Line data={lineData} />
  <CustomBubbles data={bubbleData} />
  <MyBusinessLogicRenderer data={specialData} />
</ChartCanvas>
```

---

## 🏗️ 基礎組件介紹

### 1. ChartCanvas - 圖表容器

```tsx
import { ChartCanvas } from '@/components/primitives'

<ChartCanvas 
  width={800} 
  height={600}
  margin={{ top: 20, right: 80, bottom: 60, left: 80 }}
  className="my-custom-chart"
>
  {/* 所有圖表內容 */}
</ChartCanvas>
```

**功能**：
- 提供 SVG 容器和座標系統
- 管理圖表尺寸和邊距
- 建立 React Context 供子組件使用

### 2. ScaleManager - 比例尺管理

```tsx
import { ScaleManager } from '@/components/primitives'

<ChartCanvas>
  <ScaleManager>
    {/* 在這裡註冊和使用比例尺 */}
    <XAxis scale="band" domain={categories} />
    <YAxis scale="linear" domain={[0, maxValue]} />
    <Bar xScale="x" yScale="y" />
  </ScaleManager>
</ChartCanvas>
```

**功能**：
- 自動創建和註冊比例尺
- 智能類型偵測（band, linear, time）
- 比例尺共享和複用機制

### 3. 軸線組件

```tsx
import { XAxis, YAxis, DualAxis } from '@/components/primitives'

// 單軸配置
<XAxis 
  scale="band" 
  position="bottom"
  label="產品類別"
  tickRotation={45}
  gridlines={true}
/>

<YAxis 
  scale="linear" 
  position="left"
  label="銷售額 (萬元)"
  format={d => `${d}萬`}
  gridlines={true}
/>

// 雙軸配置
<DualAxis
  leftAxis={{ scale: "linear", label: "銷售額" }}
  rightAxis={{ scale: "linear", label: "成長率 (%)" }}
/>
```

### 4. 基礎圖形組件

```tsx
import { Bar, Line, Area, Scatter } from '@/components/primitives'

// 條形圖
<Bar 
  data={salesData}
  xScale="x"
  yScale="y" 
  color="#3b82f6"
  animate={true}
/>

// 線圖
<Line 
  data={trendsData}
  xScale="x"
  yScale="rightY"
  curve={d3.curveMonotone}
  strokeWidth={3}
  showPoints={true}
/>

// 散點圖
<Scatter
  data={correlationData}
  xScale="x"
  yScale="y"
  radius={d => sizeScale(d.volume)}
  color={d => colorScale(d.category)}
/>
```

---

## 📊 實戰範例

### 範例 1: 多軸銷售分析圖表

建立一個包含條形圖（銷售額）和線圖（成長率）的雙軸圖表：

```tsx
import React from 'react'
import { 
  ChartCanvas, 
  ScaleManager, 
  XAxis, 
  YAxis,
  Bar, 
  Line 
} from '@/components/primitives'

const SalesAnalysisChart = ({ data }) => {
  return (
    <ChartCanvas width={800} height={500}>
      <ScaleManager>
        {/* X 軸：產品類別 */}
        <XAxis 
          scale="band"
          position="bottom"
          label="產品類別"
          gridlines={false}
        />
        
        {/* 左 Y 軸：銷售額 */}
        <YAxis 
          scale="linear"
          position="left"
          label="銷售額 (萬元)"
          gridlines={true}
        />
        
        {/* 右 Y 軸：成長率 */}
        <YAxis 
          scale="linear" 
          position="right"
          label="成長率 (%)"
          gridlines={false}
        />
        
        {/* 條形圖：銷售額 */}
        <Bar 
          data={data}
          xAccessor={d => d.category}
          yAccessor={d => d.sales}
          xScale="x"
          yScale="leftY"
          color="#3b82f6"
          animate={true}
          onBarClick={(d) => console.log('點擊了:', d.category)}
        />
        
        {/* 線圖：成長率 */}
        <Line 
          data={data}
          xAccessor={d => d.category} 
          yAccessor={d => d.growthRate}
          xScale="x"
          yScale="rightY"
          color="#ef4444"
          strokeWidth={3}
          showPoints={true}
          curve={d3.curveCardinal}
        />
      </ScaleManager>
    </ChartCanvas>
  )
}

// 使用範例
const salesData = [
  { category: 'A', sales: 120, growthRate: 15.2 },
  { category: 'B', sales: 98, growthRate: 8.7 },
  { category: 'C', sales: 150, growthRate: 22.1 },
  // ...
]

<SalesAnalysisChart data={salesData} />
```

### 範例 2: 自訂業務邏輯渲染器

展示如何添加完全客製化的視覺元素：

```tsx
import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useChartCanvas } from '@/components/primitives'

// 自訂的業績目標線組件
const TargetLine = ({ targetValue, color = '#ff6b6b', strokeWidth = 2 }) => {
  const lineRef = useRef()
  const { dimensions, getScale } = useChartCanvas()
  
  useEffect(() => {
    if (!lineRef.current) return
    
    const yScale = getScale('leftY')
    if (!yScale) return
    
    const y = yScale(targetValue)
    const svg = d3.select(lineRef.current)
    
    // 清除之前的線條
    svg.selectAll('*').remove()
    
    // 繪製目標線
    svg.append('line')
      .attr('x1', 0)
      .attr('x2', dimensions.contentArea.width)
      .attr('y1', y)
      .attr('y2', y)
      .attr('stroke', color)
      .attr('stroke-width', strokeWidth)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .attr('opacity', 0.8)
    
    // 添加標籤
    svg.append('text')
      .attr('x', dimensions.contentArea.width - 10)
      .attr('y', y - 5)
      .attr('text-anchor', 'end')
      .attr('fill', color)
      .attr('font-size', '12px')
      .text(`目標: ${targetValue}萬`)
      .attr('opacity', 0)
      .transition()
      .delay(400)
      .duration(400)
      .attr('opacity', 0.9)
      
  }, [targetValue, color, strokeWidth, dimensions])
  
  return <g ref={lineRef} />
}

// 使用自訂組件
const EnhancedSalesChart = ({ data, target }) => {
  return (
    <ChartCanvas width={800} height={500}>
      <ScaleManager>
        <XAxis scale="band" position="bottom" />
        <YAxis scale="linear" position="left" />
        
        <Bar data={data} xScale="x" yScale="leftY" />
        <TargetLine targetValue={target} color="#ff6b6b" />
      </ScaleManager>
    </ChartCanvas>
  )
}
```

### 範例 3: 互動式篩選圖表

建立具有即時篩選功能的複雜圖表：

```tsx
import React, { useState, useMemo } from 'react'
import { 
  ChartCanvas, 
  ScaleManager, 
  XAxis, 
  YAxis,
  Bar, 
  Line,
  BrushZoom 
} from '@/components/primitives'

const InteractiveFilterChart = ({ data }) => {
  const [selectedCategories, setSelectedCategories] = useState(new Set())
  const [timeRange, setTimeRange] = useState(null)
  
  // 篩選數據
  const filteredData = useMemo(() => {
    let filtered = [...data]
    
    // 類別篩選
    if (selectedCategories.size > 0) {
      filtered = filtered.filter(d => selectedCategories.has(d.category))
    }
    
    // 時間範圍篩選
    if (timeRange) {
      filtered = filtered.filter(d => 
        d.date >= timeRange[0] && d.date <= timeRange[1]
      )
    }
    
    return filtered
  }, [data, selectedCategories, timeRange])
  
  return (
    <div>
      {/* 篩選控制面板 */}
      <div className="mb-4 p-4 bg-gray-50 rounded">
        <h3 className="mb-2">篩選選項</h3>
        {['A', 'B', 'C', 'D'].map(category => (
          <button
            key={category}
            onClick={() => {
              const newSet = new Set(selectedCategories)
              if (newSet.has(category)) {
                newSet.delete(category)
              } else {
                newSet.add(category)
              }
              setSelectedCategories(newSet)
            }}
            className={`mr-2 px-3 py-1 rounded ${
              selectedCategories.has(category)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            類別 {category}
          </button>
        ))}
      </div>
      
      {/* 圖表 */}
      <ChartCanvas width={800} height={500}>
        <ScaleManager>
          <XAxis scale="time" position="bottom" />
          <YAxis scale="linear" position="left" />
          
          {/* 主要條形圖 */}
          <Bar 
            data={filteredData}
            xAccessor={d => d.date}
            yAccessor={d => d.value}
            xScale="x"
            yScale="y"
            color={d => categoryColors[d.category]}
            animate={true}
            animationDuration={300}
          />
          
          {/* 趨勢線 */}
          <Line 
            data={filteredData}
            xAccessor={d => d.date}
            yAccessor={d => d.trend}
            xScale="x"
            yScale="y"
            color="#333"
            strokeWidth={2}
          />
          
          {/* 刷選縮放功能 */}
          <BrushZoom 
            onBrush={(range) => setTimeRange(range)}
            brushHeight={50}
          />
        </ScaleManager>
      </ChartCanvas>
    </div>
  )
}
```

---

## 🛠️ 最佳實踐

### 1. Scale 管理策略

```tsx
// ✅ 推薦：使用描述性的 scale 名稱
<XAxis scale="band" name="categories" />
<YAxis scale="linear" name="leftSales" />
<YAxis scale="linear" name="rightGrowth" />

<Bar xScale="categories" yScale="leftSales" />
<Line xScale="categories" yScale="rightGrowth" />
```

### 2. 數據存取模式

```tsx
// ✅ 推薦：使用 accessor 函數，更靈活
<Bar 
  data={data}
  xAccessor={d => d.productName}
  yAccessor={d => d.sales * 1000} // 可以進行計算
  xScale="x"
  yScale="y"
/>

// ⚠️ 可用：使用 key，但較受限
<Bar 
  data={data}
  xKey="productName"  
  yKey="sales"
  xScale="x"
  yScale="y"
/>
```

### 3. 事件處理整合

```tsx
const MyChart = ({ data, onDataSelect }) => {
  const [selectedItems, setSelectedItems] = useState([])
  
  const handleBarClick = (dataPoint, index, event) => {
    // 更新內部狀態
    setSelectedItems(prev => [...prev, dataPoint])
    
    // 通知父組件
    onDataSelect?.(dataPoint, selectedItems)
    
    // 防止事件冒泡
    event.stopPropagation()
  }
  
  return (
    <ChartCanvas>
      <ScaleManager>
        <Bar 
          data={data}
          onBarClick={handleBarClick}
          color={d => selectedItems.includes(d) ? '#ff6b6b' : '#3b82f6'}
        />
      </ScaleManager>
    </ChartCanvas>
  )
}
```

### 4. 動畫協調

```tsx
// 統一動畫時序，避免混亂
const ANIMATION_CONFIG = {
  duration: 600,
  staggerDelay: 50,
  easing: 'ease-out'
}

<Bar 
  animate={true}
  animationDuration={ANIMATION_CONFIG.duration}
  animationDelay={(d, i) => i * ANIMATION_CONFIG.staggerDelay}
/>

<Line 
  animate={true}
  animationDuration={ANIMATION_CONFIG.duration}
  animationDelay={data.length * ANIMATION_CONFIG.staggerDelay + 200} // 條形圖之後
/>
```

---

## 🔧 疑難排解

### 常見問題與解決方案

#### 1. Scale 未正確註冊

```tsx
// ❌ 錯誤：在 ScaleManager 外使用 scale
<ChartCanvas>
  <Bar xScale="x" yScale="y" /> // 找不到 scale
</ChartCanvas>

// ✅ 正確：在 ScaleManager 內註冊和使用
<ChartCanvas>
  <ScaleManager>
    <XAxis scale="band" name="x" />
    <YAxis scale="linear" name="y" />
    <Bar xScale="x" yScale="y" />
  </ScaleManager>
</ChartCanvas>
```

#### 2. 數據對齊問題

參見 [對齊問題技術指南](../guides/ALIGNMENT_AND_POSITIONING.md) 取得詳細解決方案。

#### 3. 性能優化

```tsx
// ✅ 使用 React.memo 避免不必要的重渲染
const OptimizedBar = React.memo(Bar)

// ✅ 使用 useMemo 快取計算結果
const processedData = useMemo(() => {
  return data.map(d => ({
    ...d,
    computed: expensiveCalculation(d)
  }))
}, [data])
```

---

## 🎯 下一步

- 閱讀 [對齊問題技術指南](../guides/ALIGNMENT_AND_POSITIONING.md)
- 查看 [最佳實踐指南](../guides/BEST_PRACTICES_COMPOSABLE_CHARTS.md)
- 探索 [進階組合模式](../examples/ADVANCED_COMPOSITION_PATTERNS.md)

## 📚 相關資源

- [Primitives API 參考](../api/primitives.md)
- [Scale 管理指南](../guides/SCALE_MANAGEMENT.md)
- [事件系統文檔](../api/event-system.md)

---

*這份指南幫助您掌握 D3 Components 的組合式開發模式，創造無限可能的客製化圖表。*