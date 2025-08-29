/**
 * ScatterPlotCanvasCore - 高性能 Canvas 散點圖實現
 * 基於 CanvasFallbackCore，支援 50K+ 數據點渲染
 */

import * as d3 from 'd3';
import { 
  CanvasFallbackCore, 
  CanvasFallbackConfig, 
  CanvasRenderContext 
} from '../../../core/performance';
import { 
  renderPointsToCanvas,
  filterVisibleDataPoints,
  processBatched,
  PerformanceMonitor,
  DataPoint
} from '../../../core/performance/performance-utils';
import {
  ChartData,
  BaseChartCoreConfig,
  DataKeyOrAccessor,
  ChartStateCallbacks
} from '../../../core/types';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';

// 擴展 ScatterPlot 數據接口
export interface CanvasScatterPlotData extends DataPoint {
  size?: number;
  color?: string | number;
  [key: string]: any;
}

// 處理後的散點數據
export interface ProcessedCanvasScatterPoint extends DataPoint {
  size: number;
  color: string;
  originalData: any;
  index: number;
}

// Canvas ScatterPlot 配置
export interface ScatterPlotCanvasConfig extends BaseChartCoreConfig, CanvasFallbackConfig {
  // 數據映射
  xAccessor?: DataKeyOrAccessor<CanvasScatterPlotData, number | Date>;
  yAccessor?: DataKeyOrAccessor<CanvasScatterPlotData, number>;
  sizeAccessor?: DataKeyOrAccessor<CanvasScatterPlotData, number>;
  colorAccessor?: DataKeyOrAccessor<CanvasScatterPlotData, string | number>;
  
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
  
  // Canvas 專用性能設置
  enablePointCulling?: boolean;    // 視野剔除
  quadTreeEnabled?: boolean;       // 四叉樹優化
  adaptiveQuality?: boolean;       // 自適應品質
  
  // 事件處理
  onDataClick?: (data: ProcessedCanvasScatterPoint, event: MouseEvent) => void;
  onDataHover?: (data: ProcessedCanvasScatterPoint | null, event: MouseEvent) => void;
}

/**
 * 高性能 Canvas 散點圖核心類
 */
export class ScatterPlotCanvasCore extends CanvasFallbackCore<CanvasScatterPlotData> {
  private processedPoints: ProcessedCanvasScatterPoint[] = [];
  private scales: {
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>;
    yScale: d3.ScaleLinear<number, number>;
    colorScale?: ColorScale;
    sizeScale?: d3.ScaleLinear<number, number>;
  } | null = null;
  
  private performanceMonitor = new PerformanceMonitor();
  private isInteracting = false;

  constructor(
    config: ScatterPlotCanvasConfig,
    callbacks?: ChartStateCallbacks
  ) {
    // 設置 Canvas 專用默認配置
    const canvasConfig: ScatterPlotCanvasConfig = {
      dataThreshold: 5000,        // 5K 數據點開始使用 Canvas
      enablePointCulling: true,
      quadTreeEnabled: true,
      adaptiveQuality: true,
      pointRadius: 3,
      minPointSize: 1,
      maxPointSize: 10,
      opacity: 0.7,
      showXAxis: true,
      showYAxis: true,
      showGrid: false,
      colors: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'],
      ...config
    };
    
    super(canvasConfig, callbacks);
  }

  // === 實現抽象方法 ===
  
  public getChartType(): string {
    return 'scatter-plot-canvas';
  }

  protected processData(): ChartData<CanvasScatterPlotData>[] {
    const config = this.config as ScatterPlotCanvasConfig;
    const { data, xAccessor, yAccessor, sizeAccessor, colorAccessor } = config;

    if (!data || data.length === 0) {
      this.processedPoints = [];
      return [];
    }
    
    this.performanceMonitor.start('processData');
    
    // 處理數據點
    this.processedPoints = data.map((item, index) => {
      // 處理 X 值
      let x: number | Date;
      if (typeof xAccessor === 'function') {
        x = xAccessor(item, index, data);
      } else if (typeof xAccessor === 'string') {
        x = item[xAccessor] as number | Date;
      } else {
        x = item.x;
      }

      // 處理 Y 值
      let y: number;
      if (typeof yAccessor === 'function') {
        y = yAccessor(item, index, data);
      } else if (typeof yAccessor === 'string') {
        y = Number(item[yAccessor]) || 0;
      } else {
        y = Number(item.y) || 0;
      }

      // 處理 Size 值
      let size = config.pointRadius || 3;
      if (sizeAccessor) {
        let rawSize: number;
        if (typeof sizeAccessor === 'function') {
          rawSize = sizeAccessor(item, index, data);
        } else {
          rawSize = Number(item[sizeAccessor]) || size;
        }
        size = Math.max(config.minPointSize || 1, 
                       Math.min(config.maxPointSize || 10, rawSize));
      }

      // 處理 Color 值
      let color = config.colors?.[0] || '#3b82f6';
      if (colorAccessor && config.colors) {
        let colorIndex: number;
        if (typeof colorAccessor === 'function') {
          colorIndex = Number(colorAccessor(item, index, data)) || 0;
        } else {
          colorIndex = Number(item[colorAccessor]) || 0;
        }
        color = config.colors[colorIndex % config.colors.length];
      }

      return {
        x: typeof x === 'number' ? x : new Date(x).getTime(),
        y,
        size,
        color,
        originalData: item,
        index
      };
    });

    this.performanceMonitor.end('processData');
    
    console.log(`[ScatterPlotCanvas] Processed ${this.processedPoints.length} points in ${this.performanceMonitor.getStats('processData').avg.toFixed(2)}ms`);
    
    return data;
  }

  protected createScales(): Record<string, any> {
    if (this.processedPoints.length === 0) {
      return {};
    }
    
    const { chartWidth, chartHeight } = this.getChartDimensions();
    const config = this.config as ScatterPlotCanvasConfig;
    
    // X 軸比例尺
    const xValues = this.processedPoints.map(d => d.x);
    const xScale = d3.scaleLinear()
      .domain(d3.extent(xValues) as [number, number])
      .range([0, chartWidth]);
    
    // Y 軸比例尺
    const yValues = this.processedPoints.map(d => d.y);
    const yScale = d3.scaleLinear()
      .domain(d3.extent(yValues) as [number, number])
      .range([chartHeight, 0]);
    
    // 顏色比例尺
    let colorScale: ColorScale | undefined;
    if (config.colors) {
      try {
        colorScale = createColorScale({
          type: 'custom',
          colors: config.colors,
          domain: [0, config.colors.length - 1],
          interpolate: false
        });
      } catch (error) {
        console.warn('[ScatterPlotCanvas] Color scale creation failed:', error);
      }
    }
    
    // 尺寸比例尺
    let sizeScale: d3.ScaleLinear<number, number> | undefined;
    if (config.sizeAccessor) {
      const sizeValues = this.processedPoints.map(d => d.size);
      sizeScale = d3.scaleLinear()
        .domain(d3.extent(sizeValues) as [number, number])
        .range([config.minPointSize || 1, config.maxPointSize || 10]);
    }

    this.scales = { xScale, yScale, colorScale, sizeScale };
    
    return { xScale, yScale, colorScale, sizeScale };
  }

  protected getVisibleData(allData: any[]): any[] {
    if (!this.scales || !this.canvasContext) {
      return allData;
    }
    
    const config = this.config as ScatterPlotCanvasConfig;
    if (!config.enablePointCulling) {
      return allData;
    }
    
    // 定義當前視窗
    const viewport = {
      left: 0,
      right: this.canvasContext.width,
      top: 0,
      bottom: this.canvasContext.height
    };
    
    // 篩選可見數據點
    return filterVisibleDataPoints(
      this.processedPoints,
      viewport,
      this.scales.xScale,
      this.scales.yScale,
      20 // 邊界擴展
    );
  }

  // === Canvas 渲染實現 ===
  
  protected renderWithCanvas(context: CanvasRenderContext): void {
    if (!this.scales || this.processedPoints.length === 0) {
      return;
    }
    
    this.performanceMonitor.start('canvasRender');
    
    const config = this.config as ScatterPlotCanvasConfig;
    const { xScale, yScale } = this.scales;
    const { context: ctx } = context;
    
    // 清空畫布
    ctx.clearRect(0, 0, context.width, context.height);
    
    // 設置全局透明度
    ctx.globalAlpha = config.opacity || 0.7;
    
    // 獲取可見數據點（性能優化）
    const visiblePoints = config.enablePointCulling ? 
      this.getVisibleData(this.processedPoints) : 
      this.processedPoints;
    
    // 自適應品質：數據點過多時降低品質
    const shouldReduceQuality = config.adaptiveQuality && 
      visiblePoints.length > 20000;
    
    if (shouldReduceQuality) {
      // 降低品質設置
      ctx.imageSmoothingEnabled = false;
    }
    
    // 批次渲染以避免阻塞主線程
    const batchSize = shouldReduceQuality ? 2000 : 1000;
    
    processBatched(
      visiblePoints as ProcessedCanvasScatterPoint[],
      batchSize,
      (batch) => {
        this.renderPointBatch(ctx, batch, xScale, yScale);
      },
      () => {
        // 渲染完成後繪製軸線
        this.renderAxesToCanvas(context);
        
        const renderTime = this.performanceMonitor.end('canvasRender');
        console.log(`[ScatterPlotCanvas] Rendered ${visiblePoints.length} points in ${renderTime.toFixed(2)}ms`);
      }
    );
  }
  
  private renderPointBatch(
    ctx: CanvasRenderingContext2D,
    points: ProcessedCanvasScatterPoint[],
    xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    // 使用高效的 Canvas 點渲染
    renderPointsToCanvas(ctx, points, {
      xScale: xScale as any,
      yScale,
      radius: (point: DataPoint) => (point as ProcessedCanvasScatterPoint).size,
      fillStyle: (point: DataPoint) => (point as ProcessedCanvasScatterPoint).color,
      strokeStyle: (this.config as ScatterPlotCanvasConfig).strokeColor,
      lineWidth: (this.config as ScatterPlotCanvasConfig).strokeWidth || 0
    });
  }
  
  private renderAxesToCanvas(context: CanvasRenderContext): void {
    if (!this.scales) return;
    
    const config = this.config as ScatterPlotCanvasConfig;
    const { context: ctx, width, height } = context;
    const { xScale, yScale } = this.scales;
    
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    if (config.showXAxis) {
      // X 軸
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(width, height);
      ctx.stroke();
      
      // X 軸刻度
      const xTicks = xScale.ticks(10);
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      
      xTicks.forEach(tick => {
        const x = xScale(tick);
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(x, height - 5);
        ctx.stroke();
        ctx.fillText(tick.toString(), x, height + 15);
      });
    }
    
    if (config.showYAxis) {
      // Y 軸
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, height);
      ctx.stroke();
      
      // Y 軸刻度
      const yTicks = yScale.ticks(10);
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      
      yTicks.forEach(tick => {
        const y = yScale(tick);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(5, y);
        ctx.stroke();
        ctx.fillText(tick.toString(), -8, y + 3);
      });
    }
    
    ctx.restore();
  }

  // === SVG 渲染實現（向下兼容） ===
  
  protected renderWithSVG(): void {
    if (!this.scales || this.processedPoints.length === 0) {
      return;
    }
    
    this.performanceMonitor.start('svgRender');
    
    const chartGroup = this.createSVGContainer();
    const config = this.config as ScatterPlotCanvasConfig;
    const { xScale, yScale } = this.scales;
    
    // 渲染數據點
    const points = chartGroup
      .selectAll<SVGCircleElement, ProcessedCanvasScatterPoint>('.scatter-point')
      .data(this.processedPoints)
      .join('circle')
      .attr('class', 'scatter-point')
      .attr('cx', d => xScale(d.x) as number)
      .attr('cy', d => yScale(d.y))
      .attr('r', d => d.size)
      .attr('fill', d => d.color)
      .attr('opacity', config.opacity || 0.7);
    
    // 添加事件處理
    if (config.onDataClick) {
      points.on('click', (event, d) => {
        config.onDataClick!(d, event);
      });
    }
    
    if (config.onDataHover) {
      points
        .on('mouseenter', (event, d) => {
          config.onDataHover!(d, event);
        })
        .on('mouseleave', (event) => {
          config.onDataHover!(null, event);
        });
    }
    
    // 渲染軸線
    this.renderStandardAxis(xScale, 'bottom', {
      label: config.xAxisLabel,
      showGrid: config.showGrid
    });
    
    this.renderStandardAxis(yScale, 'left', {
      label: config.yAxisLabel,
      showGrid: config.showGrid
    });
    
    const renderTime = this.performanceMonitor.end('svgRender');
    console.log(`[ScatterPlotCanvas] SVG rendered ${this.processedPoints.length} points in ${renderTime.toFixed(2)}ms`);
  }

  // === 公開 API ===
  
  /**
   * 獲取處理後的數據點
   */
  public getProcessedPoints(): ProcessedCanvasScatterPoint[] {
    return [...this.processedPoints];
  }
  
  /**
   * 獲取性能統計
   */
  public getPerformanceStats(): { [key: string]: any } {
    return {
      renderMode: this.getCurrentRenderMode(),
      dataPoints: this.processedPoints.length,
      processData: this.performanceMonitor.getStats('processData'),
      canvasRender: this.performanceMonitor.getStats('canvasRender'),
      svgRender: this.performanceMonitor.getStats('svgRender'),
      ...this.getPerformanceMetrics()
    };
  }
}