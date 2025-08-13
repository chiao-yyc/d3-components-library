// Pure TypeScript types for the core area chart logic
import { BaseChartProps } from '../../../core/base-chart/base-chart';
import { ProcessedDataPoint as CoreProcessedDataPoint } from '../../../core/data-processor/types';

export type { Margin, DataMapping } from '../../../core/base-chart/types';

export interface ProcessedAreaDataPoint extends CoreProcessedDataPoint {
  category?: string;
  y0?: number;
  y1?: number;
}

export interface AreaSeriesData {
  key: string;
  values: ProcessedAreaDataPoint[];
  color?: string;
}

export interface AreaChartProps extends BaseChartProps {
  // AreaChart 特有的屬性
  xKey?: string;
  yKey?: string;
  categoryKey?: string;
  xAccessor?: (d: any) => Date | number | string;
  yAccessor?: (d: any) => number;
  categoryAccessor?: (d: any) => string;
  mapping?: DataMapping;
  
  // Area 特定樣式
  curve?: 'linear' | 'monotone' | 'cardinal' | 'basis' | 'step';
  stackMode?: 'none' | 'stack' | 'percent';
  fillOpacity?: number;
  strokeWidth?: number;
  colors?: string[];
  colorScheme?: 'category10' | 'set3' | 'pastel' | 'dark' | 'custom';
  gradient?: boolean;
  showGrid?: boolean;
  showDots?: boolean;
  dotRadius?: number;
  
  // Axis
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisFormat?: (d: any) => string;
  yAxisFormat?: (d: any) => string;
  
  // Legend
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  
  // Interactive
  interactive?: boolean;
  
  // Tooltip
  tooltipFormat?: (d: ProcessedAreaDataPoint, series?: string) => string;
  
  // Events
  onDataClick?: (d: ProcessedAreaDataPoint, series?: string) => void;
  onDataHover?: (d: ProcessedAreaDataPoint | null, series?: string) => void;
}
