import { ReactNode } from 'react';
import { ObservableFunnelChartConfig } from './core/types';

// React 組件的 Props 介面
export interface ObservableFunnelChartProps extends Omit<ObservableFunnelChartConfig, 'container'> {
  // 樣式相關
  className?: string;
  style?: React.CSSProperties;
  
  // 工具提示
  showTooltip?: boolean;
  tooltipFormat?: (data: any) => ReactNode;
  
  // HTML 屬性
  [key: string]: any;
}