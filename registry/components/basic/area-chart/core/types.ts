// Pure TypeScript types for the core area chart logic
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DataMapping {
  x: string | ((d: any) => any);
  y: string | ((d: any) => any);
  category?: string | ((d: any) => any);
}

export interface ProcessedAreaDataPoint {
  x: Date | number | string;
  y: number;
  category?: string;
  originalData?: any;
  index: number;
  y0?: number;
  y1?: number;
}

export interface AreaSeriesData {
  key: string;
  values: ProcessedAreaDataPoint[];
  color?: string;
}

export interface AreaChartConfig {
  data: any[];

  // Data mapping
  xKey?: string;
  yKey?: string;
  categoryKey?: string;
  xAccessor?: (d: any) => Date | number | string;
  yAccessor?: (d: any) => number;
  categoryAccessor?: (d: any) => string;
  mapping?: DataMapping;

  // Dimensions
  width?: number;
  height?: number;
  margin?: Margin;

  // Appearance
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

  // Behavior
  animate?: boolean;
  animationDuration?: number;
  interactive?: boolean;

  // Tooltip
  showTooltip?: boolean;
  tooltipFormat?: (d: ProcessedAreaDataPoint, series?: string) => string;

  // Events
  onDataClick?: (d: ProcessedAreaDataPoint, series?: string) => void;
  onDataHover?: (d: ProcessedAreaDataPoint | null, series?: string) => void;
}
