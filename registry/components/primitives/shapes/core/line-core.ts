/**
 * LineCore - 框架無關的線條圖核心邏輯
 * 基於 BaseChartCore 架構，提供純 JS/TS 實現
 */

import * as d3 from 'd3';
import { BaseChartCore } from '../../../core/base-chart/core';
import {
  BaseChartCoreConfig,
  ChartData,
  BaseChartData
} from '../../../core/types';
import { 
  calculateAlignedPosition, 
  AlignmentStrategy 
} from '../../utils';

// === 核心數據類型定義 ===

export interface LineCoreData extends BaseChartData {
  x: any;
  y: any;
  label?: string;
  color?: string;
  group?: string;
}

export interface LineCoreConfig extends BaseChartCoreConfig<LineCoreData> {
  // 視覺配置
  color?: string | ((d: LineCoreData, i: number) => string);
  strokeWidth?: number;
  opacity?: number;
  curve?: d3.CurveFactory;
  
  // 點配置
  showPoints?: boolean;
  pointRadius?: number;
  pointColor?: string | ((d: LineCoreData, i: number) => string);
  pointStrokeWidth?: number;
  pointStrokeColor?: string;
  
  // 佈局配置
  alignment?: AlignmentStrategy;
  
  // 多線條支持
  groupBy?: string;
  showConnectors?: boolean;
  
  // 動畫配置
  animate?: boolean;
  animationDuration?: number;
  animationEasing?: string;
  animationDelay?: number;
  drawAnimation?: 'none' | 'draw' | 'fade' | 'grow';
  
  // 交互配置
  interactive?: boolean;
  hoverEffect?: boolean;
  
  // 樣式配置
  lineDashArray?: string;
  tension?: number;
  gradientStroke?: {
    id: string;
    stops: Array<{
      offset: string;
      color: string;
      opacity?: number;
    }>;
  };
}

// === 核心實現類 ===

export class LineCore extends BaseChartCore<LineCoreData> {
  private groupedData: Map<string, ChartData<LineCoreData>[]> = new Map();
  private isGrouped: boolean = false;
  private lineGenerator!: d3.Line<ChartData<LineCoreData>>;
  private pathElements: d3.Selection<SVGPathElement, unknown, null, undefined>[] = [];

  public getChartType(): string {
    return 'line-chart';
  }

  protected processData(): ChartData<LineCoreData>[] {
    if (!this.validateData()) {
      return [];
    }

    // 數據預處理
    const processedData = this.config.data.map((item, index) => ({
      ...item,
      label: item.label || `Point ${index + 1}`,
      color: this.resolveItemColor(item, index)
    }));

    // 檢查是否為分組數據
    this.isGrouped = !!(this.config as LineCoreConfig).groupBy;
    
    if (this.isGrouped) {
      this.groupedData = this.groupData(processedData);
    }

    return processedData;
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

    // Y 軸比例尺
    const yValues = processedData.map(d => d.y as number);
    const yExtent = d3.extent(yValues) as [number, number];
    const yScale = d3.scaleLinear()
      .domain([Math.min(0, yExtent[0]), yExtent[1]])
      .range([chartHeight, 0])
      .nice();

    // 創建線條生成器
    this.lineGenerator = d3.line<ChartData<LineCoreData>>()
      .x((d: ChartData<LineCoreData>) => this.getXPosition(d, xScale))
      .y((d: ChartData<LineCoreData>) => yScale(d.y as number))
      .curve((this.config as LineCoreConfig).curve || d3.curveLinear);

    // 處理缺失值
    this.lineGenerator.defined((d: ChartData<LineCoreData>) => 
      d.x != null && d.y != null && !isNaN(d.y as number)
    );

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
    svg.selectAll('.line-element, .point-element').remove();
    this.pathElements = [];

    if (this.isGrouped) {
      this.renderGroupedLines(svg, processedData, scales);
    } else {
      this.renderSingleLine(svg, processedData, scales);
    }

    // 渲染點（如果啟用）
    if ((this.config as LineCoreConfig).showPoints) {
      this.renderPoints(svg, processedData, scales);
    }

    // 添加交互事件
    this.addInteractionEvents(svg);
  }

  // === 私有方法 ===

  private resolveItemColor(item: LineCoreData, index: number): string {
    const { color } = this.config as LineCoreConfig;
    
    if (typeof color === 'function') {
      return color(item, index);
    }
    
    if (typeof color === 'string') {
      return color;
    }
    
    // 使用默認色彩
    const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    return item.color || defaultColors[index % defaultColors.length];
  }

  private groupData(data: ChartData<LineCoreData>[]): Map<string, ChartData<LineCoreData>[]> {
    const groups = new Map<string, ChartData<LineCoreData>[]>();
    const groupBy = (this.config as LineCoreConfig).groupBy!;

    data.forEach(item => {
      const groupKey = item[groupBy] as string || 'default';
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(item);
    });

    // 對每組數據按 x 值排序
    groups.forEach((groupData, key) => {
      groupData.sort((a, b) => {
        const aVal = a.x instanceof Date ? a.x.getTime() : a.x;
        const bVal = b.x instanceof Date ? b.x.getTime() : b.x;
        return aVal - bVal;
      });
      groups.set(key, groupData);
    });

    return groups;
  }

  private renderSingleLine(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: ChartData<LineCoreData>[],
    scales: Record<string, any>
  ): void {
    const {
      strokeWidth = 2,
      opacity = 1,
      animate = true,
      animationDuration = 300,
      drawAnimation = 'draw',
      lineDashArray
    } = this.config as LineCoreConfig;

    // 按 x 值排序數據
    const sortedData = [...data].sort((a, b) => {
      const aVal = a.x instanceof Date ? a.x.getTime() : a.x;
      const bVal = b.x instanceof Date ? b.x.getTime() : b.x;
      return aVal - bVal;
    });

    const lineColor = data[0]?.color || '#3b82f6';

    const path = svg
      .append('path')
      .datum(sortedData)
      .attr('class', 'line-element')
      .attr('data-testid', 'line-path')
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', strokeWidth)
      .attr('opacity', opacity)
      .attr('d', this.lineGenerator);

    if (lineDashArray) {
      path.attr('stroke-dasharray', lineDashArray);
    }

    if ((this.config as LineCoreConfig).gradientStroke) {
      this.applyGradientStroke(svg, path, (this.config as LineCoreConfig).gradientStroke!);
    }

    // 動畫效果
    if (animate && drawAnimation === 'draw') {
      const totalLength = (path.node() as SVGPathElement).getTotalLength();
      
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(animationDuration)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)
        .on('end', () => {
          if (!lineDashArray) {
            path.attr('stroke-dasharray', 'none');
          }
        });
    }

    this.pathElements.push(path);
  }

  private renderGroupedLines(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: ChartData<LineCoreData>[],
    scales: Record<string, any>
  ): void {
    const groupKeys = Array.from(this.groupedData.keys());
    const { animate = true, animationDuration = 300, animationDelay = 0 } = this.config as LineCoreConfig;

    groupKeys.forEach((groupKey, groupIndex) => {
      const groupData = this.groupedData.get(groupKey)!;
      const groupColor = groupData[0]?.color || this.getGroupColor(groupIndex);

      const path = svg
        .append('path')
        .datum(groupData)
        .attr('class', `line-element group-line group-${groupKey}`)
        .attr('data-testid', `line-group-${groupKey}`)
        .attr('fill', 'none')
        .attr('stroke', groupColor)
        .attr('stroke-width', (this.config as LineCoreConfig).strokeWidth || 2)
        .attr('opacity', (this.config as LineCoreConfig).opacity || 1)
        .attr('d', this.lineGenerator);

      // 分組動畫：錯開執行
      if (animate) {
        const delay = groupIndex * (animationDelay || 100);
        path
          .attr('opacity', 0)
          .transition()
          .delay(delay)
          .duration(animationDuration)
          .attr('opacity', (this.config as LineCoreConfig).opacity || 1);
      }

      this.pathElements.push(path);
    });
  }

  private renderPoints(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: ChartData<LineCoreData>[],
    scales: Record<string, any>
  ): void {
    const {
      pointRadius = 4,
      pointColor,
      pointStrokeWidth = 1,
      pointStrokeColor = '#ffffff',
      animate = true,
      animationDuration = 300
    } = this.config as LineCoreConfig;

    const { xScale, yScale } = scales;

    const points = svg.selectAll('.point-element')
      .data(data, (d: any, i: number) => d.id || i)
      .enter()
      .append('circle')
      .attr('class', 'point-element')
      .attr('data-testid', (d, i) => `point-${i}`)
      .attr('cx', (d: ChartData<LineCoreData>) => this.getXPosition(d, xScale))
      .attr('cy', (d: ChartData<LineCoreData>) => yScale(d.y))
      .attr('r', animate ? 0 : pointRadius)
      .attr('fill', (d: ChartData<LineCoreData>) => 
        typeof pointColor === 'function' ? pointColor(d, 0) : (pointColor || d.color!)
      )
      .attr('stroke', pointStrokeColor)
      .attr('stroke-width', pointStrokeWidth);

    if (animate) {
      points
        .transition()
        .duration(animationDuration)
        .delay((d, i) => i * 50)
        .attr('r', pointRadius);
    }
  }

  private getXPosition(
    d: ChartData<LineCoreData>,
    xScale: any
  ): number {
    if (xScale.bandwidth) {
      // Band scale
      return calculateAlignedPosition(
        d.x, 
        xScale, 
        (this.config as LineCoreConfig).alignment || 'center'
      );
    } else {
      // Linear or Time scale
      return xScale(d.x);
    }
  }

  private applyGradientStroke(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    path: d3.Selection<SVGPathElement, ChartData<LineCoreData>[], null, undefined>,
    gradientConfig: NonNullable<LineCoreConfig['gradientStroke']>
  ): void {
    const defs = svg.append('defs');
    
    const gradient = defs
      .append('linearGradient')
      .attr('id', gradientConfig.id)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', this.getChartDimensions().chartWidth)
      .attr('y2', 0);

    gradientConfig.stops.forEach(stop => {
      gradient
        .append('stop')
        .attr('offset', stop.offset)
        .attr('stop-color', stop.color)
        .attr('stop-opacity', stop.opacity || 1);
    });

    path.attr('stroke', `url(#${gradientConfig.id})`);
  }

  private addInteractionEvents(svg: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    if (!(this.config as LineCoreConfig).interactive) return;

    // 為線條添加懸停效果
    this.pathElements.forEach(path => {
      path
        .on('mouseenter', (event) => {
          if ((this.config as LineCoreConfig).hoverEffect) {
            path.attr('stroke-width', ((this.config as LineCoreConfig).strokeWidth || 2) + 1);
          }
        })
        .on('mouseleave', (event) => {
          if ((this.config as LineCoreConfig).hoverEffect) {
            path.attr('stroke-width', (this.config as LineCoreConfig).strokeWidth || 2);
          }
          this.hideTooltip();
        })
        .on('mousemove', (event) => {
          const [mouseX] = d3.pointer(event);
          const tooltip = this.getTooltipContent(mouseX);
          if (tooltip) {
            this.showTooltip(event.pageX, event.pageY, tooltip);
          }
        });
    });

    // 為點添加交互
    svg.selectAll('.point-element')
      .on('click', (event, d: ChartData<LineCoreData>) => {
        const index = this.getProcessedData()!.indexOf(d);
        this.showTooltip(event.pageX, event.pageY, `${d.label}: ${d.y}`);
      })
      .on('mouseenter', (event, d: ChartData<LineCoreData>) => {
        if ((this.config as LineCoreConfig).hoverEffect) {
          d3.select(event.currentTarget).attr('r', ((this.config as LineCoreConfig).pointRadius || 4) + 2);
        }
      })
      .on('mouseleave', (event, d: ChartData<LineCoreData>) => {
        if ((this.config as LineCoreConfig).hoverEffect) {
          d3.select(event.currentTarget).attr('r', (this.config as LineCoreConfig).pointRadius || 4);
        }
      });
  }

  private getTooltipContent(mouseX: number): string | null {
    // 簡化的工具提示邏輯，實際可以更複雜
    const scales = this.getScales();
    if (!scales.xScale) return null;

    const xValue = scales.xScale.invert ? scales.xScale.invert(mouseX) : null;
    if (xValue) {
      return `X: ${xValue}`;
    }
    return null;
  }

  private isNumericData(values: any[]): boolean {
    return values.every(v => typeof v === 'number' && !isNaN(v));
  }

  private isDateData(values: any[]): boolean {
    return values.every(v => v instanceof Date || !isNaN(Date.parse(v)));
  }

  private getGroupColor(index: number): string {
    const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    return defaultColors[index % defaultColors.length];
  }

  // === 公共 API ===

  public getGroupedData(): Map<string, ChartData<LineCoreData>[]> {
    return this.groupedData;
  }

  public isGroupedChart(): boolean {
    return this.isGrouped;
  }

  public updateCurve(curve: d3.CurveFactory): void {
    (this.config as LineCoreConfig).curve = curve;
    this.render();
  }

  public togglePoints(show: boolean): void {
    (this.config as LineCoreConfig).showPoints = show;
    this.render();
  }

  public updateStrokeWidth(width: number): void {
    (this.config as LineCoreConfig).strokeWidth = Math.max(1, width);
    this.render();
  }

  public getLineGenerator(): d3.Line<ChartData<LineCoreData>> {
    return this.lineGenerator;
  }
}

// === 預設配置 ===

export const DEFAULT_LINE_CORE_CONFIG: Partial<LineCoreConfig> = {
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 40, left: 40 },
  
  // 視覺配置
  color: '#3b82f6',
  strokeWidth: 2,
  opacity: 1,
  curve: d3.curveLinear,
  
  // 點配置
  showPoints: false,
  pointRadius: 4,
  pointStrokeWidth: 1,
  pointStrokeColor: '#ffffff',
  
  // 佈局配置
  alignment: 'center',
  
  // 動畫配置
  animate: true,
  animationDuration: 300,
  animationEasing: 'ease-in-out',
  animationDelay: 0,
  drawAnimation: 'draw',
  
  // 交互配置
  interactive: true,
  hoverEffect: true
};