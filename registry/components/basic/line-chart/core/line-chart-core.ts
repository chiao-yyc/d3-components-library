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
  D3Selection,
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
  
  // 特殊功能
  enableBrushZoom?: boolean;
  enableCrosshair?: boolean;
  enableTooltip?: boolean;
  enableLegend?: boolean;
  
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
  private processedData: ProcessedLineDataPoint[] = [];
  private seriesData: LineSeriesData[] = [];
  private colorScale: ColorScale | null = null;
  private lineGroup: D3Selection | null = null;
  private pointsGroup: D3Selection | null = null;
  private clipPathId: string;
  
  // 交互控制器
  private brushZoomController: any = null;
  private crosshairController: any = null;

  constructor(
    config: LineChartCoreConfig,
    callbacks?: ChartStateCallbacks<LineChartData>
  ) {
    super(config, callbacks);
    this.clipPathId = `line-chart-clip-${Math.random().toString(36).substr(2, 9)}`;
  }

  protected processData(): { 
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>;
    yScale: d3.ScaleLinear<number, number>;
    data: ProcessedLineDataPoint[] 
  } {
    const config = this.config as LineChartCoreConfig;
    const { data, xAccessor, yAccessor, categoryAccessor } = config;

    if (!data || data.length === 0) {
      this.processedData = [];
      this.seriesData = [];
      return {
        xScale: d3.scaleLinear().range([0, this.chartWidth]),
        yScale: d3.scaleLinear().range([this.chartHeight, 0]),
        data: []
      };
    }
    
    // 處理數據點 - 使用統一的數據存取模式
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

    // 處理系列數據
    this.processSeriesData();

    // 創建比例尺
    const xValues = this.processedData.map(d => d.x);
    const yValues = this.processedData.map(d => d.y);
    
    const xScale = this.createXScale(xValues);
    const yScale = this.createYScale(yValues);

    return { xScale, yScale, data: this.processedData };
  }

  private processSeriesData(): void {
    const config = this.config as LineChartCoreConfig;
    
    if (!config.categoryAccessor) {
      // 單一系列
      this.seriesData = [{
        category: 'default',
        data: this.processedData,
        color: config.colors?.[0] || '#3b82f6',
        visible: true
      }];
    } else {
      // 多系列
      const categoryGroups = d3.group(this.processedData, d => d.category || 'default');
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
      this.colorScale = createColorScale(config.colors, this.seriesData.length);
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
    if (!this.chartGroup || this.processedData.length === 0) return;

    const config = this.config as LineChartCoreConfig;
    const { xScale, yScale } = this.processData();

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
    if (config.showXAxis !== false) this.renderXAxis(xScale);
    if (config.showYAxis !== false) this.renderYAxis(yScale);

    // 渲染網格
    if (config.showGrid) this.renderGrid(xScale, yScale);

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

  private renderXAxis(scale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>): void {
    if (!this.chartGroup) return;

    const config = this.config as LineChartCoreConfig;
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

    const config = this.config as LineChartCoreConfig;
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
  }

  private setupBrushZoom(
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    console.log('Setting up brush zoom for LineChart');
  }

  private setupCrosshair(): void {
    console.log('Setting up crosshair for LineChart');
  }

  // 公共方法：更新配置
  public updateConfig(newConfig: Partial<LineChartCoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.renderChart();
  }

  // 公共方法：獲取當前數據
  public getCurrentData(): ProcessedLineDataPoint[] {
    return this.processedData;
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