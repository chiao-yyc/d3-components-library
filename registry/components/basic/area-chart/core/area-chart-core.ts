/**
 * AreaChartCore - 純 JS/TS 的區域圖核心實現
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

// AreaChart 專用數據接口
export interface AreaChartData extends BaseChartData {
  x?: number | string | Date;
  y?: number;
  category?: string | number;
  [key: string]: string | number | Date | boolean | null | undefined;
}

// 處理後的數據點
export interface ProcessedAreaDataPoint {
  x: number | Date;
  y: number;
  category?: string | number;
  originalData: ChartData<AreaChartData>;
  index: number;
}

// 區域系列數據
export interface AreaSeriesData {
  category: string | number;
  data: ProcessedAreaDataPoint[];
  color: string;
}

// 堆疊數據點
export interface StackedDataPoint extends ProcessedAreaDataPoint {
  y0?: number; // 堆疊起始位置
  y1?: number; // 堆疊結束位置
}

// AreaChart 專用配置接口
export interface AreaChartCoreConfig extends BaseChartCoreConfig {
  // 數據映射
  xAccessor?: DataKeyOrAccessor<AreaChartData, number | string | Date>;
  yAccessor?: DataKeyOrAccessor<AreaChartData, number>;
  categoryAccessor?: DataKeyOrAccessor<AreaChartData, string | number>;
  
  // 區域圖專用配置
  stackMode?: 'none' | 'normal' | 'percent';
  curve?: 'linear' | 'monotone' | 'cardinal' | 'basis' | 'step';
  fillOpacity?: number;
  strokeWidth?: number;
  
  // 視覺樣式
  colors?: string[];
  showPoints?: boolean;
  pointRadius?: number;
  gradientFill?: boolean;
  
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
  enableBrushZoom?: boolean;
  enableCrosshair?: boolean;
  enableTooltip?: boolean;
  
  // Tooltip 進階配置
  tooltipMode?: 'point' | 'vertical-line' | 'area';
  showCrosshair?: boolean;
  tooltipFormat?: (data: ProcessedAreaDataPoint[], x: number | Date, category?: string) => string;
  
  // 事件處理
  onDataClick?: (data: ProcessedAreaDataPoint, event: Event) => void;
  onDataHover?: (data: ProcessedAreaDataPoint | null, event: Event) => void;
  onBrushZoom?: (domain: { x: [number, number]; y: [number, number] } | null) => void;
}

// 主要的 AreaChart 核心類  
export class AreaChartCore extends BaseChartCore<AreaChartData> {
  private areaProcessedData: ProcessedAreaDataPoint[] = [];
  private seriesData: AreaSeriesData[] = [];
  private stackedData: StackedDataPoint[] = [];
  private colorScale: ColorScale | null = null;
  private areaGroup: D3Selection | null = null;
  
  // 添加缺失的屬性（與 ScatterPlot 一致）
  private chartWidth: number = 0;
  private chartHeight: number = 0;
  
  // 交互控制器
  private brushZoomController: any = null;
  private crosshairController: any = null;
  
  // Tooltip 相關
  private tooltipOverlay: D3Selection | null = null;
  private crosshairGroup: D3Selection | null = null;

  constructor(
    config: AreaChartCoreConfig,
    callbacks?: ChartStateCallbacks
  ) {
    console.log('AreaChartCore constructor called with config:', {
      dataLength: config.data?.length || 0,
      width: config.width,
      height: config.height,
      xAccessor: config.xAccessor,
      yAccessor: config.yAccessor
    });
    super(config, callbacks);
  }

  public getChartType(): string {
    return 'area-chart';
  }

  /**
   * Parse date strings with better support for various formats
   */
  private parseDate(dateStr: string): Date {
    // Handle YYYY-MM format like '2023-01'
    if (/^\d{4}-\d{1,2}$/.test(dateStr)) {
      return new Date(dateStr + '-01'); // Add day to make it a valid date
    }
    // Handle other common formats
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  protected processData(): ChartData<AreaChartData>[] {
    const config = this.config as AreaChartCoreConfig;
    const { data, xAccessor, yAccessor, categoryAccessor, stackMode } = config;

    if (!data || data.length === 0) {
      console.log('AreaChart processData: no data provided');
      this.areaProcessedData = [];
      this.seriesData = [];
      this.stackedData = [];
      return [];
    }
    
    // 處理數據點 - 使用與 ScatterPlotCore 相同的模式
    this.areaProcessedData = data.map((item, index) => {
      // 處理 X 值
      let x: number | Date;
      let rawXValue: any;
      if (typeof xAccessor === 'function') {
        rawXValue = xAccessor(item, index, data);
        x = typeof rawXValue === 'string' ? this.parseDate(rawXValue) : rawXValue;
      } else if (typeof xAccessor === 'string' || typeof xAccessor === 'number') {
        rawXValue = item[xAccessor];
        x = item[xAccessor] as number | Date;
        // Convert string dates to Date objects with better parsing
        if (typeof x === 'string') {
          x = this.parseDate(x);
        }
      } else {
        rawXValue = item.x;
        x = item.x as number | Date;
        if (typeof x === 'string') {
          x = this.parseDate(x);
        }
      }

      // 處理 Y 值
      let y: number;
      let rawYValue: any;
      if (typeof yAccessor === 'function') {
        rawYValue = yAccessor(item, index, data);
        y = rawYValue;
      } else if (typeof yAccessor === 'string' || typeof yAccessor === 'number') {
        rawYValue = item[yAccessor];
        y = Number(item[yAccessor]) || 0;
      } else {
        rawYValue = item.y;
        y = Number(item.y) || 0;
      }

      // 處理 Category 值
      let category: string | number | undefined;
      let rawCategoryValue: any;
      if (categoryAccessor) {
        if (typeof categoryAccessor === 'function') {
          rawCategoryValue = categoryAccessor(item, index, data);
          category = rawCategoryValue;
        } else if (typeof categoryAccessor === 'string' || typeof categoryAccessor === 'number') {
          rawCategoryValue = item[categoryAccessor];
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

    // 處理系列數據
    this.processSeriesData();

    // 處理堆疊數據
    if (stackMode && stackMode !== 'none') {
      this.processStackedData(stackMode);
    }


    // 返回原始數據以符合 BaseChartCore 介面（與 ScatterPlot 一致）
    return data;
  }

  private processSeriesData(): void {
    const config = this.config as AreaChartCoreConfig;
    
    if (!config.categoryAccessor) {
      // 單一系列
      this.seriesData = [{
        category: 'default',
        data: this.areaProcessedData,
        color: config.colors?.[0] || '#3b82f6'
      }];
    } else {
      // 多系列
      const categoryGroups = d3.group(this.areaProcessedData, d => String(d.category || 'default'));
      const categories = [...categoryGroups.keys()];
      
      this.seriesData = categories.map((category, index) => ({
        category,
        data: categoryGroups.get(category) || [],
        color: config.colors?.[index % (config.colors?.length || 1)] || '#3b82f6'
      }));
    }

    // 創建顏色比例尺
    if (config.colors) {
      this.colorScale = createColorScale(config.colors, this.seriesData.length);
    }
  }

  private processStackedData(stackMode: 'normal' | 'percent'): void {
    if (this.seriesData.length <= 1) {
      this.stackedData = [...this.areaProcessedData] as StackedDataPoint[];
      return;
    }

    // 按 x 值分組
    const xGroups = d3.group(this.areaProcessedData, d => d.x);
    const stackedGroups: StackedDataPoint[][] = [];

    xGroups.forEach((points, x) => {
      const sortedPoints = points.sort((a, b) => (a.category || 0) < (b.category || 0) ? -1 : 1);
      let cumulative = 0;
      const total = d3.sum(sortedPoints, d => d.y);

      const stackedPoints = sortedPoints.map(point => {
        const y0 = cumulative;
        const y1 = stackMode === 'percent' ? 
          cumulative + (point.y / total) * 100 :
          cumulative + point.y;
        
        cumulative = y1;

        return {
          ...point,
          y0,
          y1,
          y: y1 - y0 // 調整 y 值為堆疊高度
        };
      });

      stackedGroups.push(stackedPoints);
    });

    this.stackedData = stackedGroups.flat();
  }

  private getYValues(): number[] {
    const config = this.config as AreaChartCoreConfig;
    
    if (config.stackMode && config.stackMode !== 'none' && this.stackedData.length > 0) {
      const maxY1Values = d3.group(this.stackedData, d => d.x);
      return Array.from(maxY1Values.values()).map(points => 
        d3.max(points, d => d.y1 || d.y) || 0
      );
    }
    
    return this.areaProcessedData.map(d => d.y);
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
    
    const config = this.config as AreaChartCoreConfig;
    let domain: [number, number];
    
    if (config.stackMode === 'percent') {
      domain = [0, 100];
    } else {
      domain = [0, d3.max(values) || 0];
    }
    
    return d3.scaleLinear()
      .domain(domain)
      .range([this.chartHeight, 0])
      .nice();
  }


  private renderAreas(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    if (!this.areaGroup) return;

    const config = this.config as AreaChartCoreConfig;
    const curve = this.getCurveFunction(config.curve);

    if (config.stackMode && config.stackMode !== 'none') {
      this.renderStackedAreas(xScale, yScale, curve);
    } else {
      this.renderRegularAreas(xScale, yScale, curve);
    }
  }

  private renderRegularAreas(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    curve: any
  ): void {
    if (!this.areaGroup) return;

    const config = this.config as AreaChartCoreConfig;

    // 創建區域生成器
    const area = d3.area<ProcessedAreaDataPoint>()
      .x(d => xScale(d.x as any) || 0)
      .y0(yScale(0))
      .y1(d => yScale(d.y))
      .curve(curve);

    // 創建線條生成器
    const line = d3.line<ProcessedAreaDataPoint>()
      .x(d => xScale(d.x as any) || 0)
      .y(d => yScale(d.y))
      .curve(curve);

    // 渲染每個系列
    this.seriesData.forEach((series, seriesIndex) => {
      if (series.data.length === 0) return;

      const seriesGroup = this.areaGroup!
        .append('g')
        .attr('class', `area-series-${seriesIndex}`);

      // 渲染區域
      seriesGroup
        .append('path')
        .datum(series.data)
        .attr('class', 'area')
        .attr('d', area)
        .attr('fill', series.color)
        .attr('fill-opacity', config.fillOpacity || 0.6)
        .attr('stroke', 'none');

      // 渲染邊界線
      seriesGroup
        .append('path')
        .datum(series.data)
        .attr('class', 'area-line')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', series.color)
        .attr('stroke-width', config.strokeWidth || 2);
    });
  }

  private renderStackedAreas(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    curve: any
  ): void {
    if (!this.areaGroup || this.stackedData.length === 0) return;

    const config = this.config as AreaChartCoreConfig;

    // 按類別分組堆疊數據
    const stackedGroups = d3.group(this.stackedData, d => d.category || 'default');

    stackedGroups.forEach((stackedPoints, category) => {
      const sortedPoints = stackedPoints.sort((a, b) => (a.x as number) - (b.x as number));
      const seriesIndex = this.seriesData.findIndex(s => s.category === category);
      const color = this.seriesData[seriesIndex]?.color || '#3b82f6';

      // 創建堆疊區域生成器
      const area = d3.area<StackedDataPoint>()
        .x(d => xScale(d.x as any) || 0)
        .y0(d => yScale(d.y0 || 0))
        .y1(d => yScale(d.y1 || d.y))
        .curve(curve);

      this.areaGroup!
        .append('path')
        .datum(sortedPoints)
        .attr('class', `stacked-area-${seriesIndex}`)
        .attr('d', area)
        .attr('fill', color)
        .attr('fill-opacity', config.fillOpacity || 0.6)
        .attr('stroke', color)
        .attr('stroke-width', config.strokeWidth || 1);
    });
  }

  private renderPoints(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    if (!this.areaGroup) return;

    const config = this.config as AreaChartCoreConfig;
    const pointRadius = config.pointRadius || 3;

    this.seriesData.forEach((series, seriesIndex) => {
      const points = this.areaGroup!
        .selectAll<SVGCircleElement, ProcessedAreaDataPoint>(`.points-series-${seriesIndex}`)
        .data(series.data)
        .join('circle')
        .attr('class', `points-series-${seriesIndex}`)
        .attr('cx', d => xScale(d.x as any) || 0)
        .attr('cy', d => yScale(d.y))
        .attr('r', pointRadius)
        .attr('fill', series.color)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);

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

  private setupInteractions(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    const config = this.config as AreaChartCoreConfig;

    // 實現 Tooltip 交互
    if (config.enableTooltip !== false) {
      this.setupTooltipInteraction(xScale, yScale);
    }

    // 實現筆刷縮放
    if (config.enableBrushZoom) {
      this.setupBrushZoom(xScale, yScale);
    }

    // 實現十字準線
    if (config.enableCrosshair) {
      this.setupCrosshair();
    }
  }

  private setupBrushZoom(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    console.log('Setting up brush zoom for AreaChart');
  }

  private setupCrosshair(): void {
    console.log('Setting up crosshair for AreaChart');
  }

  // ===============================
  // Tooltip 實現方法
  // ===============================

  private setupTooltipInteraction(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    if (!this.areaGroup) return;

    const config = this.config as AreaChartCoreConfig;
    const tooltipMode = config.tooltipMode || 'vertical-line';

    // 創建透明覆蓋層用於捕獲鼠標事件
    this.tooltipOverlay = this.areaGroup
      .append('rect')
      .attr('class', 'area-tooltip-overlay')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .style('pointer-events', 'all');

    // 創建十字線組（如果需要）
    if (config.showCrosshair !== false && tooltipMode === 'vertical-line') {
      this.crosshairGroup = this.areaGroup
        .append('g')
        .attr('class', 'area-crosshair')
        .style('display', 'none');

      // 垂直線
      this.crosshairGroup
        .append('line')
        .attr('class', 'crosshair-line-v')
        .attr('y1', 0)
        .attr('y2', this.chartHeight)
        .attr('stroke', '#666')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0.7);
    }

    // 綁定鼠標事件
    this.tooltipOverlay
      .on('mousemove', (event) => this.handleAreaMouseMove(event, xScale, yScale))
      .on('mouseleave', () => this.handleAreaMouseLeave());
  }

  private handleAreaMouseMove(
    event: MouseEvent,
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    if (!this.containerElement || !this.areaGroup) return;

    const config = this.config as AreaChartCoreConfig;
    const [mouseX] = d3.pointer(event, this.areaGroup.node());

    // 將鼠標 X 座標轉換為數據 X 值
    const xValue = xScale.invert(mouseX);

    // 尋找該 X 位置最近的數據點
    const nearestPoints = this.findDataPointsAtX(xValue);

    if (nearestPoints.length === 0) return;

    // 更新十字線位置
    if (this.crosshairGroup && config.showCrosshair !== false) {
      this.crosshairGroup
        .style('display', null)
        .select('.crosshair-line-v')
        .attr('x1', mouseX)
        .attr('x2', mouseX);
    }

    // 計算 tooltip 座標（相對於容器）
    const containerRect = this.containerElement.getBoundingClientRect();
    const tooltipX = event.clientX - containerRect.left;
    const tooltipY = event.clientY - containerRect.top;

    // 格式化 tooltip 內容
    const tooltipContent = this.formatAreaTooltipContent(nearestPoints, xValue);

    // 顯示 tooltip
    this.callbacks.onTooltipShow?.(tooltipX, tooltipY, tooltipContent);
  }

  private handleAreaMouseLeave(): void {
    // 隱藏十字線
    if (this.crosshairGroup) {
      this.crosshairGroup.style('display', 'none');
    }

    // 隱藏 tooltip
    this.callbacks.onTooltipHide?.();
  }

  private findDataPointsAtX(targetX: number | Date): ProcessedAreaDataPoint[] {
    const results: ProcessedAreaDataPoint[] = [];

    // 對於每個系列，找到最接近 targetX 的數據點
    this.seriesData.forEach(series => {
      if (series.data.length === 0) return;

      let closestPoint: ProcessedAreaDataPoint | null = null;
      let minDistance = Infinity;

      series.data.forEach(point => {
        const distance = typeof targetX === 'number'
          ? Math.abs((point.x as number) - (targetX as number))
          : Math.abs((point.x as Date).getTime() - (targetX as Date).getTime());

        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      });

      if (closestPoint) {
        results.push(closestPoint);
      }
    });

    return results;
  }

  private formatAreaTooltipContent(points: ProcessedAreaDataPoint[], xValue: number | Date): string {
    const config = this.config as AreaChartCoreConfig;

    // 如果有自定義格式化函數，使用它
    if (config.tooltipFormat) {
      return config.tooltipFormat(points, xValue);
    }

    // 默認格式化
    const xLabel = typeof xValue === 'number' 
      ? xValue.toFixed(2)
      : xValue instanceof Date 
        ? xValue.toLocaleDateString()
        : String(xValue);

    const lines = [`X: ${xLabel}`];

    // 根據模式添加數據點信息
    if (config.stackMode && config.stackMode !== 'none') {
      // 堆疊模式：顯示累積值
      let cumulative = 0;
      points.forEach(point => {
        cumulative += point.y;
        const categoryLabel = point.category || '系列';
        lines.push(`${categoryLabel}: ${point.y.toFixed(2)} (累積: ${cumulative.toFixed(2)})`);
      });
    } else {
      // 普通模式：顯示各系列值
      points.forEach(point => {
        const categoryLabel = point.category || '系列';
        lines.push(`${categoryLabel}: ${point.y.toFixed(2)}`);
      });
    }

    return lines.join('\n');
  }

  // 公共方法：更新配置
  public updateConfig(newConfig: Partial<AreaChartCoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.renderChart();
  }

  // 公共方法：獲取當前數據
  public getCurrentData(): ProcessedAreaDataPoint[] {
    return this.areaProcessedData;
  }

  // 公共方法：獲取系列數據
  public getSeriesData(): AreaSeriesData[] {
    return this.seriesData;
  }

  // 公共方法：高亮特定系列
  public highlightSeries(categoryNames: (string | number)[]): void {
    if (!this.areaGroup) return;

    this.areaGroup
      .selectAll('.area, .area-line')
      .attr('opacity', 0.3);

    categoryNames.forEach(categoryName => {
      const seriesIndex = this.seriesData.findIndex(s => s.category === categoryName);
      if (seriesIndex !== -1) {
        this.areaGroup!
          .selectAll(`.area-series-${seriesIndex} .area, .area-series-${seriesIndex} .area-line`)
          .attr('opacity', 1);
      }
    });
  }

  // === 實現 BaseChartCore 抽象方法 ===
  
  protected createScales(): Record<string, any> {
    const config = this.config as AreaChartCoreConfig;

    if (!this.areaProcessedData || this.areaProcessedData.length === 0) {
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

    // Check if X values are dates or numbers
    const firstXValue = this.areaProcessedData[0]?.x;
    const isDateData = firstXValue instanceof Date;
    
    // 確定 X 軸的域值範圍
    let xDomain: [any, any];
    let xScale: any;
    
    if (isDateData) {
      const xExtent = d3.extent(this.areaProcessedData, d => d.x as Date);
      xDomain = xExtent[0] !== undefined && xExtent[1] !== undefined ? xExtent : [new Date(), new Date()];
      xScale = d3.scaleTime()
        .domain(xDomain)
        .range([0, this.chartWidth]);
    } else {
      const xExtent = d3.extent(this.areaProcessedData, d => d.x as number);
      xDomain = xExtent[0] !== undefined && xExtent[1] !== undefined ? xExtent : [0, 1];
      xScale = d3.scaleLinear()
        .domain(xDomain)
        .range([0, this.chartWidth]);
    }
    
    // 確定 Y 軸的域值範圍 - 考慮堆疊模式
    let yDomain: [number, number];
    if (config.stackMode && config.stackMode !== 'none' && this.stackedData.length > 0) {
      const yMax = d3.max(this.stackedData, d => d.y1 || d.y) || 0;
      yDomain = [0, yMax];
    } else {
      const yMax = d3.max(this.areaProcessedData, d => d.y) || 0;
      yDomain = [0, yMax * 1.1]; // 添加 10% 的上邊距
    }

    const yScale = d3.scaleLinear()
      .domain(yDomain)
      .range([this.chartHeight, 0]);

    return { xScale, yScale };
  }
  
  protected renderChart(): void {
    console.log('AreaChart renderChart called with data:', {
      areaProcessedDataLength: this.areaProcessedData?.length || 0,
      config: this.config
    });
    
    // 先確保有數據
    if (!this.areaProcessedData || this.areaProcessedData.length === 0) {
      console.log('AreaChart renderChart: no data, returning early');
      return;
    }
    
    // 始終重新計算圖表尺寸（與 ScatterPlot 一致）
    const margin = this.config.margin || { top: 20, right: 20, bottom: 60, left: 60 };
    const width = (this.config.width || 600);
    const height = (this.config.height || 400);
    this.chartWidth = width - margin.left - margin.right;
    this.chartHeight = height - margin.top - margin.bottom;
    
    const config = this.config as AreaChartCoreConfig;
    
    // 檢查圖表尺寸
    if (this.chartWidth <= 0 || this.chartHeight <= 0) {
      return;
    }
    
    // 創建比例尺
    const scales = this.createScales();
    const { xScale, yScale } = scales;
    
    // 創建主要的圖表容器
    const chartArea = this.createSVGContainer();
    this.areaGroup = chartArea;
    
    // 獲取曲線類型
    const curve = this.getCurveFunction(config.curve);
    
    // 調試信息
    console.log('AreaChart render debug:', {
      areaProcessedData: this.areaProcessedData.length,
      seriesData: this.seriesData.length,
      stackMode: config.stackMode,
      areaGroup: !!this.areaGroup
    });
    
    // 根據堆疊模式渲染不同類型的區域圖
    if (config.stackMode && config.stackMode !== 'none') {
      this.renderStackedAreas(xScale, yScale, curve);
    } else {
      this.renderRegularAreas(xScale, yScale, curve);
    }
    
    // 渲染軸線（使用 BaseChartCore 的統一軸線系統）
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
    
    // 添加交互功能
    this.setupInteractions(xScale, yScale);
  }

  // 公共方法：重置高亮
  public resetHighlight(): void {
    if (!this.areaGroup) return;

    this.areaGroup
      .selectAll('.area, .area-line')
      .attr('opacity', 1);
  }
}
