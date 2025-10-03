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
  D3Selection
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
  
  // 新增：統一軸線系統配置
  xTickCount?: number;
  yTickCount?: number;
  xTickFormat?: (domainValue: any, index: number) => string;
  yTickFormat?: (domainValue: any, index: number) => string;
  
  // 特殊功能
  showTrendline?: boolean;
  enableBrushZoom?: boolean;
  enableCrosshair?: boolean;
  enableVoronoi?: boolean;
  
  // 智能邊距功能
  autoMargin?: boolean;              // 自動邊距，默認 true
  paddingRatio?: number;             // 邊距比例，默認 0.05 (5%)
  minPadding?: number;               // 最小邊距像素，默認 5px
  
  // 事件處理
  onDataClick?: (data: ProcessedScatterDataPoint, event: Event) => void;
  onDataHover?: (data: ProcessedScatterDataPoint | null, event: Event) => void;
  onBrushZoom?: (domain: { x: [number, number]; y: [number, number] } | null) => void;
}

// 主要的 ScatterPlot 核心類
export class ScatterPlotCore extends BaseChartCore<ScatterPlotData> {
  private scatterProcessedData: ProcessedScatterDataPoint[] = [];
  private colorScale: ColorScale | null = null;
  private sizeScale: d3.ScaleLinear<number, number> | null = null;
  private trendlineData: { x: number; y: number }[] | null = null;
  
  // 添加缺失的屬性
  private chartGroup: D3Selection | null = null;
  private chartWidth: number = 0;
  private chartHeight: number = 0;
  private scatterGroup: D3Selection | null = null;
  
  // 交互控制器
  private _brushZoomController: any = null;
  private _crosshairController: any = null;
  private _voronoiController: any = null;

  constructor(
    config: ScatterPlotCoreConfig,
    callbacks = {}
  ) {
    super(config, callbacks);
  }

  public getChartType(): string {
    return 'scatter-plot';
  }

  protected getChartAxisDefaults() {
    return {
      xAxis: { includeOrigin: false, nice: true },
      yAxis: { includeOrigin: false, nice: true }
    };
  }

  protected processData(): ChartData<ScatterPlotData>[] {
    const config = this.config as ScatterPlotCoreConfig;
    
    // 使用基類的數據驗證
    if (!this.validateData()) {
      this.scatterProcessedData = [];
      return [];
    }
    
    const { data, xAccessor, yAccessor, sizeAccessor, colorAccessor } = config;
    
    // 處理數據點 - 使用與 FunnelChartCore 相同的模式
    this.scatterProcessedData = data.map((item, index) => {
      // 處理 X 值
      let x: number | Date;
      if (typeof xAccessor === 'function') {
        const xValue = xAccessor(item, index, data);
        x = (typeof xValue === 'string') ? parseFloat(xValue) || 0 : xValue;
      } else if (typeof xAccessor === 'string' || typeof xAccessor === 'number') {
        const xValue = item[xAccessor];
        x = (typeof xValue === 'string') ? parseFloat(xValue) || 0 : xValue as number | Date;
      } else {
        const xValue = item.x;
        x = (typeof xValue === 'string') ? parseFloat(xValue) || 0 : xValue as number | Date;
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

    // 返回原始數據以符合 BaseChartCore 介面
    return data;
  }

  protected createScales(): Record<string, any> {
    const config = this.config as ScatterPlotCoreConfig;
    const { sizeAccessor, colorAccessor } = config;

    if (!this.scatterProcessedData || this.scatterProcessedData.length === 0) {
      return {
        xScale: d3.scaleLinear().range([0, this.chartWidth]),
        yScale: d3.scaleLinear().range([this.chartHeight, 0])
      };
    }
    
    // 檢查圖表尺寸是否有效
    if (this.chartWidth <= 0 || this.chartHeight <= 0) {
      // 返回基本比例尺，等待正確的尺寸
      return { 
        xScale: d3.scaleLinear().range([0, 800]),
        yScale: d3.scaleLinear().range([400, 0])
      };
    }

    // 創建 X 和 Y 比例尺
    const xValues = this.scatterProcessedData.map(d => d.x);
    const yValues = this.scatterProcessedData.map(d => d.y);
    
    const xScale = this.createXScale(xValues);
    const yScale = this.createYScale(yValues);
    
    // 創建尺寸比例尺
    if (sizeAccessor) {
      const sizeValues = this.scatterProcessedData.map(d => d.size).filter(s => s !== undefined) as number[];
      if (sizeValues.length > 0) {
        this.sizeScale = d3.scaleLinear()
          .domain(d3.extent(sizeValues) as [number, number])
          .range([config.minPointSize || 2, config.maxPointSize || 20]);
      }
    }

    // 創建顏色比例尺
    if (colorAccessor && config.colors) {
      this.colorScale = createColorScale(config.colors, [0, Math.max(0, this.scatterProcessedData.length - 1)]);
    }

    return {
      xScale,
      yScale,
      sizeScale: this.sizeScale,
      colorScale: this.colorScale
    };
  }

  /**
   * 計算當前配置下的最大點半徑
   */
  private calculateMaxPointRadius(): number {
    const config = this.config as ScatterPlotCoreConfig;
    const baseRadius = config.pointRadius || 4;
    
    // 如果有 sizeScale，使用最大值
    if (this.sizeScale && config.maxPointSize) {
      return config.maxPointSize;
    }
    
    return baseRadius;
  }

  // 移除本地的 calculateSmartPadding 方法，使用 BaseChartCore 的通用方法

  private createXScale(values: (number | Date)[]): d3.ScaleLinear<number, number> | d3.ScaleTime<number, number> {
    if (values.length === 0) return d3.scaleLinear().range([0, this.chartWidth]);
    
    const config = this.config as ScatterPlotCoreConfig;
    
    // 使用 BaseChartCore 的通用智能邊距方法
    const maxRadius = this.calculateMaxPointRadius();
    const [rangeStart, rangeEnd] = this.getSmartScaleRange(this.chartWidth, maxRadius, 'points', false);
    
    // 檢查是否為日期類型
    if (values[0] instanceof Date) {
      return d3.scaleTime()
        .domain(d3.extent(values) as [Date, Date])
        .range([rangeStart, rangeEnd]);
    }
    
    // 數值類型 - 使用統一的域值計算系統
    const numericValues = values as number[];
    const domain = this.calculateAxisDomain(
      numericValues,
      config.xAxis,
      { includeOrigin: config.includeOrigin, beginAtZero: config.beginAtZero }
    );
    
    const scale = d3.scaleLinear()
      .domain(domain)
      .range([rangeStart, rangeEnd]);
    
    // 應用 nice() 如果配置啟用
    const axisConfig = config.xAxis || {};
    if (axisConfig.nice !== false) {
      scale.nice();
    }
    
    return scale;
  }

  private createYScale(values: number[]): d3.ScaleLinear<number, number> {
    if (values.length === 0) return d3.scaleLinear().range([this.chartHeight, 0]);
    
    const config = this.config as ScatterPlotCoreConfig;
    
    // 使用 BaseChartCore 的通用智能邊距方法
    const maxRadius = this.calculateMaxPointRadius();
    const [rangeStart, rangeEnd] = this.getSmartScaleRange(this.chartHeight, maxRadius, 'points', true);
    
    // 使用統一的域值計算系統
    const domain = this.calculateAxisDomain(
      values,
      config.yAxis,
      { includeOrigin: config.includeOrigin, beginAtZero: config.beginAtZero }
    );
    
    const scale = d3.scaleLinear()
      .domain(domain)
      .range([rangeStart, rangeEnd]);
    
    // 應用 nice() 如果配置啟用
    const axisConfig = config.yAxis || {};
    if (axisConfig.nice !== false) {
      scale.nice();
    }
    
    return scale;
  }

  protected renderChart(): void {
    // 先確保有數據
    if (!this.scatterProcessedData || this.scatterProcessedData.length === 0) {
      return;
    }
    
    // 始終重新計算圖表尺寸（修復位置！）
    const margin = this.config.margin || { top: 20, right: 30, bottom: 40, left: 40 };
    const width = (this.config.width || 600);
    const height = (this.config.height || 400);
    this.chartWidth = width - margin.left - margin.right;
    this.chartHeight = height - margin.top - margin.bottom;
    
    // 現在檢查圖表尺寸是否有效
    if (this.chartWidth <= 0 || this.chartHeight <= 0) {
      return;
    }
    
    // 創建或更新 chartGroup（使用 BaseChartCore 的統一方法）
    this.chartGroup = this.createSVGContainer() as unknown as D3Selection;

    const config = this.config as ScatterPlotCoreConfig;
    
    // 注意：processData() 已經在基類的 initialize() 中被調用，
    // 並且 this.scatterProcessedData 已經在那裡被設置了
    // 這裡只需要確保數據存在
    if (!this.scatterProcessedData || this.scatterProcessedData.length === 0) {
      return;
    }
    
    // 創建比例尺
    const scales = this.createScales();
    const { xScale, yScale } = scales;
    
    // 確保 chartGroup 存在
    if (!this.chartGroup) {
      return;
    }

    // 創建散點組
    this.scatterGroup = this.chartGroup
      .append('g')
      .attr('class', 'scatter-points') as unknown as D3Selection;

    // 渲染數據點
    this.renderDataPoints(xScale, yScale);

    // 渲染軸線
    // 使用 BaseChartCore 的統一軸線系統
    if (config.showXAxis !== false) {
      this.renderXAxis(xScale, {
        label: config.xAxisLabel,
        tickCount: config.xTickCount,
        tickFormat: config.xTickFormat,
        tickSizeOuter: config.axisConfig?.tickSizeOuter,
        showGrid: config.showGrid
      });
    }
    
    if (config.showYAxis !== false) {
      this.renderYAxis(yScale, {
        label: config.yAxisLabel,
        tickCount: config.yTickCount,
        tickFormat: config.yTickFormat,
        tickSizeOuter: config.axisConfig?.tickSizeOuter,
        showGrid: config.showGrid
      });
    }

    // 網格現在由 BaseChartCore 的軸線系統統一處理
    // 舊的 renderGrid() 調用已移除

    // 渲染趨勢線
    if (config.showTrendline) this.renderTrendline(xScale, yScale);

    // 設置交互功能
    this.setupInteractions(xScale, yScale);
  }

  private renderDataPoints(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    if (!this.scatterGroup) {
      return;
    }

    const config = this.config as ScatterPlotCoreConfig;
    const pointRadius = config.pointRadius || 4;

    const points = this.scatterGroup
      .selectAll<SVGCircleElement, ProcessedScatterDataPoint>('.scatter-point')
      .data(this.scatterProcessedData)
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
        // 🎯 處理 tooltip 顯示
        this.handleMouseOver(event, d);
        config.onDataHover?.(d, event);
      })
      .on('mouseleave', (event) => {
        // 🎯 處理 tooltip 隱藏
        this.handleMouseOut();
        config.onDataHover?.(null, event);
      });
  }

  /* 
   * 舊的軸線實現已移除，現在使用 BaseChartCore 的統一軸線系統
   * 備份的舊實現保留在註解中以供參考：
   * 
   * protected renderXAxis(scale) {
   *   const axis = d3.axisBottom(scale);
   *   this.chartGroup.append('g').attr('class', 'x-axis')
   *     .attr('transform', `translate(0, ${this.chartHeight})`).call(axis);
   *   // 軸標籤實現...
   * }
   * 
   * protected renderYAxis(scale) {
   *   const axis = d3.axisLeft(scale);  
   *   this.chartGroup.append('g').attr('class', 'y-axis').call(axis);
   *   // 軸標籤實現...
   * }
   */

  private _renderGrid(
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
    if (!this.chartGroup || this.scatterProcessedData.length < 2) return;

    // 計算線性回歸
    const xValues = this.scatterProcessedData.map(d => Number(d.x));
    const yValues = this.scatterProcessedData.map(d => d.y);

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
    _xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    _yScale: d3.ScaleLinear<number, number>
  ): void {
    // 簡化的筆刷縮放實現
    // 在實際應用中需要使用更完整的 BrushZoomController
  }

  private setupCrosshair(): void {
    // 簡化的十字準線實現
    // 在實際應用中需要使用 CrosshairController
  }

  private setupVoronoi(
    _xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    _yScale: d3.ScaleLinear<number, number>
  ): void {
    // 實現 Voronoi 圖以優化鼠標懸停檢測
  }

  // 🎯 Tooltip 事件處理方法
  private handleMouseOver = (event: MouseEvent, data: ProcessedScatterDataPoint): void => {
    if (!this.containerElement) return;
    
    // 計算相對於容器的座標
    const containerRect = this.containerElement.getBoundingClientRect();
    const x = event.clientX - containerRect.left;
    const y = event.clientY - containerRect.top;
    
    // 格式化 tooltip 內容
    const content = this.formatTooltipContent(data);
    
    // 通過 callback 通知 React 層顯示 tooltip
    this.callbacks.onTooltipShow?.(x, y, content);
  }

  private handleMouseOut = (): void => {
    // 通過 callback 通知 React 層隱藏 tooltip
    this.callbacks.onTooltipHide?.();
  }

  private formatTooltipContent(data: ProcessedScatterDataPoint): string {
    const items = [
      `X: ${typeof data.x === 'number' ? data.x.toFixed(2) : String(data.x)}`,
      `Y: ${data.y.toFixed(2)}`,
      ...(data.size !== undefined ? [`Size: ${data.size.toFixed(1)}`] : []),
      ...(data.color !== undefined ? [`Color: ${data.color}`] : [])
    ];
    
    return `資料點 ${data.index + 1}\n${items.join('\n')}`;
  }

  // 公共方法：更新配置
  public updateConfig(newConfig: Partial<ScatterPlotCoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.renderChart();
  }

  // 公共方法：獲取當前數據
  public getCurrentData(): ProcessedScatterDataPoint[] {
    return this.scatterProcessedData;
  }

  // 公共方法：高亮特定數據點
  public highlightPoints(indices: number[]): void {
    if (!this.scatterGroup) return;

    const points = this.scatterGroup.selectAll<SVGCircleElement, ProcessedScatterDataPoint>('.scatter-point');

    points
      .classed('highlighted', d => indices.includes(d.index))
      .attr('stroke', d => indices.includes(d.index) ? '#000' : 'none')
      .attr('stroke-width', d => indices.includes(d.index) ? 2 : 0);
  }
}