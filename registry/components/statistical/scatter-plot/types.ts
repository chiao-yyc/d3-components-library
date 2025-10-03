import { ScatterPlotProps as CoreScatterPlotProps, ProcessedScatterDataPoint as CoreProcessedScatterDataPoint } from './core/types';

export type { ProcessedScatterDataPoint } from './core/types';

export interface ScatterPlotProps extends CoreScatterPlotProps {
  className?: string;
  style?: React.CSSProperties;
}

// 保持向下兼容
export type ProcessedDataPoint = CoreProcessedScatterDataPoint;