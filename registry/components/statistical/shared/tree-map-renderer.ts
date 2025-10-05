import * as d3 from 'd3';
import { applyEnterAnimation, applyUpdateAnimation, AnimationConfig } from '../../core/base-chart/chart-utils';

// Use local interface to avoid circular dependencies
interface TreeMapNode extends d3.HierarchyRectangularNode<any> {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  depth: number;
  parent: TreeMapNode | null;
  children?: TreeMapNode[];
  data: any;
  value?: number;
}

export interface RectangleRenderOptions {
  fill?: string | ((d: TreeMapNode) => string);
  stroke?: string | ((d: TreeMapNode) => string);
  strokeWidth?: number | ((d: TreeMapNode) => number);
  opacity?: number | ((d: TreeMapNode) => number);
  rx?: number; // 矩形圓角半徑
  ry?: number;
  className?: string | ((d: TreeMapNode) => string);
  animation?: AnimationConfig; // 使用 BaseChart 的動畫配置
}

export interface BorderRenderOptions {
  color?: string;
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  opacity?: number;
  hierarchyLevel?: number; // 只顯示特定層級的邊框
}

export interface ColorMappingOptions {
  strategy: 'depth' | 'parent' | 'value' | 'custom';
  colorScale: d3.ScaleOrdinal<string, string> | d3.ScaleSequential<string>;
  depthLevel?: number;
  customMapper?: (d: TreeMapNode) => string;
  fallbackColor?: string;
}

export interface GradientOptions {
  type: 'linear' | 'radial';
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  stops: Array<{
    offset: string;
    color: string;
    opacity?: number;
  }>;
  id?: string;
}

export interface AnimationOptions {
  duration?: number;
  delay?: (d: TreeMapNode, i: number) => number;
  ease?: (t: number) => number;
  onStart?: (d: TreeMapNode) => void;
  onEnd?: (d: TreeMapNode) => void;
}

export interface ZoomAnimationOptions extends AnimationOptions {
  scale?: number;
  translateX?: number;
  translateY?: number;
}

/**
 * TreeMapRenderer - TreeMap 矩形渲染器
 * 負責渲染 TreeMap 的矩形、邊框、顏色和動畫效果
 */
export class TreeMapRenderer {
  /**
   * 渲染矩形
   * @param container SVG 容器
   * @param nodes TreeMap 節點陣列
   * @param options 渲染選項
   * @returns 創建的矩形元素選擇集
   */
  static renderRectangles(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    _nodes: TreeMapNode[],
    options: RectangleRenderOptions = {}
  ): d3.Selection<SVGRectElement, TreeMapNode, SVGGElement, unknown> {
    const {
      fill = '#69b3a2',
      stroke = '#ffffff',
      strokeWidth = 1,
      opacity = 0.8,
      rx = 0,
      ry = 0,
      className = 'treemap-rect',
      animation
    } = options;

    const rectangles = container
      .selectAll<SVGRectElement, TreeMapNode>('.treemap-rect')
      .data(_nodes, (d: TreeMapNode) => d.data.id || d.data.name || Math.random().toString());

    const enter = rectangles
      .enter()
      .append('rect')
      .attr('class', typeof className === 'function' ? className : () => className)
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => Math.max(0, d.x1 - d.x0))
      .attr('height', d => Math.max(0, d.y1 - d.y0))
      .attr('rx', rx)
      .attr('ry', ry)
      .attr('fill', typeof fill === 'function' ? fill : () => fill)
      .attr('stroke', typeof stroke === 'function' ? stroke : () => stroke)
      .attr('stroke-width', typeof strokeWidth === 'function' ? strokeWidth : () => strokeWidth)
      .attr('opacity', typeof opacity === 'function' ? opacity : () => opacity);

    // 使用 BaseChart 的動畫工具
    if (animation && animation.enabled) {
      applyEnterAnimation(enter, animation);
    }

    // 更新現有元素，使用 BaseChart 的動畫工具
    let updateSelection = rectangles;
    if (animation && animation.enabled) {
      updateSelection = applyUpdateAnimation(rectangles, animation) as any;
    } else {
      updateSelection = rectangles.transition().duration(300);
    }
    
    updateSelection
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => Math.max(0, d.x1 - d.x0))
      .attr('height', d => Math.max(0, d.y1 - d.y0))
      .attr('fill', typeof fill === 'function' ? fill : () => fill)
      .attr('stroke', typeof stroke === 'function' ? stroke : () => stroke)
      .attr('stroke-width', typeof strokeWidth === 'function' ? strokeWidth : () => strokeWidth)
      .attr('opacity', typeof opacity === 'function' ? opacity : () => opacity);

    rectangles.exit().remove();

    return enter.merge(rectangles);
  }

  /**
   * 渲染邊框
   * @param container SVG 容器
   * @param _nodes TreeMap 節點陣列
   * @param options 邊框選項
   */
  static renderBorders(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    _nodes: TreeMapNode[],
    options: BorderRenderOptions = {}
  ): void {
    const {
      color = '#333333',
      width = 1,
      style = 'solid',
      opacity = 1,
      hierarchyLevel
    } = options;

    // 過濾特定層級的節點
    const filteredNodes = hierarchyLevel !== undefined
      ? _nodes.filter(d => d.depth === hierarchyLevel)
      : _nodes;

    container
      .selectAll('.treemap-border')
      .data(filteredNodes)
      .enter()
      .append('rect')
      .attr('class', 'treemap-border')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', width)
      .attr('stroke-dasharray', style === 'dashed' ? '5,5' : style === 'dotted' ? '2,2' : 'none')
      .attr('opacity', opacity);
  }

  /**
   * 應用顏色映射
   * @param container SVG 容器
   * @param _nodes TreeMap 節點陣列 (used via closure in colorMapper)
   * @param options 顏色映射選項
   */
  static applyColorMapping(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    _nodes: TreeMapNode[],
    options: ColorMappingOptions
  ): void {
    const {
      strategy,
      colorScale,
      depthLevel = 1,
      customMapper,
      fallbackColor = '#cccccc'
    } = options;

    const colorMapper = (d: TreeMapNode): string => {
      switch (strategy) {
        case 'depth':
          return this.getColorByDepth(d, colorScale as d3.ScaleOrdinal<string, string>, depthLevel);
        case 'parent':
          return this.getColorByParent(d, colorScale as d3.ScaleOrdinal<string, string>);
        case 'value':
          return this.getColorByValue(d, colorScale as d3.ScaleSequential<string>);
        case 'custom':
          return customMapper ? customMapper(d) : fallbackColor;
        default:
          return fallbackColor;
      }
    };

    container
      .selectAll<SVGRectElement, TreeMapNode>('.treemap-rect')
      .attr('fill', colorMapper);
  }

  /**
   * 渲染漸層效果
   * @param container SVG 容器
   * @param _nodes TreeMap 節點陣列 (reserved for future use)
   * @param options 漸層選項
   */
  static renderGradients(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    _nodes: TreeMapNode[],
    options: GradientOptions
  ): void {
    const {
      type,
      direction = 'vertical',
      stops,
      id = `treemap-gradient-${Math.random().toString(36).substr(2, 9)}`
    } = options;

    // 創建 defs 元素用於定義漸層
    const defs = container.select('defs').empty() 
      ? container.append('defs')
      : container.select('defs');

    // 創建漸層定義
    const gradient = defs
      .append(type === 'linear' ? 'linearGradient' : 'radialGradient')
      .attr('id', id);

    if (type === 'linear') {
      switch (direction) {
        case 'horizontal':
          gradient.attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%');
          break;
        case 'diagonal':
          gradient.attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
          break;
        case 'vertical':
        default:
          gradient.attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
          break;
      }
    }

    // 添加漸層停止點
    gradient
      .selectAll('stop')
      .data(stops)
      .enter()
      .append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color)
      .attr('stop-opacity', d => d.opacity || 1);

    // 應用漸層到矩形
    container
      .selectAll<SVGRectElement, TreeMapNode>('.treemap-rect')
      .attr('fill', `url(#${id})`);
  }

  /**
   * TreeMap 動畫效果
   * @param container SVG 容器
   * @param _fromNodes 起始節點 (reserved for future use)
   * @param toNodes 目標節點
   * @param options 動畫選項
   */
  static animateTreeMap(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    _fromNodes: TreeMapNode[],
    toNodes: TreeMapNode[],
    options: AnimationOptions = {}
  ): void {
    const {
      duration = 750,
      delay = () => 0,
      ease = d3.easeCubicInOut,
      onStart,
      onEnd
    } = options;

    const rectangles = container
      .selectAll<SVGRectElement, TreeMapNode>('.treemap-rect')
      .data(toNodes, (d: TreeMapNode) => d.data.id || d.data.name || Math.random().toString());

    const transition = d3.transition()
      .duration(duration)
      .ease(ease);

    rectangles
      .transition(transition)
      .delay(delay)
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .on('start', onStart as any)
      .on('end', onEnd as any);
  }

  /**
   * 縮放動畫
   * @param container SVG 容器
   * @param targetNode 目標節點（用於縮放焦點）
   * @param options 縮放動畫選項
   */
  static animateZoom(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    targetNode: TreeMapNode,
    options: ZoomAnimationOptions = {}
  ): void {
    const {
      duration = 750,
      ease = d3.easeCubicInOut,
      scale = 2,
      translateX = 0,
      translateY = 0
    } = options;

    const centerX = (targetNode.x0 + targetNode.x1) / 2;
    const centerY = (targetNode.y0 + targetNode.y1) / 2;

    container
      .transition()
      .duration(duration)
      .ease(ease)
      .attr('transform', `translate(${translateX - centerX * (scale - 1)}, ${translateY - centerY * (scale - 1)}) scale(${scale})`);
  }

  /**
   * 根據深度獲取顏色
   */
  private static getColorByDepth(
    node: TreeMapNode,
    colorScale: d3.ScaleOrdinal<string, string>,
    depthLevel: number
  ): string {
    let currentNode = node;
    while (currentNode.depth > depthLevel && currentNode.parent) {
      currentNode = currentNode.parent;
    }
    const colorKey = currentNode.data.id || currentNode.data.name || currentNode.data;
    return colorScale(colorKey);
  }

  /**
   * 根據父節點獲取顏色
   */
  private static getColorByParent(
    node: TreeMapNode,
    colorScale: d3.ScaleOrdinal<string, string>
  ): string {
    const parentNode = node.parent;
    if (!parentNode) return colorScale('root');
    const colorKey = parentNode.data.id || parentNode.data.name || parentNode.data;
    return colorScale(colorKey);
  }

  /**
   * 根據數值獲取顏色
   */
  private static getColorByValue(
    node: TreeMapNode,
    colorScale: d3.ScaleSequential<string>
  ): string {
    return colorScale(node.value || 0);
  }
}