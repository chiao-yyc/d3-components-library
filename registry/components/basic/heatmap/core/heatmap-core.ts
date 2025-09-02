/**
 * HeatmapCore - 基於 BaseChartCore 架構的熱力圖核心實現
 * 繼承自 BaseChartCore，保持框架無關
 */

import * as d3 from 'd3';
import { BaseChartCore } from '../../../core/base-chart/core';
import { 
  BaseChartData, 
  ChartData, 
  BaseChartCoreConfig, 
  DataKeyOrAccessor,
  D3Selection
} from '../../../core/types';
import { ColorScale, createColorScale } from '../../../core/color-scheme/color-manager';

export interface HeatmapData extends BaseChartData {
  x?: string | number;
  y?: string | number;
  value?: number;
  [key: string]: string | number | Date | boolean | null | undefined;
}

export interface HeatmapDataPoint {
  x: string | number;
  y: string | number;
  value: number;
  xIndex: number;
  yIndex: number;
  normalizedValue: number;
  originalData: ChartData<HeatmapData>;
}

export interface HeatmapCoreConfig extends BaseChartCoreConfig<HeatmapData> {
  // 數據存取
  xAccessor?: DataKeyOrAccessor<HeatmapData, string | number>;
  yAccessor?: DataKeyOrAccessor<HeatmapData, string | number>;
  valueAccessor?: DataKeyOrAccessor<HeatmapData, number>;

  // 熱力圖特定設定
  cellPadding?: number;
  cellRadius?: number;

  // 顏色映射
  colorScheme?: 'blues' | 'greens' | 'reds' | 'oranges' | 'purples' | 'greys' | 'custom';
  colors?: string[];
  domain?: [number, number];

  // 軸線配置
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisFormat?: (d: any) => string;
  yAxisFormat?: (d: any) => string;
  xAxisRotation?: number;
  yAxisRotation?: number;

  // 圖例配置
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  legendTitle?: string;
  legendFormat?: (d: number) => string;

  // 標籤配置
  showValues?: boolean;
  valueFormat?: (d: number) => string;
  textColor?: string | ((value: number, normalizedValue: number) => string);

  // 事件處理 - 標準命名
  onDataClick?: (data: HeatmapDataPoint, event: MouseEvent) => void;
  onDataHover?: (data: HeatmapDataPoint | null, event: MouseEvent) => void;

  // 動畫配置
  animationDelay?: number;
}

export class HeatmapCore extends BaseChartCore<HeatmapData> {
  private processedDataPoints: HeatmapDataPoint[] = [];
  private xValues: string[] = [];
  private yValues: string[] = [];
  private colorScale: d3.ScaleSequential<string, never> | null = null;
  protected scales: Record<string, any> = {};
  protected config: HeatmapCoreConfig;

  constructor(config: HeatmapCoreConfig, callbacks: any = {}) {
    super(config, callbacks);
    this.config = config;
  }

  public getChartType(): string {
    return 'heatmap';
  }

  protected processData(): ChartData<HeatmapData>[] {
    const config = this.config;
    const { data, xAccessor, yAccessor, valueAccessor } = config;

    if (!data?.length) {
      this.processedDataPoints = [];
      this.xValues = [];
      this.yValues = [];
      return data;
    }

    // 處理數據點
    const rawDataPoints: Array<{x: string | number, y: string | number, value: number, originalData: ChartData<HeatmapData>}> = [];
    
    data.forEach((datum, index) => {
      const x = this.getAccessorValue(xAccessor, datum, index) ?? datum.x ?? '';
      const y = this.getAccessorValue(yAccessor, datum, index) ?? datum.y ?? '';
      const value = this.getAccessorValue(valueAccessor, datum, index) ?? datum.value ?? 0;

      rawDataPoints.push({
        x: String(x),
        y: String(y),
        value: Number(value),
        originalData: datum
      });
    });

    // 提取唯一的 x 和 y 值
    const uniqueXValues = [...new Set(rawDataPoints.map(d => String(d.x)))];
    const uniqueYValues = [...new Set(rawDataPoints.map(d => String(d.y)))];
    
    this.xValues = uniqueXValues.sort();
    this.yValues = uniqueYValues.sort();

    // 計算值域範圍
    const values = rawDataPoints.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;

    // 生成處理後的數據點
    this.processedDataPoints = rawDataPoints.map(d => ({
      x: d.x,
      y: d.y,
      value: d.value,
      xIndex: this.xValues.indexOf(String(d.x)),
      yIndex: this.yValues.indexOf(String(d.y)),
      normalizedValue: valueRange === 0 ? 0 : (d.value - minValue) / valueRange,
      originalData: d.originalData
    }));

    return data;
  }

  private getAccessorValue<T>(
    accessor: DataKeyOrAccessor<HeatmapData, T> | undefined,
    data: HeatmapData,
    index: number
  ): T | undefined {
    if (!accessor) return undefined;
    
    if (typeof accessor === 'function') {
      return accessor(data, index, this.config.data || []);
    } else {
      return data[accessor as string] as T;
    }
  }

  protected createScales(): Record<string, any> {
    const { chartWidth, chartHeight } = this.getChartDimensions();
    const { cellPadding = 1 } = this.config;
    
    // 創建 X 比例尺（band scale for categorical data）
    const xScale = d3.scaleBand()
      .domain(this.xValues)
      .range([0, chartWidth])
      .padding(cellPadding / 100);

    // 創建 Y 比例尺
    const yScale = d3.scaleBand()
      .domain(this.yValues)
      .range([0, chartHeight])
      .padding(cellPadding / 100);

    // 創建顏色比例尺並存儲
    const colorScale = this.createColorScale();

    return { xScale, yScale, colorScale };
  }

  private createColorScale(): d3.ScaleSequential<string, never> {
    const { colorScheme = 'blues', colors, domain } = this.config;
    
    // 計算值域
    const values = this.processedDataPoints.map(d => d.value);
    const actualDomain = domain || [Math.min(...values), Math.max(...values)];


    let colorScale;
    if (colors) {
      // 自定義顏色
      colorScale = d3.scaleSequential()
        .domain(actualDomain)
        .interpolator(d3.interpolateRgbBasis(colors));
    } else {
      // 使用預設顏色方案
      let interpolator;
      switch (colorScheme) {
        case 'blues':
          interpolator = d3.interpolateBlues;
          break;
        case 'greens':
          interpolator = d3.interpolateGreens;
          break;
        case 'reds':
          interpolator = d3.interpolateReds;
          break;
        case 'oranges':
          interpolator = d3.interpolateOranges;
          break;
        case 'purples':
          interpolator = d3.interpolatePurples;
          break;
        case 'greys':
          interpolator = d3.interpolateGreys;
          break;
        default:
          interpolator = d3.interpolateBlues;
      }

      colorScale = d3.scaleSequential()
        .domain(actualDomain)
        .interpolator(interpolator);
    }

    this.colorScale = colorScale;
    return colorScale;
  }

  protected renderChart(): void {
    if (!this.validateData()) return;

    // 創建比例尺
    this.scales = this.createScales();
    
    // 確保色彩比例尺正確初始化
    this.colorScale = this.scales.colorScale;
    
    const chartArea = this.createSVGContainer();
    
    // 為軸線渲染添加 chart-area 類名  
    chartArea.classed('chart-area', true);
    
    this.renderHeatmap(chartArea);
    
    // 軸線渲染由 BaseChartCore 處理
    console.log('🔧 HeatmapCore renderChart - axis config:', { 
      showXAxis: this.config.showXAxis, 
      showYAxis: this.config.showYAxis,
      xScale: !!this.scales.xScale,
      yScale: !!this.scales.yScale
    });
    
    if (this.config.showXAxis) {
      console.log('🔧 Rendering X axis with scale:', this.scales.xScale.domain());
      this.renderXAxis(this.scales.xScale, {
        tickFormat: this.config.xAxisFormat
      });
    }
    
    if (this.config.showYAxis) {
      console.log('🔧 Rendering Y axis with scale:', this.scales.yScale.domain());
      this.renderYAxis(this.scales.yScale, {
        tickFormat: this.config.yAxisFormat
      });
    }

    if (this.config.showLegend) {
      // 圖例需要在 SVG 根元素上渲染以正確定位
      const svg = d3.select(this.svgElement as SVGSVGElement);
      this.renderLegend(svg as any);
    }
  }

  private renderHeatmap(container: D3Selection<SVGGElement>): void {
    const config = this.config;
    const { 
      animate = true,
      animationDuration = 750,
      cellRadius = 0,
      showValues = false,
      valueFormat = (d: number) => d.toString(),
      textColor = '#000000'
    } = config;

    const xScale = this.scales?.xScale as d3.ScaleBand<string>;
    const yScale = this.scales?.yScale as d3.ScaleBand<string>;

    if (!xScale || !yScale || !this.colorScale) {
      console.error('Scales not properly initialized');
      return;
    }

    // 創建單元格組
    const cells = container.selectAll('.heatmap-cell')
      .data(this.processedDataPoints, (d: any) => `${d.x}-${d.y}`)
      .enter()
      .append('g')
      .attr('class', 'heatmap-cell')
      .attr('transform', d => `translate(${xScale(String(d.x))}, ${yScale(String(d.y))})`);

    // 繪製矩形
    const rects = cells.append('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => {
        const color = this.colorScale!(d.value);
        // Debug first few cells
        if (this.processedDataPoints.indexOf(d) < 3) {
          console.log(`🔥 Cell ${d.x}-${d.y}: value=${d.value}, color=${color}`);
        }
        return color;
      })
      .attr('rx', cellRadius)
      .attr('ry', cellRadius);

    // 添加數值標籤
    if (showValues) {
      cells.append('text')
        .attr('class', 'cell-value')
        .attr('x', xScale.bandwidth() / 2)
        .attr('y', yScale.bandwidth() / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', typeof textColor === 'function' ? 
          (d: HeatmapDataPoint) => textColor(d.value, d.normalizedValue) : 
          textColor)
        .style('font-size', '12px')
        .text(d => valueFormat(d.value));
    }

    // 添加交互
    this.addInteractivity(cells);

    // 添加動畫
    if (animate) {
      rects
        .attr('opacity', 0)
        .transition()
        .duration(animationDuration)
        .delay((d, i) => (config.animationDelay || 0) + i * 20)
        .attr('opacity', 1);
    }
  }


  private renderLegend(container: D3Selection<SVGGElement>): void {
    const config = this.config;
    const { 
      legendPosition = 'right',
      legendTitle = 'Value',
      legendFormat = (d: number) => d.toString()
    } = config;

    if (!this.colorScale) return;

    const { chartWidth, chartHeight, margin, width, height } = this.getChartDimensions();
    
    // 創建圖例組
    const legendGroup = container.append('g').attr('class', 'heatmap-legend');

    // 設置圖例位置 - 基於整個 SVG 尺寸，考慮邊距
    let legendX = 0, legendY = 0;
    switch (legendPosition) {
      case 'top':
        legendX = width / 2;
        legendY = margin.top / 2;
        break;
      case 'bottom':
        legendX = width / 2;
        legendY = height - margin.bottom / 2;
        break;
      case 'left':
        legendX = margin.left / 2;
        legendY = height / 2;
        break;
      case 'right':
      default:
        legendX = width - margin.right / 2;
        legendY = height / 2;
    }

    legendGroup.attr('transform', `translate(${legendX}, ${legendY})`);

    // 創建顏色漸變
    const defs = container.select('defs').empty() ? container.append('defs') : container.select('defs');
    const gradientId = `heatmap-gradient-${Math.random().toString(36).substr(2, 9)}`;
    
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('gradientUnits', 'userSpaceOnUse');

    if (legendPosition === 'top' || legendPosition === 'bottom') {
      gradient.attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%');
    } else {
      gradient.attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    }

    const domain = this.colorScale.domain();
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const value = domain[0] + (i / steps) * (domain[1] - domain[0]);
      gradient.append('stop')
        .attr('offset', `${(i / steps) * 100}%`)
        .attr('stop-color', this.colorScale(value));
    }

    // 繪製圖例矩形
    const legendWidth = legendPosition === 'top' || legendPosition === 'bottom' ? 200 : 20;
    const legendHeight = legendPosition === 'top' || legendPosition === 'bottom' ? 20 : 200;

    legendGroup.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', `url(#${gradientId})`);

    // 添加標題
    legendGroup.append('text')
      .attr('class', 'legend-title')
      .attr('text-anchor', 'middle')
      .attr('x', legendWidth / 2)
      .attr('y', -5)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(legendTitle);

    // 添加刻度標籤
    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
      const value = domain[0] + (i / tickCount) * (domain[1] - domain[0]);
      const tickPos = (i / tickCount) * (legendPosition === 'top' || legendPosition === 'bottom' ? legendWidth : legendHeight);
      
      legendGroup.append('text')
        .attr('class', 'legend-tick')
        .attr('text-anchor', 'middle')
        .attr('x', legendPosition === 'top' || legendPosition === 'bottom' ? tickPos : legendWidth + 10)
        .attr('y', legendPosition === 'top' || legendPosition === 'bottom' ? legendHeight + 15 : tickPos + 4)
        .style('font-size', '10px')
        .text(legendFormat(value));
    }
  }

  private addInteractivity(cells: any): void {
    const config = this.config;
    
    if (!config.interactive) return;

    cells
      .style('cursor', 'pointer')
      .on('click', (event: MouseEvent, d: HeatmapDataPoint) => {
        config.onDataClick?.(d, event);
      })
      .on('mouseover', (event: MouseEvent, d: HeatmapDataPoint) => {
        // 添加懸停效果
        d3.select(event.currentTarget as SVGGElement)
          .select('rect')
          .style('stroke', '#333')
          .style('stroke-width', '2px');

        config.onDataHover?.(d, event);
        
        // 計算相對於圖表容器的座標（修復 tooltip 偏移問題）
        const containerRect = this.containerElement.getBoundingClientRect();
        const tooltipX = event.clientX - containerRect.left;
        const tooltipY = event.clientY - containerRect.top;
        
        this.showTooltip(tooltipX, tooltipY, this.formatTooltipContent(d));
      })
      .on('mouseout', (event: MouseEvent, d: HeatmapDataPoint) => {
        // 移除懸停效果
        d3.select(event.currentTarget as SVGGElement)
          .select('rect')
          .style('stroke', null)
          .style('stroke-width', null);

        config.onDataHover?.(null, event);
        this.hideTooltip();
      });
  }

  private formatTooltipContent(data: HeatmapDataPoint): string {
    const { valueFormat = (d: number) => d.toString() } = this.config;
    return `X: ${data.x}<br>Y: ${data.y}<br>Value: ${valueFormat(data.value)}`;
  }

  // 公開 API
  public getProcessedDataPoints(): HeatmapDataPoint[] {
    return [...this.processedDataPoints];
  }

  public getXValues(): string[] {
    return [...this.xValues];
  }

  public getYValues(): string[] {
    return [...this.yValues];
  }

  public updateColorScale(colorScheme?: string, colors?: string[]): void {
    this.config.colorScheme = colorScheme as any || this.config.colorScheme;
    this.config.colors = colors || this.config.colors;
    this.createColorScale();
    this.renderChart();
  }
}