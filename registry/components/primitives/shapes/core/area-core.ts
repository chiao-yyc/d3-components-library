/**
 * AreaCore - 框架無關的面積圖核心邏輯
 * 基於 BaseChartCore 架構，提供純 JS/TS 實現
 */

import * as d3 from 'd3';
import { BaseChartCore } from '../../../core/base-chart/core';
import {
  BaseChartCoreConfig,
  ChartData,
  BaseChartData
} from '../../../core/types';

// === 核心數據類型定義 ===

export interface AreaCoreData extends BaseChartData {
  x: any;
  y: any;
  y0?: any;
  label?: string;
  color?: string;
  group?: string;
}

export interface AreaCoreConfig extends BaseChartCoreConfig<AreaCoreData> {
  // 視覺配置
  color?: string | ((d: AreaCoreData, i: number) => string);
  opacity?: number;
  curve?: d3.CurveFactory;
  
  // 基線配置
  baseline?: number | ((d: AreaCoreData) => number);
  
  // 漸層配置
  gradient?: {
    id: string;
    stops: Array<{
      offset: string;
      color: string;
      opacity?: number;
    }>;
    direction?: 'vertical' | 'horizontal' | 'radial';
  };
  
  // 邊線配置
  showLine?: boolean;
  lineColor?: string;
  lineWidth?: number;
  
  // 動畫配置
  animate?: boolean;
  animationDuration?: number;
  animationEasing?: string;
  
  // 交互配置
  interactive?: boolean;
  hoverEffect?: boolean;
}

// === 核心實現類 ===

export class AreaCore extends BaseChartCore<AreaCoreData> {
  private areaGenerator!: d3.Area<ChartData<AreaCoreData>>;
  private lineGenerator!: d3.Line<ChartData<AreaCoreData>>;

  public getChartType(): string {
    return 'area-chart';
  }

  protected processData(): ChartData<AreaCoreData>[] {
    if (!this.validateData()) {
      return [];
    }

    return this.config.data.map((item, index) => ({
      ...item,
      y0: item.y0 || this.resolveBaseline(item),
      label: item.label || `Point ${index + 1}`,
      color: this.resolveItemColor(item, index)
    }));
  }

  protected createScales(): Record<string, any> {
    const processedData = this.getProcessedData();
    if (!processedData || processedData.length === 0) {
      return {};
    }

    const { chartWidth, chartHeight } = this.getChartDimensions();

    // X 軸比例尺
    const xValues = processedData.map(d => d.x);
    const xScale = this.isNumericData(xValues) 
      ? d3.scaleLinear()
          .domain(d3.extent(xValues) as [number, number])
          .range([0, chartWidth])
      : this.isDateData(xValues)
      ? d3.scaleTime()
          .domain(d3.extent(xValues) as [Date, Date])
          .range([0, chartWidth])
      : d3.scaleBand()
          .domain(xValues.map(String))
          .range([0, chartWidth])
          .padding(0.1);

    // Y 軸比例尺 - 考慮 y 和 y0
    const allYValues = processedData.flatMap(d => [d.y as number, d.y0 as number]);
    const yExtent = d3.extent(allYValues) as [number, number];
    const yScale = d3.scaleLinear()
      .domain([Math.min(0, yExtent[0]), yExtent[1]])
      .range([chartHeight, 0])
      .nice();

    // 創建面積和線條生成器
    this.areaGenerator = d3.area<ChartData<AreaCoreData>>()
      .x((d: ChartData<AreaCoreData>) => xScale(d.x) as number)
      .y0((d: ChartData<AreaCoreData>) => yScale(d.y0))
      .y1((d: ChartData<AreaCoreData>) => yScale(d.y))
      .curve((this.config as AreaCoreConfig).curve || d3.curveLinear)
      .defined((d: ChartData<AreaCoreData>) =>
        d.x != null && d.y != null && !isNaN(d.y as number)
      );

    if ((this.config as AreaCoreConfig).showLine) {
      this.lineGenerator = d3.line<ChartData<AreaCoreData>>()
        .x((d: ChartData<AreaCoreData>) => xScale(d.x) as number)
        .y((d: ChartData<AreaCoreData>) => yScale(d.y))
        .curve((this.config as AreaCoreConfig).curve || d3.curveLinear)
        .defined((d: ChartData<AreaCoreData>) =>
          d.x != null && d.y != null && !isNaN(d.y as number)
        );
    }

    return { xScale, yScale };
  }

  protected renderChart(): void {
    const svg = this.createSVGContainer();
    const processedData = this.getProcessedData();
    const scales = this.getScales();

    if (!processedData || processedData.length === 0 || !scales.xScale || !scales.yScale) {
      return;
    }

    // 清除舊內容
    svg.selectAll('.area-element, .area-line').remove();

    // 渲染面積
    this.renderArea(svg, processedData);

    // 渲染邊線（如果啟用）
    if ((this.config as AreaCoreConfig).showLine) {
      this.renderLine(svg, processedData);
    }

    // 添加交互事件
    if (this.config.interactive) {
      this.addInteractionEvents(svg);
    }
  }

  // === 私有方法 ===

  private resolveItemColor(item: AreaCoreData, index: number): string {
    const { color } = this.config as AreaCoreConfig;

    if (typeof color === 'function') {
      return color(item, index);
    }

    if (typeof color === 'string') {
      return color;
    }

    return item.color || '#3b82f6';
  }

  private resolveBaseline(item: AreaCoreData): number {
    const { baseline = 0 } = this.config as AreaCoreConfig;

    if (typeof baseline === 'function') {
      return baseline(item);
    }

    return baseline;
  }

  private renderArea(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: ChartData<AreaCoreData>[]
  ): void {
    const {
      opacity = 0.7,
      animate = true,
      animationDuration = 300
    } = this.config as AreaCoreConfig;

    // 按 x 值排序數據
    const sortedData = [...data].sort((a, b) => {
      const aVal = a.x instanceof Date ? a.x.getTime() : a.x;
      const bVal = b.x instanceof Date ? b.x.getTime() : b.x;
      return aVal - bVal;
    });

    const areaColor = data[0]?.color || '#3b82f6';

    const areaPath = svg
      .append('path')
      .datum(sortedData)
      .attr('class', 'area-element')
      .attr('data-testid', 'area-path')
      .attr('fill', areaColor)
      .attr('opacity', opacity)
      .attr('d', this.areaGenerator);

    // 應用漸層（如果配置）
    if ((this.config as AreaCoreConfig).gradient) {
      this.applyGradient(svg, areaPath, (this.config as AreaCoreConfig).gradient!);
    }

    // 動畫效果
    if (animate) {
      areaPath
        .attr('opacity', 0)
        .transition()
        .duration(animationDuration)
        .attr('opacity', opacity);
    }
  }

  private renderLine(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: ChartData<AreaCoreData>[]
  ): void {
    const {
      lineColor,
      lineWidth = 2,
      animate = true,
      animationDuration = 300
    } = this.config as AreaCoreConfig;

    const sortedData = [...data].sort((a, b) => {
      const aVal = a.x instanceof Date ? a.x.getTime() : a.x;
      const bVal = b.x instanceof Date ? b.x.getTime() : b.x;
      return aVal - bVal;
    });

    const resolvedLineColor = lineColor || data[0]?.color || '#3b82f6';

    const linePath = svg
      .append('path')
      .datum(sortedData)
      .attr('class', 'area-line')
      .attr('data-testid', 'area-line')
      .attr('fill', 'none')
      .attr('stroke', resolvedLineColor)
      .attr('stroke-width', lineWidth)
      .attr('d', this.lineGenerator);

    // 線條動畫
    if (animate) {
      const totalLength = (linePath.node() as SVGPathElement).getTotalLength();
      
      linePath
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(animationDuration)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)
        .on('end', () => {
          linePath.attr('stroke-dasharray', 'none');
        });
    }
  }

  private applyGradient(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    path: d3.Selection<SVGPathElement, ChartData<AreaCoreData>[], null, undefined>,
    gradientConfig: NonNullable<AreaCoreConfig['gradient']>
  ): void {
    const defs = svg.append('defs');
    
    const gradient = defs
      .append('linearGradient')
      .attr('id', gradientConfig.id)
      .attr('gradientUnits', 'userSpaceOnUse');

    // 設置漸層方向
    const { direction = 'vertical' } = gradientConfig;
    const { chartWidth, chartHeight } = this.getChartDimensions();
    
    if (direction === 'vertical') {
      gradient
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', chartHeight);
    } else if (direction === 'horizontal') {
      gradient
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', chartWidth)
        .attr('y2', 0);
    }

    gradientConfig.stops.forEach(stop => {
      gradient
        .append('stop')
        .attr('offset', stop.offset)
        .attr('stop-color', stop.color)
        .attr('stop-opacity', stop.opacity || 1);
    });

    path.attr('fill', `url(#${gradientConfig.id})`);
  }

  private addInteractionEvents(svg: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    // 簡化的交互實現
    const config = this.config as AreaCoreConfig;
    svg.selectAll('.area-element')
      .on('click', (event) => {
        this.showTooltip(event.pageX, event.pageY, 'Area clicked');
      })
      .on('mouseenter', (event) => {
        if (config.hoverEffect) {
          d3.select(event.currentTarget).attr('opacity', 0.9);
        }
      })
      .on('mouseleave', (event) => {
        if (config.hoverEffect) {
          d3.select(event.currentTarget).attr('opacity', config.opacity || 0.7);
        }
        this.hideTooltip();
      });
  }

  private isNumericData(values: any[]): boolean {
    return values.every(v => typeof v === 'number' && !isNaN(v));
  }

  private isDateData(values: any[]): boolean {
    return values.every(v => v instanceof Date || !isNaN(Date.parse(v)));
  }

  // === 公共 API ===

  public updateCurve(curve: d3.CurveFactory): void {
    (this.config as AreaCoreConfig).curve = curve;
    this.render();
  }

  public toggleLine(show: boolean): void {
    (this.config as AreaCoreConfig).showLine = show;
    this.render();
  }

  public updateBaseline(baseline: number | ((d: AreaCoreData) => number)): void {
    (this.config as AreaCoreConfig).baseline = baseline;
    this.render();
  }

  public getAreaGenerator(): d3.Area<ChartData<AreaCoreData>> {
    return this.areaGenerator;
  }

  public getLineGenerator(): d3.Line<ChartData<AreaCoreData>> | undefined {
    return this.lineGenerator;
  }
}

// === 預設配置 ===

export const DEFAULT_AREA_CORE_CONFIG: Partial<AreaCoreConfig> = {
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 40, left: 40 },
  
  // 視覺配置
  color: '#3b82f6',
  opacity: 0.7,
  curve: d3.curveLinear,
  
  // 基線配置
  baseline: 0,
  
  // 邊線配置
  showLine: false,
  lineWidth: 2,
  
  // 動畫配置
  animate: true,
  animationDuration: 300,
  animationEasing: 'ease-in-out',
  
  // 交互配置
  interactive: true,
  hoverEffect: true
};