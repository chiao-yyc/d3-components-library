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
} from '../../../core/types/core/chart-types';
import { 
  type AxisConfig, 
  type ChartAxisDefaults,
  CHART_AXIS_DEFAULTS,
  isValidDomain,
  mergeAxisConfig 
} from '../../../core/axis-config';
import { AxisCore } from '../../../primitives/axis/core/axis-core';
import {
  applyStandardAxisStyles,
  addAxisLabel,
  renderGrid,
  type StandardAxisStyles,
  // type AxisLabelConfig,
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
  
  /**
   * 獲取圖表類型默認軸線配置
   * 子類可以覆蓋此方法提供特定的默認配置
   */
  protected getChartAxisDefaults(): ChartAxisDefaults {
    const chartType = this.getChartType();
    return CHART_AXIS_DEFAULTS[chartType] || CHART_AXIS_DEFAULTS['default'] || {};
  }

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

  // === 統一軸線配置系統 ===
  
  /**
   * 計算軸線域值
   * @param values 數據值陣列
   * @param axisConfig 軸線配置
   * @param shortcuts 快捷配置（語法糖）
   * @returns 計算出的域值範圍
   */
  protected calculateAxisDomain(
    values: number[],
    axisConfig?: AxisConfig,
    shortcuts?: { includeOrigin?: boolean; beginAtZero?: boolean }
  ): [number, number] {
    // 配置優先級：明確配置 > 快捷配置 > 圖表默認值
    // const chartDefaults = this.getChartAxisDefaults();
    const mergedConfig = mergeAxisConfig(axisConfig, shortcuts);
    
    // 處理自定義 domain
    if (mergedConfig.domain) {
      if (typeof mergedConfig.domain === 'function') {
        return mergedConfig.domain(values);
      }
      if (Array.isArray(mergedConfig.domain) && isValidDomain(mergedConfig.domain)) {
        return mergedConfig.domain as [number, number];
      }
    }
    
    // 處理空數據或無效數據
    if (!values || values.length === 0) {
      return [0, 1]; // 默認範圍
    }
    
    // 計算數據範圍
    const extent = d3.extent(values) as [number, number];
    
    // 處理相同值的情況
    if (extent[0] === extent[1]) {
      const value = extent[0];
      if (value === 0) {
        return [0, 1];
      } else if (value > 0) {
        return mergedConfig.beginAtZero ? [0, value * 1.1] : [value * 0.9, value * 1.1];
      } else {
        return mergedConfig.beginAtZero ? [value * 1.1, 0] : [value * 1.1, value * 0.9];
      }
    }
    
    let [min, max] = extent;
    
    // 應用 includeOrigin 配置
    if (mergedConfig.includeOrigin) {
      min = Math.min(0, min);
      max = Math.max(0, max);
    }
    
    // 應用 beginAtZero 配置
    if (mergedConfig.beginAtZero) {
      if (max >= 0) {
        min = 0;
      } else if (min <= 0) {
        max = 0;
      }
    }
    
    // 應用邊距設置
    if (mergedConfig.padding && mergedConfig.padding > 0) {
      const range = max - min;
      const paddingValue = range * mergedConfig.padding;
      min -= paddingValue;
      max += paddingValue;
    }
    
    return [min, max];
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
      tickSize?: number;
      tickSizeOuter?: number;
      tickFormat?: (domainValue: any, index: number) => string;
      tickValues?: any[];
      showGrid?: boolean;
      gridConfig?: GridConfig;
      // 軸線相交配置
      axisIntersection?: {
        enabled?: boolean;
        xScale?: d3.AxisScale<any>;
        yScale?: d3.AxisScale<any>;
        intersectionPoint?: [number, number];
      };
    } = {}
  ): void {
    if (!this.svgElement) return;
    
    const { 
      label, 
      className, 
      styles, 
      tickCount, 
      tickSize,
      tickSizeOuter,
      tickFormat, 
      tickValues,
      showGrid = false,
      gridConfig = { show: showGrid },
      axisIntersection
    } = options;
    
    const { chartWidth, chartHeight } = this.getChartDimensions();
    
    // 使用 AxisCore 創建軸線
    const axisCore = new AxisCore({
      scale,
      orientation,
      tickCount,
      tickSize,
      tickSizeOuter,
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
      .attr('transform', this.getAxisTransform(
        orientation, 
        chartWidth, 
        chartHeight,
        axisIntersection?.xScale,
        axisIntersection?.yScale,
        axisIntersection?.enabled,
        axisIntersection?.intersectionPoint
      ));
    
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
    chartHeight: number,
    _xScale?: d3.AxisScale<any>,
    _yScale?: d3.AxisScale<any>,
    _forceIntersection?: boolean,
    _intersectionPoint?: [number, number]
  ): string {
    // 軸線位置保持固定，相交通過 tickSizeOuter 來實現
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
   * 計算軸線相交點的 SVG 座標
   */
  protected getAxisIntersectionPoint(
    xScale: d3.AxisScale<any>,
    yScale: d3.AxisScale<any>,
    chartWidth: number,
    chartHeight: number,
    intersectionPoint: [number, number] = [0, 0]
  ): { x: number; y: number } {
    const [intersectionX, intersectionY] = intersectionPoint;
    
    // 將數據座標轉換為 SVG 座標
    let svgX: number, svgY: number;
    
    // 處理 X 軸座標
    if ('bandwidth' in xScale) {
      // 如果是 band scale（類別軸）
      const bandwidth = (xScale as d3.ScaleBand<any>).bandwidth();
      svgX = xScale(intersectionX) || 0;
      svgX += bandwidth / 2; // 置中
    } else {
      // 數值軸或時間軸
      svgX = xScale(intersectionX) || 0;
    }
    
    // 處理 Y 軸座標  
    if ('bandwidth' in yScale) {
      const bandwidth = (yScale as d3.ScaleBand<any>).bandwidth();
      svgY = yScale(intersectionY) || 0;
      svgY += bandwidth / 2;
    } else {
      svgY = yScale(intersectionY) || 0;
    }
    
    // 確保座標在有效範圍內
    svgX = Math.max(0, Math.min(chartWidth, svgX));
    svgY = Math.max(0, Math.min(chartHeight, svgY));
    
    return { x: svgX, y: svgY };
  }
  
  /**
   * 計算動態邊距以支援軸線相交
   */
  protected calculateDynamicMargin(
    xScale: d3.AxisScale<any>,
    yScale: d3.AxisScale<any>,
    originalMargin: { top: number; right: number; bottom: number; left: number },
    intersectionPoint: [number, number] = [0, 0]
  ): { top: number; right: number; bottom: number; left: number } {
    const { chartWidth, chartHeight } = this.getChartDimensions();
    const intersection = this.getAxisIntersectionPoint(xScale, yScale, chartWidth, chartHeight, intersectionPoint);
    
    // 計算軸線相交所需的最小邊距
    const minMarginForIntersection = {
      top: Math.max(20, chartHeight - intersection.y + 20),    // Y軸上方需要的空間
      right: Math.max(20, intersection.x - chartWidth + 50),   // X軸右方需要的空間  
      bottom: Math.max(40, intersection.y + 40),               // X軸下方需要的空間
      left: Math.max(60, intersection.x + 60)                 // Y軸左方需要的空間
    };
    
    // 取原始邊距與最小相交邊距的較大值
    return {
      top: Math.max(originalMargin.top, minMarginForIntersection.top),
      right: Math.max(originalMargin.right, minMarginForIntersection.right),
      bottom: Math.max(originalMargin.bottom, minMarginForIntersection.bottom),
      left: Math.max(originalMargin.left, minMarginForIntersection.left)
    };
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
      tickSize?: number;
      tickSizeOuter?: number;
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
      tickSize?: number;
      tickSizeOuter?: number;
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