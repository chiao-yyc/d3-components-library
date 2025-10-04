/**
 * BarCore - 框架無關的條形圖核心邏輯
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
  calculateBarPosition, 
  AlignmentStrategy,
  calculateGroupedBarPosition 
} from '../../utils';

// === 核心數據類型定義 ===

export interface BarCoreData extends BaseChartData {
  x: any;
  y: any;
  width?: number;
  height?: number;
  value?: number;
  label?: string;
  color?: string;
  group?: string;
}

export interface BarCoreConfig extends BaseChartCoreConfig<BarCoreData> {
  // 視覺配置
  color?: string | ((d: BarCoreData, i: number) => string);
  opacity?: number;
  orientation?: 'vertical' | 'horizontal';
  
  // 佈局配置
  alignment?: AlignmentStrategy;
  barWidthRatio?: number;
  
  // 分組支持
  groupBy?: string;
  groupPadding?: number;
  
  // 動畫配置
  animate?: boolean;
  animationDuration?: number;
  animationEasing?: string;
  
  // 交互配置
  interactive?: boolean;
  hoverEffect?: boolean;
  
  // 樣式配置
  strokeWidth?: number;
  strokeColor?: string;
  cornerRadius?: number;
}

// === 核心實現類 ===

export class BarCore extends BaseChartCore<BarCoreData> {
  private barWidth: number = 0;
  private groupedData: Map<string, ChartData<BarCoreData>[]> = new Map();
  private isGrouped: boolean = false;

  public getChartType(): string {
    return 'bar-chart';
  }

  protected processData(): ChartData<BarCoreData>[] {
    if (!this.validateData()) {
      return [];
    }

    // 數據預處理
    const processedData = this.config.data.map((item, index) => ({
      ...item,
      value: typeof item.y === 'number' ? item.y : 0,
      label: item.label || `Item ${index + 1}`,
      color: this.resolveItemColor(item, index)
    }));

    // 檢查是否為分組數據
    this.isGrouped = !!(this.config as BarCoreConfig).groupBy;
    
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
    const { orientation = 'vertical' } = this.config as BarCoreConfig;

    let xScale: any;
    let yScale: any;

    if (orientation === 'vertical') {
      // X 軸 - 類別
      xScale = d3.scaleBand()
        .domain(processedData.map(d => d.x))
        .range([0, chartWidth])
        .padding(0.1);

      // Y 軸 - 數值
      const yExtent = d3.extent(processedData, d => d.y) as [number, number];
      yScale = d3.scaleLinear()
        .domain([Math.min(0, yExtent[0]), yExtent[1]])
        .range([chartHeight, 0])
        .nice();

      this.barWidth = xScale.bandwidth() * ((this.config as BarCoreConfig).barWidthRatio || 0.8);
    } else {
      // 水平條形圖
      yScale = d3.scaleBand()
        .domain(processedData.map(d => d.y))
        .range([chartHeight, 0])
        .padding(0.1);

      const xExtent = d3.extent(processedData, d => d.x) as [number, number];
      xScale = d3.scaleLinear()
        .domain([Math.min(0, xExtent[0]), xExtent[1]])
        .range([0, chartWidth])
        .nice();

      this.barWidth = yScale.bandwidth() * ((this.config as BarCoreConfig).barWidthRatio || 0.8);
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

    const { xScale, yScale } = scales;
    const {
      orientation = 'vertical',
      animate = true,
      animationDuration = 300,
      opacity = 1,
      strokeWidth = 0,
      strokeColor = 'none',
      cornerRadius = 0
    } = this.config as BarCoreConfig;

    // 清除舊內容
    svg.selectAll('.bar-shape').remove();

    if (this.isGrouped) {
      this.renderGroupedBars(svg, processedData, xScale, yScale);
    } else {
      this.renderBars(svg, processedData, xScale, yScale);
    }
  }

  // === 私有方法 ===

  private resolveItemColor(item: BarCoreData, index: number): string {
    const { color } = this.config as BarCoreConfig;

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

  private groupData(data: ChartData<BarCoreData>[]): Map<string, ChartData<BarCoreData>[]> {
    const groups = new Map<string, ChartData<BarCoreData>[]>();
    const groupBy = (this.config as BarCoreConfig).groupBy!;

    data.forEach(item => {
      const groupKey = item[groupBy] as string || 'default';
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(item);
    });

    return groups;
  }

  private renderBars(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: ChartData<BarCoreData>[],
    xScale: any,
    yScale: any
  ): void {
    const {
      orientation = 'vertical',
      animate = true,
      animationDuration = 300,
      opacity = 1,
      alignment = 'center'
    } = this.config as BarCoreConfig;

    const bars = svg.selectAll('.bar-shape')
      .data(data, (d: any, i: number) => d.id || i);

    if (orientation === 'vertical') {
      bars
        .join(
          enter => enter
            .append('rect')
            .attr('class', 'bar-shape')
            .attr('data-testid', (d, i) => `bar-${i}`)
            .attr('x', (d: BarCoreData) => {
              const { x } = calculateBarPosition(d.x, xScale, alignment, this.barWidth);
              return x;
            })
            .attr('y', yScale(0))
            .attr('width', this.barWidth)
            .attr('height', 0)
            .attr('fill', (d: BarCoreData) => d.color!)
            .attr('opacity', opacity)
            .call(enter => animate ? 
              enter
                .transition()
                .duration(animationDuration)
                .attr('y', (d: BarCoreData) => yScale(d.y))
                .attr('height', (d: BarCoreData) => yScale(0) - yScale(d.y))
              : 
              enter
                .attr('y', (d: BarCoreData) => yScale(d.y))
                .attr('height', (d: BarCoreData) => yScale(0) - yScale(d.y))
            ),
          update => update
            .call(update => animate ?
              update
                .transition()
                .duration(animationDuration)
                .attr('x', (d: BarCoreData) => {
                  const { x } = calculateBarPosition(d.x, xScale, alignment, this.barWidth);
                  return x;
                })
                .attr('y', (d: BarCoreData) => yScale(d.y))
                .attr('width', this.barWidth)
                .attr('height', (d: BarCoreData) => yScale(0) - yScale(d.y))
                .attr('fill', (d: BarCoreData) => d.color!)
                .attr('opacity', opacity)
              :
              update
                .attr('x', (d: BarCoreData) => {
                  const { x } = calculateBarPosition(d.x, xScale, alignment, this.barWidth);
                  return x;
                })
                .attr('y', (d: BarCoreData) => yScale(d.y))
                .attr('width', this.barWidth)
                .attr('height', (d: BarCoreData) => yScale(0) - yScale(d.y))
                .attr('fill', (d: BarCoreData) => d.color!)
                .attr('opacity', opacity)
            ),
          exit => exit
            .call(exit => animate ?
              exit
                .transition()
                .duration(animationDuration)
                .attr('height', 0)
                .attr('y', yScale(0))
                .remove()
              :
              exit.remove()
            )
        );
    } else {
      // 水平條形圖渲染邏輯
      this.renderHorizontalBars(svg, data, xScale, yScale);
    }

    // 添加交互事件
    this.addInteractionEvents(svg);
  }

  private renderGroupedBars(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: ChartData<BarCoreData>[],
    xScale: any,
    yScale: any
  ): void {
    // 分組條形圖渲染邏輯
    const groupKeys = Array.from(this.groupedData.keys());
    const groupCount = groupKeys.length;

    data.forEach((d, i) => {
      const groupKey = d[(this.config as BarCoreConfig).groupBy!] as string || 'default';
      const groupIndex = groupKeys.indexOf(groupKey);
      
      const { x, width } = calculateGroupedBarPosition(
        d.x,
        xScale,
        groupIndex,
        groupCount,
        (this.config as BarCoreConfig).barWidthRatio || 0.8,
        (this.config as BarCoreConfig).alignment || 'center'
      );

      svg.append('rect')
        .attr('class', 'bar-shape grouped-bar')
        .attr('data-testid', `grouped-bar-${groupKey}-${i}`)
        .attr('x', x)
        .attr('y', yScale(d.y))
        .attr('width', width)
        .attr('height', yScale(0) - yScale(d.y))
        .attr('fill', d.color!)
        .attr('opacity', (this.config as BarCoreConfig).opacity || 1);
    });
  }

  private renderHorizontalBars(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: ChartData<BarCoreData>[],
    xScale: any,
    yScale: any
  ): void {
    // 水平條形圖專用渲染邏輯
    const bars = svg.selectAll('.bar-shape')
      .data(data, (d: any, i: number) => d.id || i);

    const { animate = true, animationDuration = 300, opacity = 1 } = this.config as BarCoreConfig;

    bars
      .join(
        enter => enter
          .append('rect')
          .attr('class', 'bar-shape horizontal-bar')
          .attr('data-testid', (d, i) => `horizontal-bar-${i}`)
          .attr('x', xScale(0))
          .attr('y', (d: BarCoreData) => yScale(d.y))
          .attr('width', 0)
          .attr('height', this.barWidth)
          .attr('fill', (d: BarCoreData) => d.color!)
          .attr('opacity', opacity)
          .call(enter => animate ?
            enter
              .transition()
              .duration(animationDuration)
              .attr('width', (d: BarCoreData) => xScale(d.x) - xScale(0))
            :
            enter
              .attr('width', (d: BarCoreData) => xScale(d.x) - xScale(0))
          )
      );
  }

  private addInteractionEvents(svg: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    const config = this.config as BarCoreConfig;
    if (!config.interactive) return;

    svg.selectAll('.bar-shape')
      .on('click', (event, d: BarCoreData) => {
        const index = this.getProcessedData()!.indexOf(d);
        this.showTooltip(event.pageX, event.pageY, `${d.label}: ${d.value}`);
      })
      .on('mouseenter', (event, d: BarCoreData) => {
        if (config.hoverEffect) {
          d3.select(event.currentTarget).attr('opacity', 0.8);
        }
      })
      .on('mouseleave', (event, d: BarCoreData) => {
        if (config.hoverEffect) {
          d3.select(event.currentTarget).attr('opacity', config.opacity || 1);
        }
        this.hideTooltip();
      });
  }

  // === 公共 API ===

  public getBarWidth(): number {
    return this.barWidth;
  }

  public getGroupedData(): Map<string, ChartData<BarCoreData>[]> {
    return this.groupedData;
  }

  public isGroupedChart(): boolean {
    return this.isGrouped;
  }

  public updateOrientation(orientation: 'vertical' | 'horizontal'): void {
    (this.config as BarCoreConfig).orientation = orientation;
    this.render();
  }

  public updateBarWidthRatio(ratio: number): void {
    (this.config as BarCoreConfig).barWidthRatio = Math.max(0.1, Math.min(1.0, ratio));
    this.render();
  }
}

// === 預設配置 ===

export const DEFAULT_BAR_CORE_CONFIG: Partial<BarCoreConfig> = {
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 40, left: 40 },
  
  // 視覺配置
  color: '#3b82f6',
  opacity: 1,
  orientation: 'vertical',
  
  // 佈局配置
  alignment: 'center',
  barWidthRatio: 0.8,
  
  // 動畫配置
  animate: true,
  animationDuration: 300,
  animationEasing: 'ease-in-out',
  
  // 交互配置
  interactive: true,
  hoverEffect: true,
  
  // 樣式配置
  strokeWidth: 0,
  strokeColor: 'none',
  cornerRadius: 0
};