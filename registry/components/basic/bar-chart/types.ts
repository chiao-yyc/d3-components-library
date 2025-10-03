import { BaseChartProps, Margin } from '../../core/base-chart/types';
import { DataMapping, ProcessedDataPoint as CoreProcessedDataPoint } from '../../core/data-processor/types';

// Re-export core types
export type { Margin, DataMapping };

// Update ProcessedDataPoint to align with DataProcessor's output
export interface ProcessedDataPoint extends CoreProcessedDataPoint {
  // Add any BarChart specific processed data properties here if needed
}

// BarChartProps extends BaseChartProps
export interface BarChartProps extends BaseChartProps {
  // BarChart specific properties
  xKey?: string;
  yKey?: string;
  xAccessor?: (d: unknown) => unknown;
  yAccessor?: (d: unknown) => unknown;
  mapping?: DataMapping;
  orientation?: 'vertical' | 'horizontal';
  colors?: string[];
  
  // Labels
  showLabels?: boolean;
  labelPosition?: 'top' | 'center' | 'bottom';
  labelFormat?: (value: unknown) => string;
  
  // Axis configuration (unified axis system)
  showGrid?: boolean;
  xTickCount?: number;
  yTickCount?: number;
  xTickFormat?: (domainValue: unknown, index: number) => string;
  yTickFormat?: (domainValue: unknown, index: number) => string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  
  // Tooltip
  tooltipFormat?: (data: ProcessedDataPoint) => string;
  
  // Events
  onDataClick?: (data: unknown) => void;
  onHover?: (data: unknown) => void;
}