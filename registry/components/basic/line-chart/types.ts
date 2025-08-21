
import { HTMLAttributes } from 'react';
import { BaseChartProps } from '../../../../core/base-chart/base-chart'; // 導入 BaseChartProps
import { ProcessedDataPoint as CoreProcessedDataPoint } from '../../../../core/data-processor/types'; // 導入 DataProcessor 的 ProcessedDataPoint
import { BrushZoomConfig, CrosshairConfig } from '../../../../core/base-chart/interaction-utils'; // 導入交互配置類型

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

  // === 交互功能相關 props ===
  
  // 筆刷縮放功能
  enableBrushZoom?: boolean;
  brushZoomConfig?: Partial<BrushZoomConfig>;
  onZoom?: (domain: [any, any]) => void;
  onZoomReset?: () => void;
  
  // 十字游標功能
  enableCrosshair?: boolean;
  crosshairConfig?: Partial<CrosshairConfig>;
  
  // 視覺效果增強
  enableDropShadow?: boolean;
  enableGlowEffect?: boolean;
  glowColor?: string;
  
  // 數據查找配置
  dataAccessor?: (d: any) => any; // 用於十字游標的數據查找
}

// If LineChartConfig is still used, ensure its compatibility with the new structure
// Otherwise, consider removing it
export interface LineChartConfig {
  // ...
}
