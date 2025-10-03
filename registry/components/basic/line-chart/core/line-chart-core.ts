/**
 * LineChartCore - 純 JS/TS 的折線圖核心實現
 * 繼承自 BaseChartCore，保持框架無關
 */

import * as d3 from 'd3';
import { BaseChartCore } from '../../../core/base-chart/core';
import {
  BaseChartData,
  ChartData,
  BaseChartCoreConfig,
  DataKeyOrAccessor,
  ChartStateCallbacks
} from '../../../core/types';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';

// LineChart 專用數據接口
export interface LineChartData extends BaseChartData {
  x?: number | string | Date;
  y?: number;
  category?: string | number;
  [key: string]: string | number | Date | boolean | null | undefined;
}

// 處理後的數據點
export interface ProcessedLineDataPoint {
  x: number | Date;
  y: number;
  category?: string | number;
  originalData: ChartData<LineChartData>;
  index: number;
}

// 線條系列數據
export interface LineSeriesData {
  category: string | number;
  data: ProcessedLineDataPoint[];
  color: string;
  visible: boolean;
}

// 點標記配置
export interface PointMarkerConfig {
  enabled: boolean;
  radius: number;
  fillOpacity: number;
  strokeWidth: number;
  hoverRadius?: number;
}

// LineChart 專用配置接口
export interface LineChartCoreConfig extends BaseChartCoreConfig {
  // 數據映射
  xAccessor?: DataKeyOrAccessor<LineChartData, number | string | Date>;
  yAccessor?: DataKeyOrAccessor<LineChartData, number>;
  categoryAccessor?: DataKeyOrAccessor<LineChartData, string | number>;
  
  // 線條樣式
  curve?: 'linear' | 'monotone' | 'cardinal' | 'basis' | 'step';
  strokeWidth?: number;
  strokeDasharray?: string;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeOpacity?: number;
  
  // 點標記
  showPoints?: boolean;
  pointMarker?: PointMarkerConfig;
  
  // 連接線處理
  connectNulls?: boolean;
  defined?: (d: ProcessedLineDataPoint) => boolean;
  
  // 視覺樣式
  colors?: string[];
  gradientStrokes?: boolean;
  
  // 軸線配置
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  
  // 新增：統一軸線系統配置
  xTickCount?: number;
  yTickCount?: number;
  xTickFormat?: (domainValue: unknown, index: number) => string;
  yTickFormat?: (domainValue: unknown, index: number) => string;
  
  // 特殊功能
  enableBrushZoom?: boolean;
  enableCrosshair?: boolean;
  enableTooltip?: boolean;
  enableLegend?: boolean;
  
  // Tooltip 進階配置
  tooltipMode?: 'point' | 'vertical-line' | 'line';
  showCrosshair?: boolean;
  tooltipFormat?: (data: ProcessedLineDataPoint[], x: number | Date, category?: string) => string;
  
  // 高級功能
  enableDropShadow?: boolean;
  enableGlowEffect?: boolean;
  clipPath?: boolean;
  
  // 事件處理
  onDataClick?: (data: ProcessedLineDataPoint, event: Event) => void;
  onDataHover?: (data: ProcessedLineDataPoint | null, event: Event) => void;
  onLineClick?: (series: LineSeriesData, event: Event) => void;
  onLineHover?: (series: LineSeriesData | null, event: Event) => void;
  onBrushZoom?: (domain: { x: [number, number]; y: [number, number] } | null) => void;
}

// 主要的 LineChart 核心類
export class LineChartCore extends BaseChartCore<LineChartData> {
  protected processedData: ChartData<LineChartData>[] = [];
  private internalProcessedData: ProcessedLineDataPoint[] = [];
  private seriesData: LineSeriesData[] = [];
  private _colorScale: ColorScale | null = null;
  private lineGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private pointsGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private clipPathId: string;

  // 添加缺失的屬性（與其他 Core 類別一致）
  private chartWidth: number = 0;
  private chartHeight: number = 0;
  private chartGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;

  // 交互控制器
  private _brushZoomController: any = null;
  private _crosshairController: any = null;

  // Tooltip 相關
  private tooltipOverlay: d3.Selection<SVGRectElement, unknown, null, undefined> | null = null;
  private crosshairGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;

  constructor(
    config: LineChartCoreConfig,
    callbacks?: ChartStateCallbacks
  ) {
    super(config, callbacks);
    this.clipPathId = `line-chart-clip-${Math.random().toString(36).substr(2, 9)}`;
  }

  public getChartType(): string {
    return 'line-chart'; // v9-FIXED-CREATESCALES
  }

  protected processData(): ChartData<LineChartData>[] {
    const config = this.config as LineChartCoreConfig;
    const { data, xAccessor, yAccessor, categoryAccessor } = config;

    if (!data || data.length === 0) {
      this.internalProcessedData = [];
      this.processedData = data;
      this.seriesData = [];
      return data;
    }
    
    // 處理數據點 - 使用統一的數據存取模式
    this.internalProcessedData = data.map((item, index) => {
      // 處理 X 值
      let x: number | Date;
      if (typeof xAccessor === 'function') {
        x = xAccessor(item, index, data) as number | Date;
      } else if (typeof xAccessor === 'string') {
        const xValue = item[xAccessor as keyof LineChartData];
        // 嘗試解析日期字符串
        if (typeof xValue === 'string') {
          // 檢查是否為日期格式
          const dateValue = new Date(xValue);
          x = !isNaN(dateValue.getTime()) ? dateValue : Number(xValue) || 0;
        } else {
          x = xValue as number | Date;
        }
      } else {
        x = item.x as number | Date;
      }

      // 處理 Y 值
      let y: number;
      if (typeof yAccessor === 'function') {
        y = yAccessor(item, index, data);
      } else if (typeof yAccessor === 'string') {
        const yValue = item[yAccessor as keyof LineChartData];
        y = Number(yValue) || 0;
      } else {
        y = Number(item.y) || 0;
      }

      // 處理 Category 值
      let category: string | number | undefined;
      if (categoryAccessor) {
        if (typeof categoryAccessor === 'function') {
          category = categoryAccessor(item, index, data);
        } else if (typeof categoryAccessor === 'string' || typeof categoryAccessor === 'number') {
          category = item[categoryAccessor] as string | number;
        }
      }

      return {
        x,
        y,
        category,
        originalData: item,
        index
      };
    });

    // 設置 BaseChartCore 要求的 processedData
    this.processedData = data;
    
    // 處理系列數據
    this.processSeriesData();

    // 返回原始數據以符合 BaseChartCore 介面
    return data;
  }

  protected createScales(): Record<string, any> {
    if (!this.internalProcessedData || this.internalProcessedData.length === 0) {
      return {
        xScale: d3.scaleLinear().range([0, this.chartWidth || 600]),
        yScale: d3.scaleLinear().range([this.chartHeight || 400, 0])
      };
    }

    const xValues = this.internalProcessedData.map(d => d.x);
    const yValues = this.internalProcessedData.map(d => d.y);
    
    const xScale = this.createXScale(xValues);
    const yScale = this.createYScale(yValues);

    return { xScale, yScale };
  }

  private processSeriesData(): void {
    const config = this.config as LineChartCoreConfig;
    
    if (!config.categoryAccessor) {
      // 單一系列
      this.seriesData = [{
        category: 'default',
        data: this.internalProcessedData,
        color: config.colors?.[0] || '#3b82f6',
        visible: true
      }];
    } else {
      // 多系列
      const categoryGroups = d3.group(this.internalProcessedData, d => d.category || 'default');
      const categories = Array.from(categoryGroups.keys());
      
      this.seriesData = categories.map((category, index) => ({
        category,
        data: (categoryGroups.get(category) || []).sort((a, b) => {
          // 按 x 值排序確保線條順序正確
          if (a.x instanceof Date && b.x instanceof Date) {
            return a.x.getTime() - b.x.getTime();
          }
          return Number(a.x) - Number(b.x);
        }),
        color: config.colors?.[index % (config.colors?.length || 1)] || '#3b82f6',
        visible: true
      }));
    }

    // 創建顏色比例尺
    if (config.colors) {
      this._colorScale = createColorScale(config.colors, [0, Math.max(0, this.seriesData.length - 1)]);
    }
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
      .range([0, this.chartWidth])
      .nice();
  }

  private createYScale(values: number[]): d3.ScaleLinear<number, number> {
    if (values.length === 0) return d3.scaleLinear().range([this.chartHeight, 0]);
    
    return d3.scaleLinear()
      .domain(d3.extent(values) as [number, number])
      .range([this.chartHeight, 0])
      .nice();
  }

  protected renderChart(): void {
    // Process series data first to ensure we have data to render
    if (!this.internalProcessedData || this.internalProcessedData.length === 0) {
      // If internal data not yet processed, do it now
      if (this.processedData && this.processedData.length > 0) {
        this.internalProcessedData = this.processedData.map((d, i, arr) => {
          const config = this.config as LineChartCoreConfig;
          const xAccessor = config.xAccessor || ((d: any) => d.x);
          const yAccessor = config.yAccessor || ((d: any) => d.y);
          const categoryAccessor = config.categoryAccessor;
          
          const xValue = typeof xAccessor === 'function' ? xAccessor(d, i, arr) : d[xAccessor as keyof LineChartData];
          const yValue = typeof yAccessor === 'function' ? yAccessor(d, i, arr) : d[yAccessor as keyof LineChartData];
          const categoryValue = categoryAccessor ? 
            (typeof categoryAccessor === 'function' ? categoryAccessor(d, i, arr) : d[categoryAccessor as keyof LineChartData]) : 
            undefined;

          return {
            x: xValue as number | Date,
            y: Number(yValue) || 0,
            category: categoryValue as string | number | undefined,
            originalData: d,
            index: i
          };
        });
      }
    }
    
    // Now process series data
    this.processSeriesData();
    
    if (!this.internalProcessedData || this.internalProcessedData.length === 0) {
      return;
    }

    const config = this.config as LineChartCoreConfig;
    
    // 始終重新計算圖表尺寸（與其他 Core 類別一致）
    const margin = config.margin || { top: 20, right: 20, bottom: 60, left: 60 };
    const width = config.width || 600;
    const height = config.height || 400;
    this.chartWidth = width - margin.left - margin.right;
    this.chartHeight = height - margin.top - margin.bottom;
    
    // 創建或獲取圖表組
    if (!this.chartGroup) {
      this.chartGroup = this.createSVGContainer();
    }
    
    const { xScale, yScale } = this.createScales();

    // 清除之前的內容
    this.chartGroup.selectAll('*').remove();

    // 設置裁剪路徑
    if (config.clipPath !== false) {
      this.setupClipPath();
    }

    // 創建線條組
    this.lineGroup = this.chartGroup
      .append('g')
      .attr('class', 'line-chart-group');

    // 創建點標記組
    this.pointsGroup = this.chartGroup
      .append('g')
      .attr('class', 'points-group');

    // 渲染線條
    this.renderLines(xScale, yScale);

    // 渲染點標記
    if (config.showPoints !== false) {
      this.renderPoints(xScale, yScale);
    }

    // 渲染軸線
    // 使用 BaseChartCore 的統一軸線系統
    if (config.showXAxis !== false) {
      this.renderXAxis(xScale, {
        label: config.xAxisLabel,
        tickCount: config.xTickCount,
        tickFormat: config.xTickFormat,
        showGrid: config.showGrid
      });
    }
    
    if (config.showYAxis !== false) {
      this.renderYAxis(yScale, {
        label: config.yAxisLabel,
        tickCount: config.yTickCount,
        tickFormat: config.yTickFormat,
        showGrid: config.showGrid
      });
    }

    // 網格現在由 BaseChartCore 的軸線系統統一處理
    // 舊的 renderGrid() 調用已移除

    // 設置交互功能
    this.setupInteractions(xScale, yScale);
  }

  private setupClipPath(): void {
    if (!this.chartGroup) return;

    this.chartGroup
      .append('defs')
      .append('clipPath')
      .attr('id', this.clipPathId)
      .append('rect')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight);
  }

  private renderLines(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    if (!this.lineGroup) return;

    const config = this.config as LineChartCoreConfig;
    const curve = this.getCurveFunction(config.curve);

    // 創建線條生成器
    const line = d3.line<ProcessedLineDataPoint>()
      .x(d => xScale(d.x as any) || 0)
      .y(d => yScale(d.y))
      .curve(curve);

    // 處理缺失值
    if (config.connectNulls === false) {
      line.defined(d => config.defined ? config.defined(d) : !isNaN(d.y) && d.y !== null);
    }

    // 渲染每個系列
    this.seriesData.forEach((series, seriesIndex) => {
      if (series.data.length === 0 || !series.visible) return;

      const seriesGroup = this.lineGroup!
        .append('g')
        .attr('class', `line-series-${seriesIndex}`)
        .attr('clip-path', config.clipPath !== false ? `url(#${this.clipPathId})` : null);

      // 創建線條路徑
      const linePath = seriesGroup
        .append('path')
        .datum(series.data)
        .attr('class', 'line')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', series.color)
        .attr('stroke-width', config.strokeWidth || 2)
        .attr('stroke-opacity', config.strokeOpacity || 1)
        .attr('stroke-linecap', config.strokeLinecap || 'round');

      // 應用虛線樣式
      if (config.strokeDasharray) {
        linePath.attr('stroke-dasharray', config.strokeDasharray);
      }

      // 應用特殊效果
      if (config.enableDropShadow) {
        linePath.style('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))');
      }

      if (config.enableGlowEffect) {
        linePath.style('filter', 'drop-shadow(0 0 8px currentColor)');
      }

      // 添加線條交互
      linePath
        .style('cursor', 'pointer')
        .on('click', (event) => {
          config.onLineClick?.(series, event);
        })
        .on('mouseenter', (event) => {
          linePath.attr('stroke-width', (config.strokeWidth || 2) + 1);
          config.onLineHover?.(series, event);
        })
        .on('mouseleave', (event) => {
          linePath.attr('stroke-width', config.strokeWidth || 2);
          config.onLineHover?.(null, event);
        });
    });
  }

  private renderPoints(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    if (!this.pointsGroup) return;

    const config = this.config as LineChartCoreConfig;
    const pointConfig = config.pointMarker || {
      enabled: true,
      radius: 3,
      fillOpacity: 1,
      strokeWidth: 1,
      hoverRadius: 5
    };

    this.seriesData.forEach((series, seriesIndex) => {
      if (!series.visible) return;

      const points = this.pointsGroup!
        .selectAll<SVGCircleElement, ProcessedLineDataPoint>(`.points-series-${seriesIndex}`)
        .data(series.data)
        .join('circle')
        .attr('class', `points-series-${seriesIndex}`)
        .attr('cx', d => xScale(d.x as any) || 0)
        .attr('cy', d => yScale(d.y))
        .attr('r', pointConfig.radius)
        .attr('fill', series.color)
        .attr('fill-opacity', pointConfig.fillOpacity)
        .attr('stroke', 'white')
        .attr('stroke-width', pointConfig.strokeWidth)
        .style('cursor', 'pointer');

      // 點交互
      points
        .on('click', (event, d) => {
          config.onDataClick?.(d, event);
        })
        .on('mouseenter', (event, d) => {
          d3.select(event.target)
            .transition()
            .duration(150)
            .attr('r', pointConfig.hoverRadius || pointConfig.radius + 2);
          
          config.onDataHover?.(d, event);
        })
        .on('mouseleave', (event) => {
          d3.select(event.target)
            .transition()
            .duration(150)
            .attr('r', pointConfig.radius);
          
          config.onDataHover?.(null, event);
        });
    });
  }

  private getCurveFunction(curveType?: string): any {
    switch (curveType) {
      case 'monotone': return d3.curveMonotoneX;
      case 'cardinal': return d3.curveCardinal;
      case 'basis': return d3.curveBasis;
      case 'step': return d3.curveStepAfter;
      default: return d3.curveLinear;
    }
  }

  /* 
   * 舊的軸線實現已移除，現在使用 BaseChartCore 的統一軸線系統
   * 備份的舊實現保留在註解中以供參考：
   * 
   * private renderXAxis(scale) {
   *   const axis = d3.axisBottom(scale);
   *   this.chartGroup.append('g').attr('class', 'x-axis')
   *     .attr('transform', `translate(0, ${this.chartHeight})`).call(axis);
   *   // 軸標籤實現...
   * }
   * 
   * private renderYAxis(scale) {
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

  private setupInteractions(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    const config = this.config as LineChartCoreConfig;

    // 實現筆刷縮放
    if (config.enableBrushZoom) {
      this.setupBrushZoom(xScale, yScale);
    }

    // 實現十字準線
    if (config.enableCrosshair) {
      this.setupCrosshair();
    }
    
    // 實現 Tooltip 交互
    if (config.enableTooltip !== false) {
      this.setupTooltipInteraction(xScale, yScale);
    }
  }

  private setupBrushZoom(
    _xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    _yScale: d3.ScaleLinear<number, number>
  ): void {
    console.log('Setting up brush zoom for LineChart');
  }

  private setupCrosshair(): void {
    console.log('Setting up crosshair for LineChart');
  }

  private setupTooltipInteraction(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    if (!this.chartGroup) return;

    const config = this.config as LineChartCoreConfig;
    
    // 創建透明的覆蓋層來捕獲鼠標事件
    this.tooltipOverlay = this.chartGroup
      .append('rect')
      .attr('class', 'line-chart-tooltip-overlay')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .style('cursor', 'crosshair');

    // 創建十字線組
    if (config.showCrosshair !== false) {
      this.crosshairGroup = this.chartGroup
        .append('g')
        .attr('class', 'line-chart-crosshair')
        .style('display', 'none');

      // 垂直線
      this.crosshairGroup
        .append('line')
        .attr('class', 'crosshair-vertical')
        .attr('y1', 0)
        .attr('y2', this.chartHeight)
        .attr('stroke', '#666')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .style('pointer-events', 'none');

      // 水平線
      this.crosshairGroup
        .append('line')
        .attr('class', 'crosshair-horizontal')
        .attr('x1', 0)
        .attr('x2', this.chartWidth)
        .attr('stroke', '#666')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .style('pointer-events', 'none');
    }

    // 綁定鼠標事件
    this.tooltipOverlay
      .on('mousemove', (event: MouseEvent) => {
        this.handleLineMouseMove(event, xScale, yScale);
      })
      .on('mouseleave', () => {
        this.handleLineMouseLeave();
      });
  }

  private handleLineMouseMove(
    event: MouseEvent,
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    _yScale: d3.ScaleLinear<number, number>
  ): void {
    if (!this.containerElement || !this.tooltipOverlay) return;

    const config = this.config as LineChartCoreConfig;
    const [mouseX, mouseY] = d3.pointer(event, this.tooltipOverlay.node());
    
    // 轉換鼠標座標為數據座標
    const xValue = xScale.invert(mouseX);
    
    // 根據 tooltip 模式找到相應的數據點
    const dataPoints = this.findDataPointsAtX(xValue);
    
    if (dataPoints.length === 0) {
      this.handleLineMouseLeave();
      return;
    }

    // 更新十字線位置
    if (this.crosshairGroup && config.showCrosshair !== false) {
      this.crosshairGroup.style('display', 'block');
      
      this.crosshairGroup
        .select('.crosshair-vertical')
        .attr('x1', mouseX)
        .attr('x2', mouseX);
        
      this.crosshairGroup
        .select('.crosshair-horizontal')
        .attr('y1', mouseY)
        .attr('y2', mouseY);
    }

    // 格式化 tooltip 內容
    const tooltipContent = this.formatLineTooltipContent(dataPoints, xValue);
    
    // 獲取相對於容器的座標
    const containerRect = this.containerElement.getBoundingClientRect();
    const x = event.clientX - containerRect.left;
    const y = event.clientY - containerRect.top;
    
    // 調用 tooltip 顯示回調
    this.callbacks.onTooltipShow?.(x, y, tooltipContent);
  }

  private handleLineMouseLeave(): void {
    // 隱藏十字線
    if (this.crosshairGroup) {
      this.crosshairGroup.style('display', 'none');
    }
    
    // 隱藏 tooltip
    this.callbacks.onTooltipHide?.();
  }

  private findDataPointsAtX(xValue: number | Date): ProcessedLineDataPoint[] {
    const config = this.config as LineChartCoreConfig;
    const _isTimeScale = xValue instanceof Date || typeof xValue === 'object';
    
    // 根據 tooltip 模式決定查找邏輯
    switch (config.tooltipMode) {
      case 'point':
        // 點模式：找到最接近的單個數據點
        return this.findClosestDataPoint(xValue);
        
      case 'line':
        // 線條模式：找到特定系列在 X 位置的數據點
        return this.findDataPointsOnLines(xValue);
        
      case 'vertical-line':
      default:
        // 垂直線模式：找到所有系列在相同 X 位置的數據點
        return this.findAllDataPointsAtX(xValue);
    }
  }

  private findClosestDataPoint(xValue: number | Date): ProcessedLineDataPoint[] {
    let closestPoint: ProcessedLineDataPoint | null = null;
    let minDistance = Infinity;
    
    for (const series of this.seriesData) {
      if (!series.visible) continue;
      
      for (const point of series.data) {
        const distance = typeof xValue === 'number' && typeof point.x === 'number'
          ? Math.abs(point.x - xValue)
          : xValue instanceof Date && point.x instanceof Date
            ? Math.abs(point.x.getTime() - xValue.getTime())
            : Infinity;
            
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      }
    }
    
    return closestPoint ? [closestPoint] : [];
  }

  private findDataPointsOnLines(xValue: number | Date): ProcessedLineDataPoint[] {
    // 這個方法可以用於實現沿著線條的 tooltip
    // 暫時使用與垂直線相同的邏輯
    return this.findAllDataPointsAtX(xValue);
  }

  private findAllDataPointsAtX(xValue: number | Date): ProcessedLineDataPoint[] {
    const result: ProcessedLineDataPoint[] = [];
    const tolerance = this.calculateTolerance(xValue);
    
    for (const series of this.seriesData) {
      if (!series.visible) continue;
      
      // 找到最接近的 X 值
      let closestPoint: ProcessedLineDataPoint | null = null;
      let minDistance = Infinity;
      
      for (const point of series.data) {
        const distance = typeof xValue === 'number' && typeof point.x === 'number'
          ? Math.abs(point.x - xValue)
          : xValue instanceof Date && point.x instanceof Date
            ? Math.abs(point.x.getTime() - xValue.getTime())
            : Infinity;
            
        if (distance < minDistance && distance <= tolerance) {
          minDistance = distance;
          closestPoint = point;
        }
      }
      
      if (closestPoint) {
        result.push(closestPoint);
      }
    }
    
    return result;
  }

  private calculateTolerance(xValue: number | Date): number {
    if (typeof xValue === 'number') {
      // 對於數值，使用數據範圍的 5%
      const extent = d3.extent(this.internalProcessedData, d => d.x as number);
      return extent[0] !== undefined && extent[1] !== undefined 
        ? (extent[1] - extent[0]) * 0.05 
        : 1;
    } else {
      // 對於日期，使用 1 天的毫秒數
      return 24 * 60 * 60 * 1000;
    }
  }

  private formatLineTooltipContent(
    dataPoints: ProcessedLineDataPoint[], 
    xValue: number | Date
  ): string {
    const config = this.config as LineChartCoreConfig;
    
    // 如果用戶提供了自定義格式化函數，使用它
    if (config.tooltipFormat) {
      return config.tooltipFormat(dataPoints, xValue);
    }
    
    // 默認格式化
    if (dataPoints.length === 0) return '';
    
    const header = `X: ${this.formatValue(xValue)}`;
    const items = dataPoints.map(point => {
      const categoryLabel = point.category ? `${point.category}: ` : '';
      return `${categoryLabel}${this.formatValue(point.y)}`;
    }).join('\n');
    
    return `${header}\n${items}`;
  }

  private formatValue(value: number | Date | string): string {
    if (value instanceof Date) {
      return value.toLocaleDateString();
    } else if (typeof value === 'number') {
      return value.toLocaleString();
    } else {
      return String(value);
    }
  }

  // 公共方法：更新配置
  public updateConfig(newConfig: Partial<LineChartCoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.renderChart();
  }

  // 公共方法：獲取當前數據
  public getCurrentData(): ProcessedLineDataPoint[] {
    return this.internalProcessedData;
  }

  // 公共方法：獲取系列數據
  public getSeriesData(): LineSeriesData[] {
    return this.seriesData;
  }

  // 公共方法：切換系列顯示/隱藏
  public toggleSeries(categoryName: string | number): void {
    const series = this.seriesData.find(s => s.category === categoryName);
    if (series) {
      series.visible = !series.visible;
      this.renderChart();
    }
  }

  // 公共方法：高亮特定系列
  public highlightSeries(categoryNames: (string | number)[]): void {
    if (!this.lineGroup) return;

    this.lineGroup
      .selectAll('.line')
      .attr('opacity', 0.2);

    categoryNames.forEach(categoryName => {
      const seriesIndex = this.seriesData.findIndex(s => s.category === categoryName);
      if (seriesIndex !== -1) {
        this.lineGroup!
          .selectAll(`.line-series-${seriesIndex} .line`)
          .attr('opacity', 1)
          .attr('stroke-width', (this.config as LineChartCoreConfig).strokeWidth || 2 + 1);
      }
    });
  }

  // 公共方法：重置高亮
  public resetHighlight(): void {
    if (!this.lineGroup) return;

    this.lineGroup
      .selectAll('.line')
      .attr('opacity', 1)
      .attr('stroke-width', (this.config as LineChartCoreConfig).strokeWidth || 2);
  }

  // 公共方法：添加數據點
  public addDataPoint(point: LineChartData): void {
    const config = this.config as LineChartCoreConfig;
    if (config.data) {
      config.data.push(point);
      this.renderChart();
    }
  }

  // 公共方法：移除數據點
  public removeDataPoint(index: number): void {
    const config = this.config as LineChartCoreConfig;
    if (config.data && config.data[index]) {
      config.data.splice(index, 1);
      this.renderChart();
    }
  }
}