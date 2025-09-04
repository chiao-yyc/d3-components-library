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
import { AxisCore } from '../../../primitives/axis/core/axis-core';
import { 
  applyStandardAxisStyles, 
  addAxisLabel, 
  renderGrid,
  type StandardAxisStyles, 
  type AxisLabelConfig,
  type GridConfig
} from '../../axis-styles/axis-styles';

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
  protected scales: Record<string, any> = {};

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
    console.log('🔧 BaseChartCore initialize called:', {
      chartType: this.getChartType(),
      container: !!containerElement,
      svg: !!svgElement,
      data: this.config.data?.length
    });
    
    this.containerElement = containerElement;
    this.svgElement = svgElement;
    
    try {
      this.setLoading(true);
      console.log('🔧 BaseChartCore calling processData');
      this.processedData = this.processData();
      console.log('🔧 BaseChartCore calling createScales');
      this.scales = this.createScales();
      console.log('🔧 BaseChartCore calling renderChart');
      this.renderChart();
      this.setLoading(false);
      console.log('🔧 BaseChartCore initialization complete');
    } catch (error) {
      console.error('🔥 BaseChartCore initialization error:', error);
      this.handleError(error as Error);
    }
  }

  /**
   * 更新圖表配置
   */
  public updateConfig(newConfig: Partial<BaseChartCoreConfig<TData>>): void {
    console.log('🔧 BaseChartCore updateConfig called:', {
      chartType: this.getChartType(),
      newConfig: Object.keys(newConfig).length,
      svgElement: !!this.svgElement
    });
    
    this.config = { ...this.config, ...newConfig };
    
    if (this.svgElement) {
      try {
        this.setLoading(true);
        console.log('🔧 BaseChartCore updateConfig calling processData');
        this.processedData = this.processData();
        console.log('🔧 BaseChartCore updateConfig calling createScales');
        this.scales = this.createScales();
        console.log('🔧 BaseChartCore updateConfig calling renderChart');
        this.renderChart();
        this.setLoading(false);
        console.log('🔧 BaseChartCore updateConfig complete');
      } catch (error) {
        console.error('🔥 BaseChartCore updateConfig error:', error);
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

  // === 統一軸線渲染方法 ===
  
  /**
   * 使用統一樣式渲染標準軸線
   */
  protected renderStandardAxis(
    scale: d3.AxisScale<any>,
    orientation: 'top' | 'right' | 'bottom' | 'left',
    options: {
      label?: string;
      className?: string;
      styles?: Partial<StandardAxisStyles>;
      tickCount?: number;
      tickFormat?: (domainValue: any, index: number) => string;
      tickValues?: any[];
      showGrid?: boolean;
      gridConfig?: GridConfig;
    } = {}
  ): void {
    if (!this.svgElement) return;
    
    const { 
      label, 
      className, 
      styles, 
      tickCount, 
      tickFormat, 
      tickValues,
      showGrid = false,
      gridConfig = { show: showGrid }
    } = options;
    
    const { chartWidth, chartHeight } = this.getChartDimensions();
    
    // 使用 AxisCore 創建軸線
    const axisCore = new AxisCore({
      scale,
      orientation,
      tickCount,
      tickFormat,
      tickValues,
      showTicks: true,
      showTickLabels: true,
      showDomain: true
    });
    
    // 創建軸線群組並設置位置
    const svgSelection = d3.select(this.svgElement);
    let chartArea = svgSelection.select('.chart-area') as d3.Selection<SVGGElement, unknown, null, undefined>;
    
    // 如果沒有找到 .chart-area，嘗試找圖表特定的類名
    if (chartArea.empty()) {
      chartArea = svgSelection.select(`g.${this.getChartType()}-chart`) as d3.Selection<SVGGElement, unknown, null, undefined>;
    }
    
    // 如果仍然沒有找到，創建一個臨時的群組
    if (chartArea.empty()) {
      const { margin } = this.getChartDimensions();
      chartArea = svgSelection
        .append('g')
        .attr('class', 'chart-area')
        .attr('transform', `translate(${margin.left},${margin.top})`) as d3.Selection<SVGGElement, unknown, null, undefined>;
    }
    
    const axisGroup = chartArea
      .append('g')
      .attr('class', className || `${orientation}-axis`)
      .attr('transform', this.getAxisTransform(orientation, chartWidth, chartHeight));
    
    // 渲染軸線
    axisCore.render(axisGroup);
    
    // 應用統一樣式
    applyStandardAxisStyles(axisGroup, styles);
    
    // 添加軸線標籤
    if (label) {
      addAxisLabel(axisGroup, { text: label }, orientation, chartWidth, chartHeight);
    }
    
    // 渲染網格線
    if (showGrid && gridConfig.show) {
      const gridOrientation = (orientation === 'left' || orientation === 'right') ? 'horizontal' : 'vertical';
      const gridSize = gridOrientation === 'horizontal' ? chartWidth : chartHeight;
      renderGrid(chartArea, scale, gridOrientation, gridSize, gridConfig);
    }
  }
  
  /**
   * 獲取軸線變換位置
   */
  private getAxisTransform(
    orientation: 'top' | 'right' | 'bottom' | 'left',
    chartWidth: number,
    chartHeight: number
  ): string {
    switch (orientation) {
      case 'top': 
        return `translate(0, 0)`;
      case 'right': 
        return `translate(${chartWidth}, 0)`;
      case 'bottom': 
        return `translate(0, ${chartHeight})`;
      case 'left': 
        return `translate(0, 0)`;
      default:
        return '';
    }
  }
  
  /**
   * 快捷方法：渲染 X 軸（底部）
   */
  protected renderXAxis(
    scale: d3.AxisScale<any>,
    options: {
      label?: string;
      styles?: Partial<StandardAxisStyles>;
      tickCount?: number;
      tickFormat?: (domainValue: any, index: number) => string;
      showGrid?: boolean;
    } = {}
  ): void {
    this.renderStandardAxis(scale, 'bottom', {
      ...options,
      className: 'x-axis'
    });
  }
  
  /**
   * 快捷方法：渲染 Y 軸（左側）
   */
  protected renderYAxis(
    scale: d3.AxisScale<any>,
    options: {
      label?: string;
      styles?: Partial<StandardAxisStyles>;
      tickCount?: number;
      tickFormat?: (domainValue: any, index: number) => string;
      showGrid?: boolean;
    } = {}
  ): void {
    this.renderStandardAxis(scale, 'left', {
      ...options,
      className: 'y-axis'
    });
  }

  // === 智能邊距工具方法 ===
  
  /**
   * 計算智能邊距值 (通用方法)
   * @param elementSize 元素大小（如點半徑）
   * @param elementType 元素類型（points, lines, bars）
   * @returns 計算出的邊距值
   */
  protected calculateSmartPadding(elementSize: number, elementType: 'points' | 'lines' | 'bars' = 'points'): number {
    const paddingRatio = this.config.paddingRatio ?? 0.05;  // 默認 5%
    const minPadding = this.config.minPadding ?? 5;         // 默認 5px
    const elementPadding = this.config.elementPadding?.[elementType] ?? 0;
    
    const { chartWidth, chartHeight } = this.getChartDimensions();
    
    // 使用比例和固定值的較大值
    const ratioBasedPadding = Math.max(chartWidth, chartHeight) * paddingRatio;
    const elementBasedPadding = elementSize + elementPadding + 2; // 元素大小加緩衝
    
    return Math.max(minPadding, ratioBasedPadding, elementBasedPadding);
  }
  
  /**
   * 獲取考慮智能邊距的比例尺範圍
   * @param totalSize 總尺寸（寬度或高度）
   * @param elementSize 元素大小
   * @param elementType 元素類型
   * @param isYAxis 是否為 Y 軸（影響範圍順序）
   * @returns [rangeStart, rangeEnd]
   */
  protected getSmartScaleRange(
    totalSize: number, 
    elementSize: number, 
    elementType: 'points' | 'lines' | 'bars' = 'points',
    isYAxis: boolean = false
  ): [number, number] {
    const autoMargin = this.config.autoMargin ?? true;
    
    if (!autoMargin) {
      return isYAxis ? [totalSize, 0] : [0, totalSize];
    }
    
    const padding = this.calculateSmartPadding(elementSize, elementType);
    
    if (isYAxis) {
      return [totalSize - padding, padding];
    } else {
      return [padding, totalSize - padding];
    }
  }

  // === 公開 API ===
  
  public getConfig(): BaseChartCoreConfig<TData> {
    return { ...this.config };
  }

  public getProcessedData(): ChartData<TData>[] | null {
    return this.processedData ? [...this.processedData] : null;
  }

  public getScales(): Record<string, any> {
    return { ...this.scales };
  }
}