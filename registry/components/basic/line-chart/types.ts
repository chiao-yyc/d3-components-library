
import { HTMLAttributes } from 'react';
import { BaseChartProps } from '../../../../core/base-chart/base-chart'; // 導入 BaseChartProps
import { ProcessedDataPoint as CoreProcessedDataPoint } from '../../../../core/data-processor/types'; // 導入 DataProcessor 的 ProcessedDataPoint

// 重新導出 BaseChart 的相關類型
export type { Margin, DataMapping } from '../../../../core/base-chart/types';

// 更新 ProcessedDataPoint 以符合 DataProcessor 的輸出
export interface ProcessedDataPoint extends CoreProcessedDataPoint {
  // 可以添加 LineChart 特有的處理後屬性
}

// LineChartProps 繼承 BaseChartProps
export interface LineChartProps extends BaseChartProps, Omit<HTMLAttributes<HTMLDivElement>, 'onHover'> {
  // LineChart 特有的屬性
  xKey?: string;
  yKey?: string;
  xAccessor?: (d: any) => any;
  yAccessor?: (d: any) => any;
  mapping?: DataMapping; // 使用 BaseChart 的 DataMapping
  colors?: string[];
  tooltipFormat?: (data: ProcessedDataPoint) => string;
  onDataClick?: (data: any) => void;
  onHover?: (data: any) => void;
  // LineChart specific properties from old LineChartConfig that are not in BaseChartProps
  strokeWidth?: number;
  curve?: 'linear' | 'monotone' | 'cardinal' | 'basis' | 'step';
  showDots?: boolean;
  dotRadius?: number;
  showArea?: boolean;
  areaOpacity?: number;
  showGrid?: boolean;
  gridOpacity?: number;
  seriesKey?: string; // Added from LineChartConfig
}

// If LineChartConfig is still used, ensure its compatibility with the new structure
// Otherwise, consider removing it
export interface LineChartConfig {
  // ...
}
