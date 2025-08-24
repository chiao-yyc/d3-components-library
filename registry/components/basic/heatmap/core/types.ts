// Pure TypeScript types for the core heatmap logic
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DataMapping {
  x: string | ((d: any) => string | number);
  y: string | ((d: any) => string | number);
  value: string | ((d: any) => number);
}

export interface ProcessedHeatmapDataPoint {
  x: string;
  y: string;
  value: number;
  originalData?: any;
  xIndex: number;
  yIndex: number;
  normalizedValue: number;
}

export interface HeatmapConfig {
  data: any[];

  // Data mapping
  xKey?: string;
  yKey?: string;
  valueKey?: string;
  xAccessor?: (d: any) => string | number;
  yAccessor?: (d: any) => string | number;
  valueAccessor?: (d: any) => number;
  mapping?: DataMapping;

  // Dimensions
  width?: number;
  height?: number;
  margin?: Margin;

  // Heatmap specific settings
  cellPadding?: number;
  cellRadius?: number;

  // Color mapping
  colorScheme?: 'blues' | 'greens' | 'reds' | 'oranges' | 'purples' | 'greys' | 'custom';
  colors?: string[];
  domain?: [number, number];

  // Axes
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisFormat?: (d: any) => string;
  yAxisFormat?: (d: any) => string;
  xAxisRotation?: number;
  yAxisRotation?: number;

  // Legend
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  legendTitle?: string;
  legendFormat?: (d: number) => string;

  // Labels
  showValues?: boolean;
  valueFormat?: (d: number) => string;
  textColor?: string | ((value: number, normalizedValue: number) => string);

  // Behavior
  interactive?: boolean;
  animate?: boolean;
  animationDuration?: number;

  // Tooltip
  showTooltip?: boolean;
  tooltipFormat?: (d: ProcessedHeatmapDataPoint) => string;

  // Events
  // 標準事件命名
  onDataClick?: (d: ProcessedHeatmapDataPoint) => void;
  onDataHover?: (d: ProcessedHeatmapDataPoint | null) => void;
  
  // 向下兼容的廢棄事件
  /** @deprecated 請使用 onDataClick 替代 */
  onCellClick?: (d: ProcessedHeatmapDataPoint) => void;
  /** @deprecated 請使用 onDataHover 替代 */
  onCellHover?: (d: ProcessedHeatmapDataPoint | null) => void;
}
