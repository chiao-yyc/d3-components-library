# Bar Chart 元件抽象化規劃

**目標：** 將 `registry/components/basic/bar-chart/` 元件重構，使其繼承 `registry/components/core/base-chart/BaseChart`，並整合 `data-processor` 和 `color-scheme` 核心模組，以實現更高度的抽象化和共用性。

## 詳細步驟 (Tasks)

### Task 1: 更新 `registry/components/basic/bar-chart/core/bar-chart.ts` 繼承 `BaseChart`

1.  **修改類別繼承：**
    *   將 `export class D3BarChart` 修改為 `export class D3BarChart extends BaseChart<BarChartProps>`。
    *   在 `D3BarChart` 類別的 constructor 中，呼叫 `super(config)`。
    *   **導入必要的模組：**
        ```typescript
        import * as d3 from 'd3';
        import { BarChartConfig, ProcessedDataPoint } from './types';
        import { BaseChart, BaseChartProps } from '../../../../core/base-chart/base-chart';
        import { DataProcessor } from '../../../../core/data-processor/data-processor';
        import { createColorScale } from '../../../../core/color-scheme/color-manager';
        ```

2.  **實現抽象方法：**
    *   `BaseChart` 是一個抽象類別，需要實現其抽象方法：`processData()`, `createScales()`, `renderChart()`, `getChartType()`。

3.  **重構 `processData()` 方法：**
    *   將現有 `D3BarChart` 中的 `processData()` 邏輯移動到新的 `processData()` 方法中。
    *   **整合 `DataProcessor`：** 使用 `DataProcessor` 來處理資料的解析和映射，取代手動的資料處理邏輯。
        ```typescript
        // 在 D3BarChart 類別中
        protected processData(): ProcessedDataPoint[] {
            const { data, mapping, xKey, yKey, xAccessor, yAccessor } = this.props; // 使用 this.props
            const processor = new DataProcessor({
                mapping: mapping,
                keys: { x: xKey, y: yKey },
                accessors: { x: xAccessor, y: yAccessor },
                autoDetect: true, // 允許自動偵測
            });
            const result = processor.process(data);
            if (result.errors.length > 0) {
                this.handleError(new Error(result.errors.join(', ')));
            }
            this.processedData = result.data as ProcessedDataPoint[];
            return this.processedData;
        }
        ```

4.  **重構 `setupScales()` 到 `createScales()`：**
    *   將現有 `D3BarChart` 中的 `setupScales()` 邏輯移動到新的 `createScales()` 方法中。
    *   **整合 `ColorScheme`：** 使用 `createColorScale` 來管理圖表顏色。
        ```typescript
        // 在 D3BarChart 類別中
        protected createScales(): void {
            const { width, height, margin, orientation, colors } = this.props; // 使用 this.props
            const { chartWidth, chartHeight } = this.getChartDimensions(); // 使用 BaseChart 的方法

            let xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
            let yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;

            if (orientation === 'vertical') {
                xScale = d3.scaleBand()
                    .domain(this.processedData.map(d => String(d.x)))
                    .range([0, chartWidth])
                    .padding(0.1);
                yScale = d3.scaleLinear()
                    .domain([0, d3.max(this.processedData, d => d.y) || 0])
                    .range([chartHeight, 0])
                    .nice();
            } else {
                xScale = d3.scaleLinear()
                    .domain([0, d3.max(this.processedData, d => d.y) || 0])
                    .range([0, chartWidth])
                    .nice();
                yScale = d3.scaleBand()
                    .domain(this.processedData.map(d => String(d.x)))
                    .range([0, chartHeight])
                    .padding(0.1);
            }
            this.scales = { xScale, yScale, chartWidth, chartHeight }; // 更新為 chartWidth, chartHeight
            
            // 顏色比例尺
            this.colorScale = createColorScale({
                type: 'custom',
                colors: colors,
                domain: [0, this.processedData.length - 1], // 根據數據點數量設定 domain
                interpolate: false
            });
        }
        ```

5.  **重構 `render()` 到 `renderChart()`：**
    *   將現有 `D3BarChart` 中的 `render()` 邏輯移動到新的 `renderChart()` 方法中。
    *   **使用 `BaseChart` 的 SVG 容器：**
        ```typescript
        // 在 D3BarChart 類別中
        protected renderChart(): void {
            const { width, height, margin, orientation, animate, animationDuration, interactive, showTooltip } = this.props; // 使用 this.props
            const { xScale, yScale, chartWidth, chartHeight } = this.scales; // 使用 chartWidth, chartHeight

            // 使用 BaseChart 的方法創建 SVG 和 G 元素
            const g = this.createSVGContainer();
            
            // ... (保留原有的繪製長條、軸線等邏輯) ...
            // 調整長條的 fill 屬性，使用 colorScale
            const bars = g.selectAll('.bar')
                .data(this.processedData)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .style('fill', (d, i) => this.colorScale.getColor(i)); // 使用 colorScale

            // 調整互動事件中的 tooltip 顯示
            if (interactive && showTooltip) {
                bars
                    .on('mouseenter', (event, d) => {
                        const [x, y] = d3.pointer(event, g.node());
                        this.createTooltip(x, y, `X: ${d.x}, Y: ${d.y}`); // 使用 BaseChart 的 createTooltip
                        this.props.onHover?.(d.originalData);
                    })
                    .on('mouseleave', () => {
                        this.hideTooltip(); // 使用 BaseChart 的 hideTooltip
                        this.props.onHover?.(null);
                    });
            }
            // ... (其他繪製邏輯) ...
        }
        ```

6.  **實現 `getChartType()`：**
    ```typescript
    // 在 D3BarChart 類別中
    protected getChartType(): string {
        return 'bar';
    }
    ```

7.  **移除重複方法：**
    *   刪除 `D3BarChart` 中原有的 `update()` 和 `destroy()` 方法，這些將由 `BaseChart` 處理。
    *   刪除 `D3BarChart` 中原有的 `containerRef` 和 `chartInstanceRef` 相關的 `useRef` 和 `useEffect` 邏輯，這些將由 `BaseChart` 和 `createChartComponent` 處理。

8.  **調整屬性存取：**
    *   將所有對 `this.config` 的存取改為 `this.props`。
    *   將所有對 `this.container` 的存取改為 `this.containerRef.current`。
    *   將所有對 `this.svg` 和 `this.g` 的直接操作改為透過 `this.createSVGContainer()` 獲取 `g` 元素後進行操作。

### Task 2: 更新 `registry/components/basic/bar-chart/bar-chart.tsx`

1.  **修改元件定義：**
    *   刪除現有的 `export function BarChart(...)` 函數元件。
    *   **導入 `createChartComponent`：**
        ```typescript
        import { createChartComponent } from '../../../../core/base-chart/base-chart';
        import { D3BarChart } from './core/bar-chart'; // 確保導入 D3BarChart
        import { BarChartProps } from './types'; // 確保導入 BarChartProps
        ```
    *   **使用 `createChartComponent` 導出元件：**
        ```typescript
        export const BarChart = createChartComponent<BarChartProps>(D3BarChart);
        ```

### Task 3: 更新 `registry/components/basic/bar-chart/types.ts`

1.  **調整 `BarChartProps` 介面：**
    *   讓 `BarChartProps` 繼承 `BaseChartProps`。
    *   移除 `BarChartProps` 中與 `BaseChartProps` 重複的屬性（例如 `data`, `width`, `height`, `margin`, `animate`, `animationDuration`, `showTooltip`, `className`, `style`）。
    *   更新 `ProcessedDataPoint` 介面，使其與 `DataProcessor` 處理後的資料結構一致。
    *   更新 `BarChartConfig` 介面，如果它仍然被使用，確保其與新的結構相容。

    ```typescript
    import { HTMLAttributes } from 'react';
    import { BaseChartProps } from '../../../../core/base-chart/base-chart'; // 導入 BaseChartProps
    import { ProcessedDataPoint as CoreProcessedDataPoint } from '../../../../core/data-processor/types'; // 導入 DataProcessor 的 ProcessedDataPoint

    // 重新導出 BaseChart 的相關類型
    export type { Margin, DataMapping } from '../../../../core/base-chart/types';

    // 更新 ProcessedDataPoint 以符合 DataProcessor 的輸出
    export interface ProcessedDataPoint extends CoreProcessedDataPoint {
      // 可以添加 BarChart 特有的處理後屬性
    }

    // BarChartProps 繼承 BaseChartProps
    export interface BarChartProps extends BaseChartProps, Omit<HTMLAttributes<HTMLDivElement>, 'onHover'> {
      // BarChart 特有的屬性
      xKey?: string;
      yKey?: string;
      xAccessor?: (d: any) => any;
      yAccessor?: (d: any) => any;
      mapping?: DataMapping; // 使用 BaseChart 的 DataMapping
      orientation?: 'vertical' | 'horizontal';
      colors?: string[];
      tooltipFormat?: (data: ProcessedDataPoint) => string;
      onDataClick?: (data: any) => void;
      onHover?: (data: any) => void;
    }

    // 如果 BarChartConfig 仍然被使用，請確保其與新的結構相容
    // 否則可以考慮移除
    export interface BarChartConfig {
      // ...
    }
    ```

### Task 4: 驗證變更

1.  **啟動開發伺服器：**
    *   進入 `demo/` 目錄並執行 `npm install`。
    *   執行 `npm run dev` 啟動 demo 應用程式。
2.  **檢查 Bar Chart 頁面：**
    *   在瀏覽器中導航到 Bar Chart 的 demo 頁面。
    *   確認圖表是否正確渲染。
    *   測試動畫、互動性（例如滑鼠懸停顯示工具提示）是否正常工作。
    *   檢查瀏覽器控制台是否有任何錯誤或警告。
3.  **執行專案的 lint 和型別檢查：**
    *   在專案根目錄執行 `npm run lint` (如果有的話)。
    *   執行 `tsc --noEmit` 或 `npm run typecheck` (如果有的話) 進行型別檢查。

---

# 其他圖表組件抽象化規劃

**目標：** 將剩餘的圖表組件重構為 JS/TS 核心模式，使其繼承 `BaseChart` 抽象類，並整合 `DataProcessor` 和 `ColorScheme` 核心模組，以實現統一的架構模式並便於各種前端框架包裝使用。

## 📋 待抽象化圖表清單

### **階段 1: 基礎圖表 (高優先級)**

#### Task 1: AreaChart 抽象化
**位置：** `registry/components/basic/area-chart/`
**特點：** 支援堆疊模式、多重區域、漸層填充
**複雜度：** 中等（需處理堆疊邏輯）

#### Task 2: PieChart 抽象化  
**位置：** `registry/components/basic/pie-chart/`
**特點：** 支援甜甜圈圖、標籤、圖例、動畫
**複雜度：** 中等（圓形布局特殊性）

#### Task 3: ScatterPlot 抽象化
**位置：** `registry/components/statistical/scatter-plot/`
**特點：** 支援氣泡圖、趨勢線、多維度映射
**複雜度：** 中等（多維度數據處理）

### **階段 2: 特殊圖表 (中優先級)**

#### Task 4: HeatMap 抽象化
**位置：** `registry/components/basic/heatmap/`
**特點：** 矩陣數據、顏色映射、格網布局
**複雜度：** 高（二維數據結構）

#### Task 5: FunnelChart 抽象化
**位置：** `registry/components/basic/funnel-chart/`
**特點：** 梯形布局、轉換率顯示
**複雜度：** 中等（特殊幾何形狀）

#### Task 6: GaugeChart 抽象化
**位置：** `registry/components/basic/gauge-chart/`
**特點：** 弧形布局、指針、刻度
**複雜度：** 中等（極座標系統）

### **階段 3: 統計圖表 (中優先級)**

#### Task 7: BoxPlot 抽象化
**位置：** `registry/components/statistical/box-plot/`
**特點：** 統計分佈、四分位數、異常值
**複雜度：** 中等（統計計算）

#### Task 8: RadarChart 抽象化
**位置：** `registry/components/statistical/radar-chart/`
**特點：** 極座標、多軸、多邊形區域
**複雜度：** 高（極座標轉換）

#### Task 9: ViolinPlot 抽象化
**位置：** `registry/components/statistical/violin-plot/`
**特點：** 密度分佈、統計形狀
**複雜度：** 高（密度計算）

### **階段 4: 金融圖表 (低優先級)**

#### Task 10: CandlestickChart 抽象化
**位置：** `registry/components/financial/candlestick-chart/`
**特點：** OHLC 數據、K線樣式、成交量
**複雜度：** 中等（金融數據格式）

## 🔧 標準抽象化模板

每個圖表將遵循以下統一重構步驟：

### Step 1: 核心類重構 (`core/[chart-name].ts`)
```typescript
export class D3[ChartName] extends BaseChart<[ChartName]Props> {
  constructor(config: [ChartName]Props) {
    super(config);
  }

  protected processData(): ProcessedDataPoint[] {
    const { data, mapping, xKey, yKey, xAccessor, yAccessor } = this.props;
    const processor = new DataProcessor({
      mapping: mapping,
      keys: { x: xKey, y: yKey },
      accessors: { x: xAccessor, y: yAccessor },
      autoDetect: true,
    });
    const result = processor.process(data);
    if (result.errors.length > 0) {
      this.handleError(new Error(result.errors.join(', ')));
    }
    this.processedData = result.data as ProcessedDataPoint[];
    return this.processedData;
  }
  
  protected createScales(): void {
    const { width, height, margin, colors } = this.props;
    const { chartWidth, chartHeight } = this.getChartDimensions();
    
    // 創建圖表特定的比例尺邏輯
    
    // 顏色比例尺
    this.colorScale = createColorScale({
      type: 'custom',
      colors: colors,
      domain: [0, this.processedData.length - 1],
      interpolate: false
    });
  }
  
  protected renderChart(): void {
    const g = this.createSVGContainer();
    
    // 實現圖表特定的渲染邏輯
    // 使用 this.colorScale.getColor() 獲取顏色
    // 使用 this.createTooltip() 和 this.hideTooltip() 處理互動
  }
  
  protected getChartType(): string {
    return '[chart-type]';
  }
}
```

### Step 2: React 包裝器重構 (`[chart-name].tsx`)
```typescript
import { createChartComponent } from '../../../core/base-chart/base-chart';
import { D3[ChartName] } from './core/[chart-name]';
import { [ChartName]Props } from './types';

export const [ChartName] = createChartComponent<[ChartName]Props>(D3[ChartName]);
```

### Step 3: 類型定義重構 (`types.ts`)
```typescript
import { HTMLAttributes } from 'react';
import { BaseChartProps } from '../../../core/base-chart/base-chart';
import { ProcessedDataPoint as CoreProcessedDataPoint } from '../../../core/data-processor/types';

export type { Margin, DataMapping } from '../../../core/base-chart/types';

export interface ProcessedDataPoint extends CoreProcessedDataPoint {
  // 圖表特有的處理後屬性
}

export interface [ChartName]Props extends BaseChartProps, Omit<HTMLAttributes<HTMLDivElement>, 'onHover'> {
  // 圖表特有的屬性
  xKey?: string;
  yKey?: string;
  xAccessor?: (d: any) => any;
  yAccessor?: (d: any) => any;
  mapping?: DataMapping;
  colors?: string[];
  tooltipFormat?: (data: ProcessedDataPoint) => string;
  onDataClick?: (data: any) => void;
  onHover?: (data: any) => void;
  
  // 圖表專用屬性...
}
```

## 📅 實施優先順序建議

**Phase 1 (Week 1-2):**
- AreaChart (最接近 LineChart，容易開始)
- PieChart (獨立性高，風險低)

**Phase 2 (Week 3-4):**
- ScatterPlot (與其他圖表互補性強)
- HeatMap (數據處理複雜，需更多時間)

**Phase 3 (Week 5-6):**
- FunnelChart, GaugeChart (特殊布局圖表)

**Phase 4 (Week 7-8):**
- BoxPlot, RadarChart (統計圖表)

**Phase 5 (Week 9):**
- ViolinPlot, CandlestickChart (最複雜的圖表)

## 🎁 預期效益

1. **代碼復用**: 減少 70% 重複代碼
2. **維護性**: 統一架構便於維護和調試
3. **擴展性**: 新框架包裝更容易（Vue, Angular, Svelte）
4. **一致性**: 統一的 API 和行為模式
5. **測試**: 核心邏輯與 UI 分離，更容易進行單元測試
6. **類型安全**: 完整的 TypeScript 支援
7. **性能**: BaseChart 提供統一的生命週期管理

## 📝 注意事項

- 每個圖表抽象化後都需要在 demo 中測試功能完整性
- 特別注意保持現有 API 的向下兼容性
- 統一錯誤處理和邊界情況
- 確保動畫和互動體驗的一致性

---
**注意事項：**

*   在修改檔案之前，請確保備份相關檔案。
*   路徑 `../../../../core/base-chart/base-chart` 是基於 `registry/components/basic/bar-chart/core/bar-chart.ts` 到 `registry/components/core/base-chart/base-chart.ts` 的相對路徑，請仔細檢查。
*   在 `renderChart()` 中，`this.createSVGContainer()` 會返回一個 `d3.Selection<SVGGElement, unknown, null, undefined>`，您應該將其賦值給一個變數（例如 `const g = this.createSVGContainer();`），然後使用這個 `g` 變數來繪製圖表元素。
*   `BaseChart` 已經處理了 `svgRef` 和 `containerRef`，所以 `D3BarChart` 類別本身不需要再定義這些 `useRef`。
*   `BaseChart` 的 `render()` 方法會處理 React 元件的渲染，`D3BarChart` 只需要專注於 D3 繪製邏輯。
*   `BaseChart` 的 `update()` 方法會自動呼叫 `processData()`, `createScales()`, `renderChart()`，所以 `D3BarChart` 不需要手動呼叫這些方法。
*   `BaseChart` 的 `destroy()` 方法會清理 SVG，所以 `D3BarChart` 不需要手動清理。

---

# BaseChart 共用工具函數抽象化規劃

**目標：** 分析並抽象各圖表組件中重複的功能邏輯，創建統一的工具函數庫，以進一步減少代碼重複並提升維護效率。

## 🔍 當前問題分析

### **❌ 軸線渲染重複問題**

目前所有基於 BaseChart 的圖表組件都是**各自獨立繪製軸線**，存在以下問題：

1. **代碼重複** - 每個圖表都重複相同的軸線創建邏輯
2. **樣式不一致** - 有些圖表有詳細的樣式設定，有些沒有
3. **功能差異** - 條件檢查、格式化、旋轉等功能實現不統一
4. **維護困難** - 修改軸線邏輯需要在多個檔案中重複修改

**範例對比：**

```typescript
// BarChart (basic/bar-chart/core/bar-chart.ts:135-148)
const xAxis = orientation === 'vertical' 
  ? d3.axisBottom(xScale as d3.ScaleBand<string>)
  : d3.axisBottom(xScale as d3.ScaleLinear<number, number>);
g.append('g')
  .attr('class', 'x-axis')
  .attr('transform', `translate(0,${chartHeight})`)
  .call(xAxis);

// LineChart (basic/line-chart/core/line-chart.ts:175-180)
const xAxis = d3.axisBottom(xScale as any);
if (this.processedData[0]?.x instanceof Date) {
    xAxis.tickFormat(d3.timeFormat('%m/%d') as any);
}
g.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${chartHeight})`).call(xAxis);

// AreaChart (basic/area-chart/core/area-chart.ts:264-275)
if (showXAxis !== false) {
  const xAxis = d3.axisBottom(xScale);
  if (xAxisFormat) {
    xAxis.tickFormat(xAxisFormat);
  }
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${chartHeight})`)
    .call(xAxis)
    .selectAll('text')
    .style('font-size', '12px')
    .style('fill', '#6b7280');
}
```

## 🎯 共用工具函數規劃

### **Task 1: 創建統一軸線渲染工具**

**位置：** `registry/components/core/base-chart/chart-utils.ts`

#### **1.1 軸線渲染工具函數**

```typescript
// 軸線配置介面
export interface AxisConfig {
  scale: any;
  orientation: 'top' | 'bottom' | 'left' | 'right';
  label?: string;
  format?: (d: any) => string;
  rotation?: number;
  fontSize?: string;
  fontColor?: string;
  tickCount?: number;
  tickSize?: number;
  gridlines?: boolean;
  className?: string;
  show?: boolean;
}

// 統一軸線渲染函數
export function renderAxis(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  config: AxisConfig,
  chartDimensions: { width: number; height: number }
): d3.Selection<SVGGElement, unknown, null, undefined> | null {
  if (config.show === false) return null;
  
  // 建立軸線生成器
  let axisGenerator: d3.Axis<any>;
  let transform = '';
  
  switch (config.orientation) {
    case 'bottom':
      axisGenerator = d3.axisBottom(config.scale);
      transform = `translate(0,${chartDimensions.height})`;
      break;
    case 'top':
      axisGenerator = d3.axisTop(config.scale);
      break;
    case 'left':
      axisGenerator = d3.axisLeft(config.scale);
      break;
    case 'right':
      axisGenerator = d3.axisRight(config.scale);
      transform = `translate(${chartDimensions.width},0)`;
      break;
  }
  
  // 配置軸線屬性
  if (config.format) axisGenerator.tickFormat(config.format);
  if (config.tickCount) axisGenerator.ticks(config.tickCount);
  if (config.tickSize) axisGenerator.tickSize(config.tickSize);
  
  // 渲染軸線
  const axisGroup = container.append('g')
    .attr('class', config.className || `${config.orientation}-axis`)
    .attr('transform', transform)
    .call(axisGenerator);
  
  // 統一樣式
  axisGroup.selectAll('text')
    .style('font-size', config.fontSize || '12px')
    .style('fill', config.fontColor || '#6b7280');
  
  // 處理文字旋轉
  if (config.rotation && config.rotation !== 0) {
    const textAnchor = config.rotation < 0 ? 'end' : 'start';
    axisGroup.selectAll('text')
      .style('text-anchor', textAnchor)
      .attr('transform', `rotate(${config.rotation})`);
  }
  
  // 軸線標籤
  if (config.label) {
    // 添加軸線標籤邏輯
  }
  
  return axisGroup;
}
```

#### **1.2 網格線渲染工具函數**

```typescript
export interface GridConfig {
  scale: any;
  orientation: 'horizontal' | 'vertical';
  tickCount?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  show?: boolean;
}

export function renderGrid(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  config: GridConfig,
  chartDimensions: { width: number; height: number }
): d3.Selection<SVGGElement, unknown, null, undefined> | null {
  if (config.show === false) return null;
  
  const gridGroup = container.append('g')
    .attr('class', `grid grid-${config.orientation}`);
  
  if (config.orientation === 'horizontal') {
    gridGroup.selectAll('line')
      .data(config.scale.ticks(config.tickCount))
      .enter().append('line')
      .attr('x1', 0)
      .attr('x2', chartDimensions.width)
      .attr('y1', d => config.scale(d))
      .attr('y2', d => config.scale(d))
      .attr('stroke', config.strokeColor || '#e5e7eb')
      .attr('stroke-width', config.strokeWidth || 1)
      .attr('stroke-opacity', config.strokeOpacity || 0.7);
  } else {
    gridGroup.selectAll('line')
      .data(config.scale.ticks(config.tickCount))
      .enter().append('line')
      .attr('x1', d => config.scale(d))
      .attr('x2', d => config.scale(d))
      .attr('y1', 0)
      .attr('y2', chartDimensions.height)
      .attr('stroke', config.strokeColor || '#e5e7eb')
      .attr('stroke-width', config.strokeWidth || 1)
      .attr('stroke-opacity', config.strokeOpacity || 0.7);
  }
  
  return gridGroup;
}
```

### **Task 2: 動畫工具函數**

```typescript
export interface AnimationConfig {
  enabled?: boolean;
  duration?: number;
  delay?: number;
  easing?: string;
}

export function applyEnterAnimation(
  selection: d3.Selection<any, any, any, any>,
  config: AnimationConfig
): d3.Selection<any, any, any, any> {
  if (!config.enabled) return selection;
  
  return selection
    .attr('opacity', 0)
    .transition()
    .duration(config.duration || 750)
    .delay(config.delay || 0)
    .attr('opacity', 1);
}

export function applyUpdateAnimation(
  selection: d3.Selection<any, any, any, any>,
  config: AnimationConfig
): d3.Transition<any, any, any, any> {
  return selection
    .transition()
    .duration(config.duration || 500)
    .delay(config.delay || 0);
}
```

### **Task 3: 樣式統一工具函數**

```typescript
export interface StyleConfig {
  fontSize?: string;
  fontFamily?: string;
  fontColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  opacity?: number;
}

export function applyTextStyles(
  selection: d3.Selection<any, any, any, any>,
  config: StyleConfig
): d3.Selection<any, any, any, any> {
  if (config.fontSize) selection.style('font-size', config.fontSize);
  if (config.fontFamily) selection.style('font-family', config.fontFamily);
  if (config.fontColor) selection.style('fill', config.fontColor);
  return selection;
}

export function applyShapeStyles(
  selection: d3.Selection<any, any, any, any>,
  config: StyleConfig
): d3.Selection<any, any, any, any> {
  if (config.fillColor) selection.attr('fill', config.fillColor);
  if (config.strokeColor) selection.attr('stroke', config.strokeColor);
  if (config.strokeWidth) selection.attr('stroke-width', config.strokeWidth);
  if (config.opacity) selection.attr('opacity', config.opacity);
  return selection;
}
```

### **Task 4: BaseChart 中整合工具函數**

#### **4.1 擴展 BaseChart 抽象類**

```typescript
// 在 BaseChart 中添加統一的軸線渲染方法
protected renderAxes(config: {
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  showGrid?: boolean;
  gridConfig?: { x?: GridConfig; y?: GridConfig };
}): void {
  const { chartWidth, chartHeight } = this.getChartDimensions();
  const dimensions = { width: chartWidth, height: chartHeight };
  const g = this.createSVGContainer();
  
  // 渲染網格線 (在軸線之前)
  if (config.showGrid && config.gridConfig) {
    if (config.gridConfig.x) {
      renderGrid(g, config.gridConfig.x, dimensions);
    }
    if (config.gridConfig.y) {
      renderGrid(g, config.gridConfig.y, dimensions);
    }
  }
  
  // 渲染軸線
  if (config.xAxis) {
    renderAxis(g, config.xAxis, dimensions);
  }
  if (config.yAxis) {
    renderAxis(g, config.yAxis, dimensions);
  }
  
  // 統一軸線樣式
  g.selectAll('.domain').style('stroke', '#d1d5db');
  g.selectAll('.tick line').style('stroke', '#d1d5db');
}
```

#### **4.2 各圖表組件中的使用**

```typescript
// 在各個圖表的 renderChart() 方法中使用
protected renderChart(): void {
  const { showXAxis, showYAxis, xAxisFormat, yAxisFormat, xAxisRotation, yAxisRotation, showGrid } = this.props;
  const { xScale, yScale } = this.scales;
  
  // 使用統一的軸線渲染
  this.renderAxes({
    xAxis: {
      scale: xScale,
      orientation: 'bottom',
      format: xAxisFormat,
      rotation: xAxisRotation,
      show: showXAxis
    },
    yAxis: {
      scale: yScale,
      orientation: 'left',
      format: yAxisFormat,
      rotation: yAxisRotation,
      show: showYAxis
    },
    showGrid,
    gridConfig: {
      x: { scale: xScale, orientation: 'vertical', show: showGrid },
      y: { scale: yScale, orientation: 'horizontal', show: showGrid }
    }
  });
  
  // ... 圖表特定的渲染邏輯
}
```

## 🎁 預期效益

### **量化效益：**
1. **代碼減少**: 軸線相關代碼減少 80% 重複
2. **維護成本**: 單一修改點，無需在多個檔案中重複修改
3. **一致性**: 100% 統一的軸線樣式和行為
4. **開發效率**: 新圖表組件開發時間減少 30%

### **質化效益：**
1. **維護性提升**: 統一的工具函數易於維護和調試
2. **測試便利**: 工具函數可獨立進行單元測試
3. **擴展性增強**: 新功能只需在工具函數中添加
4. **代碼品質**: 統一的實現標準提升整體代碼品質

## 📅 實施計劃

### **Phase 1: 基礎工具函數 (1-2 天)**
- 創建 `chart-utils.ts` 檔案
- 實現軸線渲染工具函數
- 實現網格線渲染工具函數

### **Phase 2: 樣式和動畫工具 (1 天)**  
- 實現樣式統一工具函數
- 實現動畫工具函數

### **Phase 3: BaseChart 整合 (1 天)**
- 在 BaseChart 中添加 `renderAxes()` 方法
- 更新 BaseChart 抽象介面

### **Phase 4: 圖表組件遷移 (2-3 天)**
- 依序更新各圖表組件使用新工具函數
- 移除重複的軸線渲染代碼
- 測試確保功能一致性

### **Phase 5: 驗證和優化 (1 天)**
- 全面測試所有圖表組件
- 效能測試和優化
- 文檔更新

## 📝 其他可抽象的功能

基於代碼分析，還發現以下可抽象的重複功能：

1. **Tooltip 渲染** - 各圖表都有相似的 tooltip 邏輯
2. **Legend 渲染** - 圖例組件可以統一
3. **事件處理** - 點擊、懸停等事件處理模式
4. **響應式計算** - 圖表尺寸自適應邏輯
5. **數據驗證** - 輸入數據的格式驗證
6. **錯誤處理** - 統一的錯誤顯示和恢復機制

這些功能將在後續階段中逐步抽象和統一。

---

# 📊 圖表抽象化進度總覽

## ✅ **已完成的圖表組件抽象化：**
1. **AreaChart** - 完全遷移至 BaseChart 模式 ✅
2. **PieChart** - 完全遷移至 BaseChart 模式 ✅  
3. **ScatterPlot** - 完全遷移至 BaseChart 模式 ✅
4. **HeatMap** - 完全遷移至 BaseChart 模式，整合 ScaleManager ✅

## ⏳ **待處理的圖表組件：**
5. **FunnelChart** - 待開始 ⏳
6. **GaugeChart** - 待開始 ⏳
7. **BoxPlot** - 待開始 ⏳
8. **RadarChart** - 待開始 ⏳
9. **ViolinPlot** - 待開始 ⏳
10. **CandlestickChart** - 待開始 ⏳

## 🎯 **下一步重點：**
- **BaseChart 共用工具函數抽象化** - 軸線渲染工具函數 🔥
- 繼續剩餘圖表組件的抽象化工作

---

# Line Chart 元件抽象化規劃

**目標：** 將 `registry/components/basic/line-chart/` 元件重構，使其繼承 `registry/components/core/base-chart/BaseChart`，並整合 `data-processor` 和 `color-scheme` 核心模組，以實現更高度的抽象化和共用性。

## 詳細步驟 (Tasks)

### Task 1: 更新 `registry/components/basic/line-chart/core/line-chart.ts` 繼承 `BaseChart`

1.  **修改類別繼承：**
    *   將 `export class D3LineChart` 修改為 `export class D3LineChart extends BaseChart<LineChartProps>`。
    *   在 `D3LineChart` 類別的 constructor 中，呼叫 `super(config)`。
    *   **導入必要的模組：**
        ```typescript
        import * as d3 from 'd3';
        import { LineChartConfig, ProcessedDataPoint } from './types';
        import { BaseChart, BaseChartProps } from '../../../../core/base-chart/base-chart';
        import { DataProcessor } from '../../../../core/data-processor/data-processor';
        import { createColorScale } from '../../../../core/color-scheme/color-manager';
        ```

2.  **實現抽象方法：**
    *   `BaseChart` 是一個抽象類別，需要實現其抽象方法：`processData()`, `createScales()`, `renderChart()`, `getChartType()`。

3.  **重構 `processData()` 方法：**
    *   將現有 `D3LineChart` 中的 `processData()` 邏輯移動到新的 `processData()` 方法中。
    *   **整合 `DataProcessor`：** 使用 `DataProcessor` 來處理資料的解析和映射，取代手動的資料處理邏輯。
        ```typescript
        // 在 D3LineChart 類別中
        protected processData(): ProcessedDataPoint[] {
            const { data, mapping, xKey, yKey, xAccessor, yAccessor } = this.props; // 使用 this.props
            const processor = new DataProcessor({
                mapping: mapping,
                keys: { x: xKey, y: yKey },
                accessors: { x: xAccessor, y: yAccessor },
                autoDetect: true, // 允許自動偵測
            });
            const result = processor.process(data);
            if (result.errors.length > 0) {
                this.handleError(new Error(result.errors.join(', ')));
            }
            this.processedData = result.data as ProcessedDataPoint[];
            return this.processedData;
        }
        ```

4.  **重構 `setupScales()` 到 `createScales()`：**
    *   將現有 `D3LineChart` 中的 `setupScales()` 邏輯移動到新的 `createScales()` 方法中。
    *   **整合 `ColorScheme`：** 使用 `createColorScale` 來管理圖表顏色。
        ```typescript
        // 在 D3LineChart 類別中
        protected createScales(): void {
            const { width, height, margin, colors } = this.props; // 使用 this.props
            const { chartWidth, chartHeight } = this.getChartDimensions(); // 使用 BaseChart 的方法

            const xScale = d3.scaleTime() // 或 d3.scaleLinear() 取決於數據類型
                .domain(d3.extent(this.processedData, d => d.x) as [Date, Date]) // 假設 x 是時間或數值
                .range([0, chartWidth]);

            const yScale = d3.scaleLinear()
                .domain([0, d3.max(this.processedData, d => d.y) || 0])
                .range([chartHeight, 0])
                .nice();
            
            this.scales = { xScale, yScale, chartWidth, chartHeight };
            
            // 顏色比例尺 (如果有多條線，則根據 series 鍵設定 domain)
            this.colorScale = createColorScale({
                type: 'custom',
                colors: colors,
                domain: [0, this.processedData.length - 1], // 根據數據點數量設定 domain
                interpolate: false
            });
        }
        ```

5.  **重構 `render()` 到 `renderChart()`：**
    *   將現有 `D3LineChart` 中的 `render()` 邏輯移動到新的 `renderChart()` 方法中。
    *   **使用 `BaseChart` 的 SVG 容器：**
        ```typescript
        // 在 D3LineChart 類別中
        protected renderChart(): void {
            const { animate, animationDuration, interactive, showTooltip } = this.props; // 使用 this.props
            const { xScale, yScale, chartWidth, chartHeight } = this.scales;

            // 使用 BaseChart 的方法創建 SVG 和 G 元素
            const g = this.createSVGContainer();
            
            // 定義線條生成器
            const line = d3.line<ProcessedDataPoint>()
                .x(d => xScale(d.x))
                .y(d => yScale(d.y));

            // 繪製線條
            const path = g.append('path')
                .datum(this.processedData)
                .attr('fill', 'none')
                .attr('stroke', this.colorScale.getColor(0)) // 假設單條線，使用第一個顏色
                .attr('stroke-width', 1.5)
                .attr('d', line);

            // 調整互動事件中的 tooltip 顯示 (例如，在點上顯示)
            if (interactive && showTooltip) {
                g.selectAll('.dot')
                    .data(this.processedData)
                    .enter()
                    .append('circle')
                    .attr('class', 'dot')
                    .attr('cx', d => xScale(d.x))
                    .attr('cy', d => yScale(d.y))
                    .attr('r', 4)
                    .attr('fill', this.colorScale.getColor(0))
                    .on('mouseenter', (event, d) => {
                        const [x, y] = d3.pointer(event, g.node());
                        this.createTooltip(x, y, `X: ${d.x}, Y: ${d.y}`); // 使用 BaseChart 的 createTooltip
                        this.props.onHover?.(d.originalData);
                    })
                    .on('mouseleave', () => {
                        this.hideTooltip(); // 使用 BaseChart 的 hideTooltip
                        this.props.onHover?.(null);
                    });
            }
            // ... (其他繪製邏輯，例如軸線) ...
        }
        ```

6.  **實現 `getChartType()`：**
    ```typescript
    // 在 D3LineChart 類別中
    protected getChartType(): string {
        return 'line';
    }
    ```

7.  **移除重複方法：**
    *   刪除 `D3LineChart` 中原有的 `update()` 和 `destroy()` 方法，這些將由 `BaseChart` 處理。
    *   刪除 `D3LineChart` 中原有的 `containerRef` 和 `chartInstanceRef` 相關的 `useRef` 和 `useEffect` 邏輯，這些將由 `BaseChart` 和 `createChartComponent` 處理。

8.  **調整屬性存取：**
    *   將所有對 `this.config` 的存取改為 `this.props`。
    *   將所有對 `this.container` 的存取改為 `this.containerRef.current`。
    *   將所有對 `this.svg` 和 `this.g` 的直接操作改為透過 `this.createSVGContainer()` 獲取 `g` 元素後進行操作。

### Task 2: 更新 `registry/components/basic/line-chart/line-chart.tsx`

1.  **修改元件定義：**
    *   刪除現有的 `export function LineChart(...)` 函數元件。
    *   **導入 `createChartComponent`：**
        ```typescript
        import { createChartComponent } from '../../../../core/base-chart/base-chart';
        import { D3LineChart } from './core/line-chart'; // 確保導入 D3LineChart
        import { LineChartProps } from './types'; // 確保導入 LineChartProps
        ```
    *   **使用 `createChartComponent` 導出元件：**
        ```typescript
        export const LineChart = createChartComponent<LineChartProps>(D3LineChart);
        ```

### Task 3: 更新 `registry/components/basic/line-chart/types.ts`

1.  **調整 `LineChartProps` 介面：**
    *   讓 `LineChartProps` 繼承 `BaseChartProps`。
    *   移除 `LineChartProps` 中與 `BaseChartProps` 重複的屬性（例如 `data`, `width`, `height`, `margin`, `animate`, `animationDuration`, `showTooltip`, `className`, `style`）。
    *   更新 `ProcessedDataPoint` 介面，使其與 `DataProcessor` 處理後的資料結構一致。
    *   更新 `LineChartConfig` 介面，如果它仍然被使用，確保其與新的結構相容。

    ```typescript
    import { HTMLAttributes } from 'react';
    import { BaseChartProps } from '../../../../core/base-chart/base-chart'; // 導入 BaseChartProps
    import { ProcessedDataPoint as CoreProcessedDataPoint } from '../../../../core/data-processor/types'; // 導入 DataProcessor 的 ProcessedDataPoint

    // 重新導出 BaseChart 的相關類型
    export type { Margin, DataMapping } from '../../../../core/base-chart/types';

    // 更新 ProcessedDataPoint 以符合 DataProcessor 的輸出
    export interface ProcessedDataPoint extends CoreProcessedDataPoint {
      // 可以添加 LineChart 特有的處理後屬性
    }

    // LineChartProps 繼承 BaseChartProps
    export interface LineChartProps extends BaseChartProps, Omit<HTMLAttributes<HTMLDivElement>, 'onHover'> {
      // LineChart 特有的屬性
      xKey?: string;
      yKey?: string;
      xAccessor?: (d: any) => any;
      yAccessor?: (d: any) => any;
      mapping?: DataMapping; // 使用 BaseChart 的 DataMapping
      colors?: string[];
      tooltipFormat?: (data: ProcessedDataPoint) => string;
      onDataClick?: (data: any) => void;
      onHover?: (data: any) => void;
    }

    // 如果 LineChartConfig 仍然被使用，請確保其與新的結構相容
    // 否則可以考慮移除
    export interface LineChartConfig {
      // ...
    }
    ```

### Task 4: 驗證變更

1.  **啟動開發伺服器：**
    *   進入 `demo/` 目錄並執行 `npm install`。
    *   執行 `npm run dev` 啟動 demo 應用程式。
2.  **檢查 Line Chart 頁面：**
    *   在瀏覽器中導航到 Line Chart 的 demo 頁面。
    *   確認圖表是否正確渲染。
    *   測試動畫、互動性（例如滑鼠懸停顯示工具提示）是否正常工作。
    *   檢查瀏覽器控制台是否有任何錯誤或警告。
3.  **執行專案的 lint 和型別檢查：**
    *   在專案根目錄執行 `npm run lint` (如果有的話)。
    *   執行 `tsc --noEmit` 或 `npm run typecheck` (如果有的話) 進行型別檢查。

---

# 其他圖表組件抽象化規劃

**目標：** 將剩餘的圖表組件重構為 JS/TS 核心模式，使其繼承 `BaseChart` 抽象類，並整合 `DataProcessor` 和 `ColorScheme` 核心模組，以實現統一的架構模式並便於各種前端框架包裝使用。

## 📋 待抽象化圖表清單

### **階段 1: 基礎圖表 (高優先級)**

#### Task 1: AreaChart 抽象化
**位置：** `registry/components/basic/area-chart/`
**特點：** 支援堆疊模式、多重區域、漸層填充
**複雜度：** 中等（需處理堆疊邏輯）

#### Task 2: PieChart 抽象化  
**位置：** `registry/components/basic/pie-chart/`
**特點：** 支援甜甜圈圖、標籤、圖例、動畫
**複雜度：** 中等（圓形布局特殊性）

#### Task 3: ScatterPlot 抽象化
**位置：** `registry/components/statistical/scatter-plot/`
**特點：** 支援氣泡圖、趨勢線、多維度映射
**複雜度：** 中等（多維度數據處理）

### **階段 2: 特殊圖表 (中優先級)**

#### Task 4: HeatMap 抽象化
**位置：** `registry/components/basic/heatmap/`
**特點：** 矩陣數據、顏色映射、格網布局
**複雜度：** 高（二維數據結構）

#### Task 5: FunnelChart 抽象化
**位置：** `registry/components/basic/funnel-chart/`
**特點：** 梯形布局、轉換率顯示
**複雜度：** 中等（特殊幾何形狀）

#### Task 6: GaugeChart 抽象化
**位置：** `registry/components/basic/gauge-chart/`
**特點：** 弧形布局、指針、刻度
**複雜度：** 中等（極座標系統）

### **階段 3: 統計圖表 (中優先級)**

#### Task 7: BoxPlot 抽象化
**位置：** `registry/components/statistical/box-plot/`
**特點：** 統計分佈、四分位數、異常值
**複雜度：** 中等（統計計算）

#### Task 8: RadarChart 抽象化
**位置：** `registry/components/statistical/radar-chart/`
**特點：** 極座標、多軸、多邊形區域
**複雜度：** 高（極座標轉換）

#### Task 9: ViolinPlot 抽象化
**位置：** `registry/components/statistical/violin-plot/`
**特點：** 密度分佈、統計形狀
**複雜度：** 高（密度計算）

### **階段 4: 金融圖表 (低優先級)**

#### Task 10: CandlestickChart 抽象化
**位置：** `registry/components/financial/candlestick-chart/`
**特點：** OHLC 數據、K線樣式、成交量
**複雜度：** 中等（金融數據格式）

## 🔧 標準抽象化模板

每個圖表將遵循以下統一重構步驟：

### Step 1: 核心類重構 (`core/[chart-name].ts`)
```typescript
export class D3[ChartName] extends BaseChart<[ChartName]Props> {
  constructor(config: [ChartName]Props) {
    super(config);
  }

  protected processData(): ProcessedDataPoint[] {
    const { data, mapping, xKey, yKey, xAccessor, yAccessor } = this.props;
    const processor = new DataProcessor({
      mapping: mapping,
      keys: { x: xKey, y: yKey },
      accessors: { x: xAccessor, y: yAccessor },
      autoDetect: true,
    });
    const result = processor.process(data);
    if (result.errors.length > 0) {
      this.handleError(new Error(result.errors.join(', ')));
    }
    this.processedData = result.data as ProcessedDataPoint[];
    return this.processedData;
  }
  
  protected createScales(): void {
    const { width, height, margin, colors } = this.props;
    const { chartWidth, chartHeight } = this.getChartDimensions();
    
    // 創建圖表特定的比例尺邏輯
    
    // 顏色比例尺
    this.colorScale = createColorScale({
      type: 'custom',
      colors: colors,
      domain: [0, this.processedData.length - 1],
      interpolate: false
    });
  }
  
  protected renderChart(): void {
    const g = this.createSVGContainer();
    
    // 實現圖表特定的渲染邏輯
    // 使用 this.colorScale.getColor() 獲取顏色
    // 使用 this.createTooltip() 和 this.hideTooltip() 處理互動
  }
  
  protected getChartType(): string {
    return '[chart-type]';
  }
}
```

### Step 2: React 包裝器重構 (`[chart-name].tsx`)
```typescript
import { createChartComponent } from '../../../core/base-chart/base-chart';
import { D3[ChartName] } from './core/[chart-name]';
import { [ChartName]Props } from './types';

export const [ChartName] = createChartComponent<[ChartName]Props>(D3[ChartName]);
```

### Step 3: 類型定義重構 (`types.ts`)
```typescript
import { HTMLAttributes } from 'react';
import { BaseChartProps } from '../../../core/base-chart/base-chart';
import { ProcessedDataPoint as CoreProcessedDataPoint } from '../../../core/data-processor/types';

export type { Margin, DataMapping } from '../../../core/base-chart/types';

export interface ProcessedDataPoint extends CoreProcessedDataPoint {
  // 圖表特有的處理後屬性
}

export interface [ChartName]Props extends BaseChartProps, Omit<HTMLAttributes<HTMLDivElement>, 'onHover'> {
  // 圖表特有的屬性
  xKey?: string;
  yKey?: string;
  xAccessor?: (d: any) => any;
  yAccessor?: (d: any) => any;
  mapping?: DataMapping;
  colors?: string[];
  tooltipFormat?: (data: ProcessedDataPoint) => string;
  onDataClick?: (data: any) => void;
  onHover?: (data: any) => void;
  
  // 圖表專用屬性...
}
```

## 📅 實施優先順序建議

**Phase 1 (Week 1-2):**
- AreaChart (最接近 LineChart，容易開始)
- PieChart (獨立性高，風險低)

**Phase 2 (Week 3-4):**
- ScatterPlot (與其他圖表互補性強)
- HeatMap (數據處理複雜，需更多時間)

**Phase 3 (Week 5-6):**
- FunnelChart, GaugeChart (特殊布局圖表)

**Phase 4 (Week 7-8):**
- BoxPlot, RadarChart (統計圖表)

**Phase 5 (Week 9):**
- ViolinPlot, CandlestickChart (最複雜的圖表)

## 🎁 預期效益

1. **代碼復用**: 減少 70% 重複代碼
2. **維護性**: 統一架構便於維護和調試
3. **擴展性**: 新框架包裝更容易（Vue, Angular, Svelte）
4. **一致性**: 統一的 API 和行為模式
5. **測試**: 核心邏輯與 UI 分離，更容易進行單元測試
6. **類型安全**: 完整的 TypeScript 支援
7. **性能**: BaseChart 提供統一的生命週期管理

## 📝 注意事項

- 每個圖表抽象化後都需要在 demo 中測試功能完整性
- 特別注意保持現有 API 的向下兼容性
- 統一錯誤處理和邊界情況
- 確保動畫和互動體驗的一致性