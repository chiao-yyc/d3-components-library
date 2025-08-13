// Pure TypeScript types for the core scatter plot logic
import { BaseChartProps } from '../../../core/base-chart/base-chart';
import { ProcessedDataPoint as CoreProcessedDataPoint } from '../../../core/data-processor/types';

export type { Margin, DataMapping } from '../../../core/base-chart/types';

export interface ProcessedScatterDataPoint extends CoreProcessedDataPoint {
  size?: number;
  color?: string;
}

export interface ScatterPlotProps extends BaseChartProps {
  // ScatterPlot 特有的屬性
  xKey?: string;
  yKey?: string;
  sizeKey?: string;
  colorKey?: string;
  xAccessor?: (d: any) => number;
  yAccessor?: (d: any) => number;
  sizeAccessor?: (d: any) => number;
  colorAccessor?: (d: any) => string;
  mapping?: DataMapping;

  // Scatter 特定樣式
  radius?: number;
  minRadius?: number;
  maxRadius?: number;
  sizeRange?: [number, number];
  opacity?: number;
  strokeWidth?: number;
  strokeColor?: string;
  colors?: string[];

  // Trendline
  showTrendline?: boolean;
  trendlineColor?: string;
  trendlineWidth?: number;

  // 互動
  interactive?: boolean;

  // Tooltip
  tooltipFormat?: (d: ProcessedScatterDataPoint) => string;

  // Events
  onDataClick?: (d: ProcessedScatterDataPoint) => void;
  onHover?: (d: ProcessedScatterDataPoint | null) => void;
}

// 保持向下兼容的類型別名
export type ScatterPlotConfig = ScatterPlotProps;
export type ProcessedDataPoint = ProcessedScatterDataPoint;
