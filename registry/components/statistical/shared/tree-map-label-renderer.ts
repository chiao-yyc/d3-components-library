import * as d3 from 'd3';
import { TreeMapNode } from '../tree-map/types';

export interface LabelRenderOptions {
  showName?: boolean;
  showValue?: boolean;
  nameProperty?: string;
  valueProperty?: string;
  fontSize?: number | string | ((d: TreeMapNode) => number | string);
  fontFamily?: string;
  fontWeight?: string | number;
  fill?: string | ((d: TreeMapNode) => string);
  textAnchor?: 'start' | 'middle' | 'end';
  dominantBaseline?: 'auto' | 'middle' | 'hanging' | 'central';
  className?: string | ((d: TreeMapNode) => string);
  padding?: number;
  minNodeSize?: { width: number; height: number; area?: number };
  maxTextLength?: number;
  ellipsis?: string;
}

export interface HierarchicalLabelOptions extends LabelRenderOptions {
  maxDepth?: number;
  depthColors?: string[];
  depthFontSizes?: number[];
  showParentLabels?: boolean;
  parentLabelOffset?: number;
}

export interface ValueDisplayOptions {
  format?: (value: number) => string;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
  useThousandsSeparator?: boolean;
  position?: 'top' | 'bottom' | 'center' | 'below-name';
  style?: {
    fontSize?: number | string;
    fontWeight?: string | number;
    fill?: string;
    opacity?: number;
  };
}

export interface TooltipOptions {
  show?: boolean;
  content?: (d: TreeMapNode) => string;
  className?: string;
  offsetX?: number;
  offsetY?: number;
  delay?: number;
  hideDelay?: number;
}

export interface LabelFitCalculation {
  canFitName: boolean;
  canFitValue: boolean;
  maxNameLength: number;
  maxValueLength: number;
  recommendedFontSize: number;
}

/**
 * TreeMapLabelRenderer - TreeMap 標籤層級渲染器
 * 提供多層級標籤渲染、智能文字適配和數值顯示功能
 */
export class TreeMapLabelRenderer {
  private static readonly DEFAULT_FONT_SIZE = 12;
  private static readonly MIN_FONT_SIZE = 8;
  private static readonly CHAR_WIDTH_RATIO = 0.6; // 字符寬度與字體大小的估算比例

  /**
   * 渲染基本標籤
   * @param container SVG 容器
   * @param nodes TreeMap 節點陣列
   * @param options 標籤渲染選項
   * @returns 創建的文字元素選擇集
   */
  static renderLabels(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    nodes: TreeMapNode[],
    options: LabelRenderOptions = {}
  ): d3.Selection<SVGTextElement, TreeMapNode, SVGGElement, unknown> {
    const {
      showName = true,
      showValue = false,
      nameProperty = 'name',
      valueProperty = 'value',
      fontSize = this.DEFAULT_FONT_SIZE,
      fontFamily = 'Arial, sans-serif',
      fontWeight = 'normal',
      fill = '#333333',
      textAnchor = 'middle',
      dominantBaseline = 'central',
      className = 'treemap-label',
      // padding = 4,
      minNodeSize = { width: 30, height: 20, area: 500 },
      maxTextLength = 20,
      ellipsis = '...'
    } = options;

    // 過濾適合顯示標籤的節點
    const visibleNodes = this.filterVisibleNodes(nodes, minNodeSize);

    const labels = container
      .selectAll<SVGTextElement, TreeMapNode>('.treemap-label')
      .data(visibleNodes, (d: TreeMapNode) => d.data.id || d.data.name || Math.random().toString());

    const enter = labels
      .enter()
      .append('text')
      .attr('class', typeof className === 'function' ? className : () => className)
      .attr('x', d => (d.x0 + d.x1) / 2)
      .attr('y', d => (d.y0 + d.y1) / 2)
      .attr('text-anchor', textAnchor)
      .attr('dominant-baseline', dominantBaseline)
      .attr('font-family', fontFamily)
      .attr('font-weight', fontWeight)
      .attr('font-size', typeof fontSize === 'function' ? fontSize : () => fontSize)
      .attr('fill', typeof fill === 'function' ? fill : () => fill)
      .style('pointer-events', 'none')
      .text(d => this.generateLabelText(d, {
        showName,
        showValue,
        nameProperty,
        valueProperty,
        maxTextLength,
        ellipsis
      }));

    labels
      .transition()
      .duration(300)
      .attr('x', d => (d.x0 + d.x1) / 2)
      .attr('y', d => (d.y0 + d.y1) / 2)
      .attr('font-size', typeof fontSize === 'function' ? fontSize : () => fontSize)
      .attr('fill', typeof fill === 'function' ? fill : () => fill)
      .text(d => this.generateLabelText(d, {
        showName,
        showValue,
        nameProperty,
        valueProperty,
        maxTextLength,
        ellipsis
      }));

    labels.exit().remove();

    return enter.merge(labels);
  }

  /**
   * 渲染階層式標籤
   * @param container SVG 容器
   * @param nodes TreeMap 節點陣列
   * @param depth 當前渲染深度
   * @param options 階層標籤選項
   */
  static renderHierarchicalLabels(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    nodes: TreeMapNode[],
    depth: number,
    options: HierarchicalLabelOptions = {}
  ): void {
    const {
      maxDepth = 3,
      depthColors = ['#000000', '#333333', '#666666'],
      depthFontSizes = [16, 14, 12],
      showParentLabels = true,
      parentLabelOffset = 15,
      ...baseOptions
    } = options;

    if (depth > maxDepth) return;

    // 過濾當前深度的節點
    const currentDepthNodes = nodes.filter(d => d.depth === depth);
    
    if (currentDepthNodes.length === 0) return;

    // 設置深度相關的樣式
    const depthOptions: LabelRenderOptions = {
      ...baseOptions,
      fill: depthColors[depth] || depthColors[depthColors.length - 1],
      fontSize: depthFontSizes[depth] || depthFontSizes[depthFontSizes.length - 1],
      className: `treemap-label-depth-${depth}`
    };

    // 調整父級標籤位置
    if (depth > 0 && showParentLabels) {
      depthOptions.padding = (baseOptions.padding || 4) + parentLabelOffset * depth;
    }

    this.renderLabels(container, currentDepthNodes, depthOptions);

    // 遞迴渲染子層級
    if (depth < maxDepth) {
      this.renderHierarchicalLabels(container, nodes, depth + 1, options);
    }
  }

  /**
   * 計算標籤適合度
   * @param node TreeMap 節點
   * @param text 要顯示的文字
   * @param fontSize 字體大小
   * @returns 適合度計算結果
   */
  static calculateLabelFit(
    node: TreeMapNode,
    text: string,
    fontSize: number
  ): LabelFitCalculation {
    const nodeWidth = node.x1 - node.x0;
    const nodeHeight = node.y1 - node.y0;
    const charWidth = fontSize * this.CHAR_WIDTH_RATIO;
    
    const maxCharsInWidth = Math.floor(nodeWidth / charWidth);
    const maxLinesInHeight = Math.floor(nodeHeight / fontSize);
    
    const lines = text.split('\n');
    const canFitName = lines.length <= maxLinesInHeight && 
                      lines.every(line => line.length <= maxCharsInWidth);
    
    // 計算推薦字體大小
    const recommendedFontSize = Math.min(
      fontSize,
      Math.max(this.MIN_FONT_SIZE, Math.floor(nodeWidth / (text.length * this.CHAR_WIDTH_RATIO))),
      Math.max(this.MIN_FONT_SIZE, nodeHeight / lines.length)
    );

    return {
      canFitName,
      canFitValue: canFitName, // 簡化處理
      maxNameLength: maxCharsInWidth,
      maxValueLength: maxCharsInWidth,
      recommendedFontSize
    };
  }

  /**
   * 截斷標籤文字
   * @param nodes TreeMap 節點陣列
   * @param maxLength 最大長度
   * @param strategy 截斷策略
   */
  static truncateLabels(
    nodes: TreeMapNode[],
    maxLength: number,
    strategy: 'ellipsis' | 'word-break' | 'char-break' = 'ellipsis'
  ): Map<TreeMapNode, string> {
    const truncatedTexts = new Map<TreeMapNode, string>();

    nodes.forEach(node => {
      const originalText = node.data.name || node.data.id || '';
      let truncatedText = originalText;

      if (originalText.length > maxLength) {
        switch (strategy) {
          case 'ellipsis':
            truncatedText = originalText.substring(0, maxLength - 3) + '...';
            break;
          case 'word-break':
            const words = originalText.split(' ');
            truncatedText = '';
            for (const word of words) {
              if ((truncatedText + word).length <= maxLength) {
                truncatedText += (truncatedText ? ' ' : '') + word;
              } else {
                break;
              }
            }
            break;
          case 'char-break':
            truncatedText = originalText.substring(0, maxLength);
            break;
        }
      }

      truncatedTexts.set(node, truncatedText);
    });

    return truncatedTexts;
  }

  /**
   * 定位標籤
   * @param container SVG 容器
   * @param nodes TreeMap 節點陣列
   * @param alignment 對齊方式
   */
  static positionLabels(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    _nodes: TreeMapNode[],
    alignment: 'center' | 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' = 'center'
  ): void {
    const getPosition = (node: TreeMapNode) => {
      const { x0, y0, x1, y1 } = node;
      const centerX = (x0 + x1) / 2;
      const centerY = (y0 + y1) / 2;

      switch (alignment) {
        case 'top-left':
          return { x: x0 + 5, y: y0 + 15, anchor: 'start', baseline: 'hanging' };
        case 'top-center':
          return { x: centerX, y: y0 + 15, anchor: 'middle', baseline: 'hanging' };
        case 'top-right':
          return { x: x1 - 5, y: y0 + 15, anchor: 'end', baseline: 'hanging' };
        case 'bottom-left':
          return { x: x0 + 5, y: y1 - 5, anchor: 'start', baseline: 'baseline' };
        case 'bottom-center':
          return { x: centerX, y: y1 - 5, anchor: 'middle', baseline: 'baseline' };
        case 'bottom-right':
          return { x: x1 - 5, y: y1 - 5, anchor: 'end', baseline: 'baseline' };
        case 'center':
        default:
          return { x: centerX, y: centerY, anchor: 'middle', baseline: 'central' };
      }
    };

    container
      .selectAll<SVGTextElement, TreeMapNode>('.treemap-label')
      .attr('x', d => getPosition(d).x)
      .attr('y', d => getPosition(d).y)
      .attr('text-anchor', d => getPosition(d).anchor)
      .attr('dominant-baseline', d => getPosition(d).baseline);
  }

  /**
   * 渲染數值
   * @param container SVG 容器
   * @param nodes TreeMap 節點陣列
   * @param options 數值顯示選項
   */
  static renderValues(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    nodes: TreeMapNode[],
    options: ValueDisplayOptions = {}
  ): void {
    const {
      format = d3.format(','),
      prefix = '',
      suffix = '',
      position = 'below-name',
      style = {}
    } = options;

    container
      .selectAll<SVGTextElement, TreeMapNode>('.treemap-value')
      .data(nodes.filter(d => d.value !== undefined))
      .enter()
      .append('text')
      .attr('class', 'treemap-value')
      .attr('x', d => (d.x0 + d.x1) / 2)
      .attr('y', d => {
        const centerY = (d.y0 + d.y1) / 2;
        switch (position) {
          case 'top': return d.y0 + 15;
          case 'bottom': return d.y1 - 5;
          case 'below-name': return centerY + 15;
          case 'center':
          default: return centerY;
        }
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', position === 'top' ? 'hanging' : position === 'bottom' ? 'baseline' : 'central')
      .attr('font-size', style.fontSize || 10)
      .attr('font-weight', style.fontWeight || 'normal')
      .attr('fill', style.fill || '#666666')
      .attr('opacity', style.opacity || 1)
      .text(d => `${prefix}${format(d.value!)}${suffix}`);
  }

  /**
   * 渲染工具提示
   * @param container SVG 容器
   * @param nodes TreeMap 節點陣列
   * @param options 工具提示選項
   */
  static renderTooltips(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    _nodes: TreeMapNode[],
    options: TooltipOptions = {}
  ): void {
    const {
      show = true,
      content = (d: TreeMapNode) => `${d.data.name || d.data.id}: ${d.value}`,
      className = 'treemap-tooltip',
      offsetX = 10,
      offsetY = -10,
      // delay = 500,
      // hideDelay = 200
    } = options;

    if (!show) return;

    // 創建工具提示容器
    const tooltip = d3.select('body')
      .selectAll(`.${className}`)
      .data([null])
      .enter()
      .append('div')
      .attr('class', className)
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    // 為矩形添加事件監聽
    container
      .selectAll<SVGRectElement, TreeMapNode>('.treemap-rect')
      .on('mouseover', function(_event, d) {
        tooltip
          .style('visibility', 'visible')
          .html(content(d));
      })
      .on('mousemove', function(event) {
        // 使用相對於視窗的座標而非頁面座標
        tooltip
          .style('left', (event.clientX + offsetX) + 'px')
          .style('top', (event.clientY + offsetY) + 'px');
      })
      .on('mouseout', function() {
        tooltip.style('visibility', 'hidden');
      });
  }

  /**
   * 生成標籤文字
   */
  private static generateLabelText(
    node: TreeMapNode,
    options: {
      showName: boolean;
      showValue: boolean;
      nameProperty: string;
      valueProperty: string;
      maxTextLength: number;
      ellipsis: string;
    }
  ): string {
    const parts: string[] = [];

    if (options.showName) {
      let name = node.data[options.nameProperty] || node.data.id || '';
      if (name.length > options.maxTextLength) {
        name = name.substring(0, options.maxTextLength - options.ellipsis.length) + options.ellipsis;
      }
      if (name) parts.push(name);
    }

    if (options.showValue && node.value !== undefined) {
      const value = d3.format(',')(node.value);
      parts.push(value);
    }

    return parts.join('\n');
  }

  /**
   * 過濾可見節點
   */
  private static filterVisibleNodes(
    nodes: TreeMapNode[],
    minNodeSize: { width: number; height: number; area?: number }
  ): TreeMapNode[] {
    return nodes.filter(node => {
      const width = node.x1 - node.x0;
      const height = node.y1 - node.y0;
      const area = width * height;

      return width >= minNodeSize.width &&
             height >= minNodeSize.height &&
             (minNodeSize.area === undefined || area >= minNodeSize.area);
    });
  }
}