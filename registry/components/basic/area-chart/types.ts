
import { HTMLAttributes } from 'react';
import { AreaChartProps as CoreAreaChartProps, ProcessedAreaDataPoint, AreaSeriesData } from './core/types';

export type { Margin, DataMapping, ProcessedAreaDataPoint, AreaSeriesData } from './core/types';

// React 包裝器的 props，繼承 core 的 AreaChartProps 並添加 HTML 屬性
export interface AreaChartProps extends CoreAreaChartProps, Omit<HTMLAttributes<HTMLDivElement>, 'onHover'> {
  className?: string;
  style?: React.CSSProperties;
}

// Simple 變體專用類型
export interface SimpleAreaChartData {
  x: string | number | Date;
  y: number;
  series?: string;
}

export interface SimpleAreaChartProps {
  data: SimpleAreaChartData[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  colors?: string[];
  stackMode?: 'none' | 'stack' | 'percent';
  curve?: 'linear' | 'monotone' | 'step';
  showLine?: boolean;
  lineWidth?: number;
  areaOpacity?: number;
  showGrid?: boolean;
  className?: string;
  onAreaClick?: (data: SimpleAreaChartData) => void;
}
