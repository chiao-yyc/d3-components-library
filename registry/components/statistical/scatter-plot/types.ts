import { HTMLAttributes, ReactNode } from 'react';
import { ScatterPlotProps as CoreScatterPlotProps, ProcessedScatterDataPoint as CoreProcessedScatterDataPoint } from './core/types';

export type { Margin, DataMapping, ProcessedScatterDataPoint } from './core/types';

export interface ScatterPlotProps extends CoreScatterPlotProps, Omit<HTMLAttributes<HTMLDivElement>, 'onHover'> {
  className?: string;
  style?: React.CSSProperties;
  tooltipFormat?: (d: CoreProcessedScatterDataPoint) => ReactNode;
}

// 保持向下兼容
export type ProcessedDataPoint = CoreProcessedScatterDataPoint;