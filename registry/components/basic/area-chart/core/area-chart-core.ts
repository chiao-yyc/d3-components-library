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
  
  // 特殊功能
  enableBrushZoom?: boolean;
  enableCrosshair?: boolean;
  enableTooltip?: boolean;
  
  // 事件處理
  onDataClick?: (data: ProcessedAreaDataPoint, event: Event) => void;
  onDataHover?: (data: ProcessedAreaDataPoint | null, event: Event) => void;
  onBrushZoom?: (domain: { x: [number, number]; y: [number, number] } | null) => void;
}

// 主要的 AreaChart 核心類
export class AreaChartCore extends BaseChartCore<AreaChartData> {
  private processedData: ProcessedAreaDataPoint[] = [];
  private seriesData: AreaSeriesData[] = [];
  private stackedData: StackedDataPoint[] = [];
  private colorScale: ColorScale | null = null;
  private areaGroup: D3Selection | null = null;
  
  // 交互控制器
  private brushZoomController: any = null;
  private crosshairController: any = null;

  constructor(
    config: AreaChartCoreConfig,
    callbacks?: ChartStateCallbacks<AreaChartData>
  ) {
    super(config, callbacks);
  }

  protected processData(): { 
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>;
    yScale: d3.ScaleLinear<number, number>;
    data: ProcessedAreaDataPoint[] 
  } {
    const config = this.config as AreaChartCoreConfig;
    const { data, xAccessor, yAccessor, categoryAccessor, stackMode } = config;

    if (!data || data.length === 0) {
      this.processedData = [];
      this.seriesData = [];
      this.stackedData = [];
      return {
        xScale: d3.scaleLinear().range([0, this.chartWidth]),
        yScale: d3.scaleLinear().range([this.chartHeight, 0]),
        data: []
      };
    }
    
    // 處理數據點 - 使用與 ScatterPlotCore 相同的模式
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

    // 處理堆疊數據
    if (stackMode && stackMode !== 'none') {
      this.processStackedData(stackMode);
    }

    // 創建比例尺
    const xValues = this.processedData.map(d => d.x);
    const yValues = this.getYValues();
    
    const xScale = this.createXScale(xValues);
    const yScale = this.createYScale(yValues);

    return { xScale, yScale, data: this.processedData };
  }

  private processSeriesData(): void {
    const config = this.config as AreaChartCoreConfig;
    
    if (!config.categoryAccessor) {
      // 單一系列
      this.seriesData = [{
        category: 'default',
        data: this.processedData,
        color: config.colors?.[0] || '#3b82f6'
      }];
    } else {
      // 多系列
      const categoryGroups = d3.group(this.processedData, d => d.category || 'default');
      const categories = Array.from(categoryGroups.keys());
      
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
      this.stackedData = [...this.processedData] as StackedDataPoint[];
      return;
    }

    // 按 x 值分組
    const xGroups = d3.group(this.processedData, d => d.x);
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
    
    return this.processedData.map(d => d.y);
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

  protected renderChart(): void {
    if (!this.chartGroup || this.processedData.length === 0) return;

    const config = this.config as AreaChartCoreConfig;
    const { xScale, yScale } = this.processData();

    // 清除之前的內容
    this.chartGroup.selectAll('*').remove();

    // 創建區域組
    this.areaGroup = this.chartGroup
      .append('g')
      .attr('class', 'area-chart-group');

    // 渲染區域
    this.renderAreas(xScale, yScale);

    // 渲染點
    if (config.showPoints) {
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

  private renderXAxis(scale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>): void {
    if (!this.chartGroup) return;

    const config = this.config as AreaChartCoreConfig;
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

    const config = this.config as AreaChartCoreConfig;
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
    const config = this.config as AreaChartCoreConfig;

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

  // 公共方法：更新配置
  public updateConfig(newConfig: Partial<AreaChartCoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.renderChart();
  }

  // 公共方法：獲取當前數據
  public getCurrentData(): ProcessedAreaDataPoint[] {
    return this.processedData;
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

  // 公共方法：重置高亮
  public resetHighlight(): void {
    if (!this.areaGroup) return;

    this.areaGroup
      .selectAll('.area, .area-line')
      .attr('opacity', 1);
  }
}