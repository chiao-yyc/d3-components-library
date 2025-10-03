
import { HTMLAttributes } from 'react';
import { AreaChartProps as CoreAreaChartProps } from './core/types';

export type { Margin, DataMapping, ProcessedAreaDataPoint } from './core/types';
export type { AreaSeriesData } from './core/area-chart-core';

// React 包裝器的 props，繼承 core 的 AreaChartProps 並添加 HTML 屬性
export interface AreaChartProps extends CoreAreaChartProps, Omit<HTMLAttributes<HTMLDivElement>, 'onHover' | 'onError'> {
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
  stackMode?: 'none' | 'normal' | 'percent';
  curve?: 'linear' | 'monotone' | 'step';
  showLine?: boolean;
  lineWidth?: number;
  areaOpacity?: number;
  showGrid?: boolean;
  className?: string;
  
  // 標準事件命名
  onDataClick?: (data: SimpleAreaChartData) => void;
  
  // 向下兼容的廢棄事件
  /** @deprecated 請使用 onDataClick 替代 */
  onAreaClick?: (data: SimpleAreaChartData) => void;
}
