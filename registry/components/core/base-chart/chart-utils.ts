import * as d3 from 'd3';

// 軸線配置介面
export interface AxisConfig {
  scale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number> | d3.ScaleBand<string> | d3.ScaleOrdinal<string, unknown>;
  orientation: 'top' | 'bottom' | 'left' | 'right';
  label?: string;
  format?: (d: unknown) => string;
  rotation?: number;
  fontSize?: string;
  fontColor?: string;
  tickCount?: number;
  tickSize?: number;
  gridlines?: boolean;
  className?: string;
  show?: boolean;
}

// 網格線配置介面
export interface GridConfig {
  scale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number> | d3.ScaleBand<string>;
  orientation: 'horizontal' | 'vertical';
  tickCount?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  show?: boolean;
}

// 動畫配置介面
export interface AnimationConfig {
  enabled?: boolean;
  duration?: number;
  delay?: number;
  easing?: string;
}

// 樣式配置介面
export interface StyleConfig {
  fontSize?: string;
  fontFamily?: string;
  fontColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  opacity?: number;
}

/**
 * 統一軸線渲染函數
 * @param container SVG 容器
 * @param config 軸線配置
 * @param chartDimensions 圖表尺寸
 * @returns 軸線群組元素或 null
 */
export function renderAxis(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  config: AxisConfig,
  chartDimensions: { width: number; height: number }
): d3.Selection<SVGGElement, unknown, null, undefined> | null {
  if (config.show === false) return null;
  
  // 建立軸線生成器
  let axisGenerator: d3.Axis<any>;
  let transform = '';
  
  switch (config.orientation) {
    case 'bottom':
      axisGenerator = d3.axisBottom(config.scale as any);
      transform = `translate(0,${chartDimensions.height})`;
      break;
    case 'top':
      axisGenerator = d3.axisTop(config.scale as any);
      break;
    case 'left':
      axisGenerator = d3.axisLeft(config.scale as any);
      break;
    case 'right':
      axisGenerator = d3.axisRight(config.scale as any);
      transform = `translate(${chartDimensions.width},0)`;
      break;
  }
  
  // 配置軸線屬性
  if (config.format) axisGenerator.tickFormat(config.format);
  if (config.tickCount) axisGenerator.ticks(config.tickCount);
  if (config.tickSize) axisGenerator.tickSize(config.tickSize);
  
  // 渲染軸線
  const axisGroup = container.append('g')
    .attr('class', config.className || `${config.orientation}-axis`)
    .attr('transform', transform)
    .call(axisGenerator);
  
  // 統一樣式
  axisGroup.selectAll('text')
    .style('font-size', config.fontSize || '12px')
    .style('fill', config.fontColor || '#6b7280');
  
  // 處理文字旋轉
  if (config.rotation && config.rotation !== 0) {
    const textAnchor = config.rotation < 0 ? 'end' : 'start';
    axisGroup.selectAll('text')
      .style('text-anchor', textAnchor)
      .attr('transform', `rotate(${config.rotation})`);
  }
  
  // 軸線標籤
  if (config.label) {
    addAxisLabel(axisGroup, config.label, config.orientation, chartDimensions);
  }
  
  return axisGroup;
}

/**
 * 統一網格線渲染函數
 * @param container SVG 容器
 * @param config 網格線配置
 * @param chartDimensions 圖表尺寸
 * @returns 網格線群組元素或 null
 */
export function renderGrid(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  config: GridConfig,
  chartDimensions: { width: number; height: number }
): d3.Selection<SVGGElement, unknown, null, undefined> | null {
  if (config.show === false) return null;
  
  const gridGroup = container.append('g')
    .attr('class', `grid grid-${config.orientation}`);
  
  if (config.orientation === 'horizontal') {
    // Type guard: check if scale has ticks method
    const tickData = 'ticks' in config.scale ? config.scale.ticks(config.tickCount) : [];
    gridGroup.selectAll('line')
      .data(tickData as any[])
      .enter().append('line')
      .attr('x1', 0)
      .attr('x2', chartDimensions.width)
      .attr('y1', (d: any) => config.scale(d as any) as number)
      .attr('y2', (d: any) => config.scale(d as any) as number)
      .attr('stroke', config.strokeColor || '#e5e7eb')
      .attr('stroke-width', config.strokeWidth || 1)
      .attr('stroke-opacity', config.strokeOpacity || 0.7);
  } else {
    // Type guard: check if scale has ticks method
    const tickData = 'ticks' in config.scale ? config.scale.ticks(config.tickCount) : [];
    gridGroup.selectAll('line')
      .data(tickData as any[])
      .enter().append('line')
      .attr('x1', (d: any) => config.scale(d as any) as number)
      .attr('x2', (d: any) => config.scale(d as any) as number)
      .attr('y1', 0)
      .attr('y2', chartDimensions.height)
      .attr('stroke', config.strokeColor || '#e5e7eb')
      .attr('stroke-width', config.strokeWidth || 1)
      .attr('stroke-opacity', config.strokeOpacity || 0.7);
  }
  
  return gridGroup;
}

/**
 * 進入動畫工具函數
 * @param selection D3 選取器
 * @param config 動畫配置
 * @returns 套用動畫的選取器
 */
export function applyEnterAnimation(
  selection: d3.Selection<any, any, any, any>,
  config: AnimationConfig
): d3.Selection<any, any, any, any> | d3.Transition<any, any, any, any> {
  if (!config.enabled) return selection;

  return selection
    .attr('opacity', 0)
    .transition()
    .duration(config.duration || 750)
    .delay(config.delay || 0)
    .attr('opacity', 1);
}

/**
 * 更新動畫工具函數
 * @param selection D3 選取器
 * @param config 動畫配置
 * @returns 動畫轉換物件
 */
export function applyUpdateAnimation(
  selection: d3.Selection<any, any, any, any>,
  config: AnimationConfig
): d3.Transition<any, any, any, any> {
  return selection
    .transition()
    .duration(config.duration || 500)
    .delay(config.delay || 0);
}

/**
 * 文字樣式套用工具函數
 * @param selection D3 選取器
 * @param config 樣式配置
 * @returns 套用樣式的選取器
 */
export function applyTextStyles(
  selection: d3.Selection<any, any, any, any>,
  config: StyleConfig
): d3.Selection<any, any, any, any> {
  if (config.fontSize) selection.style('font-size', config.fontSize);
  if (config.fontFamily) selection.style('font-family', config.fontFamily);
  if (config.fontColor) selection.style('fill', config.fontColor);
  return selection;
}

/**
 * 圖形樣式套用工具函數
 * @param selection D3 選取器
 * @param config 樣式配置
 * @returns 套用樣式的選取器
 */
export function applyShapeStyles(
  selection: d3.Selection<any, any, any, any>,
  config: StyleConfig
): d3.Selection<any, any, any, any> {
  if (config.fillColor) selection.attr('fill', config.fillColor);
  if (config.strokeColor) selection.attr('stroke', config.strokeColor);
  if (config.strokeWidth) selection.attr('stroke-width', config.strokeWidth);
  if (config.opacity) selection.attr('opacity', config.opacity);
  return selection;
}

/**
 * 軸線標籤添加輔助函數
 * @param axisGroup 軸線群組
 * @param label 標籤文字
 * @param orientation 軸線方向
 * @param chartDimensions 圖表尺寸
 */
function addAxisLabel(
  axisGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  label: string,
  orientation: 'top' | 'bottom' | 'left' | 'right',
  chartDimensions: { width: number; height: number }
): void {
  let x: number, y: number, rotation = 0;
  
  switch (orientation) {
    case 'bottom':
      x = chartDimensions.width / 2;
      y = 40;
      break;
    case 'top':
      x = chartDimensions.width / 2;
      y = -20;
      break;
    case 'left':
      x = -40;
      y = chartDimensions.height / 2;
      rotation = -90;
      break;
    case 'right':
      x = 40;
      y = chartDimensions.height / 2;
      rotation = 90;
      break;
  }
  
  axisGroup.append('text')
    .attr('class', 'axis-label')
    .attr('x', x)
    .attr('y', y)
    .attr('text-anchor', 'middle')
    .attr('transform', rotation !== 0 ? `rotate(${rotation},${x},${y})` : '')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .style('fill', '#374151')
    .text(label);
}

// 圖例配置介面
export interface LegendConfig {
  show?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  orientation?: 'horizontal' | 'vertical';
  itemSpacing?: number;
  fontSize?: string;
  fontColor?: string;
  symbolSize?: number;
  symbolType?: 'circle' | 'square' | 'line';
}

// 標籤配置介面
export interface LabelConfig {
  show?: boolean;
  position?: 'inside' | 'outside' | 'center' | 'top' | 'bottom' | 'left' | 'right';
  fontSize?: string;
  fontColor?: string;
  format?: (value: any) => string;
  threshold?: number; // 最小顯示百分比
}

// Arc 動畫配置介面
export interface ArcAnimationConfig extends AnimationConfig {
  startAngle?: number;
  endAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
}

/**
 * 渲染圖例
 * @param container SVG 容器
 * @param data 圖例數據
 * @param config 圖例配置
 * @param chartDimensions 圖表尺寸
 * @returns 圖例群組元素或 null
 */
export function renderLegend(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: Array<{ label: string; color: string; value?: number }>,
  config: LegendConfig,
  chartDimensions: { width: number; height: number }
): d3.Selection<SVGGElement, unknown, null, undefined> | null {
  if (config.show === false || !data.length) return null;

  const legendGroup = container.append('g').attr('class', 'legend');
  const itemSpacing = config.itemSpacing || 20;
  const symbolSize = config.symbolSize || 12;
  const fontSize = config.fontSize || '12px';
  const fontColor = config.fontColor || '#6b7280';

  // 根據位置計算偏移
  let legendX = 0, legendY = 0;
  switch (config.position) {
    case 'top':
      legendX = chartDimensions.width / 2;
      legendY = -30;
      break;
    case 'bottom':
      legendX = chartDimensions.width / 2;
      legendY = chartDimensions.height + 30;
      break;
    case 'left':
      legendX = -80;
      legendY = chartDimensions.height / 2;
      break;
    case 'right':
      legendX = chartDimensions.width + 20;
      legendY = chartDimensions.height / 2;
      break;
  }

  legendGroup.attr('transform', `translate(${legendX}, ${legendY})`);

  const legendItems = legendGroup.selectAll('.legend-item')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (_d, i) => {
      if (config.orientation === 'horizontal') {
        return `translate(${i * itemSpacing - (data.length * itemSpacing) / 2}, 0)`;
      } else {
        return `translate(0, ${i * itemSpacing - (data.length * itemSpacing) / 2})`;
      }
    });

  // 圖例符號
  legendItems.append(config.symbolType === 'square' ? 'rect' : 'circle')
    .attr('fill', (d: any) => d.color)
    .each(function(_d: any, _i: number) {
      const element = d3.select(this);
      if (config.symbolType === 'square') {
        element
          .attr('width', symbolSize)
          .attr('height', symbolSize)
          .attr('x', -symbolSize / 2)
          .attr('y', -symbolSize / 2);
      } else {
        element.attr('r', symbolSize / 2);
      }
    });

  // 圖例文字
  legendItems.append('text')
    .attr('x', symbolSize + 5)
    .attr('y', 0)
    .attr('dy', '0.35em')
    .style('font-size', fontSize)
    .style('fill', fontColor)
    .style('text-anchor', 'start')
    .text((d: any) => d.label);

  return legendGroup;
}

// 條形標籤配置介面
export interface BarLabelConfig extends LabelConfig {
  position?: 'top' | 'center' | 'bottom'; // 條形標籤位置
  offset?: number; // 標籤偏移量
}

// 點形標籤配置介面  
export interface PointLabelConfig extends LabelConfig {
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
}

/**
 * 渲染弧形標籤（PieChart、DonutChart、GaugeChart）
 * @param container SVG 容器
 * @param arcs 弧形數據
 * @param config 標籤配置
 * @param arcGenerator 弧形生成器
 * @returns 標籤群組元素或 null
 */
export function renderArcLabels(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  arcs: any[],
  config: LabelConfig,
  arcGenerator: d3.Arc<any, any>
): d3.Selection<SVGGElement, unknown, null, undefined> | null {
  if (config.show === false) return null;

  const labelGroup = container.append('g').attr('class', 'arc-labels');
  const fontSize = config.fontSize || '12px';
  const fontColor = config.fontColor || '#fff';
  const threshold = config.threshold || 0.05; // 5% 最小顯示閾值

  labelGroup.selectAll('.arc-label')
    .data(arcs.filter((d: any) => d.data.percentage >= threshold))
    .enter()
    .append('text')
    .attr('class', 'arc-label')
    .attr('transform', (d: any) => {
      const [x, y] = arcGenerator.centroid(d);
      return `translate(${x}, ${y})`;
    })
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font-size', fontSize)
    .style('fill', fontColor)
    .style('pointer-events', 'none')
    .text((d: any) => {
      if (config.format) {
        return config.format(d.data);
      }
      return `${(d.data.percentage * 100).toFixed(1)}%`;
    });

  return labelGroup;
}

/**
 * 渲染條形標籤（BarChart）
 * @param container SVG 容器
 * @param data 數據點數組
 * @param config 標籤配置
 * @param scales 比例尺對象
 * @param orientation 方向
 * @returns 標籤群組元素或 null
 */
export function renderBarLabels(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: any[],
  config: BarLabelConfig,
  scales: { xScale: any; yScale: any },
  orientation: 'vertical' | 'horizontal' = 'vertical'
): d3.Selection<SVGGElement, unknown, null, undefined> | null {
  if (config.show === false) return null;

  const labelGroup = container.append('g').attr('class', 'bar-labels');
  const fontSize = config.fontSize || '12px';
  const fontColor = config.fontColor || '#374151';
  const offset = config.offset || 5;
  const { xScale, yScale } = scales;

  const labels = labelGroup.selectAll('.bar-label')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'bar-label')
    .style('font-size', fontSize)
    .style('fill', fontColor)
    .style('pointer-events', 'none')
    .text((d: any) => config.format ? config.format(d.y) : String(d.y));

  if (orientation === 'vertical') {
    labels
      .attr('x', (d: any) => (xScale(String(d.x)) || 0) + xScale.bandwidth() / 2)
      .attr('y', (d: any) => {
        const barY = yScale(d.y);
        switch (config.position) {
          case 'center': return barY + (yScale(0) - barY) / 2;
          case 'bottom': return yScale(0) - offset;
          default: return barY - offset; // 'top'
        }
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', config.position === 'bottom' ? 'auto' : 'middle');
  } else {
    labels
      .attr('x', (d: any) => {
        const barWidth = xScale(d.y);
        switch (config.position) {
          case 'center': return barWidth / 2;
          default: return barWidth + offset; // 'top' (right for horizontal)
        }
      })
      .attr('y', (d: any) => (yScale(String(d.x)) || 0) + yScale.bandwidth() / 2)
      .attr('text-anchor', config.position === 'center' ? 'middle' : 'start')
      .attr('dominant-baseline', 'middle');
  }

  return labelGroup;
}

/**
 * 渲染點形標籤（ScatterPlot、LineChart 數據點）
 * @param container SVG 容器
 * @param data 數據點數組
 * @param config 標籤配置
 * @param scales 比例尺對象
 * @returns 標籤群組元素或 null
 */
export function renderPointLabels(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: any[],
  config: PointLabelConfig,
  scales: { xScale: any; yScale: any }
): d3.Selection<SVGGElement, unknown, null, undefined> | null {
  if (config.show === false) return null;

  const labelGroup = container.append('g').attr('class', 'point-labels');
  const fontSize = config.fontSize || '11px';
  const fontColor = config.fontColor || '#6b7280';
  const offset = config.offset || 8;
  const { xScale, yScale } = scales;

  labelGroup.selectAll('.point-label')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'point-label')
    .attr('x', (d: any) => {
      const baseX = xScale(d.x);
      switch (config.position) {
        case 'left': return baseX - offset;
        case 'right': return baseX + offset;
        default: return baseX; // 'top' | 'bottom'
      }
    })
    .attr('y', (d: any) => {
      const baseY = yScale(d.y);
      switch (config.position) {
        case 'top': return baseY - offset;
        case 'bottom': return baseY + offset;
        default: return baseY; // 'left' | 'right'
      }
    })
    .attr('text-anchor',
      config.position === 'left' ? 'end' :
      config.position === 'right' ? 'start' : 'middle'
    )
    .attr('dominant-baseline',
      config.position === 'top' ? 'auto' :
      config.position === 'bottom' ? 'hanging' : 'middle'
    )
    .style('font-size', fontSize)
    .style('fill', fontColor)
    .style('pointer-events', 'none')
    .text((d: any) => config.format ? config.format(d) : `${d.x}, ${d.y}`);

  return labelGroup;
}

/**
 * Arc 進入動畫
 * @param selection D3 選取器
 * @param config 動畫配置
 * @returns 動畫轉換物件
 */
export function applyArcEnterAnimation(
  selection: d3.Selection<any, any, any, any>,
  config: ArcAnimationConfig
): d3.Transition<any, any, any, any> {
  if (!config.enabled) return selection.transition().duration(0);

  const transition = selection.transition()
    .duration(config.duration || 750)
    .delay(config.delay || 0);

  return transition
    .attrTween('d', function(d: any) {
      const interpolate = d3.interpolate(
        { startAngle: 0, endAngle: 0 },
        { startAngle: d.startAngle, endAngle: d.endAngle }
      );
      return function(t: number) {
        const arc = d3.arc()
          .innerRadius(config.innerRadius || 0)
          .outerRadius(config.outerRadius || 100);
        return arc(interpolate(t) as any) as string;
      };
    });
}

/**
 * 通用樣式應用函數
 * @param container SVG 容器
 * @param axisStyleConfig 軸線樣式配置
 */
export function applyAxisStyles(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  axisStyleConfig?: {
    domainColor?: string;
    tickColor?: string;
    fontSize?: string;
    fontColor?: string;
  }
): void {
  const config = {
    domainColor: '#d1d5db',
    tickColor: '#d1d5db',
    fontSize: '12px',
    fontColor: '#6b7280',
    ...axisStyleConfig
  };
  
  container.selectAll('.domain')
    .style('stroke', config.domainColor);
    
  container.selectAll('.tick line')
    .style('stroke', config.tickColor);
    
  container.selectAll('.tick text')
    .style('font-size', config.fontSize)
    .style('fill', config.fontColor);
}