/**
 * BarChart 核心邏輯 - 純 TypeScript 實現
 * 完全框架無關，可用於任何前端框架
 */

import * as d3 from 'd3';
import { BaseChartCore } from '../../../core/base-chart/core/base-chart-core';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';
import type { BaseChartCoreConfig, ChartStateCallbacks } from '../../../core/types';
import type { DataMapping } from '../../../core/data-processor/types';

export interface BarChartData {
  [key: string]: string | number | Date | boolean | null | undefined;
}

// 擴展基礎配置以支援 BarChart 特有屬性
export interface BarChartCoreConfig extends BaseChartCoreConfig<BarChartData> {
  // BarChart 特有配置
  orientation?: 'vertical' | 'horizontal';
  colors?: string[];
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;

  // 統一軸線系統配置
  xTickCount?: number;
  yTickCount?: number;
  xTickFormat?: (domainValue: unknown, index: number) => string;
  yTickFormat?: (domainValue: unknown, index: number) => string;
  showLabels?: boolean;
  labelPosition?: 'top' | 'center' | 'bottom';
  labelFormat?: (value: unknown) => string;
  barOpacity?: number;
  strokeWidth?: number;
  strokeColor?: string;
  tooltipFormat?: (data: import('../../../core/types').ChartData<BarChartData>) => string;
  onDataClick?: (data: import('../../../core/types').ChartData<BarChartData>) => void;
  onHover?: (data: import('../../../core/types').ChartData<BarChartData> | null) => void;

  // 數據映射
  mapping?: DataMapping; // 從 DataMapping 導入
  xKey?: string;
  yKey?: string;
  xAccessor?: (d: unknown) => unknown;
  yAccessor?: (d: unknown) => unknown;
}

/**
 * BarChart 的核心實現類
 * 繼承 BaseChartCore，實現長條圖的特定邏輯
 */
export class BarChartCore extends BaseChartCore<BarChartData> {
  protected scales: {
    xScale?: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
    yScale?: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;
  } = {};
  protected colorScale?: ColorScale;

  constructor(config: BarChartCoreConfig, callbacks: ChartStateCallbacks = {}) {
    super(config, callbacks);
  }

  public getChartType(): string {
    return 'bar';
  }

  protected processData(): import('../../../core/types').ChartData<BarChartData>[] {
    const config = this.config as BarChartCoreConfig;
    const { data, mapping, xKey, yKey, xAccessor, yAccessor } = config;

    // 使用統一的數據處理器
    const processor = new DataProcessor({
      mapping: mapping,
      keys: { x: xKey, y: yKey },
      accessors: { x: xAccessor, y: yAccessor },
      autoDetect: true,
    });

    const result = processor.process(data);

    if (result.errors.length > 0) {
      this.handleError(new Error(result.errors.join(', ')));
      return [];
    }

    return result.data as import('../../../core/types').ChartData<BarChartData>[];
  }

  protected createScales(): Record<string, d3.ScaleBand<string> | d3.ScaleLinear<number, number>> {
    const config = this.config as BarChartCoreConfig;
    const { orientation = 'vertical', colors } = config;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    if (!this.processedData || this.processedData.length === 0) {
      return {};
    }

    let xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
    let yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;

    if (orientation === 'vertical') {
      // 垂直長條圖：X軸為類別，Y軸為數值
      xScale = d3.scaleBand()
        .domain(this.processedData.map(d => String(d.x)))
        .range([0, chartWidth])
        .padding(0.1);

      const yValues = this.processedData.map(d => Number(d.y)).filter(v => !isNaN(v));
      const yMax = d3.max(yValues) || 0;
      yScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([chartHeight, 0])
        .nice();
    } else {
      // 水平長條圖：X軸為數值，Y軸為類別
      const xValues = this.processedData.map(d => Number(d.y)).filter(v => !isNaN(v));
      const xMax = d3.max(xValues) || 0;
      xScale = d3.scaleLinear()
        .domain([0, xMax])
        .range([0, chartWidth])
        .nice();

      yScale = d3.scaleBand()
        .domain(this.processedData.map(d => String(d.x)))
        .range([0, chartHeight])
        .padding(0.1);
    }

    // 創建顏色比例尺
    const dataLength = this.processedData.length;
    this.colorScale = createColorScale(colors || ['#3b82f6'], [0, Math.max(0, dataLength - 1)]);

    this.scales = { xScale, yScale };
    return this.scales;
  }

  protected renderChart(): void {
    if (!this.svgElement || !this.processedData || this.processedData.length === 0) return;

    const config = this.config as BarChartCoreConfig;
    const { orientation = 'vertical', animate = true, animationDuration = 750 } = config;
    const { xScale, yScale } = this.scales;

    // 創建 SVG 容器
    const container = this.createSVGContainer();

    // 渲染長條
    const bars = container
      .selectAll('.bar')
      .data(this.processedData)
      .join('rect')
      .attr('class', 'bar')
      .attr('data-testid', (_, i) => `bar-${i}`)
      .attr('fill', (_d, i) => this.colorScale?.getColor(i) || '#3b82f6')
      .attr('stroke', 'none');

    if (orientation === 'vertical') {
      // 垂直長條圖
      const xBandScale = xScale as d3.ScaleBand<string>;
      const yLinearScale = yScale as d3.ScaleLinear<number, number>;

      bars
        .attr('x', d => xBandScale(String(d.x)) || 0)
        .attr('width', xBandScale.bandwidth())
        .attr('y', yLinearScale(0)) // 動畫起始位置
        .attr('height', 0);

      // 添加動畫
      if (animate) {
        bars.transition()
          .duration(animationDuration)
          .ease(d3.easeBackOut)
          .attr('y', d => yLinearScale(Number(d.y)))
          .attr('height', d => yLinearScale(0) - yLinearScale(Number(d.y)));
      } else {
        bars
          .attr('y', d => yLinearScale(Number(d.y)))
          .attr('height', d => yLinearScale(0) - yLinearScale(Number(d.y)));
      }
    } else {
      // 水平長條圖
      const xLinearScale = xScale as d3.ScaleLinear<number, number>;
      const yBandScale = yScale as d3.ScaleBand<string>;

      bars
        .attr('x', 0)
        .attr('y', d => yBandScale(String(d.x)) || 0)
        .attr('width', 0) // 動畫起始位置
        .attr('height', yBandScale.bandwidth());

      // 添加動畫
      if (animate) {
        bars.transition()
          .duration(animationDuration)
          .ease(d3.easeBackOut)
          .attr('width', d => xLinearScale(Number(d.y)));
      } else {
        bars.attr('width', d => xLinearScale(Number(d.y)));
      }
    }

    // 添加互動事件
    this.addInteractionEvents(bars);

    // 渲染軸線（如果啟用）
    this.renderAxes(container);
  }

  /**
   * 添加互動事件
   */
  private addInteractionEvents(selection: d3.Selection<d3.BaseType | SVGRectElement, import('../../../core/types').ChartData<BarChartData>, SVGGElement, unknown>): void {
    const config = this.config as BarChartCoreConfig;
    const { interactive, onDataClick, onHover } = config;

    if (!interactive) return;

    selection
      .on('mouseover', (event, d) => {
        // 顯示工具提示
        const [x, y] = d3.pointer(event, this.containerElement);
        this.showTooltip(x, y, `${d.x}: ${d.y}`);
        onHover?.(d);
      })
      .on('mouseout', () => {
        this.hideTooltip();
        onHover?.(null);
      })
      .on('click', (_event, d) => {
        onDataClick?.(d);
      })
      .style('cursor', 'pointer');
  }

  /**
   * 渲染軸線 - 使用 BaseChartCore 的統一軸線系統
   */
  private renderAxes(_container: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    const config = this.config as BarChartCoreConfig;
    const { showXAxis = true, showYAxis = true } = config;
    const { xScale, yScale } = this.scales;

    // 使用 BaseChartCore 的統一軸線系統
    if (showXAxis && xScale) {
      this.renderXAxis(xScale, {
        label: config.xAxisLabel,
        tickCount: config.xTickCount,
        tickFormat: config.xTickFormat,
        showGrid: config.showGrid
      });
    }

    if (showYAxis && yScale) {
      this.renderYAxis(yScale, {
        label: config.yAxisLabel,
        tickCount: config.yTickCount,
        tickFormat: config.yTickFormat,
        showGrid: config.showGrid
      });
    }
  }

  /**
   * 舊的軸線實現已移除，現在使用 BaseChartCore 的統一軸線系統
   * 備份的舊實現保留在註解中以供參考：
   * 
   * X 軸渲染（根據 orientation 調整）:
   * const xAxis = orientation === 'vertical' 
   *   ? d3.axisBottom(xScale as any)
   *   : d3.axisBottom(xScale as d3.ScaleLinear<number, number>);
   * 
   * Y 軸渲染（根據 orientation 調整）:
   * const yAxis = orientation === 'vertical'
   *   ? d3.axisLeft(yScale as d3.ScaleLinear<number, number>)
   *   : d3.axisLeft(yScale as any);
   */

  /**
   * 公開 API - 獲取處理後的數據
   */
  public getProcessedData(): import('../../../core/types').ChartData<BarChartData>[] {
    return this.processedData ? [...this.processedData] : [];
  }

  /**
   * 公開 API - 獲取比例尺
   */
  public getScales(): typeof this.scales {
    return { ...this.scales };
  }
}