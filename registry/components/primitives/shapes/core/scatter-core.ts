/**
 * ScatterCore - 框架無關的散點圖核心邏輯
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

export interface ScatterCoreData extends BaseChartData {
  x: any;
  y: any;
  size?: number;
  color?: string;
  group?: string;
  label?: string;
}

export interface ScatterCoreConfig extends BaseChartCoreConfig<ScatterCoreData> {
  // 視覺配置
  color?: string | string[] | ((d: ScatterCoreData, i: number) => string);
  opacity?: number;
  
  // 點配置
  radius?: number;
  minPointSize?: number;
  maxPointSize?: number;
  
  // 描邊配置
  strokeWidth?: number;
  strokeColor?: string;
  
  // 大小映射
  sizeAccessor?: string | ((d: ScatterCoreData) => number);
  sizeScale?: d3.ScaleLinear<number, number>;
  
  // 顏色映射
  colorAccessor?: string | ((d: ScatterCoreData) => string);
  colorScale?: d3.ScaleOrdinal<string, string>;
  
  // 分組支持
  groupBy?: string;
  
  // 符號類型
  symbol?: d3.SymbolType | ((d: ScatterCoreData, i: number) => d3.SymbolType);
  
  // 佈局配置
  alignment?: AlignmentStrategy;
  
  // 動畫配置
  animate?: boolean;
  animationDuration?: number;
  animationEasing?: string;
  animationDelay?: number;
  entranceAnimation?: 'none' | 'fade' | 'scale' | 'bounce';
  
  // 交互配置
  interactive?: boolean;
  hoverEffect?: boolean;
  hoverRadius?: number;
  
  // 趨勢線配置
  showTrendline?: boolean;
  trendlineColor?: string;
  trendlineWidth?: number;
  trendlineType?: 'linear' | 'polynomial' | 'exponential';
}

// === 核心實現類 ===

export class ScatterCore extends BaseChartCore<ScatterCoreData> {
  private groupedData: Map<string, ChartData<ScatterCoreData>[]> = new Map();
  private isGrouped: boolean = false;
  private computedSizeScale!: d3.ScaleLinear<number, number>;
  private computedColorScale!: d3.ScaleOrdinal<string, string>;
  private symbolGenerator!: d3.Symbol<any, ScatterCoreData>;

  public getChartType(): string {
    return 'scatter-chart';
  }

  protected processData(): ChartData<ScatterCoreData>[] {
    if (!this.validateData()) {
      return [];
    }

    // 數據預處理
    const processedData = this.config.data.map((item, index) => ({
      ...item,
      size: this.resolveSizeValue(item),
      color: this.resolveColorValue(item, index),
      label: item.label || `Point ${index + 1}`
    }));

    // 檢查是否為分組數據
    this.isGrouped = !!(this.config as ScatterCoreConfig).groupBy;
    
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

    // 大小比例尺
    this.computedSizeScale = this.createSizeScale(processedData);
    
    // 顏色比例尺
    this.computedColorScale = this.createColorScale(processedData);

    // 符號生成器
    this.symbolGenerator = d3.symbol<ScatterCoreData>()
      .type((d: ScatterCoreData) => this.resolveSymbolType(d, 0))
      .size((d: ScatterCoreData) => Math.pow(this.computedSizeScale(d.size || 0), 2));

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
    svg.selectAll('.scatter-point').remove();

    // 渲染趨勢線（如果啟用）
    if ((this.config as ScatterCoreConfig).showTrendline) {
      this.renderTrendline(svg, processedData, scales);
    }

    // 渲染散點
    if (this.isGrouped) {
      this.renderGroupedPoints(svg, processedData, scales);
    } else {
      this.renderPoints(svg, processedData, scales);
    }

    // 添加交互事件
    this.addInteractionEvents(svg);
  }

  // === 私有方法 ===

  private resolveSizeValue(item: ScatterCoreData): number {
    const { sizeAccessor, radius = 4 } = this.config as ScatterCoreConfig;
    
    if (typeof sizeAccessor === 'function') {
      return sizeAccessor(item);
    }
    
    if (typeof sizeAccessor === 'string' && item[sizeAccessor] != null) {
      return Number(item[sizeAccessor]);
    }
    
    return item.size || radius;
  }

  private resolveColorValue(item: ScatterCoreData, index: number): string {
    const { color, colorAccessor } = this.config as ScatterCoreConfig;
    
    if (typeof colorAccessor === 'function') {
      return colorAccessor(item);
    }
    
    if (typeof colorAccessor === 'string' && item[colorAccessor] != null) {
      return String(item[colorAccessor]);
    }
    
    if (typeof color === 'function') {
      return color(item, index);
    }
    
    if (Array.isArray(color)) {
      return color[index % color.length];
    }
    
    if (typeof color === 'string') {
      return color;
    }
    
    // 使用默認色彩
    const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    return item.color || defaultColors[index % defaultColors.length];
  }

  private resolveSymbolType(item: ScatterCoreData, index: number): d3.SymbolType {
    const { symbol = d3.symbolCircle } = this.config as ScatterCoreConfig;
    
    if (typeof symbol === 'function') {
      return symbol(item, index);
    }
    
    return symbol;
  }

  private createSizeScale(data: ChartData<ScatterCoreData>[]): d3.ScaleLinear<number, number> {
    if ((this.config as ScatterCoreConfig).sizeScale) {
      return (this.config as ScatterCoreConfig).sizeScale!;
    }

    const sizeValues = data.map(d => d.size || 0);
    const sizeExtent = d3.extent(sizeValues) as [number, number];
    
    const { minPointSize = 2, maxPointSize = 20 } = this.config as ScatterCoreConfig;

    return d3.scaleLinear()
      .domain(sizeExtent)
      .range([minPointSize, maxPointSize])
      .clamp(true);
  }

  private createColorScale(data: ChartData<ScatterCoreData>[]): d3.ScaleOrdinal<string, string> {
    if ((this.config as ScatterCoreConfig).colorScale) {
      return (this.config as ScatterCoreConfig).colorScale!;
    }

    const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    const colorValues = data.map(d => d.color || 'default');
    const uniqueColors = Array.from(new Set(colorValues));

    return d3.scaleOrdinal<string, string>()
      .domain(uniqueColors)
      .range(defaultColors);
  }

  private groupData(data: ChartData<ScatterCoreData>[]): Map<string, ChartData<ScatterCoreData>[]> {
    const groups = new Map<string, ChartData<ScatterCoreData>[]>();
    const groupBy = (this.config as ScatterCoreConfig).groupBy!;

    data.forEach(item => {
      const groupKey = item[groupBy] as string || 'default';
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(item);
    });

    return groups;
  }

  private renderPoints(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: ChartData<ScatterCoreData>[],
    scales: Record<string, any>
  ): void {
    const { xScale, yScale } = scales;
    const {
      opacity = 1,
      strokeWidth = 1,
      strokeColor = '#ffffff',
      animate = true,
      animationDuration = 300,
      animationDelay = 0,
      entranceAnimation = 'scale'
    } = this.config as ScatterCoreConfig;

    const points = svg.selectAll('.scatter-point')
      .data(data, (d: any, i: number) => d.id || i)
      .enter()
      .append('path')
      .attr('class', 'scatter-point')
      .attr('data-testid', (_d, i) => `scatter-point-${i}`)
      .attr('transform', (d: ScatterCoreData) => {
        const x = this.getXPosition(d, xScale);
        const y = yScale(d.y);
        return `translate(${x}, ${y})`;
      })
      .attr('d', this.symbolGenerator)
      .attr('fill', (d: ScatterCoreData) => this.computedColorScale(d.color!))
      .attr('stroke', strokeColor)
      .attr('stroke-width', strokeWidth)
      .attr('opacity', opacity);

    // 動畫效果
    if (animate) {
      this.applyEntranceAnimation(points, entranceAnimation, animationDuration, animationDelay);
    }
  }

  private renderGroupedPoints(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    _data: ChartData<ScatterCoreData>[],
    scales: Record<string, any>
  ): void {
    const groupKeys = Array.from(this.groupedData.keys());
    const { animate = true, animationDuration = 300, animationDelay = 100 } = this.config as ScatterCoreConfig;

    groupKeys.forEach((groupKey, groupIndex) => {
      const groupData = this.groupedData.get(groupKey)!;
      const groupColor = this.getGroupColor(groupIndex);

      const groupPoints = svg.selectAll(`.scatter-point-group-${groupKey}`)
        .data(groupData, (d: any, i: number) => d.id || i)
        .enter()
        .append('path')
        .attr('class', `scatter-point scatter-point-group-${groupKey}`)
        .attr('data-testid', (_d, i) => `scatter-point-${groupKey}-${i}`)
        .attr('transform', (d: ScatterCoreData) => {
          const x = this.getXPosition(d, scales.xScale);
          const y = scales.yScale(d.y);
          return `translate(${x}, ${y})`;
        })
        .attr('d', this.symbolGenerator)
        .attr('fill', groupColor)
        .attr('stroke', (this.config as ScatterCoreConfig).strokeColor || '#ffffff')
        .attr('stroke-width', (this.config as ScatterCoreConfig).strokeWidth || 1)
        .attr('opacity', (this.config as ScatterCoreConfig).opacity || 1);

      // 分組動畫：錯開執行
      if (animate) {
        const delay = groupIndex * animationDelay;
        this.applyEntranceAnimation(
          groupPoints, 
          (this.config as ScatterCoreConfig).entranceAnimation || 'scale', 
          animationDuration, 
          delay
        );
      }
    });
  }

  private renderTrendline(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: ChartData<ScatterCoreData>[],
    scales: Record<string, any>
  ): void {
    if (!this.isNumericData(data.map(d => d.x)) || !this.isNumericData(data.map(d => d.y))) {
      return; // 趨勢線只支援數值數據
    }

    const {
      trendlineColor = '#666666',
      trendlineWidth = 2,
      trendlineType = 'linear'
    } = this.config as ScatterCoreConfig;

    const { xScale, yScale } = scales;
    
    // 計算趨勢線數據點
    const trendlineData = this.calculateTrendline(data, trendlineType);
    
    if (trendlineData.length < 2) return;

    const lineGenerator = d3.line<{ x: number; y: number }>()
      .x((d: { x: number; y: number }) => xScale(d.x))
      .y((d: { x: number; y: number }) => yScale(d.y))
      .curve(d3.curveLinear);

    svg.append('path')
      .datum(trendlineData)
      .attr('class', 'trendline')
      .attr('data-testid', 'trendline')
      .attr('fill', 'none')
      .attr('stroke', trendlineColor)
      .attr('stroke-width', trendlineWidth)
      .attr('stroke-dasharray', '5,5')
      .attr('d', lineGenerator);
  }

  private calculateTrendline(
    data: ChartData<ScatterCoreData>[],
    type: 'linear' | 'polynomial' | 'exponential'
  ): Array<{ x: number; y: number }> {
    // 簡化的線性趨勢線計算
    const numericData = data
      .filter(d => typeof d.x === 'number' && typeof d.y === 'number')
      .map(d => ({ x: d.x as number, y: d.y as number }));

    if (numericData.length < 2) return [];

    if (type === 'linear') {
      return this.calculateLinearTrendline(numericData);
    }

    // 其他類型的趨勢線可以在這裡實現
    return this.calculateLinearTrendline(numericData);
  }

  private calculateLinearTrendline(data: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
    const n = data.length;
    const sumX = d3.sum(data, d => d.x);
    const sumY = d3.sum(data, d => d.y);
    const sumXY = d3.sum(data, d => d.x * d.y);
    const sumXX = d3.sum(data, d => d.x * d.x);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const xExtent = d3.extent(data, d => d.x) as [number, number];

    return [
      { x: xExtent[0], y: slope * xExtent[0] + intercept },
      { x: xExtent[1], y: slope * xExtent[1] + intercept }
    ];
  }

  private applyEntranceAnimation(
    selection: d3.Selection<any, any, any, any>,
    animationType: 'none' | 'fade' | 'scale' | 'bounce',
    duration: number,
    delay: number
  ): void {
    switch (animationType) {
      case 'fade':
        selection
          .attr('opacity', 0)
          .transition()
          .delay(delay)
          .duration(duration)
          .attr('opacity', (this.config as ScatterCoreConfig).opacity || 1);
        break;
      
      case 'scale':
        selection
          .attr('transform', (d: ScatterCoreData) => {
            const x = this.getXPosition(d, this.getScales().xScale);
            const y = this.getScales().yScale(d.y);
            return `translate(${x}, ${y}) scale(0)`;
          })
          .transition()
          .delay(delay)
          .duration(duration)
          .attr('transform', (d: ScatterCoreData) => {
            const x = this.getXPosition(d, this.getScales().xScale);
            const y = this.getScales().yScale(d.y);
            return `translate(${x}, ${y}) scale(1)`;
          });
        break;
      
      case 'bounce':
        selection
          .attr('transform', (d: ScatterCoreData) => {
            const x = this.getXPosition(d, this.getScales().xScale);
            const y = this.getScales().yScale(d.y);
            return `translate(${x}, ${y}) scale(0)`;
          })
          .transition()
          .delay(delay)
          .duration(duration)
          .ease(d3.easeBounce)
          .attr('transform', (d: ScatterCoreData) => {
            const x = this.getXPosition(d, this.getScales().xScale);
            const y = this.getScales().yScale(d.y);
            return `translate(${x}, ${y}) scale(1)`;
          });
        break;
    }
  }

  private getXPosition(d: ScatterCoreData, xScale: any): number {
    if (xScale.bandwidth) {
      return calculateAlignedPosition(d.x, xScale, (this.config as ScatterCoreConfig).alignment || 'center');
    } else {
      return xScale(d.x);
    }
  }

  private addInteractionEvents(svg: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    if (!(this.config as ScatterCoreConfig).interactive) return;

    const { hoverRadius = 6, hoverEffect = true } = this.config as ScatterCoreConfig;

    svg.selectAll('.scatter-point')
      .on('click', (event, d: any) => {
        // const _index = this.getProcessedData()!.indexOf(d);
        this.showTooltip(event.pageX, event.pageY, `${d.label}: (${d.x}, ${d.y})`);
      })
      .on('mouseenter', (event, d: any) => {
        if (hoverEffect) {
          d3.select(event.currentTarget)
            .transition()
            .duration(150)
            .attr('transform', (d: any) => {
              const x = this.getXPosition(d, this.getScales().xScale);
              const y = this.getScales().yScale(d.y);
              const scale = hoverRadius / ((this.config as ScatterCoreConfig).radius || 4);
              return `translate(${x}, ${y}) scale(${scale})`;
            });
        }
        this.showTooltip(event.pageX, event.pageY, `${d.label}: (${d.x}, ${d.y})`);
      })
      .on('mouseleave', (event, _d: any) => {
        if (hoverEffect) {
          d3.select(event.currentTarget)
            .transition()
            .duration(150)
            .attr('transform', (d: any) => {
              const x = this.getXPosition(d, this.getScales().xScale);
              const y = this.getScales().yScale(d.y);
              return `translate(${x}, ${y}) scale(1)`;
            });
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

  private getGroupColor(index: number): string {
    const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    return defaultColors[index % defaultColors.length];
  }

  // === 公共 API ===

  public getGroupedData(): Map<string, ChartData<ScatterCoreData>[]> {
    return this.groupedData;
  }

  public isGroupedChart(): boolean {
    return this.isGrouped;
  }

  public getSizeScale(): d3.ScaleLinear<number, number> {
    return this.computedSizeScale;
  }

  public getColorScale(): d3.ScaleOrdinal<string, string> {
    return this.computedColorScale;
  }

  public toggleTrendline(show: boolean): void {
    (this.config as ScatterCoreConfig).showTrendline = show;
    this.render();
  }

  public updateSymbolType(symbol: d3.SymbolType): void {
    (this.config as ScatterCoreConfig).symbol = symbol;
    this.render();
  }

  public updateSizeRange(minSize: number, maxSize: number): void {
    (this.config as ScatterCoreConfig).minPointSize = minSize;
    (this.config as ScatterCoreConfig).maxPointSize = maxSize;
    this.render();
  }
}

// === 預設配置 ===

export const DEFAULT_SCATTER_CORE_CONFIG: Partial<ScatterCoreConfig> = {
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 40, left: 40 },
  
  // 視覺配置
  color: '#3b82f6',
  opacity: 0.7,
  
  // 點配置
  radius: 4,
  minPointSize: 2,
  maxPointSize: 20,
  
  // 描邊配置
  strokeWidth: 1,
  strokeColor: '#ffffff',
  
  // 符號類型
  symbol: d3.symbolCircle,
  
  // 佈局配置
  alignment: 'center',
  
  // 動畫配置
  animate: true,
  animationDuration: 300,
  animationEasing: 'ease-in-out',
  animationDelay: 0,
  entranceAnimation: 'scale',
  
  // 交互配置
  interactive: true,
  hoverEffect: true,
  hoverRadius: 6,
  
  // 趨勢線配置
  showTrendline: false,
  trendlineColor: '#666666',
  trendlineWidth: 2,
  trendlineType: 'linear'
};