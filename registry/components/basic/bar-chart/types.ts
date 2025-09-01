import { HTMLAttributes } from 'react';
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
  xAccessor?: (d: any) => any;
  yAccessor?: (d: any) => any;
  mapping?: DataMapping;
  orientation?: 'vertical' | 'horizontal';
  colors?: string[];
  
  // Labels
  showLabels?: boolean;
  labelPosition?: 'top' | 'center' | 'bottom';
  labelFormat?: (value: any) => string;
  
  // Axis configuration (unified axis system)
  showGrid?: boolean;
  xTickCount?: number;
  yTickCount?: number;
  xTickFormat?: (domainValue: any, index: number) => string;
  yTickFormat?: (domainValue: any, index: number) => string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  
  // Tooltip
  tooltipFormat?: (data: ProcessedDataPoint) => string;
  
  // Events
  onDataClick?: (data: any) => void;
  onHover?: (data: any) => void;
}