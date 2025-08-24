
// Pure TypeScript types for the core line chart logic
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DataMapping {
  x: string | ((d: any) => any);
  y: string | ((d: any) => any);
  series?: string | ((d: any) => any);
}

export interface ProcessedDataPoint {
  x: any;
  y: number;
  originalData: any;
}

export interface LineChartConfig {
  data: any[];

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
  xAccessor?: (d: any) => any;
  /** @deprecated 請使用 mapping.y 替代。將在 v1.0.0 版本中移除。 */
  yAccessor?: (d: any) => any;

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
  onDataClick?: (data: any) => void;
  onHover?: (data: any) => void;
}
