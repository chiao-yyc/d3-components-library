
import { HTMLAttributes } from 'react';
import { BarChartConfig as CoreBarChartConfig, ProcessedDataPoint as CoreProcessedDataPoint } from './core/types';

// Re-export core types if they need to be exposed to the consumer
export type { Margin, DataMapping, ProcessedDataPoint } from './core/types';

// React-specific props
export interface BarChartProps extends CoreBarChartConfig, Omit<HTMLAttributes<HTMLDivElement>, 'onHover'> {
  className?: string;
}

// Deprecated or to be removed if not used by React wrapper
export interface BarChartConfig {
  defaultWidth: number;
  defaultHeight: number;
  defaultMargin: CoreBarChartConfig['margin'];
  defaultColors: string[];
  animationDuration: number;
  animationEasing: string;
  barPadding: number;
  hoverOpacity: number;
}
