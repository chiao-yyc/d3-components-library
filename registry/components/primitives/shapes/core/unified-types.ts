/**
 * Shapes Unified Types - 統一的圖形組件類型定義
 * 基於 BaseChartCore 架構，移除 React 依賴，統一事件處理器 API
 */

import * as d3 from 'd3';
import { BaseChartData } from '../../../core/base-chart/types';
import { AlignmentStrategy } from '../../utils';

// === 基礎數據類型 ===

export interface ShapeDataBase extends BaseChartData {
  x: any;
  y: any;
  id?: string;
  label?: string;
  color?: string;
  [key: string]: any;
}

// === 統一的事件處理器類型 ===

export interface StandardEventHandlers<T extends ShapeDataBase> {
  onDataClick?: (dataPoint: T, index: number, event: MouseEvent) => void;
  onDataHover?: (dataPoint: T | null, index: number, event: MouseEvent) => void;
  onDataFocus?: (dataPoint: T, index: number, event: FocusEvent) => void;
}

// === 統一的視覺配置 ===

export interface StandardVisualConfig {
  color?: string | string[] | ((d: any, i: number) => string);
  opacity?: number;
  strokeWidth?: number;
  strokeColor?: string;
  className?: string;
}

// === 統一的動畫配置 ===

export interface StandardAnimationConfig {
  animate?: boolean;
  animationDuration?: number;
  animationEasing?: string;
  animationDelay?: number;
  staggerDelay?: number;
}

// === 統一的交互配置 ===

export interface StandardInteractionConfig<T extends ShapeDataBase> 
  extends StandardEventHandlers<T> {
  interactive?: boolean;
  hoverable?: boolean;
  selectable?: boolean;
  draggable?: boolean;
}

// === Bar 相關類型 ===

export interface BarShapeData extends ShapeDataBase {
  value?: number;
  width?: number;
  height?: number;
  group?: string;
}

export interface BarVisualConfig extends StandardVisualConfig {
  orientation?: 'vertical' | 'horizontal';
  alignment?: AlignmentStrategy;
  barWidthRatio?: number;
  cornerRadius?: number;
  gradient?: GradientConfig;
}

// === Line 相關類型 ===

export interface LineShapeData extends ShapeDataBase {
  [key: string]: any;
}

export interface LineVisualConfig extends StandardVisualConfig {
  curve?: d3.CurveFactory;
  showPoints?: boolean;
  pointRadius?: number;
  pointColor?: string;
  lineDashArray?: string;
  tension?: number;
}

// === Area 相關類型 ===

export interface AreaShapeData extends ShapeDataBase {
  y0?: any;
  y1?: any;
}

export interface AreaVisualConfig extends StandardVisualConfig {
  curve?: d3.CurveFactory;
  baseline?: number | ((d: AreaShapeData) => number);
  gradient?: GradientConfig;
  showLine?: boolean;
  lineColor?: string;
}

// === Scatter 相關類型 ===

export interface ScatterShapeData extends ShapeDataBase {
  size?: number;
  group?: string;
}

export interface ScatterVisualConfig extends StandardVisualConfig {
  radius?: number;
  sizeScale?: d3.ScaleLinear<number, number>;
  colorScale?: d3.ScaleOrdinal<string, string>;
  symbol?: d3.SymbolType;
}

// === Stacked Area 相關類型 ===

export interface StackedAreaData extends ShapeDataBase {
  [key: string]: any;
}

export interface StackedAreaSeries {
  key: string;
  color?: string;
  name?: string;
  opacity?: number;
  gradient?: GradientConfig;
}

export interface StackedAreaVisualConfig extends StandardVisualConfig {
  curve?: d3.CurveFactory;
  stackOrder?: 'ascending' | 'descending' | 'insideOut' | 'none' | 'reverse';
  stackOffset?: 'none' | 'expand' | 'diverging' | 'silhouette' | 'wiggle';
  series: StackedAreaSeries[];
}

// === Waterfall 相關類型 ===

export interface WaterfallShapeData extends ShapeDataBase {
  value: number;
  type?: 'positive' | 'negative' | 'total' | 'subtotal';
  category?: string;
}

export interface WaterfallVisualConfig extends StandardVisualConfig {
  positiveColor?: string;
  negativeColor?: string;
  totalColor?: string;
  subtotalColor?: string;
  showConnectors?: boolean;
  connectorColor?: string;
  connectorWidth?: number;
  connectorDasharray?: string;
}

// === Regression Line 相關類型 ===

export interface RegressionData extends ShapeDataBase {
  x: number;
  y: number;
}

export interface RegressionVisualConfig extends StandardVisualConfig {
  regressionType?: 'linear' | 'polynomial' | 'exponential';
  polynomialDegree?: number;
  strokeDasharray?: string;
  showEquation?: boolean;
  showRSquared?: boolean;
}

// === 通用輔助類型 ===

export interface GradientConfig {
  id: string;
  stops: Array<{
    offset: string;
    color: string;
    opacity?: number;
  }>;
  direction?: 'vertical' | 'horizontal' | 'radial';
}

export interface TooltipConfig {
  show?: boolean;
  formatter?: (d: any) => string;
  position?: 'mouse' | 'data' | 'fixed';
  offset?: { x: number; y: number };
}

// === 統一的組件配置基類 ===

export interface UnifiedShapeConfig<T extends ShapeDataBase, V extends StandardVisualConfig> {
  // 數據
  data: T[];
  
  // 視覺配置
  visual: V;
  
  // 動畫配置
  animation?: StandardAnimationConfig;
  
  // 交互配置
  interaction?: StandardInteractionConfig<T>;
  
  // 工具提示配置
  tooltip?: TooltipConfig;
  
  // 可訪問性配置
  accessibility?: {
    ariaLabel?: string;
    description?: string;
    role?: string;
  };
}

// === 具體形狀配置類型 ===

export type UnifiedBarConfig = UnifiedShapeConfig<BarShapeData, BarVisualConfig>;
export type UnifiedLineConfig = UnifiedShapeConfig<LineShapeData, LineVisualConfig>;
export type UnifiedAreaConfig = UnifiedShapeConfig<AreaShapeData, AreaVisualConfig>;
export type UnifiedScatterConfig = UnifiedShapeConfig<ScatterShapeData, ScatterVisualConfig>;
export type UnifiedStackedAreaConfig = UnifiedShapeConfig<StackedAreaData, StackedAreaVisualConfig>;
export type UnifiedWaterfallConfig = UnifiedShapeConfig<WaterfallShapeData, WaterfallVisualConfig>;
export type UnifiedRegressionConfig = UnifiedShapeConfig<RegressionData, RegressionVisualConfig>;

// === 向下兼容映射（用於漸進式遷移）===

/**
 * @deprecated 請使用 BarShapeData
 */
export type BarShapeDataLegacy = BarShapeData;

/**
 * @deprecated 請使用 LineShapeData
 */
export type LineShapeDataLegacy = LineShapeData;

/**
 * @deprecated 請使用 AreaShapeData
 */
export type AreaShapeDataLegacy = AreaShapeData;

/**
 * @deprecated 請使用 ScatterShapeData
 */
export type ScatterShapeDataLegacy = ScatterShapeData;

// === 工具函數類型 ===

export type ColorResolver<T> = (d: T, i: number) => string;
export type DataAccessor<T, R> = (d: T) => R;
export type ScaleGenerator = (data: any[], range: [number, number]) => d3.ScaleLinear<number, number> | d3.ScaleBand<any>;

// === 常用類型聯合 ===

export type AnyShapeData = 
  | BarShapeData 
  | LineShapeData 
  | AreaShapeData 
  | ScatterShapeData 
  | StackedAreaData 
  | WaterfallShapeData 
  | RegressionData;

export type AnyVisualConfig = 
  | BarVisualConfig 
  | LineVisualConfig 
  | AreaVisualConfig 
  | ScatterVisualConfig 
  | StackedAreaVisualConfig 
  | WaterfallVisualConfig 
  | RegressionVisualConfig;

// === 驗證函數類型 ===

export type DataValidator<T> = (data: T[]) => boolean;
export type ConfigValidator<T> = (config: T) => boolean;

// === 預設配置常數 ===

export const DEFAULT_VISUAL_CONFIG: StandardVisualConfig = {
  opacity: 1,
  strokeWidth: 1,
  strokeColor: 'none',
  className: ''
};

export const DEFAULT_ANIMATION_CONFIG: StandardAnimationConfig = {
  animate: true,
  animationDuration: 300,
  animationEasing: 'ease-in-out',
  animationDelay: 0,
  staggerDelay: 50
};

export const DEFAULT_INTERACTION_CONFIG: Omit<StandardInteractionConfig<any>, keyof StandardEventHandlers<any>> = {
  interactive: true,
  hoverable: true,
  selectable: false,
  draggable: false
};