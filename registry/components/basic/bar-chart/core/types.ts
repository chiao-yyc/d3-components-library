
// Pure TypeScript types for the core chart logic
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DataMapping {
  x: string | ((d: any) => any);
  y: string | ((d: any) => any);
  color?: string | ((d: any) => any);
}

export interface ProcessedDataPoint {
  x: any;
  y: number;
  originalData: any;
  index: number;
}

export interface BarChartConfig {
  data: any[];
  
  // Data mapping
  xKey?: string;
  yKey?: string;
  xAccessor?: (d: any) => any;
  yAccessor?: (d: any) => any;
  mapping?: DataMapping;
  
  // Dimensions
  width?: number;
  height?: number;
  margin?: Margin;
  
  // Appearance
  orientation?: 'vertical' | 'horizontal';
  colors?: string[];
  
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
