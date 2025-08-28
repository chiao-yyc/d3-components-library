/**
 * ScatterPlotCore - 純 JS/TS 的散點圖核心實現
 * 繼承自 BaseChartCore，保持框架無關
 */

import * as d3 from 'd3';
import { BaseChartCore } from '../../../core/base-chart/core';
import { 
  BaseChartData, 
  ChartData, 
  BaseChartCoreConfig, 
  DataKeyOrAccessor,
  D3Selection,
  ChartStateCallbacks
} from '../../../core/types';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';

// ScatterPlot 專用數據接口
export interface ScatterPlotData extends BaseChartData {
  x?: number | string | Date;
  y?: number;
  size?: number;
  color?: string | number;
  [key: string]: string | number | Date | boolean | null | undefined;
}

// 處理後的數據點
export interface ProcessedScatterDataPoint {
  x: number | Date;
  y: number;
  size?: number;
  color?: string | number;
  originalData: ChartData<ScatterPlotData>;
  index: number;
}

// ScatterPlot 專用配置接口
export interface ScatterPlotCoreConfig extends BaseChartCoreConfig {
  // 數據映射
  xAccessor?: DataKeyOrAccessor<ScatterPlotData, number | string | Date>;
  yAccessor?: DataKeyOrAccessor<ScatterPlotData, number>;
  sizeAccessor?: DataKeyOrAccessor<ScatterPlotData, number>;
  colorAccessor?: DataKeyOrAccessor<ScatterPlotData, string | number>;
  
  // 視覺樣式
  colors?: string[];
  pointRadius?: number;
  minPointSize?: number;
  maxPointSize?: number;
  opacity?: number;
  strokeWidth?: number;
  strokeColor?: string;
  
  // 軸線配置
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  
  // 特殊功能
  showTrendline?: boolean;
  enableBrushZoom?: boolean;
  enableCrosshair?: boolean;
  enableVoronoi?: boolean;
  
  // 事件處理
  onDataClick?: (data: ProcessedScatterDataPoint, event: Event) => void;
  onDataHover?: (data: ProcessedScatterDataPoint | null, event: Event) => void;
  onBrushZoom?: (domain: { x: [number, number]; y: [number, number] } | null) => void;
}

// 主要的 ScatterPlot 核心類
export class ScatterPlotCore extends BaseChartCore<ScatterPlotData> {
  private processedData: ProcessedScatterDataPoint[] = [];
  private colorScale: ColorScale | null = null;
  private sizeScale: d3.ScaleLinear<number, number> | null = null;
  private trendlineData: { x: number; y: number }[] | null = null;
  private scatterGroup: D3Selection | null = null;
  
  // 交互控制器
  private brushZoomController: any = null;
  private crosshairController: any = null;
  private voronoiController: any = null;

  constructor(
    config: ScatterPlotCoreConfig,
    callbacks?: ChartStateCallbacks<ScatterPlotData>
  ) {
    super(config, callbacks);
  }

  protected processData(): { 
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>;
    yScale: d3.ScaleLinear<number, number>;
    data: ProcessedScatterDataPoint[] 
  } {
    const config = this.config as ScatterPlotCoreConfig;
    const { data, xAccessor, yAccessor, sizeAccessor, colorAccessor } = config;

    if (!data || data.length === 0) {
      this.processedData = [];
      return {
        xScale: d3.scaleLinear().range([0, this.chartWidth]),
        yScale: d3.scaleLinear().range([this.chartHeight, 0]),
        data: []
      };
    }
    
    // 處理數據點 - 使用與 FunnelChartCore 相同的模式
    this.processedData = data.map((item, index) => {
      // 處理 X 值
      let x: number | Date;
      if (typeof xAccessor === 'function') {
        x = xAccessor(item, index, data);
      } else if (typeof xAccessor === 'string' || typeof xAccessor === 'number') {
        x = item[xAccessor] as number | Date;
      } else {
        x = item.x as number | Date;
      }

      // 處理 Y 值
      let y: number;
      if (typeof yAccessor === 'function') {
        y = yAccessor(item, index, data);
      } else if (typeof yAccessor === 'string' || typeof yAccessor === 'number') {
        y = Number(item[yAccessor]) || 0;
      } else {
        y = Number(item.y) || 0;
      }

      // 處理 Size 值
      let size: number | undefined;
      if (sizeAccessor) {
        if (typeof sizeAccessor === 'function') {
          size = sizeAccessor(item, index, data);
        } else if (typeof sizeAccessor === 'string' || typeof sizeAccessor === 'number') {
          size = Number(item[sizeAccessor]);
        }
      }

      // 處理 Color 值
      let color: string | number | undefined;
      if (colorAccessor) {
        if (typeof colorAccessor === 'function') {
          color = colorAccessor(item, index, data);
        } else if (typeof colorAccessor === 'string' || typeof colorAccessor === 'number') {
          color = item[colorAccessor] as string | number;
        }
      }

      return {
        x,
        y,
        size,
        color,
        originalData: item,
        index
      };
    });

    // 創建比例尺
    const xValues = this.processedData.map(d => d.x);
    const yValues = this.processedData.map(d => d.y);
    
    const xScale = this.createXScale(xValues);
    const yScale = this.createYScale(yValues);
    
    // 創建尺寸比例尺
    if (sizeAccessor) {
      const sizeValues = this.processedData.map(d => d.size).filter(s => s !== undefined) as number[];
      if (sizeValues.length > 0) {
        this.sizeScale = d3.scaleLinear()
          .domain(d3.extent(sizeValues) as [number, number])
          .range([config.minPointSize || 2, config.maxPointSize || 20]);
      }
    }

    // 創建顏色比例尺
    if (colorAccessor && config.colors) {
      this.colorScale = createColorScale(config.colors, this.processedData.length);
    }

    return { xScale, yScale, data: this.processedData };
  }

  private createXScale(values: (number | Date)[]): d3.ScaleLinear<number, number> | d3.ScaleTime<number, number> {
    if (values.length === 0) return d3.scaleLinear().range([0, this.chartWidth]);
    
    // 檢查是否為日期類型
    if (values[0] instanceof Date) {
      return d3.scaleTime()
        .domain(d3.extent(values) as [Date, Date])
        .range([0, this.chartWidth]);
    }
    
    // 數值類型
    return d3.scaleLinear()
      .domain(d3.extent(values as number[]) as [number, number])
      .range([0, this.chartWidth]);
  }

  private createYScale(values: number[]): d3.ScaleLinear<number, number> {
    if (values.length === 0) return d3.scaleLinear().range([this.chartHeight, 0]);
    
    return d3.scaleLinear()
      .domain(d3.extent(values) as [number, number])
      .range([this.chartHeight, 0]);
  }

  protected renderChart(): void {
    if (!this.chartGroup || this.processedData.length === 0) return;

    const config = this.config as ScatterPlotCoreConfig;
    const { xScale, yScale } = this.processData();

    // 清除之前的內容
    this.chartGroup.selectAll('*').remove();

    // 創建散點組
    this.scatterGroup = this.chartGroup
      .append('g')
      .attr('class', 'scatter-points');

    // 渲染數據點
    this.renderDataPoints(xScale, yScale);

    // 渲染軸線
    if (config.showXAxis !== false) this.renderXAxis(xScale);
    if (config.showYAxis !== false) this.renderYAxis(yScale);

    // 渲染網格
    if (config.showGrid) this.renderGrid(xScale, yScale);

    // 渲染趨勢線
    if (config.showTrendline) this.renderTrendline(xScale, yScale);

    // 設置交互功能
    this.setupInteractions(xScale, yScale);
  }

  private renderDataPoints(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    if (!this.scatterGroup) return;

    const config = this.config as ScatterPlotCoreConfig;
    const pointRadius = config.pointRadius || 4;

    const points = this.scatterGroup
      .selectAll<SVGCircleElement, ProcessedScatterDataPoint>('.scatter-point')
      .data(this.processedData)
      .join('circle')
      .attr('class', 'scatter-point')
      .attr('cx', d => xScale(d.x as any) || 0)
      .attr('cy', d => yScale(d.y))
      .attr('r', d => {
        if (this.sizeScale && d.size !== undefined) {
          return this.sizeScale(d.size);
        }
        return pointRadius;
      })
      .attr('fill', (d, i) => {
        if (this.colorScale && d.color !== undefined) {
          return this.colorScale.getColor(i);
        }
        return config.colors?.[0] || '#3b82f6';
      })
      .attr('opacity', config.opacity || 0.7)
      .attr('stroke', config.strokeColor || 'none')
      .attr('stroke-width', config.strokeWidth || 0);

    // 添加點擊和懸停事件
    points
      .on('click', (event, d) => {
        config.onDataClick?.(d, event);
      })
      .on('mouseenter', (event, d) => {
        config.onDataHover?.(d, event);
      })
      .on('mouseleave', (event) => {
        config.onDataHover?.(null, event);
      });
  }

  private renderXAxis(scale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>): void {
    if (!this.chartGroup) return;

    const config = this.config as ScatterPlotCoreConfig;
    const axis = d3.axisBottom(scale);

    this.chartGroup
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.chartHeight})`)
      .call(axis);

    // 添加軸標籤
    if (config.xAxisLabel) {
      this.chartGroup
        .append('text')
        .attr('class', 'x-axis-label')
        .attr('x', this.chartWidth / 2)
        .attr('y', this.chartHeight + 40)
        .attr('text-anchor', 'middle')
        .text(config.xAxisLabel);
    }
  }

  private renderYAxis(scale: d3.ScaleLinear<number, number>): void {
    if (!this.chartGroup) return;

    const config = this.config as ScatterPlotCoreConfig;
    const axis = d3.axisLeft(scale);

    this.chartGroup
      .append('g')
      .attr('class', 'y-axis')
      .call(axis);

    // 添加軸標籤
    if (config.yAxisLabel) {
      this.chartGroup
        .append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -this.chartHeight / 2)
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .text(config.yAxisLabel);
    }
  }

  private renderGrid(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    if (!this.chartGroup) return;

    // X軸網格
    this.chartGroup
      .append('g')
      .attr('class', 'x-grid')
      .attr('transform', `translate(0, ${this.chartHeight})`)
      .call(d3.axisBottom(xScale).tickSize(-this.chartHeight).tickFormat('' as any))
      .selectAll('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 0.5);

    // Y軸網格
    this.chartGroup
      .append('g')
      .attr('class', 'y-grid')
      .call(d3.axisLeft(yScale).tickSize(-this.chartWidth).tickFormat('' as any))
      .selectAll('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 0.5);
  }

  private renderTrendline(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    if (!this.chartGroup || this.processedData.length < 2) return;

    // 計算線性回歸
    const xValues = this.processedData.map(d => Number(d.x));
    const yValues = this.processedData.map(d => d.y);

    const n = xValues.length;
    const sumX = d3.sum(xValues);
    const sumY = d3.sum(yValues);
    const sumXY = d3.sum(xValues.map((x, i) => x * yValues[i]));
    const sumXX = d3.sum(xValues.map(x => x * x));

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 創建趨勢線數據
    const xExtent = d3.extent(xValues) as [number, number];
    this.trendlineData = [
      { x: xExtent[0], y: slope * xExtent[0] + intercept },
      { x: xExtent[1], y: slope * xExtent[1] + intercept }
    ];

    // 渲染趨勢線
    const line = d3.line<{ x: number; y: number }>()
      .x(d => xScale(d.x) || 0)
      .y(d => yScale(d.y));

    this.chartGroup
      .append('path')
      .datum(this.trendlineData)
      .attr('class', 'trendline')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.7);
  }

  private setupInteractions(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    const config = this.config as ScatterPlotCoreConfig;

    // 實現筆刷縮放
    if (config.enableBrushZoom) {
      this.setupBrushZoom(xScale, yScale);
    }

    // 實現十字準線
    if (config.enableCrosshair) {
      this.setupCrosshair();
    }

    // 實現 Voronoi 懸停
    if (config.enableVoronoi) {
      this.setupVoronoi(xScale, yScale);
    }
  }

  private setupBrushZoom(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    // 簡化的筆刷縮放實現
    // 在實際應用中需要使用更完整的 BrushZoomController
    console.log('Setting up brush zoom for ScatterPlot');
  }

  private setupCrosshair(): void {
    // 簡化的十字準線實現
    // 在實際應用中需要使用 CrosshairController
    console.log('Setting up crosshair for ScatterPlot');
  }

  private setupVoronoi(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    // 實現 Voronoi 圖以優化鼠標懸停檢測
    console.log('Setting up Voronoi interaction for ScatterPlot');
  }

  // 公共方法：更新配置
  public updateConfig(newConfig: Partial<ScatterPlotCoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.renderChart();
  }

  // 公共方法：獲取當前數據
  public getCurrentData(): ProcessedScatterDataPoint[] {
    return this.processedData;
  }

  // 公共方法：高亮特定數據點
  public highlightPoints(indices: number[]): void {
    if (!this.scatterGroup) return;

    this.scatterGroup
      .selectAll('.scatter-point')
      .classed('highlighted', (d: ProcessedScatterDataPoint) => indices.includes(d.index))
      .attr('stroke', (d: ProcessedScatterDataPoint) => 
        indices.includes(d.index) ? '#000' : 'none'
      )
      .attr('stroke-width', (d: ProcessedScatterDataPoint) => 
        indices.includes(d.index) ? 2 : 0
      );
  }
}