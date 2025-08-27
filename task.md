# D3 Components 專案全面健檢與優化計劃

## 🎯 目前狀況總結

### ✅ **已完成優化**
- **EnhancedComboChart 模組化重構** - 成功拆解1100+行巨型組件 ✅
- **Demo頁面現代化** - 34個頁面全部完成現代化 (34/34 = 100%) ✅
- **核心架構統一** - 實現框架無關設計（純JS/TS核心 + React包裝） ✅
- **測試覆蓋提升** - 關鍵組件已有測試（ScatterPlot、RadarChart、AreaChart等） ✅

### 📊 **架構健康分數**: 64/100 → 目標 80+/100

## 🔧 優化計劃

### ~~**Phase 1: Demo層完成現代化**~~ ✅ **已完成！**

**🎉 重大成就：所有 34 個 Demo 頁面現代化 100% 完成！**

- ✅ **34/34 頁面** 已使用現代化架構
- ✅ **統一側邊欄佈局** - grid grid-cols-1 lg:grid-cols-4 (25頁面) + xl:grid-cols-4 (5頁面)
- ✅ **ModernControlPanel** - 統一控制面板架構
- ✅ **響應式ChartContainer** - 完整響應式支援
- ✅ **StatusDisplay + DataTable + CodeExample** - 完整展示組件

**已現代化的頁面包括**:
- **基礎圖表**: BarChart, LineChart, AreaChart, PieChart, ScatterPlot 等
- **統計圖表**: BoxPlot, ViolinPlot, HeatMap, Radar, Funnel, Gauge 等  
- **組合圖表**: 所有 Combo 系列頁面
- **工具頁面**: DataMapper, Correlogram, TreeMap 等
- **測試頁面**: Responsive, Alignment, Modular 等

### **Phase 2: Registry組件架構優化 (現為最高優先級)** 🔥

#### **測試覆蓋擴展**
- 目前只有5個組件有完整測試，需擴展至所有核心組件
- 目標：測試覆蓋率從56/100提升至80+/100

#### **Core架構完善**  
- 確保所有組件都有core/目錄結構（已達74個組件有core架構）
- 統一BaseChart繼承模式

#### **API一致性統一**
- 統一事件處理器命名和參數傳遞模式
- 標準化Props介面設計

### **Phase 3: CLI工具增強 (低優先級)** 📚

#### **功能完整性**
- 目前CLI有完整的命令結構（add、config、import、init等）
- 版本0.1.0，依賴管理完善

#### **發布準備**  
- 可考慮發布到npm供外部使用

### **Phase 4: 文檔與開發體驗 (持續改善)** 📝

#### **API文檔自動生成**
- 基於TypeScript定義生成完整文檔

#### **最佳實踐指南**
- 完善架構指南和開發規範

#### **效能監控** 
- 建立圖表渲染效能基準測試

## 📊 預期效果

### **量化指標**
- **架構健康分數**: 64/100 → 80+/100
- **測試覆蓋率**: 56/100 → 80+/100  
- **Demo頁面現代化**: ✅ 34/34 (100% 完成)
- **開發效率**: 統一架構降低新組件開發時間50%

### **質化效益**
- **用戶體驗**: 所有Demo頁面支援完整響應式設計
- **維護性**: 統一架構模式降低維護成本
- **擴展性**: 為Vue、Angular等框架適配奠定基礎
- **一致性**: 所有組件遵循統一設計原則

## 🚀 執行順序

### **立即執行 (今日)**
- ✅ **Phase 1 完成**: Demo頁面現代化 100% 完成
- 🔥 **Phase 2 啟動**: Registry組件架構優化
- 優先處理測試覆蓋擴展和API一致性統一

### **本週內**  
- **測試覆蓋擴展**: 從 56/100 → 70+/100
- **API一致性統一**: 事件處理器命名規範
- **Core架構完善**: 確保所有組件結構完整

### **下週**
- **Phase 2 完成**: 架構健康分數提升至 75+/100
- **Phase 3 啟動**: CLI工具發布準備

### **後續持續**
- **Phase 4 實施**: 效能優化和最佳實踐完善

## 📋 當前任務執行

✅ **Phase 1: Demo層完成現代化** - 已完成！

🔥 **Phase 2: Registry組件架構優化** - 現在執行，按照以下優先順序：

1. **測試覆蓋擴展** - 複製 ScatterPlot 測試模式到更多組件
2. **API一致性統一** - 統一事件處理器命名 (onDataClick vs onBarClick)  
3. **Core架構完善** - 確保所有組件都有完整 core/ 結構
4. **參數傳遞一致性** - 檢查顏色、動畫、交互系統的參數模式
5. **文檔完善** - 基於 TypeScript 定義生成 API 文檔

**Phase 2 的標準化要求**：
- 所有核心組件都有完整測試覆蓋
- 統一的事件處理器命名規範 (onDataClick, onDataHover)
- 一致的參數傳遞模式 (colors, animate, interactive)
- 完整的 core/ 目錄結構
- TypeScript 型別定義完善

---

# 歷史任務記錄

## Bar Chart 元件抽象化規劃

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