
import { PieChartProps as CorePieChartProps } from './core/types';

export type { Margin, DataMapping, ProcessedPieDataPoint } from './core/types';

export interface PieChartProps extends CorePieChartProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface LegendItem {
  label: string;
  color: string;
  value: number;
  percentage: number;
  index: number;
}
