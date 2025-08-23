/**
 * CanvasCore - 純 JS/TS 畫布核心邏輯
 * 框架無關的 SVG 容器管理和圖層控制
 */

import * as d3 from 'd3';

export interface CanvasCoreConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  className?: string;
  preserveAspectRatio?: string;
}

export class CanvasCore {
  private config: CanvasCoreConfig;
  private svgElement: SVGSVGElement | null = null;
  private chartArea: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;

  constructor(config: CanvasCoreConfig) {
    this.config = config;
  }

  public initialize(svgElement: SVGSVGElement): d3.Selection<SVGGElement, unknown, null, undefined> {
    this.svgElement = svgElement;
    const { width, height, margin, className, preserveAspectRatio } = this.config;

    const svg = d3.select(svgElement)
      .attr('width', width)
      .attr('height', height)
      .attr('class', className || 'chart-canvas');

    if (preserveAspectRatio) {
      svg.attr('preserveAspectRatio', preserveAspectRatio);
    }

    // 清除現有內容
    svg.selectAll('*').remove();

    // 創建主要圖表區域
    this.chartArea = svg
      .append('g')
      .attr('class', 'chart-area')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    return this.chartArea;
  }

  public getChartArea(): d3.Selection<SVGGElement, unknown, null, undefined> | null {
    return this.chartArea;
  }

  public getChartDimensions() {
    const { width, height, margin } = this.config;
    return {
      width,
      height,
      margin,
      chartWidth: width - margin.left - margin.right,
      chartHeight: height - margin.top - margin.bottom
    };
  }

  public createLayer(name: string, zIndex?: number): d3.Selection<SVGGElement, unknown, null, undefined> | null {
    if (!this.chartArea) return null;

    const layer = this.chartArea
      .append('g')
      .attr('class', `layer-${name}`);

    if (zIndex !== undefined) {
      layer.style('z-index', zIndex);
    }

    return layer;
  }

  public updateConfig(newConfig: Partial<CanvasCoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.svgElement) {
      this.initialize(this.svgElement);
    }
  }

  public getConfig(): CanvasCoreConfig {
    return { ...this.config };
  }

  public destroy(): void {
    if (this.svgElement) {
      d3.select(this.svgElement).selectAll('*').remove();
    }
    this.svgElement = null;
    this.chartArea = null;
  }
}