import { ReactNode } from 'react';
import * as d3 from 'd3';
import { BaseChartProps } from '../../../core/base-chart/types';
import { StatisticalData } from '../../shared/statistical-utils';

export interface ViolinPlotDataPoint {
  [key: string]: any;
}

export interface DensityPoint {
  value: number;
  density: number;
}

export interface ProcessedViolinDataPoint {
  label: string;
  values: number[];
  statistics: StatisticalData;
  densityData: DensityPoint[];
  originalData: ViolinPlotDataPoint | ViolinPlotDataPoint[];
  index: number;
}

export interface ViolinShape {
  label: string;
  statistics: StatisticalData;
  densityData: DensityPoint[];
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  violinPath: string;
  index: number;
}

export interface ViolinPlotProps extends BaseChartProps {
  // 資料相關
  data: ViolinPlotDataPoint[];
  labelKey?: string;
  valueKey?: string;
  valuesKey?: string; // 用於已聚合的資料
  categoryKey?: string; // 替代 labelKey 的新字段，與其他組件保持一致
  labelAccessor?: (d: ViolinPlotDataPoint) => string;
  valueAccessor?: (d: ViolinPlotDataPoint) => number[];
  mapping?: {
    label: string | ((d: ViolinPlotDataPoint) => string);
    values: string | ((d: ViolinPlotDataPoint) => number[]);
  };
  
  // 小提琴圖樣式
  orientation?: 'vertical' | 'horizontal';
  violinWidth?: number;
  bandwidth?: number; // KDE 帶寬
  resolution?: number; // 密度計算解析度
  showBoxPlot?: boolean;
  boxPlotWidth?: number;
  showMedian?: boolean;
  showMean?: boolean;
  showQuartiles?: boolean;
  showOutliers?: boolean;
  
  // KDE 設定
  kdeMethod?: 'gaussian' | 'epanechnikov' | 'triangular';
  smoothing?: number;
  clipMin?: number;
  clipMax?: number;
  
  // 顏色和樣式
  colors?: string[];
  colorScheme?: 'custom' | 'blues' | 'greens' | 'oranges' | 'reds' | 'purples';
  violinFillOpacity?: number;
  violinStroke?: string;
  violinStrokeWidth?: number;
  boxPlotStroke?: string;
  boxPlotStrokeWidth?: number;
  medianStroke?: string;
  medianStrokeWidth?: number;
  
  // 統計選項
  statisticsMethod?: 'standard' | 'tukey' | 'percentile';
  outlierThreshold?: number;
  
  // 標籤和文字
  showLabels?: boolean;
  showValues?: boolean;
  showStatistics?: boolean;
  labelPosition?: 'inside' | 'outside';
  valueFormat?: (value: number) => string;
  statisticsFormat?: (stats: StatisticalData) => string;
  fontSize?: number;
  fontFamily?: string;
  
  // 動畫延遲
  animationDelay?: number;
  animationEasing?: string;
  
  // 互動 - 標準事件命名
  tooltipFormat?: (data: ProcessedViolinDataPoint) => ReactNode;
  onDataClick?: (data: ProcessedViolinDataPoint) => void;
  onDataHover?: (data: ProcessedViolinDataPoint | null) => void;
  
  // 向下兼容的廢棄事件 (將在未來版本中移除)
  /** @deprecated 請使用 onDataClick 替代 */
  onViolinClick?: (data: ProcessedViolinDataPoint) => void;
  /** @deprecated 請使用 onDataHover 替代 */
  onViolinHover?: (data: ProcessedViolinDataPoint | null) => void;
  
  // 平均值樣式
  meanStyle?: 'circle' | 'diamond' | 'square';
  
  // HTML 屬性
  [key: string]: any;
}

export interface ViolinPlotScales {
  xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;
  colorScale: d3.ScaleOrdinal<string, string> | d3.ScaleSequential<string>;
  densityScale: d3.ScaleLinear<number, number>;
}