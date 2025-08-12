// Pure TypeScript types for the core pie chart logic
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DataMapping {
  label: string | ((d: any) => string);
  value: string | ((d: any) => number);
  color?: string | ((d: any) => string);
}

export interface ProcessedPieDataPoint {
  label: string;
  value: number;
  color?: string;
  originalData?: any;
  percentage: number;
  startAngle: number;
  endAngle: number;
  index: number;
}

export interface PieChartConfig {
  data: any[];

  // Data mapping
  labelKey?: string;
  valueKey?: string;
  colorKey?: string;
  labelAccessor?: (d: any) => string;
  valueAccessor?: (d: any) => number;
  colorAccessor?: (d: any) => string;
  mapping?: DataMapping;

  // Dimensions
  width?: number;
  height?: number;
  margin?: Margin;

  // Appearance
  innerRadius?: number;
  outerRadius?: number;
  cornerRadius?: number;
  padAngle?: number;
  colors?: string[];
  colorScheme?: 'category10' | 'set3' | 'pastel' | 'dark' | 'custom';
  showLabels?: boolean;
  showPercentages?: boolean;
  labelThreshold?: number;
  labelFormat?: (d: ProcessedPieDataPoint) => string;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  legendFormat?: (d: ProcessedPieDataPoint) => string;
  showCenterText?: boolean;
  centerTextFormat?: (total: number, data: ProcessedPieDataPoint[]) => { total: string; label: string };

  // Behavior
  animate?: boolean;
  animationDuration?: number;
  animationType?: 'fade' | 'scale' | 'rotate' | 'sweep';
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
  interactive?: boolean;

  // Tooltip
  showTooltip?: boolean;
  tooltipFormat?: (d: ProcessedPieDataPoint) => string;

  // Events
  onSliceClick?: (d: ProcessedPieDataPoint) => void;
  onSliceHover?: (d: ProcessedPieDataPoint | null) => void;
}
