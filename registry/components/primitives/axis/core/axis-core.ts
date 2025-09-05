/**
 * AxisCore - 純 JS/TS 軸線核心邏輯
 * 框架無關的軸線渲染和配置管理
 */

import * as d3 from 'd3';

export interface AxisCoreConfig {
  scale: d3.AxisScale<unknown>;
  orientation: 'top' | 'right' | 'bottom' | 'left';
  tickCount?: number;
  tickSize?: number;
  tickSizeOuter?: number;
  tickFormat?: (domainValue: unknown, index: number) => string;
  tickValues?: unknown[];
  showTicks?: boolean;
  showTickLabels?: boolean;
  showDomain?: boolean;
}

export class AxisCore {
  private config: AxisCoreConfig;
  private axisGenerator: d3.Axis<d3.AxisDomain>;

  constructor(config: AxisCoreConfig) {
    this.config = config;
    this.axisGenerator = this.createAxisGenerator();
  }

  private createAxisGenerator(): d3.Axis<any> {
    const { scale, orientation, tickCount, tickSize, tickSizeOuter, tickFormat, tickValues } = this.config;
    
    let axis: d3.Axis<any>;
    
    switch (orientation) {
      case 'top':
        axis = d3.axisTop(scale);
        break;
      case 'right':
        axis = d3.axisRight(scale);
        break;
      case 'bottom':
        axis = d3.axisBottom(scale);
        break;
      case 'left':
        axis = d3.axisLeft(scale);
        break;
      default:
        axis = d3.axisBottom(scale);
    }

    if (tickCount) axis.ticks(tickCount);
    if (tickSize) axis.tickSize(tickSize);
    if (tickFormat) axis.tickFormat(tickFormat);
    if (tickValues) axis.tickValues(tickValues);
    
    // 🔧 可配置的外側刻度延伸 - 默認值 6 讓軸線相交
    axis.tickSizeOuter(tickSizeOuter !== undefined ? tickSizeOuter : 6);

    return axis;
  }

  public render(container: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    const { showTicks = true, showTickLabels = true, showDomain = true } = this.config;
    
    // 渲染軸線
    const axisGroup = container.call(this.axisGenerator);
    
    // 條件性顯示元素
    if (!showTicks) {
      axisGroup.selectAll('.tick line').remove();
    }
    
    if (!showTickLabels) {
      axisGroup.selectAll('.tick text').remove();
    }
    
    if (!showDomain) {
      axisGroup.select('.domain').remove();
    }
  }

  public updateConfig(newConfig: Partial<AxisCoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.axisGenerator = this.createAxisGenerator();
  }

  public getConfig(): AxisCoreConfig {
    return { ...this.config };
  }
}