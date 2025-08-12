// Pure TypeScript types for the core scatter plot logic
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DataMapping {
  x: string | ((d: any) => any);
  y: string | ((d: any) => any);
  size?: string | ((d: any) => any);
  color?: string | ((d: any) => any);
}

export interface ProcessedDataPoint {
  x: number;
  y: number;
  size?: number;
  color?: string;
  originalData: any;
}

export interface ScatterPlotConfig {
  data: any[];

  // Data mapping
  xKey?: string;
  yKey?: string;
  sizeKey?: string;
  colorKey?: string;
  xAccessor?: (d: any) => number;
  yAccessor?: (d: any) => number;
  sizeAccessor?: (d: any) => number;
  colorAccessor?: (d: any) => string;
  mapping?: DataMapping;

  // Dimensions
  width?: number;
  height?: number;
  margin?: Margin;

  // Appearance
  radius?: number;
  minRadius?: number;
  maxRadius?: number;
  sizeRange?: [number, number];
  opacity?: number;
  strokeWidth?: number;
  strokeColor?: string;
  colors?: string[];

  // Trendline
  showTrendline?: boolean;
  trendlineColor?: string;
  trendlineWidth?: number;

  // Behavior
  animate?: boolean;
  animationDuration?: number;
  interactive?: boolean;

  // Tooltip
  showTooltip?: boolean;
  tooltipFormat?: (d: ProcessedDataPoint) => string;

  // Events
  onDataClick?: (d: ProcessedDataPoint) => void;
  onHover?: (d: ProcessedDataPoint | null) => void;
}
