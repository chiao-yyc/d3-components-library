# BaseChart 工具函數參考指南

> 📅 更新日期：2025-08-15  
> 🎯 目標：BaseChart 共用工具函數使用指南

## 📋 概述

BaseChart 提供了一套標準化的工具函數，用於統一各圖表組件的渲染方式。這些工具函數確保了組件間的一致性和可維護性。

## 🛠️ 核心工具函數

### 1. 軸線渲染 (renderAxes)

**功能**: 統一的 X/Y 軸渲染，支援網格線、標籤格式化等

```typescript
protected renderAxes(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  scales: { xScale: any; yScale: any },
  config: {
    showXAxis?: boolean;
    showYAxis?: boolean;
    xAxisConfig?: Partial<AxisConfig>;
    yAxisConfig?: Partial<AxisConfig>;
    showXGrid?: boolean;
    showYGrid?: boolean;
    xGridConfig?: Partial<GridConfig>;
    yGridConfig?: Partial<GridConfig>;
  } = {}
): void
```

**使用範例**:
```typescript
// BarChart 中的使用
this.renderAxes(chartArea, { xScale, yScale }, {
  showXAxis: true,
  showYAxis: true,
  xAxisConfig: {
    fontSize: '12px',
    fontColor: '#6b7280'
  },
  yAxisConfig: {
    fontSize: '12px',
    fontColor: '#6b7280'
  }
});
```

**已使用組件**: BarChart, LineChart, AreaChart, ScatterPlot, Heatmap

### 2. 條形標籤渲染 (renderBarLabels)

**功能**: 為條形圖提供標籤顯示，支援多種位置和格式

```typescript
protected renderBarLabels(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: any[],
  config: BarLabelConfig,
  scales: { xScale: any; yScale: any },
  orientation: 'vertical' | 'horizontal' = 'vertical'
): d3.Selection<SVGGElement, unknown, null, undefined> | null
```

**BarLabelConfig 介面**:
```typescript
interface BarLabelConfig {
  show: boolean;
  position: 'top' | 'center' | 'bottom';
  format?: (value: any) => string;
  fontSize?: string;
  fontColor?: string;
  fontFamily?: string;
}
```

**使用範例**:
```typescript
// BarChart 中的使用
if (showLabels) {
  this.renderBarLabels(chartArea, this.processedData, {
    show: true,
    position: labelPosition || 'top',
    format: labelFormat,
    fontSize: '11px',
    fontColor: '#374151'
  }, { xScale, yScale }, orientation);
}
```

**已使用組件**: BarChart

### 3. 點標籤渲染 (renderPointLabels)

**功能**: 為散點圖和線圖提供點標籤顯示

```typescript
protected renderPointLabels(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: any[],
  config: PointLabelConfig,
  scales: { xScale: any; yScale: any }
): d3.Selection<SVGGElement, unknown, null, undefined> | null
```

**PointLabelConfig 介面**:
```typescript
interface PointLabelConfig {
  show: boolean;
  xAccessor: (d: any) => any;
  yAccessor: (d: any) => any;
  labelAccessor: (d: any) => string;
  fontSize?: string;
  fontColor?: string;
  fontFamily?: string;
  offset?: { x: number; y: number };
}
```

**已使用組件**: ScatterPlot

### 4. 弧形標籤渲染 (renderArcLabels)

**功能**: 為餅圖和環形圖提供弧形標籤顯示

```typescript
protected renderArcLabels(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  arcs: any[],
  config: LabelConfig,
  arcGenerator: d3.Arc<any, any>
): d3.Selection<SVGGElement, unknown, null, undefined> | null
```

**已使用組件**: PieChart

### 5. 圖例渲染 (renderLegend)

**功能**: 統一的圖例渲染，支援多種布局和樣式

```typescript
protected renderLegend(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: Array<{ label: string; color: string; value?: number }>,
  config: LegendConfig = {}
): d3.Selection<SVGGElement, unknown, null, undefined> | null
```

**LegendConfig 介面**:
```typescript
interface LegendConfig {
  show?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  orientation?: 'horizontal' | 'vertical';
  itemSpacing?: number;
  fontSize?: string;
  fontColor?: string;
}
```

**已使用組件**: PieChart

## 🔧 核心模組

### DataProcessor

**功能**: 統一的數據處理和映射

```typescript
const processor = new DataProcessor({
  mapping?: DataMapping;
  keys?: { x?: string; y?: string; category?: string };
  accessors?: { x?: (d: any) => any; y?: (d: any) => any; category?: (d: any) => any };
  autoDetect?: boolean;
});

const result = processor.process(data);
```

**使用模式**:
```typescript
// 標準使用
const processor = new DataProcessor({
  keys: { x: this.props.xKey, y: this.props.yKey },
  autoDetect: true
});

// 帶錯誤處理
if (result.errors.length > 0) {
  this.handleError(new Error(result.errors.join(', ')));
}
```

### ColorScale

**功能**: 統一的顏色管理

```typescript
const colorScale = createColorScale({
  type: 'custom' | 'categorical' | 'sequential' | 'diverging';
  colors: string[];
  domain: number[] | string[];
  interpolate?: boolean;
});

const color = colorScale.getColor(index);
```

**使用模式**:
```typescript
// 離散顏色
this.colorScale = createColorScale({
  type: 'custom',
  colors: this.props.colors,
  domain: [0, this.processedData.length - 1],
  interpolate: false
});

// 連續顏色（漸變）
this.colorScale = createColorScale({
  type: 'custom',
  colors: ['#FF6B6B', '#4ECDC4'],
  domain: [0, this.processedData.length - 1],
  interpolate: true
});
```

## 📊 組件實現模式

### 標準 BaseChart 組件結構

```typescript
import * as d3 from 'd3';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';

export class D3ComponentChart extends BaseChart<ComponentChartProps> {
  private processedData: ProcessedDataPoint[] = [];
  private scales: any = {};
  private colorScale!: ColorScale;

  constructor(props: ComponentChartProps) {
    super(props);
  }

  // 1. 數據處理 - 使用 DataProcessor
  protected processData(): ProcessedDataPoint[] {
    const { data, xKey, yKey } = this.props;
    const processor = new DataProcessor({
      keys: { x: xKey, y: yKey },
      autoDetect: true
    });
    
    const result = processor.process(data);
    if (result.errors.length > 0) {
      this.handleError(new Error(result.errors.join(', ')));
    }
    
    this.processedData = result.data as ProcessedDataPoint[];
    return this.processedData;
  }

  // 2. 比例尺創建 - 使用 ColorScale
  protected createScales(): void {
    const { colors } = this.props;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    // 創建 D3 比例尺
    const xScale = d3.scaleBand()
      .domain(this.processedData.map(d => String(d.x)))
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.processedData, d => d.y) || 0])
      .range([chartHeight, 0])
      .nice();

    this.scales = { xScale, yScale, chartWidth, chartHeight };

    // 創建顏色比例尺
    this.colorScale = createColorScale({
      type: 'custom',
      colors: colors,
      domain: [0, this.processedData.length - 1],
      interpolate: false
    });
  }

  // 3. 圖表渲染 - 使用工具函數
  protected renderChart(): void {
    const chartArea = this.createSVGContainer();
    const { xScale, yScale } = this.scales;

    // 渲染主要圖形
    const elements = chartArea.selectAll('.element')
      .data(this.processedData)
      .enter()
      .append('rect') // 或其他圖形元素
      .attr('class', 'element')
      .style('fill', (d, i) => this.colorScale.getColor(i));

    // 使用 BaseChart 工具函數
    this.renderAxes(chartArea, { xScale, yScale }, {
      showXAxis: true,
      showYAxis: true
    });

    if (this.props.showLabels) {
      this.renderBarLabels(chartArea, this.processedData, {
        show: true,
        position: 'top',
        fontSize: '11px',
        fontColor: '#374151'
      }, { xScale, yScale });
    }
  }

  protected getChartType(): string {
    return 'component';
  }
}

// 4. React 組件包裝
export const ComponentChart = createChartComponent<ComponentChartProps>(D3ComponentChart);
```

## 🎯 最佳實踐

### 1. 工具函數選擇指南

| 圖表類型 | 推薦工具函數 |
|----------|-------------|
| 條形圖/柱狀圖 | `renderAxes()` + `renderBarLabels()` |
| 線圖/面積圖 | `renderAxes()` |
| 散點圖 | `renderAxes()` + `renderPointLabels()` |
| 餅圖/環形圖 | `renderLegend()` + `renderArcLabels()` |
| 熱力圖 | `renderAxes()` |
| 特殊圖表 | 自定義渲染 + 適當的工具函數 |

### 2. 顏色管理指南

```typescript
// 離散分類顏色
colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b']
interpolate: false

// 連續漸變顏色  
colors: ['#blue', '#red']
interpolate: true

// 主題色彩
colors: this.props.colors || DEFAULT_COLORS
```

### 3. 錯誤處理模式

```typescript
// DataProcessor 錯誤
if (result.errors.length > 0) {
  this.handleError(new Error(result.errors.join(', ')));
  return;
}

// 數據驗證錯誤
if (!this.processedData?.length) {
  this.handleError(new Error('No valid data provided'));
  return;
}
```

## 📈 覆蓋率統計

- **renderAxes()**: 5/7 組件使用 (71%)
- **renderBarLabels()**: 1/7 組件使用 (14%)
- **renderPointLabels()**: 1/7 組件使用 (14%)
- **renderArcLabels()**: 1/7 組件使用 (14%)
- **renderLegend()**: 1/7 組件使用 (14%)
- **DataProcessor**: 7/7 組件使用 (100%)
- **ColorScale**: 7/7 組件使用 (100%)

## 🔄 下一步改進

1. **增加工具函數使用率**
   - 為更多組件添加標籤支援
   - 標準化圖例使用

2. **新增工具函數**
   - `renderTooltips()` - 統一工具提示
   - `renderAnimations()` - 統一動畫效果

3. **性能優化**
   - 工具函數缺存機制
   - 批量渲染優化

## 📝 結論

BaseChart 工具函數體系已經建立了堅實的基礎，所有組件都使用了核心的 DataProcessor 和 ColorScale。軸線渲染覆蓋率最高，而標籤和圖例工具函數還有很大的提升空間。

通過統一使用這些工具函數，確保了組件間的一致性、減少了代碼重複，並提高了整體的可維護性。