/**
 * CanvasFallbackCore - 高性能 Canvas 渲染系統
 * 自動在 SVG 和 Canvas 之間切換，支援 50K+ 數據點
 */

import * as d3 from 'd3';
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
  
  // 回調函數
  onRenderModeChange?: (mode: 'svg' | 'canvas') => void;
  onPerformanceMetrics?: (metrics: PerformanceMetrics) => void;
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

  constructor(
    config: BaseChartCoreConfig & CanvasFallbackConfig,
    callbacks?: ChartStateCallbacks
  ) {
    super(config, callbacks);
    
    this.canvasConfig = {
      dataThreshold: 10000,
      pixelRatio: window.devicePixelRatio || 1,
      antialias: true,
      alpha: true,
      enableVirtualization: true,
      batchSize: 1000,
      animationFrameLimit: 60,
      ...config
    };
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
      alpha: this.canvasConfig.alpha,
      antialias: this.canvasConfig.antialias
    });

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

    return this.canvasContext;
  }
  
  /**
   * 銷毀 Canvas 上下文
   */
  protected destroyCanvasContext(): void {
    if (this.canvasContext) {
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