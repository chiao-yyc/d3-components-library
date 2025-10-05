/**
 * ShapeComposer - 圖形組件組合器
 * 提供靈活的圖形組件組合和渲染管理
 * 支援層級管理、共享比例尺、統一主題
 */

import * as d3 from 'd3';
import { BaseChartCore, BaseChartCoreConfig, ChartStateCallbacks } from '../../../core/base-chart/core';
import { BaseChartData, ChartData } from '../../../core/base-chart/types';

// === 組合器類型定義 ===

export interface ShapeConfig {
  type: 'bar' | 'line' | 'area' | 'scatter' | 'waterfall';
  id: string;
  data: BaseChartData[];
  zIndex?: number;
  visible?: boolean;
  opacity?: number;
  color?: string | string[] | ((d: any, i: number) => string);
  [key: string]: any; // 允許形狀特定配置
}

export interface ShapeComposerConfig extends BaseChartCoreConfig<BaseChartData> {
  shapes: ShapeConfig[];
  sharedScales?: boolean;
  layerOrder?: 'data' | 'zIndex' | 'manual';
  theme?: ShapeTheme;
  legend?: LegendConfig;
}

export interface ShapeTheme {
  colors: string[];
  opacity: number;
  strokeWidth: number;
  strokeColor: string;
  animation: {
    duration: number;
    easing: string;
    stagger: number;
  };
  interaction: {
    hover: boolean;
    click: boolean;
    tooltip: boolean;
  };
}

export interface LegendConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  orientation: 'horizontal' | 'vertical';
  itemSpacing: number;
  showSymbols: boolean;
}

// === 圖形渲染器抽象 ===

export abstract class ShapeRenderer {
  protected config: ShapeConfig;
  protected parentSvg: d3.Selection<SVGGElement, unknown, null, undefined>;
  protected scales: Record<string, any>;

  constructor(
    config: ShapeConfig, 
    parentSvg: d3.Selection<SVGGElement, unknown, null, undefined>,
    scales: Record<string, any>
  ) {
    this.config = config;
    this.parentSvg = parentSvg;
    this.scales = scales;
  }

  abstract render(): void;
  abstract update(newConfig: ShapeConfig): void;
  abstract destroy(): void;

  // 通用方法
  protected resolveColor(d: any, i: number): string {
    const { color } = this.config;
    
    if (typeof color === 'function') {
      return color(d, i);
    }
    
    if (Array.isArray(color)) {
      return color[i % color.length];
    }
    
    if (typeof color === 'string') {
      return color;
    }
    
    // 默認顏色
    const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    return defaultColors[i % defaultColors.length];
  }

  protected createGroup(): d3.Selection<SVGGElement, unknown, null, undefined> {
    return this.parentSvg
      .append('g')
      .attr('class', `shape-${this.config.type}`)
      .attr('data-shape-id', this.config.id)
      .style('opacity', this.config.opacity || 1)
      .style('z-index', this.config.zIndex || 0);
  }
}

// === 具體渲染器實現 ===

export class BarRenderer extends ShapeRenderer {
  private barGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;

  render(): void {
    this.barGroup = this.createGroup();

    this.barGroup
      .selectAll('.bar-element')
      .data(this.config.data)
      .enter()
      .append('rect')
      .attr('class', 'bar-element')
      .attr('x', (d: any) => this.scales.xScale(d.x))
      .attr('y', (d: any) => this.scales.yScale(d.y))
      .attr('width', this.scales.xScale.bandwidth ? this.scales.xScale.bandwidth() : 20)
      .attr('height', (d: any) => this.scales.yScale(0) - this.scales.yScale(d.y))
      .attr('fill', (d, i) => this.resolveColor(d, i));
  }

  update(newConfig: ShapeConfig): void {
    this.config = newConfig;
    
    this.barGroup
      .selectAll('.bar-element')
      .data(this.config.data)
      .transition()
      .duration(300)
      .attr('x', (d: any) => this.scales.xScale(d.x))
      .attr('y', (d: any) => this.scales.yScale(d.y))
      .attr('height', (d: any) => this.scales.yScale(0) - this.scales.yScale(d.y))
      .attr('fill', (d, i) => this.resolveColor(d, i));
  }

  destroy(): void {
    this.barGroup.remove();
  }
}

export class LineRenderer extends ShapeRenderer {
  private lineGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;

  render(): void {
    this.lineGroup = this.createGroup();
    
    const line = d3.line<any>()
      .x((d: any) => this.scales.xScale(d.x))
      .y((d: any) => this.scales.yScale(d.y))
      .curve(d3.curveLinear);

    this.lineGroup
      .append('path')
      .datum(this.config.data)
      .attr('class', 'line-element')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', this.resolveColor(this.config.data[0], 0))
      .attr('stroke-width', 2);
  }

  update(newConfig: ShapeConfig): void {
    this.config = newConfig;
    
    const line = d3.line<any>()
      .x((d: any) => this.scales.xScale(d.x))
      .y((d: any) => this.scales.yScale(d.y))
      .curve(d3.curveLinear);

    this.lineGroup
      .select('.line-element')
      .datum(this.config.data)
      .transition()
      .duration(300)
      .attr('d', line)
      .attr('stroke', this.resolveColor(this.config.data[0], 0));
  }

  destroy(): void {
    this.lineGroup.remove();
  }
}

// === 渲染器工廠 ===

export class ShapeRendererFactory {
  static create(
    shapeConfig: ShapeConfig,
    parentSvg: d3.Selection<SVGGElement, unknown, null, undefined>,
    scales: Record<string, any>
  ): ShapeRenderer {
    switch (shapeConfig.type) {
      case 'bar':
        return new BarRenderer(shapeConfig, parentSvg, scales);
      case 'line':
        return new LineRenderer(shapeConfig, parentSvg, scales);
      // case 'area':
      //   return new AreaRenderer(shapeConfig, parentSvg, scales);
      // case 'scatter':
      //   return new ScatterRenderer(shapeConfig, parentSvg, scales);
      default:
        throw new Error(`Unsupported shape type: ${shapeConfig.type}`);
    }
  }
}

// === 主組合器類 ===

export class ShapeComposer extends BaseChartCore<BaseChartData> {
  private renderers: Map<string, ShapeRenderer> = new Map();
  private layerGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor(config: ShapeComposerConfig, callbacks: ChartStateCallbacks) {
    super(config, callbacks);
  }

  private get composerConfig(): ShapeComposerConfig {
    return this.config as ShapeComposerConfig;
  }

  public getChartType(): string {
    return 'shape-composer';
  }

  protected processData(): ChartData<BaseChartData>[] {
    // 組合器不直接處理數據，而是委託給各個形狀渲染器
    const allData: ChartData<BaseChartData>[] = [];

    this.composerConfig.shapes.forEach(shape => {
      allData.push(...shape.data);
    });
    
    return allData;
  }

  protected createScales(): Record<string, any> {
    if (!this.composerConfig.sharedScales) {
      return {}; // 每個形狀有自己的比例尺
    }

    // 創建共享比例尺
    const allData = this.getProcessedData();
    if (!allData || allData.length === 0) {
      return {};
    }

    const { chartWidth, chartHeight } = this.getChartDimensions();

    // X 軸比例尺
    const xValues = allData.map(d => d.x);
    const xScale = this.isNumericData(xValues)
      ? d3.scaleLinear().domain(d3.extent(xValues as any) as unknown as [number, number]).range([0, chartWidth])
      : d3.scaleBand().domain(xValues as unknown as Iterable<string>).range([0, chartWidth]).padding(0.1);

    // Y 軸比例尺
    const yValues = allData.map(d => d.y);
    const yExtent = d3.extent(yValues as any) as unknown as [number, number];
    const yScale = d3.scaleLinear()
      .domain([Math.min(0, yExtent[0]), yExtent[1]])
      .range([chartHeight, 0])
      .nice();

    return { xScale, yScale };
  }

  protected renderChart(): void {
    const svg = this.createSVGContainer();
    const scales = this.getScales();

    // 創建圖層組
    this.layerGroup = svg.append('g').attr('class', 'shape-layers');

    // 按順序渲染各個形狀
    const sortedShapes = this.getSortedShapes();
    
    sortedShapes.forEach(shapeConfig => {
      if (!shapeConfig.visible && shapeConfig.visible !== undefined) {
        return; // 跳過隱藏的形狀
      }

      try {
        const renderer = ShapeRendererFactory.create(shapeConfig, this.layerGroup, scales);
        renderer.render();
        this.renderers.set(shapeConfig.id, renderer);
      } catch (error) {
        console.warn(`Failed to render shape ${shapeConfig.id}:`, error);
      }
    });

    // 渲染圖例
    if (this.composerConfig.legend?.show) {
      this.renderLegend(svg);
    }
  }

  // === 公共方法 ===

  public addShape(shapeConfig: ShapeConfig): void {
    this.composerConfig.shapes.push(shapeConfig);
    this.render(); // 重新渲染
  }

  public removeShape(shapeId: string): void {
    // 銷毀渲染器
    const renderer = this.renderers.get(shapeId);
    if (renderer) {
      renderer.destroy();
      this.renderers.delete(shapeId);
    }

    // 從配置中移除
    this.composerConfig.shapes = this.composerConfig.shapes.filter(shape => shape.id !== shapeId);
  }

  public updateShape(shapeId: string, newConfig: Partial<ShapeConfig>): void {
    const shapeIndex = this.composerConfig.shapes.findIndex(shape => shape.id === shapeId);
    if (shapeIndex === -1) return;

    // 更新配置
    this.composerConfig.shapes[shapeIndex] = { ...this.composerConfig.shapes[shapeIndex], ...newConfig };

    // 更新渲染器
    const renderer = this.renderers.get(shapeId);
    if (renderer) {
      renderer.update(this.composerConfig.shapes[shapeIndex]);
    }
  }

  public toggleShapeVisibility(shapeId: string): void {
    const shape = this.composerConfig.shapes.find(s => s.id === shapeId);
    if (shape) {
      shape.visible = !shape.visible;
      
      if (shape.visible) {
        // 重新渲染該形狀
        const scales = this.getScales();
        const renderer = ShapeRendererFactory.create(shape, this.layerGroup, scales);
        renderer.render();
        this.renderers.set(shapeId, renderer);
      } else {
        // 隱藏該形狀
        const renderer = this.renderers.get(shapeId);
        if (renderer) {
          renderer.destroy();
          this.renderers.delete(shapeId);
        }
      }
    }
  }

  // === 私有方法 ===

  private getSortedShapes(): ShapeConfig[] {
    const { layerOrder = 'zIndex' } = this.composerConfig;

    switch (layerOrder) {
      case 'zIndex':
        return [...this.composerConfig.shapes].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      
      case 'data':
        return [...this.composerConfig.shapes].sort((a, b) => a.data.length - b.data.length);
      
      case 'manual':
      default:
        return this.composerConfig.shapes;
    }
  }

  private isNumericData(values: any[]): boolean {
    return values.every(v => typeof v === 'number');
  }

  private renderLegend(svg: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    const { legend } = this.composerConfig;
    if (!legend) return;

    const legendGroup = svg.append('g').attr('class', 'shape-legend');
    
    // 簡單的圖例實現
    this.composerConfig.shapes.forEach((shape, index) => {
      const legendItem = legendGroup
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', `translate(10, ${20 + index * 25})`);

      // 圖例符號
      if (legend.showSymbols) {
        legendItem
          .append('rect')
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', this.getShapeColor(shape, 0));
      }

      // 圖例文字
      legendItem
        .append('text')
        .attr('x', legend.showSymbols ? 20 : 0)
        .attr('y', 12)
        .text(shape.id)
        .style('font-size', '12px')
        .style('fill', '#333');
    });
  }

  private getShapeColor(shape: ShapeConfig, index: number): string {
    if (typeof shape.color === 'function') {
      return shape.color({}, index);
    }
    if (Array.isArray(shape.color)) {
      return shape.color[0] || '#3b82f6';
    }
    if (typeof shape.color === 'string') {
      return shape.color;
    }
    const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    return defaultColors[index % defaultColors.length];
  }
}

// === 預設配置和工具函數 ===

export const DEFAULT_SHAPE_THEME: ShapeTheme = {
  colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
  opacity: 1,
  strokeWidth: 2,
  strokeColor: '#ffffff',
  animation: {
    duration: 300,
    easing: 'ease-in-out',
    stagger: 50
  },
  interaction: {
    hover: true,
    click: true,
    tooltip: true
  }
};

export const DEFAULT_LEGEND_CONFIG: LegendConfig = {
  show: true,
  position: 'right',
  orientation: 'vertical',
  itemSpacing: 20,
  showSymbols: true
};

// 便利函數：創建形狀配置
export const createShapeConfig = (
  type: ShapeConfig['type'],
  id: string,
  data: BaseChartData[],
  options: Partial<ShapeConfig> = {}
): ShapeConfig => ({
  type,
  id,
  data,
  zIndex: 0,
  visible: true,
  opacity: 1,
  ...options
});

// 便利函數：創建組合器配置
export const createComposerConfig = (
  shapes: ShapeConfig[],
  options: Partial<ShapeComposerConfig> = {}
): ShapeComposerConfig => ({
  data: [], // 組合器不直接使用數據
  width: 600,
  height: 400,
  margin: { top: 20, right: 80, bottom: 40, left: 40 },
  shapes,
  sharedScales: true,
  layerOrder: 'zIndex',
  theme: DEFAULT_SHAPE_THEME,
  legend: DEFAULT_LEGEND_CONFIG,
  ...options
});