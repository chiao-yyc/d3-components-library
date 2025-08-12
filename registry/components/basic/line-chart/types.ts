
import { HTMLAttributes } from 'react';
import { LineChartConfig as CoreLineChartConfig } from './core/types';

export type { Margin, DataMapping, ProcessedDataPoint } from './core/types';

export interface LineChartProps extends CoreLineChartConfig, Omit<HTMLAttributes<HTMLDivElement>, 'onHover'> {
  className?: string;
}
