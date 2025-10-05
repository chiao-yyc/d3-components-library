import * as d3 from 'd3';
import { DataFinder } from '../data-processor/data-finder';

/**
 * 筆刷縮放配置介面
 */
export interface BrushZoomConfig {
  enabled?: boolean;
  direction?: 'x' | 'y' | 'xy';
  resetOnDoubleClick?: boolean;
  idleTimeout?: number;
  extent?: [[number, number], [number, number]];
  brushColor?: string;
  brushOpacity?: number;
  onZoom?: (domain: [unknown, unknown]) => void;
  onReset?: () => void;
}

/**
 * 增強版筆刷縮放配置介面
 */
export interface EnhancedBrushZoomConfig extends BrushZoomConfig {
  clipPath?: {
    enabled: boolean;
    targetSelector?: string; // 指定要剪裁的元素選擇器
    excludeSelector?: string; // 排除不被剪裁的元素選擇器
    autoApply?: boolean; // 自動應用到圖表內容元素
  };
  boundaryProtection?: {
    enabled: boolean;
    padding?: number; // 邊界保護間距
  };
  axisUpdate?: {
    enabled: boolean;
    updateSelectors?: string[]; // 需要更新的軸線選擇器
    animationDuration?: number;
  };
}

/**
 * 十字游標配置介面
 */
export interface CrosshairConfig {
  enabled?: boolean;
  showCircle?: boolean;
  showText?: boolean;
  showLines?: boolean;
  circleRadius?: number;
  circleColor?: string;
  lineColor?: string;
  lineWidth?: number;
  lineOpacity?: number;
  textOffset?: { x: number; y: number };
  textColor?: string;
  textSize?: string;
  formatText?: (data: unknown) => string;
}

/**
 * 增強版筆刷縮放控制器類
 */
export class EnhancedBrushZoomController {
  private brush: d3.BrushBehavior<unknown> | null = null;
  private brushGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private scales: { xScale: any; yScale: any };
  private config: EnhancedBrushZoomConfig;
  private idleTimeoutId: number | null = null;
  private originalDomain: { x: [any, any]; y: [any, any] };
  private container: d3.Selection<SVGGElement, unknown, null, undefined>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;

  constructor(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    scales: { xScale: any; yScale: any },
    config: EnhancedBrushZoomConfig,
    svg?: d3.Selection<SVGSVGElement, unknown, null, undefined>
  ) {
    this.container = container;
    this.scales = scales;
    this.config = config;
    this.svg = svg || null;
    this.originalDomain = {
      x: [...scales.xScale.domain()] as [any, any],
      y: [...scales.yScale.domain()] as [any, any]
    };
  }

  /**
   * 創建增強版筆刷縮放功能
   */
  create(chartDimensions: { width: number; height: number }): EnhancedBrushZoomController {
    if (!this.config.enabled) return this;

    const { width, height } = chartDimensions;
    const extent = this.config.extent || [[0, 0], [width, height]];

    // 根據方向選擇筆刷類型
    switch (this.config.direction) {
      case 'x':
        this.brush = d3.brushX().extent(extent);
        break;
      case 'y':
        this.brush = d3.brushY().extent(extent);
        break;
      case 'xy':
      default:
        this.brush = d3.brush().extent(extent);
        break;
    }

    // 設定筆刷事件處理
    this.brush.on('end', this.handleBrushEnd.bind(this));

    // 創建筆刷組
    this.brushGroup = this.container.append('g')
      .attr('class', 'brush-zoom-enhanced')
      .call(this.brush);

    // 自定義筆刷樣式
    if (this.config.brushColor) {
      this.brushGroup.selectAll('.selection')
        .attr('fill', this.config.brushColor)
        .attr('fill-opacity', this.config.brushOpacity || 0.3);
    }

    // 設置雙擊重置
    if (this.config.resetOnDoubleClick !== false) {
      this.container.on('dblclick', this.resetZoom.bind(this));
    }

    // 應用剪裁路徑
    this.applyClipPath(chartDimensions);

    return this;
  }

  /**
   * 應用智能剪裁路徑
   */
  private applyClipPath(chartDimensions: { width: number; height: number }): void {
    if (!this.config.clipPath?.enabled || !this.svg) return;

    // 創建剪裁路徑
    const clipPathId = this.createClipPath(chartDimensions);
    
    if (this.config.clipPath.autoApply) {
      // 自動應用到圖表內容元素
      const targetElements = this.container.selectAll(
        'path[class*="line-"], path[class*="area-"], circle[class*="dot-"], circle[class*="interact-"]'
      );
      targetElements.attr('clip-path', clipPathId);
    } else if (this.config.clipPath.targetSelector) {
      // 應用到指定元素
      const targetElements = this.container.selectAll(this.config.clipPath.targetSelector);
      targetElements.attr('clip-path', clipPathId);
    }

    // 確保排除的元素不被剪裁
    if (this.config.clipPath.excludeSelector) {
      const excludedElements = this.container.selectAll(this.config.clipPath.excludeSelector);
      excludedElements.attr('clip-path', null);
    }

    // 預設排除軸線元素
    const axisElements = this.container.selectAll('.bottom-axis, .left-axis, .top-axis, .right-axis, .x-axis, .y-axis, g[class*="axis"]');
    axisElements.attr('clip-path', null);
  }

  /**
   * 創建剪裁路徑
   */
  private createClipPath(chartDimensions: { width: number; height: number }): string {
    if (!this.svg) return '';

    const clipPathId = 'enhanced-chart-clip';
    
    // 確保 defs 元素存在
    let defs = this.svg.select('defs') as d3.Selection<any, unknown, null, undefined>;
    if (defs.empty()) {
      defs = this.svg.append('defs') as d3.Selection<any, unknown, null, undefined>;
    }

    // 移除現有的剪裁路徑
    defs.select(`#${clipPathId}`).remove();

    // 創建新的剪裁路徑
    const clipPath = defs.append('clipPath').attr('id', clipPathId);
    clipPath.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', chartDimensions.width)
      .attr('height', chartDimensions.height);

    return `url(#${clipPathId})`;
  }

  /**
   * 處理筆刷結束事件
   */
  private handleBrushEnd(event: any): void {
    const selection = event.selection;
    
    if (!selection) {
      if (!this.idleTimeoutId) {
        this.idleTimeoutId = window.setTimeout(() => {
          this.idleTimeoutId = null;
        }, this.config.idleTimeout || 350);
        return;
      }
      this.resetZoom();
    } else {
      this.performZoom(selection);
    }
  }

  /**
   * 執行縮放
   */
  private performZoom(selection: any): void {
    let newDomain: [any, any];

    if (this.config.direction === 'x') {
      const [x0, x1] = selection;
      newDomain = [this.scales.xScale.invert(x0), this.scales.xScale.invert(x1)];
      
      // 邊界保護
      if (this.config.boundaryProtection?.enabled) {
        newDomain = this.applyBoundaryProtection(newDomain, 'x');
      }
      
      this.scales.xScale.domain(newDomain);
    } else if (this.config.direction === 'y') {
      const [y0, y1] = selection;
      newDomain = [this.scales.yScale.invert(y1), this.scales.yScale.invert(y0)];
      
      if (this.config.boundaryProtection?.enabled) {
        newDomain = this.applyBoundaryProtection(newDomain, 'y');
      }
      
      this.scales.yScale.domain(newDomain);
    }

    // 更新軸線
    if (this.config.axisUpdate?.enabled) {
      this.updateAxes();
    }

    // 清除筆刷選擇
    if (this.brushGroup) {
      this.brushGroup.call(this.brush!.move, null);
    }

    // 觸發用戶回調
    if (this.config.onZoom && newDomain!) {
      this.config.onZoom(newDomain);
    }
  }

  /**
   * 應用邊界保護
   */
  private applyBoundaryProtection(domain: [any, any], axis: 'x' | 'y'): [any, any] {
    // const _padding = this.config.boundaryProtection?.padding || 2;
    const originalDomain = axis === 'x' ? this.originalDomain.x : this.originalDomain.y;
    
    // 確保縮放域值不超出原始範圍
    if (domain[0] < originalDomain[0]) {
      domain[0] = originalDomain[0];
    }
    if (domain[1] > originalDomain[1]) {
      domain[1] = originalDomain[1];
    }
    
    return domain;
  }

  /**
   * 更新軸線
   */
  private updateAxes(): void {
    const duration = this.config.axisUpdate?.animationDuration || 1000;
    const selectors = this.config.axisUpdate?.updateSelectors || ['.bottom-axis', '.left-axis'];
    
    selectors.forEach(selector => {
      const axisGroup = this.container.select(selector);
      if (!axisGroup.empty()) {
        if (selector.includes('bottom') || selector.includes('x')) {
          axisGroup.transition().duration(duration).call(d3.axisBottom(this.scales.xScale) as any);
        } else if (selector.includes('left') || selector.includes('y')) {
          axisGroup.transition().duration(duration).call(d3.axisLeft(this.scales.yScale) as any);
        }
      }
    });
  }

  /**
   * 重置縮放
   */
  resetZoom(): void {
    this.scales.xScale.domain(this.originalDomain.x);
    this.scales.yScale.domain(this.originalDomain.y);
    
    if (this.config.axisUpdate?.enabled) {
      this.updateAxes();
    }
    
    if (this.config.onReset) {
      this.config.onReset();
    }
  }

  /**
   * 銷毀控制器
   */
  destroy(): void {
    if (this.brushGroup) {
      this.brushGroup.remove();
      this.brushGroup = null;
    }
    if (this.idleTimeoutId) {
      clearTimeout(this.idleTimeoutId);
      this.idleTimeoutId = null;
    }
    this.container.on('dblclick', null);
  }
}

/**
 * 筆刷縮放控制器類
 */
export class BrushZoomController {
  private brush: d3.BrushBehavior<unknown> | null = null;
  private brushGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private scales: { xScale: any; yScale: any };
  private config: BrushZoomConfig;
  private idleTimeoutId: number | null = null;
  private originalDomain: { x: [any, any]; y: [any, any] };

  constructor(
    scales: { xScale: any; yScale: any },
    config: BrushZoomConfig
  ) {
    this.scales = scales;
    this.config = config;
    this.originalDomain = {
      x: [...scales.xScale.domain()] as [any, any],
      y: [...scales.yScale.domain()] as [any, any]
    };
  }

  /**
   * 創建筆刷縮放功能
   */
  create(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    chartDimensions: { width: number; height: number }
  ): BrushZoomController {
    if (!this.config.enabled) return this;

    const { width, height } = chartDimensions;
    const extent = this.config.extent || [[0, 0], [width, height]];

    // 根據方向選擇筆刷類型
    switch (this.config.direction) {
      case 'x':
        this.brush = d3.brushX().extent(extent);
        break;
      case 'y':
        this.brush = d3.brushY().extent(extent);
        break;
      case 'xy':
      default:
        this.brush = d3.brush().extent(extent);
        break;
    }

    // 設定筆刷事件處理
    this.brush.on('end', this.handleBrushEnd.bind(this));

    // 創建筆刷組
    this.brushGroup = container.append('g')
      .attr('class', 'brush-zoom')
      .attr('data-testid', 'brush-overlay')
      .call(this.brush);

    // 自定義筆刷樣式
    if (this.config.brushColor) {
      this.brushGroup.selectAll('.selection')
        .attr('fill', this.config.brushColor)
        .attr('fill-opacity', this.config.brushOpacity || 0.3);
    }

    // 雙擊重置功能
    if (this.config.resetOnDoubleClick) {
      container.on('dblclick', this.reset.bind(this));
    }

    return this;
  }

  /**
   * 處理筆刷結束事件
   */
  private handleBrushEnd(event: d3.D3BrushEvent<any>): void {
    const selection = event.selection;

    if (!selection) {
      // 沒有選擇區域時的閒置處理
      if (!this.idleTimeoutId) {
        this.idleTimeoutId = window.setTimeout(() => {
          this.idleTimeoutId = null;
        }, this.config.idleTimeout || 350);
        return;
      }
      // 重置到原始域
      this.reset();
    } else {
      // 有選擇區域時進行縮放
      this.zoomToSelection(selection);
      // 清除筆刷選擇
      if (this.brushGroup) {
        this.brushGroup.call(this.brush!.move, null);
      }
    }
  }

  /**
   * 縮放到選擇區域
   */
  private zoomToSelection(selection: any): void {
    let newDomain: [any, any];

    if (this.config.direction === 'x') {
      const [x0, x1] = selection;
      newDomain = [this.scales.xScale.invert(x0), this.scales.xScale.invert(x1)];
      this.scales.xScale.domain(newDomain);
    } else if (this.config.direction === 'y') {
      const [y0, y1] = selection;
      newDomain = [this.scales.yScale.invert(y1), this.scales.yScale.invert(y0)]; // Y軸反向
      this.scales.yScale.domain(newDomain);
    } else {
      // xy 方向
      const [[x0, y0], [x1, y1]] = selection;
      const xDomain: [any, any] = [this.scales.xScale.invert(x0), this.scales.xScale.invert(x1)];
      const yDomain: [any, any] = [this.scales.yScale.invert(y1), this.scales.yScale.invert(y0)];
      this.scales.xScale.domain(xDomain);
      this.scales.yScale.domain(yDomain);
      newDomain = xDomain; // 主要返回 X 軸域
    }

    // 觸發縮放回調
    if (this.config.onZoom) {
      this.config.onZoom(newDomain);
    }
  }

  /**
   * 重置縮放
   */
  reset(): void {
    this.scales.xScale.domain(this.originalDomain.x);
    this.scales.yScale.domain(this.originalDomain.y);

    if (this.config.onReset) {
      this.config.onReset();
    }
  }

  /**
   * 銷毀筆刷
   */
  destroy(): void {
    if (this.brushGroup) {
      this.brushGroup.remove();
      this.brushGroup = null;
    }
    if (this.idleTimeoutId) {
      clearTimeout(this.idleTimeoutId);
      this.idleTimeoutId = null;
    }
  }
}

/**
 * 十字游標控制器類
 */
export class CrosshairController {
  private config: CrosshairConfig;
  private dataFinder: DataFinder<any>;
  private scales: { xScale: any; yScale: any };
  private container: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private focus: d3.Selection<SVGCircleElement, unknown, null, undefined> | null = null;
  private focusText: d3.Selection<SVGTextElement, unknown, null, undefined> | null = null;
  private verticalLine: d3.Selection<SVGLineElement, unknown, null, undefined> | null = null;
  private horizontalLine: d3.Selection<SVGLineElement, unknown, null, undefined> | null = null;
  private interactionRect: d3.Selection<SVGRectElement, unknown, null, undefined> | null = null;
  private data: any[] = [];

  constructor(
    data: any[],
    scales: { xScale: any; yScale: any },
    config: CrosshairConfig,
    dataAccessor?: (d: any) => any
  ) {
    this.data = data;
    this.scales = scales;
    this.config = config;
    this.dataFinder = new DataFinder(dataAccessor || ((d: any) => d.x));
  }

  /**
   * 創建十字游標功能
   */
  create(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    chartDimensions: { width: number; height: number }
  ): CrosshairController {
    if (!this.config.enabled) return this;

    this.container = container;
    const { width, height } = chartDimensions;

    // 創建十字游標組
    const crosshairGroup = container.append('g')
      .attr('class', 'crosshair')
      .attr('data-testid', 'crosshair-overlay');

    // 創建垂直線
    if (this.config.showLines !== false) {
      this.verticalLine = crosshairGroup.append('line')
        .attr('class', 'crosshair-vertical')
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', this.config.lineColor || '#999')
        .attr('stroke-width', this.config.lineWidth || 1)
        .attr('stroke-opacity', this.config.lineOpacity || 0.7)
        .style('opacity', 0)
        .style('pointer-events', 'none');

      // 創建水平線
      this.horizontalLine = crosshairGroup.append('line')
        .attr('class', 'crosshair-horizontal')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('stroke', this.config.lineColor || '#999')
        .attr('stroke-width', this.config.lineWidth || 1)
        .attr('stroke-opacity', this.config.lineOpacity || 0.7)
        .style('opacity', 0)
        .style('pointer-events', 'none');
    }

    // 創建焦點圓圈
    if (this.config.showCircle !== false) {
      this.focus = crosshairGroup.append('circle')
        .attr('class', 'crosshair-circle')
        .attr('r', this.config.circleRadius || 4)
        .attr('fill', 'none')
        .attr('stroke', this.config.circleColor || '#333')
        .attr('stroke-width', 2)
        .style('opacity', 0)
        .style('pointer-events', 'none');
    }

    // 創建文字標籤
    if (this.config.showText !== false) {
      this.focusText = crosshairGroup.append('text')
        .attr('class', 'crosshair-text')
        .attr('text-anchor', 'left')
        .attr('alignment-baseline', 'middle')
        .attr('fill', this.config.textColor || '#333')
        .attr('font-size', this.config.textSize || '12px')
        .style('opacity', 0)
        .style('pointer-events', 'none');
    }

    // 創建透明交互層
    this.interactionRect = container.append('rect')
      .attr('class', 'crosshair-interaction')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', this.handleMouseOver.bind(this))
      .on('mousemove', this.handleMouseMove.bind(this))
      .on('mouseout', this.handleMouseOut.bind(this));

    return this;
  }

  /**
   * 處理鼠標進入事件
   */
  private handleMouseOver(): void {
    this.showCrosshair();
  }

  /**
   * 處理鼠標移動事件
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.container) return;

    const [mouseX, _mouseY] = d3.pointer(event, this.container.node());
    
    // 反轉比例尺獲取數據值
    const xValue = this.scales.xScale.invert(mouseX);
    
    // 查找最近的數據點
    const nearestData = this.dataFinder.findNearest(this.data, xValue);
    
    if (nearestData) {
      const x = this.scales.xScale(this.dataFinder['accessor'](nearestData));
      const y = this.scales.yScale(nearestData.y || nearestData.value || 0);

      // 更新十字線位置
      if (this.verticalLine) {
        this.verticalLine.attr('x1', x).attr('x2', x);
      }
      if (this.horizontalLine) {
        this.horizontalLine.attr('y1', y).attr('y2', y);
      }

      // 更新焦點圓圈位置
      if (this.focus) {
        this.focus.attr('cx', x).attr('cy', y);
      }

      // 更新文字標籤
      if (this.focusText) {
        const textContent = this.config.formatText 
          ? this.config.formatText(nearestData)
          : `${nearestData.x || nearestData.name}: ${nearestData.y || nearestData.value}`;
        
        const textX = x + (this.config.textOffset?.x || 10);
        const textY = y + (this.config.textOffset?.y || -10);
        
        this.focusText
          .text(textContent)
          .attr('x', textX)
          .attr('y', textY);
      }
    }
  }

  /**
   * 處理鼠標離開事件
   */
  private handleMouseOut(): void {
    this.hideCrosshair();
  }

  /**
   * 顯示十字游標
   */
  private showCrosshair(): void {
    if (this.focus) this.focus.style('opacity', 1);
    if (this.focusText) this.focusText.style('opacity', 1);
    if (this.verticalLine) this.verticalLine.style('opacity', 1);
    if (this.horizontalLine) this.horizontalLine.style('opacity', 1);
  }

  /**
   * 隱藏十字游標
   */
  private hideCrosshair(): void {
    if (this.focus) this.focus.style('opacity', 0);
    if (this.focusText) this.focusText.style('opacity', 0);
    if (this.verticalLine) this.verticalLine.style('opacity', 0);
    if (this.horizontalLine) this.horizontalLine.style('opacity', 0);
  }

  /**
   * 更新數據
   */
  updateData(data: any[]): void {
    this.data = data;
  }

  /**
   * 銷毀十字游標
   */
  destroy(): void {
    if (this.container) {
      this.container.selectAll('.crosshair').remove();
      this.container = null;
    }
    if (this.interactionRect) {
      this.interactionRect.remove();
      this.interactionRect = null;
    }
  }
}

/**
 * 創建筆刷縮放功能
 * @param container SVG 容器
 * @param scales 比例尺對象
 * @param config 筆刷縮放配置
 * @param chartDimensions 圖表尺寸
 * @returns 筆刷縮放控制器
 */
export function createBrushZoom(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  scales: { xScale: any; yScale: any },
  config: BrushZoomConfig,
  chartDimensions: { width: number; height: number }
): BrushZoomController {
  const controller = new BrushZoomController(scales, config);
  return controller.create(container, chartDimensions);
}

/**
 * 創建十字游標功能
 * @param container SVG 容器
 * @param data 數據數組
 * @param scales 比例尺對象
 * @param config 十字游標配置
 * @param chartDimensions 圖表尺寸
 * @param dataAccessor 數據存取器
 * @returns 十字游標控制器
 */
export function createCrosshair(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: any[],
  scales: { xScale: any; yScale: any },
  config: CrosshairConfig,
  chartDimensions: { width: number; height: number },
  dataAccessor?: (d: any) => any
): CrosshairController {
  const controller = new CrosshairController(data, scales, config, dataAccessor);
  return controller.create(container, chartDimensions);
}

/**
 * 視窗控制器 - 管理圖表視窗狀態
 */
export class ViewportController {
  private originalDomain: { x: [any, any]; y: [any, any] };
  private currentDomain: { x: [any, any]; y: [any, any] };
  private scales: { xScale: any; yScale: any };
  private history: Array<{ x: [any, any]; y: [any, any] }> = [];
  private maxHistoryLength: number = 10;

  constructor(scales: { xScale: any; yScale: any }) {
    this.scales = scales;
    this.originalDomain = {
      x: [...scales.xScale.domain()] as [any, any],
      y: [...scales.yScale.domain()] as [any, any]
    };
    this.currentDomain = {
      x: [...scales.xScale.domain()] as [any, any],
      y: [...scales.yScale.domain()] as [any, any]
    };
  }

  /**
   * 設定新的視窗域
   */
  setDomain(domain: { x?: [any, any]; y?: [any, any] }): void {
    // 保存當前狀態到歷史記錄
    this.history.push({
      x: [...this.currentDomain.x],
      y: [...this.currentDomain.y]
    });

    // 限制歷史記錄長度
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }

    // 更新域
    if (domain.x) {
      this.currentDomain.x = [...domain.x];
      this.scales.xScale.domain(domain.x);
    }
    if (domain.y) {
      this.currentDomain.y = [...domain.y];
      this.scales.yScale.domain(domain.y);
    }
  }

  /**
   * 重置到原始視窗
   */
  reset(): void {
    this.setDomain({
      x: [...this.originalDomain.x],
      y: [...this.originalDomain.y]
    });
    this.history = []; // 清空歷史
  }

  /**
   * 撤銷上一次操作
   */
  undo(): boolean {
    if (this.history.length === 0) return false;

    const previousState = this.history.pop()!;
    this.currentDomain = previousState;
    this.scales.xScale.domain(previousState.x);
    this.scales.yScale.domain(previousState.y);
    
    return true;
  }

  /**
   * 縮放到數據範圍
   */
  fitToData(data: any[], xAccessor: (d: any) => any, yAccessor: (d: any) => any, padding: number = 0.1): void {
    if (!data || data.length === 0) return;

    const xExtent = d3.extent(data, xAccessor) as [any, any];
    const yExtent = d3.extent(data, yAccessor) as [any, any];

    if (xExtent[0] !== undefined && xExtent[1] !== undefined &&
        yExtent[0] !== undefined && yExtent[1] !== undefined) {
      
      // 添加 padding
      const xPadding = (xExtent[1] - xExtent[0]) * padding;
      const yPadding = (yExtent[1] - yExtent[0]) * padding;

      this.setDomain({
        x: [xExtent[0] - xPadding, xExtent[1] + xPadding],
        y: [yExtent[0] - yPadding, yExtent[1] + yPadding]
      });
    }
  }

  /**
   * 獲取當前域
   */
  getCurrentDomain(): { x: [any, any]; y: [any, any] } {
    return {
      x: [...this.currentDomain.x],
      y: [...this.currentDomain.y]
    };
  }

  /**
   * 獲取原始域
   */
  getOriginalDomain(): { x: [any, any]; y: [any, any] } {
    return {
      x: [...this.originalDomain.x],
      y: [...this.originalDomain.y]
    };
  }
}

/**
 * 創建視窗控制器
 */
/**
 * 創建增強版筆刷縮放控制器
 */
export function createEnhancedBrushZoom(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  scales: { xScale: any; yScale: any },
  config: EnhancedBrushZoomConfig,
  chartDimensions: { width: number; height: number },
  svg?: d3.Selection<SVGSVGElement, unknown, null, undefined>
): EnhancedBrushZoomController {
  const controller = new EnhancedBrushZoomController(container, scales, config, svg);
  return controller.create(chartDimensions);
}

export function createViewportController(
  scales: { xScale: any; yScale: any }
): ViewportController {
  return new ViewportController(scales);
}