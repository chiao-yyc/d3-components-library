/**
 * 核心圖表型別定義
 * 提供強型別約束，取代 any 類型的使用
 */

import * as d3 from 'd3';

// === 基礎數據型別 ===

/**
 * 圖表數據的基礎接口
 */
export interface BaseChartData {
  [key: string]: string | number | Date | boolean | null | undefined;
}

/**
 * 泛型圖表數據約束
 */
export type ChartData<T = BaseChartData> = T & BaseChartData;

/**
 * 數據存取器函數型別
 */
export type DataAccessor<T, R> = (datum: T, index: number, data: T[]) => R;

/**
 * 數據鍵值或存取器
 */
export type DataKeyOrAccessor<T, R> = keyof T | DataAccessor<T, R>;

// === 圖表配置型別 ===

/**
 * 基礎圖表核心配置
 */
export interface BaseChartCoreConfig<TData = BaseChartData> {
  data: ChartData<TData>[];
  width?: number;
  height?: number;
  margin?: ChartMargin;
  animate?: boolean;
  animationDuration?: number;
  interactive?: boolean;
  
  // 智能邊距功能（通用配置）
  autoMargin?: boolean;              // 自動邊距，默認 true
  paddingRatio?: number;             // 邊距比例，默認 0.05 (5%)
  minPadding?: number;               // 最小邊距像素，默認 5px
  elementPadding?: {                 // 元素特定邊距設置
    points?: number;                 // 點元素額外邊距
    lines?: number;                  // 線元素額外邊距
    bars?: number;                   // 條形元素額外邊距
  };
  
  // 分組功能
  groupBy?: DataKeyOrAccessor<ChartData<TData>, string>;
  groupColors?: string[];
}

/**
 * 圖表邊距配置
 */
export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * 圖表尺寸信息
 */
export interface ChartDimensions {
  width: number;
  height: number;
  margin: ChartMargin;
  chartWidth: number;
  chartHeight: number;
}

// === 比例尺型別 ===

/**
 * 支援的比例尺類型
 */
export type ScaleType = 'linear' | 'band' | 'time' | 'ordinal' | 'log' | 'sqrt' | 'pow' | 'point';

/**
 * D3 比例尺聯合型別
 */
export type D3Scale = 
  | d3.ScaleLinear<number, number>
  | d3.ScaleBand<string>
  | d3.ScaleTime<number, number>
  | d3.ScaleOrdinal<string, string>
  | d3.ScaleLogarithmic<number, number>
  | d3.ScalePow<number, number>
  | d3.ScalePoint<string>;

/**
 * 比例尺配置
 */
export interface ScaleConfig<TDomain = unknown, TRange = unknown> {
  type: ScaleType;
  domain?: TDomain[];
  range?: TRange[];
  padding?: number;
  paddingInner?: number;
  paddingOuter?: number;
  nice?: boolean;
  clamp?: boolean;
}

/**
 * 軸向類型
 */
export type AxisType = 'x' | 'y' | 'y2';

// === 事件處理型別 ===

/**
 * 圖表事件處理器
 */
export interface ChartEventHandlers<TData = BaseChartData> {
  onClick?: (datum: ChartData<TData>, index: number, event: MouseEvent) => void;
  onMouseOver?: (datum: ChartData<TData>, index: number, event: MouseEvent) => void;
  onMouseOut?: (datum: ChartData<TData>, index: number, event: MouseEvent) => void;
  onMouseMove?: (datum: ChartData<TData>, index: number, event: MouseEvent) => void;
}

/**
 * 狀態回調接口
 */
export interface ChartStateCallbacks {
  onError?: (error: Error) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onTooltipShow?: (x: number, y: number, content: unknown) => void;
  onTooltipHide?: () => void;
}

// === 渲染相關型別 ===

/**
 * SVG 選擇器類型
 */
export type D3Selection<TElement extends Element = Element> = 
  d3.Selection<TElement, unknown, null, undefined>;

/**
 * 圖表渲染配置
 */
export interface RenderConfig {
  container: HTMLElement;
  svg: SVGSVGElement;
  dimensions: ChartDimensions;
}

// === 動畫型別 ===

/**
 * 動畫配置
 */
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  ease?: d3.EasingFunction;
}

/**
 * 動畫狀態
 */
export type AnimationState = 'idle' | 'running' | 'completed' | 'cancelled';

// === 顏色相關型別 ===

/**
 * 顏色值類型
 */
export type ColorValue = string | d3.RGBColor | d3.HSLColor;

/**
 * 顏色函數類型
 */
export type ColorFunction<TData = BaseChartData> = (
  datum: ChartData<TData>, 
  index: number, 
  data: ChartData<TData>[]
) => ColorValue;

/**
 * 顏色配置
 */
export type ColorConfig<TData = BaseChartData> = ColorValue | ColorFunction<TData> | ColorValue[];

// === 樣式型別 ===

/**
 * SVG 樣式屬性
 */
export interface SVGStyleAttributes {
  fill?: ColorValue;
  stroke?: ColorValue;
  strokeWidth?: number;
  opacity?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
}

// === 工具類型 ===

/**
 * 可選屬性工具類型
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 嚴格屬性工具類型
 */
export type Strict<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * 數值範圍類型
 */
export type NumberRange = [number, number];

/**
 * 時間範圍類型
 */
export type TimeRange = [Date, Date];

/**
 * 類別列表類型
 */
export type CategoryList = string[];

/**
 * 域值聯合類型
 */
export type DomainValue = NumberRange | TimeRange | CategoryList;

// === 圖表專用型別 ===

/**
 * 座標點
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 矩形區域
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 圓形區域
 */
export interface Circle {
  x: number;
  y: number;
  radius: number;
}

// === 錯誤處理型別 ===

/**
 * 圖表錯誤類型
 */
export class ChartError extends Error {
  constructor(
    message: string,
    public readonly chartType: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ChartError';
  }
}

/**
 * 數據驗證錯誤
 */
export class DataValidationError extends ChartError {
  constructor(
    message: string,
    chartType: string,
    public readonly invalidData?: unknown
  ) {
    super(message, chartType);
    this.name = 'DataValidationError';
  }
}

// === 設定驗證工具 ===

/**
 * 檢查是否為有效數據鍵
 */
export function isDataKey<T>(value: unknown): value is keyof T {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'symbol';
}

/**
 * 檢查是否為存取器函數
 */
export function isDataAccessor<T, R>(value: unknown): value is DataAccessor<T, R> {
  return typeof value === 'function';
}

/**
 * 檢查是否為有效的圖表數據
 */
export function isValidChartData<T = BaseChartData>(data: unknown): data is ChartData<T>[] {
  return Array.isArray(data) && data.length > 0 && 
    data.every(item => typeof item === 'object' && item !== null);
}

/**
 * 檢查是否為有效的邊距配置
 */
export function isValidMargin(margin: unknown): margin is ChartMargin {
  return (
    typeof margin === 'object' &&
    margin !== null &&
    'top' in margin &&
    'right' in margin &&
    'bottom' in margin &&
    'left' in margin &&
    typeof (margin as ChartMargin).top === 'number' &&
    typeof (margin as ChartMargin).right === 'number' &&
    typeof (margin as ChartMargin).bottom === 'number' &&
    typeof (margin as ChartMargin).left === 'number'
  );
}