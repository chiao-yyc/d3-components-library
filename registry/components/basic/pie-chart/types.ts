
import { HTMLAttributes, ReactNode } from 'react';
import { PieChartConfig as CorePieChartConfig, ProcessedPieDataPoint as CoreProcessedPieDataPoint } from './core/types';

export type { Margin, DataMapping, ProcessedPieDataPoint } from './core/types';

export interface PieChartProps extends CorePieChartConfig, Omit<HTMLAttributes<HTMLDivElement>, 'onHover'> {
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
