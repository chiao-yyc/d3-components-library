
// Pure TypeScript types for the core line chart logic
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DataMapping {
  x: string | ((d: unknown) => unknown);
  y: string | ((d: unknown) => unknown);
  series?: string | ((d: unknown) => unknown);
}

export interface ProcessedDataPoint {
  x: unknown;
  y: number;
  originalData: unknown;
}

export interface LineChartConfig {
  data: unknown[];

  // 數據映射配置 (推薦)
  mapping?: DataMapping;

  // 向下兼容的廢棄屬性 - Key-based 模式
  /** @deprecated 請使用 mapping.x 替代。將在 v1.0.0 版本中移除。 */
  xKey?: string;
  /** @deprecated 請使用 mapping.y 替代。將在 v1.0.0 版本中移除。 */
  yKey?: string;
  /** @deprecated 請使用 mapping.series 替代。將在 v1.0.0 版本中移除。 */
  seriesKey?: string;
  
  // 向下兼容的廢棄屬性 - Accessor-based 模式
  /** @deprecated 請使用 mapping.x 替代。將在 v1.0.0 版本中移除。 */
  xAccessor?: (d: unknown) => unknown;
  /** @deprecated 請使用 mapping.y 替代。將在 v1.0.0 版本中移除。 */
  yAccessor?: (d: unknown) => unknown;

  // Dimensions
  width?: number;
  height?: number;
  margin?: Margin;

  // Appearance
  colors?: string[];
  strokeWidth?: number;
  curve?: 'linear' | 'monotone' | 'cardinal' | 'basis' | 'step';
  showDots?: boolean;
  dotRadius?: number;
  showArea?: boolean;
  areaOpacity?: number;
  showGrid?: boolean;
  gridOpacity?: number;

  // Behavior
  animate?: boolean;
  animationDuration?: number;
  interactive?: boolean;

  // Tooltip
  showTooltip?: boolean;
  tooltipFormat?: (data: ProcessedDataPoint) => string;

  // Events
  onDataClick?: (data: unknown) => void;
  onHover?: (data: unknown) => void;
}
