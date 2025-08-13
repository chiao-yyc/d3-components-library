
import { HTMLAttributes, ReactNode } from 'react';
import { PieChartProps as CorePieChartProps, ProcessedPieDataPoint as CoreProcessedPieDataPoint } from './core/types';

export type { Margin, DataMapping, ProcessedPieDataPoint } from './core/types';

export interface PieChartProps extends CorePieChartProps, Omit<HTMLAttributes<HTMLDivElement>, 'onHover'> {
  className?: string;
  style?: React.CSSProperties;
  tooltipFormat?: (d: CoreProcessedPieDataPoint) => ReactNode;
}

export interface LegendItem {
  label: string;
  color: string;
  value: number;
  percentage: number;
  index: number;
}
