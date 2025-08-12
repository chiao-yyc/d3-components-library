
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

  // Data mapping
  xKey?: string;
  yKey?: string;
  seriesKey?: string;
  xAccessor?: (d: any) => any;
  yAccessor?: (d: any) => any;
  mapping?: DataMapping;

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
