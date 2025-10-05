/**
 * CanvasFallbackCore - 高性能 Canvas 渲染系統
 * 自動在 SVG 和 Canvas 之間切換，支援 50K+ 數據點
 */

// import * as d3 from 'd3';
import { BaseChartCore } from '../base-chart/core';
import { BaseChartCoreConfig, ChartStateCallbacks, BaseChartData } from '../types';

// Canvas 渲染配置
export interface CanvasFallbackConfig {
  // 性能閾值
  dataThreshold?: number;        // 數據點閾值，超過則使用 Canvas (默認: 10000)
  forceCanvas?: boolean;         // 強制使用 Canvas 渲染
  forceSVG?: boolean;           // 強制使用 SVG 渲染
  
  // Canvas 專用設定
  pixelRatio?: number;          // 像素比率，默認為 devicePixelRatio
  antialias?: boolean;          // 抗鋸齒 (默認: true)
  alpha?: boolean;              // 透明度支援 (默認: true)
  
  // 性能優化
  enableVirtualization?: boolean; // 視窗虛擬化
  batchSize?: number;           // 批次渲染大小
  animationFrameLimit?: number; // 動畫幀數限制
  
  // 🎯 Canvas Tooltip 配置
  enableCanvasTooltip?: boolean;  // Canvas 模式是否啟用 tooltip (默認: true)
  tooltipHitRadius?: number;      // Tooltip 碰撞半徑 (默認: 10px)
  tooltipThrottleMs?: number;     // Tooltip 事件節流延遲 (默認: 16ms ~60fps)
  
  // 回調函數
  onRenderModeChange?: (mode: 'svg' | 'canvas') => void;
  onPerformanceMetrics?: (metrics: PerformanceMetrics) => void;
  onCanvasDataHover?: (data: any, event: MouseEvent) => void;  // Canvas 專用 hover 事件
  onCanvasDataClick?: (data: any, event: MouseEvent) => void;  // Canvas 專用 click 事件
}

// 性能指標
export interface PerformanceMetrics {
  renderMode: 'svg' | 'canvas';
  dataPointCount: number;
  renderTime: number;           // 毫秒
  memoryUsage?: number;         // MB
  fps?: number;                 // 幀數
}

// Canvas 渲染上下文
export interface CanvasRenderContext {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  pixelRatio: number;
}

/**
 * Canvas Fallback 核心類
 * 提供自動 SVG/Canvas 切換和高性能渲染
 */
export abstract class CanvasFallbackCore<TData extends BaseChartData = BaseChartData> extends BaseChartCore<TData> {
  protected canvasConfig: CanvasFallbackConfig;
  protected currentRenderMode: 'svg' | 'canvas' = 'svg';
  protected canvasContext: CanvasRenderContext | null = null;
  protected performanceMetrics: PerformanceMetrics | null = null;
  
  // 性能監控
  private renderStartTime = 0;
  private animationFrameId: number | null = null;

  // 🎯 Canvas Tooltip 支援
  private isCanvasTooltipEnabled = true;
  private tooltipThrottleTimer: ReturnType<typeof setTimeout> | null = null;
  private lastHoveredData: any = null;

  constructor(
    config: BaseChartCoreConfig<TData> & CanvasFallbackConfig,
    callbacks?: ChartStateCallbacks
  ) {
    super(config, callbacks ?? {});
    
    this.canvasConfig = {
      dataThreshold: 10000,
      pixelRatio: window.devicePixelRatio || 1,
      antialias: true,
      alpha: true,
      enableVirtualization: true,
      batchSize: 1000,
      animationFrameLimit: 60,
      // 🎯 Canvas Tooltip 預設配置
      enableCanvasTooltip: true,
      tooltipHitRadius: 10,
      tooltipThrottleMs: 16,
      ...config
    };
    
    // 初始化 Canvas tooltip 狀態
    this.isCanvasTooltipEnabled = this.canvasConfig.enableCanvasTooltip !== false;
  }

  // === 抽象方法：子類需實現的 Canvas 渲染方法 ===
  
  /**
   * Canvas 專用渲染方法
   * 子類需實現高性能的 Canvas 渲染邏輯
   */
  protected abstract renderWithCanvas(context: CanvasRenderContext): void;
  
  /**
   * 數據虛擬化：返回當前視窗內需要渲染的數據
   * 用於處理超大數據集
   */
  protected abstract getVisibleData(allData: any[]): any[];
  
  /**
   * 🎯 Canvas 模式的數據點檢測
   * 根據滑鼠位置找到最近的數據點，用於 tooltip 顯示
   * @param mouseX 滑鼠 X 座標 (相對於 canvas)
   * @param mouseY 滑鼠 Y 座標 (相對於 canvas)
   * @param hitRadius 碰撞檢測半徑
   * @returns 最近的數據點，沒有則返回 null
   */
  protected abstract findDataPointAt(mouseX: number, mouseY: number, hitRadius: number): any | null;

  // === 渲染模式決策 ===
  
  /**
   * 決定使用 SVG 還是 Canvas 渲染
   */
  protected determineRenderMode(dataCount: number): 'svg' | 'canvas' {
    // 強制模式
    if (this.canvasConfig.forceCanvas) return 'canvas';
    if (this.canvasConfig.forceSVG) return 'svg';
    
    // 基於數據量自動決策
    const threshold = this.canvasConfig.dataThreshold || 10000;
    return dataCount > threshold ? 'canvas' : 'svg';
  }
  
  /**
   * 切換渲染模式
   */
  protected switchRenderMode(newMode: 'svg' | 'canvas'): void {
    if (this.currentRenderMode === newMode) return;
    
    const previousMode = this.currentRenderMode;
    this.currentRenderMode = newMode;
    
    // 清理舊的渲染上下文
    if (previousMode === 'canvas' && this.canvasContext) {
      this.destroyCanvasContext();
    }
    
    // 回調通知
    this.canvasConfig.onRenderModeChange?.(newMode);
    
    console.log(`[CanvasFallback] Switched from ${previousMode} to ${newMode} rendering`);
  }

  // === Canvas 上下文管理 ===
  
  /**
   * 創建 Canvas 渲染上下文
   */
  protected createCanvasContext(): CanvasRenderContext | null {
    if (!this.containerElement) {
      console.error('[CanvasFallback] Container element not available');
      return null;
    }

    const { width = 800, height = 400 } = this.getChartDimensions();
    const pixelRatio = this.canvasConfig.pixelRatio || window.devicePixelRatio || 1;

    // 創建 Canvas 元素
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', {
      alpha: this.canvasConfig.alpha
    }) as CanvasRenderingContext2D | null;

    if (!context) {
      console.error('[CanvasFallback] Failed to get 2D context');
      return null;
    }

    // 設置 Canvas 尺寸
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // 設置上下文縮放
    context.scale(pixelRatio, pixelRatio);
    
    // 添加到 DOM
    this.containerElement.appendChild(canvas);
    
    // 隱藏 SVG (如果存在)
    if (this.svgElement) {
      this.svgElement.style.display = 'none';
    }

    this.canvasContext = {
      canvas,
      context,
      width,
      height,
      pixelRatio
    };

    // 🎯 設置 Canvas Tooltip 事件監聽器
    this.setupCanvasTooltipListeners(canvas);

    return this.canvasContext;
  }
  
  /**
   * 銷毀 Canvas 上下文
   */
  protected destroyCanvasContext(): void {
    if (this.canvasContext) {
      // 🎯 清理 Canvas 事件監聽器
      this.cleanupCanvasTooltipListeners(this.canvasContext.canvas);
      
      // 移除 Canvas 元素
      if (this.canvasContext.canvas.parentNode) {
        this.canvasContext.canvas.parentNode.removeChild(this.canvasContext.canvas);
      }
      
      this.canvasContext = null;
    }
    
    // 顯示 SVG (如果存在)
    if (this.svgElement) {
      this.svgElement.style.display = 'block';
    }
  }
  
  // === 🎯 Canvas Tooltip 事件處理系統 ===
  
  /**
   * 設置 Canvas 的 tooltip 事件監聽器
   */
  private setupCanvasTooltipListeners(canvas: HTMLCanvasElement): void {
    if (!this.isCanvasTooltipEnabled) return;
    
    // 綁定事件處理器到 canvas 元素
    canvas.addEventListener('mousemove', this.handleCanvasMouseMove);
    canvas.addEventListener('mouseout', this.handleCanvasMouseOut);
    canvas.addEventListener('click', this.handleCanvasClick);
    
    console.log('🎯 Canvas tooltip 事件監聽器已設置');
  }
  
  /**
   * 清理 Canvas 的 tooltip 事件監聽器
   */
  private cleanupCanvasTooltipListeners(canvas: HTMLCanvasElement): void {
    canvas.removeEventListener('mousemove', this.handleCanvasMouseMove);
    canvas.removeEventListener('mouseout', this.handleCanvasMouseOut);
    canvas.removeEventListener('click', this.handleCanvasClick);
    
    // 清理節流器
    if (this.tooltipThrottleTimer) {
      clearTimeout(this.tooltipThrottleTimer);
      this.tooltipThrottleTimer = null;
    }
    
    console.log('🎯 Canvas tooltip 事件監聽器已清理');
  }
  
  /**
   * Canvas 滑鼠移動事件處理器（帶節流）
   */
  private handleCanvasMouseMove = (event: MouseEvent): void => {
    if (!this.isCanvasTooltipEnabled || !this.canvasContext) return;
    
    // 節流處理，避免過於頻繁的處理
    if (this.tooltipThrottleTimer) return;
    
    this.tooltipThrottleTimer = setTimeout(() => {
      this.processCanvasMouseMove(event);
      this.tooltipThrottleTimer = null;
    }, this.canvasConfig.tooltipThrottleMs || 16);
  };
  
  /**
   * 處理 Canvas 滑鼠移動的核心邏輯
   */
  private processCanvasMouseMove(event: MouseEvent): void {
    if (!this.canvasContext) return;
    
    const rect = this.canvasContext.canvas.getBoundingClientRect();
    const scaleX = this.canvasContext.width / rect.width;
    const scaleY = this.canvasContext.height / rect.height;
    
    // 轉換為 canvas 座標
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    
    // 尋找最近的數據點
    const hitRadius = this.canvasConfig.tooltipHitRadius || 10;
    const hitData = this.findDataPointAt(canvasX, canvasY, hitRadius);
    
    // 如果找到的數據點與上次不同，觸發事件
    if (hitData !== this.lastHoveredData) {
      this.lastHoveredData = hitData;
      
      if (hitData) {
        // 觸發用戶自定義 hover 事件
        this.canvasConfig.onCanvasDataHover?.(hitData, event);
        console.log('🎯 Canvas tooltip hover:', hitData);
      } else {
        // 觸發 hover out 事件
        this.canvasConfig.onCanvasDataHover?.(null, event);
      }
    }
  }
  
  /**
   * Canvas 滑鼠離開事件處理器
   */
  private handleCanvasMouseOut = (event: MouseEvent): void => {
    if (this.lastHoveredData) {
      this.lastHoveredData = null;
      this.canvasConfig.onCanvasDataHover?.(null, event);
      console.log('🎯 Canvas tooltip mouse out');
    }
  };
  
  /**
   * Canvas 點擊事件處理器
   */
  private handleCanvasClick = (event: MouseEvent): void => {
    if (!this.isCanvasTooltipEnabled || !this.canvasContext) return;
    
    const rect = this.canvasContext.canvas.getBoundingClientRect();
    const scaleX = this.canvasContext.width / rect.width;
    const scaleY = this.canvasContext.height / rect.height;
    
    // 轉換為 canvas 座標
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    
    // 尋找最近的數據點
    const hitRadius = this.canvasConfig.tooltipHitRadius || 10;
    const hitData = this.findDataPointAt(canvasX, canvasY, hitRadius);
    
    if (hitData) {
      this.canvasConfig.onCanvasDataClick?.(hitData, event);
      console.log('🎯 Canvas tooltip click:', hitData);
    }
  };

  // === 重寫基礎渲染邏輯 ===
  
  protected renderChart(): void {
    this.startPerformanceTracking();
    
    const processedData = this.getProcessedData();
    const dataCount = Array.isArray(processedData) ? processedData.length : 0;
    
    // 決定渲染模式
    const targetMode = this.determineRenderMode(dataCount);
    this.switchRenderMode(targetMode);
    
    try {
      if (this.currentRenderMode === 'canvas') {
        this.renderWithCanvasMode();
      } else {
        this.renderWithSVGMode();
      }
    } catch (error) {
      console.error('[CanvasFallback] Render error:', error);
      this.handleError(error as Error);
    } finally {
      this.endPerformanceTracking(dataCount);
    }
  }
  
  /**
   * Canvas 模式渲染
   */
  private renderWithCanvasMode(): void {
    // 創建或更新 Canvas 上下文
    const context = this.canvasContext || this.createCanvasContext();
    if (!context) {
      throw new Error('Failed to create Canvas context');
    }
    
    // 清空 Canvas
    context.context.clearRect(0, 0, context.width, context.height);
    
    // 調用子類的 Canvas 渲染方法
    this.renderWithCanvas(context);
  }
  
  /**
   * SVG 模式渲染 (使用原有邏輯)
   */
  private renderWithSVGMode(): void {
    // 確保 Canvas 被隱藏
    if (this.canvasContext) {
      this.canvasContext.canvas.style.display = 'none';
    }
    
    // 顯示 SVG 並進行渲染
    if (this.svgElement) {
      this.svgElement.style.display = 'block';
    }
    
    // 調用原有的 SVG 渲染邏輯
    // 子類需要實現具體的 SVG 渲染
    this.renderWithSVG();
  }
  
  /**
   * SVG 渲染方法 (子類需實現)
   */
  protected abstract renderWithSVG(): void;

  // === 性能監控 ===
  
  private startPerformanceTracking(): void {
    this.renderStartTime = performance.now();
  }
  
  private endPerformanceTracking(dataCount: number): void {
    const renderTime = performance.now() - this.renderStartTime;
    
    this.performanceMetrics = {
      renderMode: this.currentRenderMode,
      dataPointCount: dataCount,
      renderTime,
      memoryUsage: this.getMemoryUsage(),
      fps: this.getFPS()
    };
    
    // 回調通知
    this.canvasConfig.onPerformanceMetrics?.(this.performanceMetrics);
    
    // 開發模式下輸出性能信息
    if (process.env.NODE_ENV === 'development') {
      console.log('[CanvasFallback] Performance:', this.performanceMetrics);
    }
  }
  
  private getMemoryUsage(): number | undefined {
    // @ts-ignore - performance.memory 可能不存在
    return (performance as any).memory?.usedJSHeapSize ? 
      (performance as any).memory.usedJSHeapSize / 1024 / 1024 : undefined;
  }
  
  private getFPS(): number | undefined {
    // 簡化的 FPS 估算
    return this.renderStartTime > 0 ? Math.round(1000 / (performance.now() - this.renderStartTime)) : undefined;
  }

  // === 公開 API ===
  
  /**
   * 獲取當前渲染模式
   */
  public getCurrentRenderMode(): 'svg' | 'canvas' {
    return this.currentRenderMode;
  }
  
  /**
   * 獲取性能指標
   */
  public getPerformanceMetrics(): PerformanceMetrics | null {
    return this.performanceMetrics;
  }
  
  /**
   * 強制切換到指定渲染模式
   */
  public forceRenderMode(mode: 'svg' | 'canvas'): void {
    this.canvasConfig.forceCanvas = mode === 'canvas';
    this.canvasConfig.forceSVG = mode === 'svg';
    this.renderChart();
  }
  
  // === 清理資源 ===
  
  public destroy(): void {
    // 取消動畫幀
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // 清理 Canvas 上下文
    this.destroyCanvasContext();
    
    // 調用父類清理方法
    super.destroy();
  }
}