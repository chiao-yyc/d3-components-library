/**
 * BarChart 核心邏輯 - 純 TypeScript 實現
 * 完全框架無關，可用於任何前端框架
 */

import * as d3 from 'd3';
import { BaseChartCore } from '../../../core/base-chart/core/base-chart-core';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';
import type { BaseChartCoreConfig, ChartStateCallbacks } from '../../../core/types';
import type { ProcessedDataPoint, BarChartConfig } from '../core/types';

// 擴展基礎配置以支援 BarChart 特有屬性
export interface BarChartCoreConfig extends BaseChartCoreConfig {
  // BarChart 特有配置
  orientation?: 'vertical' | 'horizontal';
  colors?: string[];
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLabels?: boolean;
  labelPosition?: 'top' | 'center' | 'bottom';
  labelFormat?: (value: any) => string;
  barOpacity?: number;
  strokeWidth?: number;
  strokeColor?: string;
  tooltipFormat?: (data: ProcessedDataPoint) => string;
  onDataClick?: (data: ProcessedDataPoint) => void;
  onHover?: (data: ProcessedDataPoint | null) => void;
  
  // 數據映射
  mapping?: any; // 從 DataMapping 導入
  xKey?: string;
  yKey?: string;
  xAccessor?: (d: any) => any;
  yAccessor?: (d: any) => any;
}

/**
 * BarChart 的核心實現類
 * 繼承 BaseChartCore，實現長條圖的特定邏輯
 */
export class BarChartCore extends BaseChartCore<any> {
  private processedData: ProcessedDataPoint[] = [];
  private scales: {
    xScale?: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
    yScale?: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;
  } = {};
  private colorScale?: ColorScale;

  constructor(config: BarChartCoreConfig, callbacks: ChartStateCallbacks = {}) {
    super(config, callbacks);
  }

  public getChartType(): string {
    return 'bar';
  }

  protected processData(): ProcessedDataPoint[] {
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

    this.processedData = result.data as ProcessedDataPoint[];
    return this.processedData;
  }

  protected createScales(): Record<string, any> {
    const config = this.config as BarChartCoreConfig;
    const { orientation = 'vertical', colors } = config;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    let xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
    let yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;

    if (orientation === 'vertical') {
      // 垂直長條圖：X軸為類別，Y軸為數值
      xScale = d3.scaleBand()
        .domain(this.processedData.map(d => String(d.x)))
        .range([0, chartWidth])
        .padding(0.1);

      const yMax = d3.max(this.processedData, d => d.y) || 0;
      yScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([chartHeight, 0])
        .nice();
    } else {
      // 水平長條圖：X軸為數值，Y軸為類別
      const xMax = d3.max(this.processedData, d => d.y) || 0;
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
    this.colorScale = createColorScale(colors || ['#3b82f6'], 'ordinal');

    this.scales = { xScale, yScale };
    return this.scales;
  }

  protected renderChart(): void {
    if (!this.svgElement || !this.processedData.length) return;

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
      .attr('fill', (d, i) => this.colorScale?.getColor(i) || '#3b82f6')
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
          .attr('y', d => yLinearScale(d.y))
          .attr('height', d => yLinearScale(0) - yLinearScale(d.y));
      } else {
        bars
          .attr('y', d => yLinearScale(d.y))
          .attr('height', d => yLinearScale(0) - yLinearScale(d.y));
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
          .attr('width', d => xLinearScale(d.y));
      } else {
        bars.attr('width', d => xLinearScale(d.y));
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
  private addInteractionEvents(selection: d3.Selection<any, ProcessedDataPoint, any, any>): void {
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
      .on('click', (event, d) => {
        onDataClick?.(d);
      })
      .style('cursor', 'pointer');
  }

  /**
   * 渲染軸線
   */
  private renderAxes(container: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    const config = this.config as BarChartCoreConfig;
    const { showXAxis = true, showYAxis = true, orientation = 'vertical' } = config;
    const { chartWidth, chartHeight } = this.getChartDimensions();
    const { xScale, yScale } = this.scales;

    // X 軸
    if (showXAxis && xScale) {
      const xAxis = orientation === 'vertical' 
        ? d3.axisBottom(xScale as any)
        : d3.axisBottom(xScale as d3.ScaleLinear<number, number>);
      
      container.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(xAxis);
    }

    // Y 軸
    if (showYAxis && yScale) {
      const yAxis = orientation === 'vertical'
        ? d3.axisLeft(yScale as d3.ScaleLinear<number, number>)
        : d3.axisLeft(yScale as any);
      
      container.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);
    }
  }

  /**
   * 公開 API - 獲取處理後的數據
   */
  public getProcessedData(): ProcessedDataPoint[] {
    return [...this.processedData];
  }

  /**
   * 公開 API - 獲取比例尺
   */
  public getScales(): typeof this.scales {
    return { ...this.scales };
  }
}