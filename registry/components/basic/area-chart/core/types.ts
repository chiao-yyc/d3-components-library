// Pure TypeScript types for the core area chart logic
import { BaseChartProps } from '../../../core/base-chart/base-chart';
import { ProcessedDataPoint as CoreProcessedDataPoint } from '../../../core/data-processor/types';
import { BrushZoomConfig, CrosshairConfig } from '../../../core/base-chart/interaction-utils';

import type { Margin, DataMapping } from '../../../core/base-chart/types';

export interface ProcessedAreaDataPoint extends CoreProcessedDataPoint {
  category?: string;
  y0?: number;
  y1?: number;
}

export interface AreaSeriesData {
  key: string;
  values: ProcessedAreaDataPoint[];
  color?: string;
}

export interface AreaChartProps extends BaseChartProps {
  // AreaChart 特有的屬性
  
  // 數據映射配置 (推薦)
  mapping?: DataMapping;
  
  // 向下兼容的廢棄屬性 - Key-based 模式
  /** @deprecated 請使用 mapping.x 替代。將在 v1.0.0 版本中移除。 */
  xKey?: string;
  /** @deprecated 請使用 mapping.y 替代。將在 v1.0.0 版本中移除。 */
  yKey?: string;
  /** @deprecated 請使用 mapping.category 替代。將在 v1.0.0 版本中移除。 */
  categoryKey?: string;
  
  // 向下兼容的廢棄屬性 - Accessor-based 模式
  /** @deprecated 請使用 mapping.x 替代。將在 v1.0.0 版本中移除。 */
  xAccessor?: (d: unknown) => Date | number | string;
  /** @deprecated 請使用 mapping.y 替代。將在 v1.0.0 版本中移除。 */
  yAccessor?: (d: unknown) => number;
  /** @deprecated 請使用 mapping.category 替代。將在 v1.0.0 版本中移除。 */
  categoryAccessor?: (d: unknown) => string;
  
  // Area 特定樣式
  curve?: 'linear' | 'monotone' | 'cardinal' | 'basis' | 'step';
  stackMode?: 'none' | 'stack' | 'percent';
  fillOpacity?: number;
  strokeWidth?: number;
  colors?: string[];
  colorScheme?: 'category10' | 'set3' | 'pastel' | 'dark' | 'custom';
  gradient?: boolean;
  showGrid?: boolean;
  showDots?: boolean;
  dotRadius?: number;
  
  // Axis
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisFormat?: (d: unknown) => string;
  yAxisFormat?: (d: unknown) => string;
  
  // Legend
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  
  // Interactive
  interactive?: boolean;
  
  // Tooltip
  tooltipFormat?: (d: ProcessedAreaDataPoint, series?: string) => string;
  
  // Events
  onDataClick?: (d: ProcessedAreaDataPoint, series?: string) => void;
  onDataHover?: (d: ProcessedAreaDataPoint | null, series?: string) => void;
  
  // === 交互功能相關 props ===
  
  // 筆刷縮放功能
  enableBrushZoom?: boolean;
  brushZoomConfig?: Partial<BrushZoomConfig>;
  onZoom?: (domain: [unknown, unknown]) => void;
  onZoomReset?: () => void;
  
  // 十字游標功能
  enableCrosshair?: boolean;
  crosshairConfig?: Partial<CrosshairConfig>;
  
  // 視覺效果增強
  enableDropShadow?: boolean;
  enableGlowEffect?: boolean;
  glowColor?: string;
  
  // 數據查找配置
  dataAccessor?: (d: unknown) => unknown; // 用於十字游標的數據查找
}
