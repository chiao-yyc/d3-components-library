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
  tooltipFormat?: (data: ProcessedDataPoint) => string;
  onDataClick?: (data: any) => void;
  onHover?: (data: any) => void;
}