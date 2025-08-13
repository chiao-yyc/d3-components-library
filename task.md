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
**注意事項：**

*   在修改檔案之前，請確保備份相關檔案。
*   路徑 `../../../../core/base-chart/base-chart` 是基於 `registry/components/basic/bar-chart/core/bar-chart.ts` 到 `registry/components/core/base-chart/base-chart.ts` 的相對路徑，請仔細檢查。
*   在 `renderChart()` 中，`this.createSVGContainer()` 會返回一個 `d3.Selection<SVGGElement, unknown, null, undefined>`，您應該將其賦值給一個變數（例如 `const g = this.createSVGContainer();`），然後使用這個 `g` 變數來繪製圖表元素。
*   `BaseChart` 已經處理了 `svgRef` 和 `containerRef`，所以 `D3BarChart` 類別本身不需要再定義這些 `useRef`。
*   `BaseChart` 的 `render()` 方法會處理 React 元件的渲染，`D3BarChart` 只需要專注於 D3 繪製邏輯。
*   `BaseChart` 的 `update()` 方法會自動呼叫 `processData()`, `createScales()`, `renderChart()`，所以 `D3BarChart` 不需要手動呼叫這些方法。
*   `BaseChart` 的 `destroy()` 方法會清理 SVG，所以 `D3BarChart` 不需要手動清理。

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