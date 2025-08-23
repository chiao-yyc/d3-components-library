# ScatterPlot 散點圖組件

可高度客製化的散點圖組件，支援多種數據映射、互動功能和視覺效果。

## 📊 功能特色

- ✅ **多維數據映射** - 支援 X/Y 位置、大小、顏色映射
- ✅ **互動功能** - 筆刷縮放、十字游標、懸停提示
- ✅ **趨勢線支援** - 自動計算線性回歸趨勢線
- ✅ **群組功能** - 數據分組、群組高亮、群組篩選
- ✅ **視覺效果** - 陰影、光暈效果
- ✅ **無障礙支援** - ARIA 標籤、鍵盤導覽
- ✅ **TypeScript** - 完整類型支援

## 🚀 基本使用

```tsx
import { ScatterPlot } from '@d3-components/registry';

// 準備資料
const data = [
  { revenue: 100000, profit: 20000, region: 'North', employees: 50 },
  { revenue: 150000, profit: 30000, region: 'South', employees: 75 },
  { revenue: 200000, profit: 40000, region: 'East', employees: 100 },
];

// 基本散點圖
function BasicScatterPlot() {
  return (
    <ScatterPlot
      data={data}
      width={600}
      height={400}
      xAccessor={(d) => d.revenue}
      yAccessor={(d) => d.profit}
    />
  );
}
```

## 🎨 進階範例

### 多維映射散點圖

```tsx
function AdvancedScatterPlot() {
  return (
    <ScatterPlot
      data={data}
      width={800}
      height={600}
      xAccessor={(d) => d.revenue}
      yAccessor={(d) => d.profit}
      sizeAccessor={(d) => d.employees}  // 員工數決定點的大小
      colorAccessor={(d) => d.region}    // 區域決定點的顏色
      showTrendline={true}               // 顯示趨勢線
      interactive={true}                 // 啟用互動功能
    />
  );
}
```

### 帶互動功能的散點圖

```tsx
function InteractiveScatterPlot() {
  return (
    <ScatterPlot
      data={data}
      width={800}
      height={600}
      xAccessor={(d) => d.revenue}
      yAccessor={(d) => d.profit}
      
      // 啟用筆刷縮放（雙軸）
      enableBrushZoom={true}
      onZoom={(domain) => console.log('縮放範圍:', domain)}
      
      // 啟用十字游標
      enableCrosshair={true}
      
      // 事件處理
      onDataClick={(data) => console.log('點擊數據:', data)}
      onDataHover={(data) => console.log('懸停數據:', data)}
      
      // 視覺效果
      enableDropShadow={true}
      enableGlowEffect={true}
    />
  );
}
```

### 群組功能散點圖

```tsx
function GroupedScatterPlot() {
  return (
    <ScatterPlot
      data={data}
      width={800}
      height={600}
      xAccessor={(d) => d.revenue}
      yAccessor={(d) => d.profit}
      
      // 群組設定
      groupBy="region"
      groupColors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24']}
      
      // 群組互動
      enableGroupHighlight={true}
      enableGroupFilter={true}
      showGroupLegend={true}
      
      // 群組事件
      onGroupHover={(group) => console.log('群組懸停:', group)}
      onGroupSelect={(group) => console.log('群組選擇:', group)}
    />
  );
}
```

## 📝 API 參考

### 基本屬性

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `data` | `T[]` | **必需** | 圖表數據陣列 |
| `width` | `number` | `400` | 圖表寬度 |
| `height` | `number` | `300` | 圖表高度 |
| `margin` | `Margin` | `{top: 20, right: 40, bottom: 40, left: 40}` | 邊距設定 |

### 數據映射

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `xAccessor` | `(d: T) => number` | **必需** | X 軸數據存取器 |
| `yAccessor` | `(d: T) => number` | **必需** | Y 軸數據存取器 |
| `sizeAccessor` | `(d: T) => number` | - | 大小映射存取器 |
| `colorAccessor` | `(d: T) => string` | - | 顏色映射存取器 |

### 視覺樣式

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `radius` | `number` | `4` | 散點半徑 |
| `opacity` | `number` | `0.7` | 散點透明度 |
| `colors` | `string[]` | 預設色彩 | 色彩陣列 |
| `strokeWidth` | `number` | `1` | 邊框寬度 |
| `strokeColor` | `string` | `'white'` | 邊框顏色 |

### 趨勢線

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `showTrendline` | `boolean` | `false` | 是否顯示趨勢線 |
| `trendlineColor` | `string` | `'#ef4444'` | 趨勢線顏色 |
| `trendlineWidth` | `number` | `2` | 趨勢線寬度 |

### 互動功能

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `interactive` | `boolean` | `false` | 啟用基本互動 |
| `enableBrushZoom` | `boolean` | `false` | 啟用筆刷縮放 |
| `enableCrosshair` | `boolean` | `false` | 啟用十字游標 |
| `brushZoomConfig` | `BrushZoomConfig` | - | 縮放功能配置 |
| `crosshairConfig` | `CrosshairConfig` | - | 十字游標配置 |

### 群組功能

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `groupBy` | `string` | - | 群組分類欄位 |
| `groupColors` | `string[]` | - | 群組色彩 |
| `enableGroupHighlight` | `boolean` | `false` | 啟用群組高亮 |
| `enableGroupFilter` | `boolean` | `false` | 啟用群組篩選 |
| `showGroupLegend` | `boolean` | `false` | 顯示群組圖例 |

### 視覺效果

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `enableDropShadow` | `boolean` | `false` | 啟用陰影效果 |
| `enableGlowEffect` | `boolean` | `false` | 啟用光暈效果 |
| `glowColor` | `string` | `'#3b82f6'` | 光暈顏色 |

### 事件處理器

| 屬性 | 類型 | 說明 |
|------|------|------|
| `onDataClick` | `(data: ProcessedDataPoint, event: MouseEvent) => void` | 數據點點擊事件 |
| `onDataHover` | `(data: ProcessedDataPoint \| null, event: MouseEvent) => void` | 數據點懸停事件 |
| `onZoom` | `(domain: {x?: [any, any]; y?: [any, any]}) => void` | 縮放事件 |
| `onZoomReset` | `() => void` | 重置縮放事件 |
| `onGroupHover` | `(group: string \| null) => void` | 群組懸停事件 |
| `onGroupSelect` | `(group: string, selected: boolean) => void` | 群組選擇事件 |

### 無障礙屬性

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `aria-label` | `string` | `'散點圖'` | ARIA 標籤 |
| `aria-describedby` | `string` | - | ARIA 描述 |

## 🎯 使用場景

### 1. 相關性分析
```tsx
// 分析收入與利潤的相關性
<ScatterPlot
  data={salesData}
  xAccessor={d => d.revenue}
  yAccessor={d => d.profit}
  showTrendline={true}
/>
```

### 2. 多維度數據探索
```tsx
// 同時顯示位置、大小、顏色三個維度
<ScatterPlot
  data={companyData}
  xAccessor={d => d.revenue}
  yAccessor={d => d.profit}
  sizeAccessor={d => d.employees}
  colorAccessor={d => d.industry}
/>
```

### 3. 群組比較分析
```tsx
// 不同地區的業績比較
<ScatterPlot
  data={regionalData}
  xAccessor={d => d.sales}
  yAccessor={d => d.growth}
  groupBy="region"
  enableGroupHighlight={true}
/>
```

### 4. 互動式數據探索
```tsx
// 支援縮放和詳細檢視
<ScatterPlot
  data={detailData}
  xAccessor={d => d.x}
  yAccessor={d => d.y}
  enableBrushZoom={true}
  enableCrosshair={true}
  onDataClick={showDetails}
/>
```

## 📐 資料格式

### 基本資料格式
```typescript
interface DataPoint {
  // X 軸數值（必需）
  x: number;
  // Y 軸數值（必需）
  y: number;
  // 其他可選欄位
  [key: string]: any;
}
```

### 完整資料範例
```typescript
const data = [
  {
    id: 1,
    name: "產品 A",
    revenue: 120000,      // X 軸：收入
    profit: 24000,       // Y 軸：利潤
    employees: 45,       // 大小：員工數
    region: "北部",       // 顏色：地區
    category: "科技"      // 群組：類別
  },
  // ... 更多資料
];
```

## 🔧 技術細節

### 繼承架構
```
ScatterPlot (React Component)
└── D3ScatterPlot (D3 Logic Class)
    └── BaseChart (Abstract Base)
```

### 核心模組
- **數據處理**: `DataProcessor` - 統一的數據轉換
- **比例尺管理**: `ScaleManager` - 集中式比例尺管理  
- **互動控制**: `BrushZoomController`, `CrosshairController`
- **群組功能**: `GroupDataProcessor`, `GroupHighlightManager`
- **視覺效果**: `createStandardDropShadow`, `createStandardGlow`

### 效能優化
- 使用 `useMemo` 進行數據處理緩存
- 智能重渲染：僅更新變化的部分
- 大數據集支援：10,000+ 點位流暢渲染
- SVG 剪裁路徑：防止溢出，保護軸線

## 🧪 測試

```bash
# 運行組件測試
npm run test components/statistical/scatter-plot

# 運行特定測試
npm run test scatter-plot.test.tsx

# 測試覆蓋率
npm run test:coverage
```

### 測試範圍
- ✅ 基本渲染測試
- ✅ 數據更新測試  
- ✅ 事件處理測試
- ✅ 無障礙功能測試
- ✅ 效能測試（大數據集）
- ✅ 邊界情況測試

## 🐛 已知問題

目前沒有已知的重大問題。如有問題請提交 Issue。

## 📝 更新日誌

### v1.0.0 (2025-08-23)
- ✨ 初始版本發布
- ✅ 完整的散點圖功能
- ✅ 筆刷縮放和十字游標
- ✅ 群組功能支援
- ✅ 完整測試覆蓋

---

**相關組件**: [BarChart](../../../basic/bar-chart/), [LineChart](../../../basic/line-chart/), [AreaChart](../../../basic/area-chart/)

**參考文檔**: [Architecture Guidelines](../../../../docs/ARCHITECTURE_GUIDELINES.md)