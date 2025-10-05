import * as d3 from 'd3';

/**
 * 剪裁路徑配置介面
 */
export interface ClipPathConfig {
  id: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  shape?: 'rect' | 'circle' | 'ellipse' | 'custom';
  customPath?: string;
  rx?: number; // 圓角半徑 (矩形)
  ry?: number; // 圓角半徑 Y 軸 (矩形)
}

/**
 * 濾鏡效果配置介面
 */
export interface FilterConfig {
  id: string;
  blur?: number;
  opacity?: number;
  color?: string;
  offsetX?: number;
  offsetY?: number;
}

/**
 * 陰影效果配置介面
 */
export interface DropShadowConfig extends FilterConfig {
  blur?: number;
  offsetX?: number;
  offsetY?: number;
  color?: string;
  opacity?: number;
}

/**
 * 光暈效果配置介面
 */
export interface GlowConfig extends FilterConfig {
  blur?: number;
  color?: string;
  opacity?: number;
  intensity?: number;
}

/**
 * 漸層配置介面
 */
export interface GradientConfig {
  id: string;
  type: 'linear' | 'radial';
  stops: Array<{
    offset: string;
    color: string;
    opacity?: number;
  }>;
  // 線性漸層
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;
  // 放射狀漸層
  cx?: string;
  cy?: string;
  r?: string;
  fx?: string;
  fy?: string;
}

/**
 * 創建剪裁路徑
 * @param svg SVG 元素選擇器
 * @param config 剪裁路徑配置
 * @returns 剪裁路徑的 ID，用於 clip-path 屬性
 */
export function createClipPath(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  config: ClipPathConfig
): string {
  // 確保 defs 元素存在
  let defs = svg.select('defs') as d3.Selection<any, unknown, null, undefined>;
  if (defs.empty()) {
    defs = svg.append('defs') as d3.Selection<any, unknown, null, undefined>;
  }

  // 移除現有的同名剪裁路徑
  defs.select(`#${config.id}`).remove();

  // 創建剪裁路徑
  const clipPath = defs.append('clipPath').attr('id', config.id);

  const x = config.x || 0;
  const y = config.y || 0;

  switch (config.shape) {
    case 'circle':
      clipPath.append('circle')
        .attr('cx', x + config.width / 2)
        .attr('cy', y + config.height / 2)
        .attr('r', Math.min(config.width, config.height) / 2);
      break;

    case 'ellipse':
      clipPath.append('ellipse')
        .attr('cx', x + config.width / 2)
        .attr('cy', y + config.height / 2)
        .attr('rx', config.width / 2)
        .attr('ry', config.height / 2);
      break;

    case 'custom':
      if (config.customPath) {
        clipPath.append('path').attr('d', config.customPath);
      }
      break;

    case 'rect':
    default:
      const rect = clipPath.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', config.width)
        .attr('height', config.height);
      
      if (config.rx) rect.attr('rx', config.rx);
      if (config.ry) rect.attr('ry', config.ry);
      break;
  }

  return `url(#${config.id})`;
}

/**
 * 創建陰影效果濾鏡
 * @param svg SVG 元素選擇器
 * @param config 陰影效果配置
 * @returns 濾鏡的 ID，用於 filter 屬性
 */
export function createDropShadow(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  config: DropShadowConfig = { id: 'drop-shadow' }
): string {
  // 確保 defs 元素存在
  let defs = svg.select('defs') as d3.Selection<any, unknown, null, undefined>;
  if (defs.empty()) {
    defs = svg.append('defs') as d3.Selection<any, unknown, null, undefined>;
  }

  // 移除現有的同名濾鏡
  defs.select(`#${config.id}`).remove();

  // 創建濾鏡
  const filter = defs.append('filter')
    .attr('id', config.id)
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');

  // 創建高斯模糊
  filter.append('feGaussianBlur')
    .attr('in', 'SourceAlpha')
    .attr('stdDeviation', config.blur || 3)
    .attr('result', 'blur');

  // 設定偏移
  filter.append('feOffset')
    .attr('in', 'blur')
    .attr('dx', config.offsetX || 2)
    .attr('dy', config.offsetY || 2)
    .attr('result', 'offsetBlur');

  // 設定顏色
  const floodColor = filter.append('feFlood')
    .attr('flood-color', config.color || '#000000')
    .attr('result', 'floodColor');

  if (config.opacity !== undefined) {
    floodColor.attr('flood-opacity', config.opacity);
  }

  // 合成陰影
  filter.append('feComposite')
    .attr('in', 'floodColor')
    .attr('in2', 'offsetBlur')
    .attr('operator', 'in')
    .attr('result', 'shadow');

  // 合併原圖和陰影
  filter.append('feMerge')
    .selectAll('feMergeNode')
    .data(['shadow', 'SourceGraphic'])
    .enter()
    .append('feMergeNode')
    .attr('in', d => d);

  return `url(#${config.id})`;
}

/**
 * 創建光暈效果濾鏡
 * @param svg SVG 元素選擇器
 * @param config 光暈效果配置
 * @returns 濾鏡的 ID，用於 filter 屬性
 */
export function createGlowEffect(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  config: GlowConfig = { id: 'glow' }
): string {
  // 確保 defs 元素存在
  let defs = svg.select('defs') as d3.Selection<any, unknown, null, undefined>;
  if (defs.empty()) {
    defs = svg.append('defs') as d3.Selection<any, unknown, null, undefined>;
  }

  // 移除現有的同名濾鏡
  defs.select(`#${config.id}`).remove();

  // 創建濾鏡
  const filter = defs.append('filter')
    .attr('id', config.id)
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');

  // 創建高斯模糊
  filter.append('feGaussianBlur')
    .attr('stdDeviation', config.blur || 4)
    .attr('result', 'coloredBlur');

  // 設定光暈顏色
  const floodColor = filter.append('feFlood')
    .attr('flood-color', config.color || '#ffffff')
    .attr('result', 'glowColor');

  if (config.opacity !== undefined) {
    floodColor.attr('flood-opacity', config.opacity);
  }

  // 合成光暈
  filter.append('feComposite')
    .attr('in', 'glowColor')
    .attr('in2', 'coloredBlur')
    .attr('operator', 'in')
    .attr('result', 'glow');

  // 如果有強度設定，進行多次合併增強效果
  const intensity = config.intensity || 1;
  if (intensity > 1) {
    const merge = filter.append('feMerge');
    for (let i = 0; i < intensity; i++) {
      merge.append('feMergeNode').attr('in', 'glow');
    }
    merge.append('feMergeNode').attr('in', 'SourceGraphic');
  } else {
    // 合併原圖和光暈
    filter.append('feMerge')
      .selectAll('feMergeNode')
      .data(['glow', 'SourceGraphic'])
      .enter()
      .append('feMergeNode')
      .attr('in', d => d);
  }

  return `url(#${config.id})`;
}

/**
 * 創建漸層
 * @param svg SVG 元素選擇器
 * @param config 漸層配置
 * @returns 漸層的 ID，用於 fill 或 stroke 屬性
 */
export function createGradient(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  config: GradientConfig
): string {
  // 確保 defs 元素存在
  let defs = svg.select('defs') as d3.Selection<any, unknown, null, undefined>;
  if (defs.empty()) {
    defs = svg.append('defs') as d3.Selection<any, unknown, null, undefined>;
  }

  // 移除現有的同名漸層
  defs.select(`#${config.id}`).remove();

  let gradient: d3.Selection<any, unknown, null, undefined>;

  if (config.type === 'radial') {
    gradient = defs.append('radialGradient').attr('id', config.id) as d3.Selection<any, unknown, null, undefined>;

    if (config.cx) gradient.attr('cx', config.cx);
    if (config.cy) gradient.attr('cy', config.cy);
    if (config.r) gradient.attr('r', config.r);
    if (config.fx) gradient.attr('fx', config.fx);
    if (config.fy) gradient.attr('fy', config.fy);
  } else {
    gradient = defs.append('linearGradient').attr('id', config.id) as d3.Selection<any, unknown, null, undefined>;

    if (config.x1) gradient.attr('x1', config.x1);
    if (config.y1) gradient.attr('y1', config.y1);
    if (config.x2) gradient.attr('x2', config.x2);
    if (config.y2) gradient.attr('y2', config.y2);
  }

  // 添加漸層停止點
  gradient.selectAll('stop')
    .data(config.stops)
    .enter()
    .append('stop')
    .attr('offset', d => d.offset)
    .attr('stop-color', d => d.color)
    .attr('stop-opacity', d => d.opacity !== undefined ? d.opacity : 1);

  return `url(#${config.id})`;
}

/**
 * 創建圖案填充
 * @param svg SVG 元素選擇器
 * @param id 圖案 ID
 * @param patternData 圖案數據
 * @param width 圖案寬度
 * @param height 圖案高度
 * @returns 圖案的 ID，用於 fill 屬性
 */
export function createPattern(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  id: string,
  patternData: { type: 'dots' | 'lines' | 'crosshatch' | 'custom'; color?: string; spacing?: number; strokeWidth?: number; customPath?: string },
  width: number = 10,
  height: number = 10
): string {
  // 確保 defs 元素存在
  let defs = svg.select('defs') as d3.Selection<any, unknown, null, undefined>;
  if (defs.empty()) {
    defs = svg.append('defs') as d3.Selection<any, unknown, null, undefined>;
  }

  // 移除現有的同名圖案
  defs.select(`#${id}`).remove();

  // 創建圖案
  const pattern = defs.append('pattern')
    .attr('id', id)
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', width)
    .attr('height', height);

  const color = patternData.color || '#000000';
  // const _spacing = patternData.spacing || 5;
  const strokeWidth = patternData.strokeWidth || 1;

  switch (patternData.type) {
    case 'dots':
      pattern.append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', Math.min(width, height) / 4)
        .attr('fill', color);
      break;

    case 'lines':
      pattern.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', width)
        .attr('y2', height)
        .attr('stroke', color)
        .attr('stroke-width', strokeWidth);
      break;

    case 'crosshatch':
      pattern.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', width)
        .attr('y2', height)
        .attr('stroke', color)
        .attr('stroke-width', strokeWidth);
      
      pattern.append('line')
        .attr('x1', width)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', height)
        .attr('stroke', color)
        .attr('stroke-width', strokeWidth);
      break;

    case 'custom':
      if (patternData.customPath) {
        pattern.append('path')
          .attr('d', patternData.customPath)
          .attr('fill', color);
      }
      break;
  }

  return `url(#${id})`;
}

/**
 * 應用視覺效果到元素
 * @param selection D3 選擇器
 * @param effects 效果配置
 */
export function applyVisualEffects(
  selection: d3.Selection<any, any, any, any>,
  effects: {
    clipPath?: string;
    filter?: string;
    opacity?: number;
    transform?: string;
  }
): d3.Selection<any, any, any, any> {
  if (effects.clipPath) {
    selection.attr('clip-path', effects.clipPath);
  }
  
  if (effects.filter) {
    selection.attr('filter', effects.filter);
  }
  
  if (effects.opacity !== undefined) {
    selection.attr('opacity', effects.opacity);
  }
  
  if (effects.transform) {
    selection.attr('transform', effects.transform);
  }

  return selection;
}

/**
 * 便利函數：創建常用的圖表剪裁路徑
 */
export function createChartClipPath(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  chartDimensions: { width: number; height: number }
): string {
  return createClipPath(svg, {
    id: 'chart-clip',
    width: chartDimensions.width,
    height: chartDimensions.height,
    shape: 'rect'
  });
}

/**
 * 便利函數：創建標準陰影效果
 */
export function createStandardDropShadow(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
): string {
  return createDropShadow(svg, {
    id: 'standard-shadow',
    blur: 3,
    offsetX: 2,
    offsetY: 2,
    color: '#000000',
    opacity: 0.3
  });
}

/**
 * 便利函數：創建標準光暈效果
 */
export function createStandardGlow(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  color: string = '#ffffff'
): string {
  return createGlowEffect(svg, {
    id: 'standard-glow',
    blur: 4,
    color: color,
    opacity: 0.8,
    intensity: 2
  });
}