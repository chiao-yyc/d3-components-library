/**
 * BaseChartCore - 純 TypeScript 圖表核心邏輯
 * 完全框架無關，可用於 React、Vue、Angular 等任何框架
 */

import * as d3 from 'd3';
import type { 
  ChartData, 
  BaseChartData,
  BaseChartCoreConfig,
  ChartStateCallbacks,
  ChartDimensions
} from '../../types';

/**
 * 純 TypeScript 的圖表核心基類
 * 完全不依賴任何前端框架
 */
export abstract class BaseChartCore<TData extends BaseChartData = BaseChartData> {
  protected config: BaseChartCoreConfig<TData>;
  protected callbacks: ChartStateCallbacks;
  protected containerElement: HTMLElement | null = null;
  protected svgElement: SVGSVGElement | null = null;
  protected processedData: ChartData<TData>[] | null = null;

  constructor(config: BaseChartCoreConfig<TData>, callbacks: ChartStateCallbacks = {}) {
    this.config = config;
    this.callbacks = callbacks;
  }

  // === 抽象方法，子類必須實現 ===
  protected abstract processData(): ChartData<TData>[];
  protected abstract createScales(): Record<string, any>;  
  protected abstract renderChart(): void;
  public abstract getChartType(): string;

  // === 生命周期方法 ===
  
  /**
   * 初始化圖表 - 由框架層調用
   */
  public initialize(containerElement: HTMLElement, svgElement: SVGSVGElement): void {
    this.containerElement = containerElement;
    this.svgElement = svgElement;
    
    try {
      this.setLoading(true);
      this.processedData = this.processData();
      this.createScales();
      this.renderChart();
      this.setLoading(false);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * 更新圖表配置
   */
  public updateConfig(newConfig: Partial<BaseChartCoreConfig<TData>>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.svgElement) {
      try {
        this.setLoading(true);
        this.processedData = this.processData();
        this.createScales();
        this.renderChart();
        this.setLoading(false);
      } catch (error) {
        this.handleError(error as Error);
      }
    }
  }

  /**
   * 銷毀圖表
   */
  public destroy(): void {
    if (this.svgElement) {
      d3.select(this.svgElement).selectAll('*').remove();
    }
    this.containerElement = null;
    this.svgElement = null;
  }

  // === 數據驗證 ===
  
  protected validateData(): boolean {
    const { data } = this.config;
    if (!data || !Array.isArray(data) || data.length === 0) {
      this.handleError(new Error('Invalid or empty data provided'));
      return false;
    }
    
    // 檢查每個數據項是否為有效物件
    const hasInvalidItems = data.some(item => 
      typeof item !== 'object' || item === null
    );
    
    if (hasInvalidItems) {
      this.handleError(new Error('Data contains invalid items'));
      return false;
    }
    
    return true;
  }

  // === 狀態管理（通過回調與框架層通信）===
  
  protected handleError(error: Error): void {
    this.callbacks.onError?.(error);
  }

  protected setLoading(isLoading: boolean): void {
    this.callbacks.onLoadingChange?.(isLoading);
  }

  protected showTooltip(x: number, y: number, content: string | number | JSX.Element): void {
    this.callbacks.onTooltipShow?.(x, y, content);
  }

  protected hideTooltip(): void {
    this.callbacks.onTooltipHide?.();
  }

  // === 核心工具方法 ===
  
  protected getChartDimensions(): ChartDimensions {
    const { width = 800, height = 400, margin = { top: 20, right: 30, bottom: 40, left: 40 } } = this.config;
    return {
      width,
      height,
      margin,
      chartWidth: width - margin.left - margin.right,
      chartHeight: height - margin.top - margin.bottom
    };
  }

  protected createSVGContainer(): d3.Selection<SVGGElement, unknown, null, undefined> {
    if (!this.svgElement) {
      throw new Error('SVG element not initialized');
    }

    const svg = d3.select(this.svgElement);
    const { margin } = this.getChartDimensions();

    // 清除現有內容
    svg.selectAll('*').remove();

    // 設置測試 ID
    svg.attr('data-testid', 'chart-area');

    // 創建圖表區域
    const chartArea = svg
      .append('g')
      .attr('class', `${this.getChartType()}-chart`)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    return chartArea;
  }

  // === 公開 API ===
  
  public getConfig(): BaseChartCoreConfig<TData> {
    return { ...this.config };
  }

  public getProcessedData(): ChartData<TData>[] | null {
    return this.processedData ? [...this.processedData] : null;
  }
}