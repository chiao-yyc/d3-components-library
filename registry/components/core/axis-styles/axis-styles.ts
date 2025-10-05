/**
 * 統一軸線樣式系統
 * 為所有圖表提供一致的軸線外觀和樣式配置
 */

import * as d3 from 'd3';

export interface StandardAxisStyles {
  fontSize: string;
  fontColor: string;
  fontFamily: string;
  tickLength: number;
  gridColor: string;
  domainColor: string;
  tickPadding: number;
}

export const DEFAULT_AXIS_STYLES: StandardAxisStyles = {
  fontSize: '12px',
  fontColor: '#6b7280',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  tickLength: 6,
  gridColor: '#e5e7eb',
  domainColor: '#d1d5db',
  tickPadding: 8
};

/**
 * 應用標準軸線樣式到軸線群組
 */
export function applyStandardAxisStyles(
  axisGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  styles: Partial<StandardAxisStyles> = {}
): void {
  const finalStyles = { ...DEFAULT_AXIS_STYLES, ...styles };
  
  // 應用 tick label 樣式
  axisGroup.selectAll('.tick text')
    .style('font-size', finalStyles.fontSize)
    .style('fill', finalStyles.fontColor)
    .style('font-family', finalStyles.fontFamily);
    
  // 應用 tick line 樣式  
  axisGroup.selectAll('.tick line')
    .style('stroke', finalStyles.gridColor)
    .style('stroke-width', 1);
    
  // 應用 domain 樣式
  axisGroup.select('.domain')
    .style('stroke', finalStyles.domainColor)
    .style('stroke-width', 1);
}

/**
 * 軸線標籤配置接口
 */
export interface AxisLabelConfig {
  text: string;
  offset?: number;
  fontSize?: string;
  fontColor?: string;
  fontFamily?: string;
}

/**
 * 添加軸線標籤
 */
export function addAxisLabel(
  axisGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  config: AxisLabelConfig,
  orientation: 'top' | 'right' | 'bottom' | 'left',
  chartWidth: number,
  chartHeight: number
): void {
  const {
    text,
    offset = 40,
    fontSize = DEFAULT_AXIS_STYLES.fontSize,
    fontColor = DEFAULT_AXIS_STYLES.fontColor,
    fontFamily = DEFAULT_AXIS_STYLES.fontFamily
  } = config;

  let x: number, y: number, textAnchor: string, transform: string = '';

  switch (orientation) {
    case 'bottom':
      x = chartWidth / 2;
      y = offset;
      textAnchor = 'middle';
      break;
    case 'top':
      x = chartWidth / 2;
      y = -offset;
      textAnchor = 'middle';
      break;
    case 'left':
      x = -offset;
      y = chartHeight / 2;
      textAnchor = 'middle';
      transform = `rotate(-90, ${-offset}, ${chartHeight / 2})`;
      break;
    case 'right':
      x = offset;
      y = chartHeight / 2;
      textAnchor = 'middle';
      transform = `rotate(90, ${offset}, ${chartHeight / 2})`;
      break;
  }

  const label = axisGroup
    .append('text')
    .attr('class', 'axis-label')
    .attr('x', x)
    .attr('y', y)
    .attr('text-anchor', textAnchor)
    .style('font-size', fontSize)
    .style('fill', fontColor)
    .style('font-family', fontFamily)
    .text(text);

  if (transform) {
    label.attr('transform', transform);
  }
}

/**
 * 網格線配置接口
 */
export interface GridConfig {
  show: boolean;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  opacity?: number;
}

/**
 * 渲染網格線
 */
export function renderGrid(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  scale: d3.AxisScale<any>,
  orientation: 'horizontal' | 'vertical',
  size: number,
  config: GridConfig = { show: true }
): void {
  if (!config.show) return;

  const {
    color = DEFAULT_AXIS_STYLES.gridColor,
    strokeWidth = 0.5,
    strokeDasharray = 'none',
    opacity = 0.7
  } = config;

  const tickValues = 'ticks' in scale ? (scale as any).ticks() : scale.domain();
  
  const gridGroup = container
    .append('g')
    .attr('class', `${orientation}-grid`)
    .style('opacity', opacity);

  if (orientation === 'horizontal') {
    // 水平網格線
    gridGroup.selectAll('.grid-line')
      .data(tickValues)
      .join('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', size)
      .attr('y1', (d: any) => scale(d) as number)
      .attr('y2', (d: any) => scale(d) as number)
      .style('stroke', color)
      .style('stroke-width', strokeWidth)
      .style('stroke-dasharray', strokeDasharray);
  } else {
    // 垂直網格線
    gridGroup.selectAll('.grid-line')
      .data(tickValues)
      .join('line')
      .attr('class', 'grid-line')
      .attr('x1', (d: any) => scale(d) as number)
      .attr('x2', (d: any) => scale(d) as number)
      .attr('y1', 0)
      .attr('y2', size)
      .style('stroke', color)
      .style('stroke-width', strokeWidth)
      .style('stroke-dasharray', strokeDasharray);
  }
}