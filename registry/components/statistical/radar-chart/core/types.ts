/**
 * RadarChart 類型定義
 * 繼承 BaseChartProps 並添加雷達圖特有屬性
 */

import { ReactNode } from 'react';
import * as d3 from 'd3';
import { BaseChartProps } from '../../../core/base-chart/types';
import { InterpolationType } from '../../shared/polar-utils';

export interface RadarChartDataPoint {
  [key: string]: any;
}

export interface RadarValue {
  axis: string;
  value: number;
  normalizedValue: number;
  originalValue: number;
}

export interface ProcessedRadarDataPoint {
  label: string;
  values: RadarValue[];
  originalData: RadarChartDataPoint;
  index: number;
}

export interface RadarAxis {
  name: string;
  min: number;
  max: number;
  scale: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number>;
  angle: number;
  position: { x: number; y: number };
}

export interface RadarSeries {
  label: string;
  values: RadarValue[];
  color: string;
  path: string;
  points: Array<{ x: number; y: number; value: RadarValue }>;
  area?: string;
  index: number;
}

export interface RadarChartProps extends BaseChartProps {
  // 基礎資料
  data: RadarChartDataPoint[];
  axes: string[]; // 軸的名稱列表
  
  // 資料存取器
  labelKey?: string;
  labelAccessor?: (d: RadarChartDataPoint) => string;
  valueAccessor?: (d: RadarChartDataPoint, axis: string) => number;
  mapping?: {
    label: string | ((d: RadarChartDataPoint) => string);
    values: { [axis: string]: string | ((d: RadarChartDataPoint) => number) };
  };
  
  // 雷達圖配置
  radius?: number;
  levels?: number; // 同心圓層級數
  startAngle?: number; // 起始角度（度）
  clockwise?: boolean; // 順時針方向
  interpolation?: InterpolationType; // 路徑插值類型
  
  // 顯示選項
  showGrid?: boolean;
  showGridLabels?: boolean;
  showAxes?: boolean;
  showAxisLabels?: boolean;
  showDots?: boolean;
  showArea?: boolean;
  
  // 數值範圍
  minValue?: number;
  maxValue?: number;
  autoScale?: boolean;
  scaleType?: 'linear' | 'log';
  
  // 網格樣式
  gridStroke?: string;
  gridStrokeWidth?: number;
  gridOpacity?: number;
  axisStroke?: string;
  axisStrokeWidth?: number;
  
  // 數據樣式
  strokeWidth?: number;
  areaOpacity?: number;
  dotRadius?: number;
  dotStroke?: string;
  dotStrokeWidth?: number;
  
  // 標籤配置
  axisLabelOffset?: number;
  gridLabelOffset?: number;
  valueFormat?: (value: number) => string;
  fontSize?: number;
  fontFamily?: string;
  
  // 視覺效果
  glowEffect?: boolean; // 發光濾鏡效果
  
  // 互動事件
  onSeriesClick?: (data: ProcessedRadarDataPoint, event: Event) => void;
  onSeriesHover?: (data: ProcessedRadarDataPoint | null, event: Event) => void;
  onDotClick?: (value: RadarValue, series: ProcessedRadarDataPoint, event: Event) => void;
  onDotHover?: (value: RadarValue | null, series: ProcessedRadarDataPoint | null, event: Event) => void;
  
  // 工具提示
  tooltipFormat?: (data: RadarValue, series: ProcessedRadarDataPoint) => ReactNode;
  
  // 圖例
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  
  // HTML 屬性
  [key: string]: any;
}

export interface RadarChartScales {
  radiusScale: d3.ScaleLinear<number, number>;
  colorScale: d3.ScaleOrdinal<string, string> | d3.ScaleSequential<string>;
}