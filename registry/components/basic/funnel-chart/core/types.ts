// Pure TypeScript types for the core funnel chart logic
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DataMapping {
  label: string | ((d: any) => string);
  value: string | ((d: any) => number);
}

export interface ProcessedFunnelDataPoint {
  label: string;
  value: number;
  percentage: number;
  conversionRate?: number;
  color?: string;
  originalData: any;
  index: number;
}

export interface FunnelSegment {
  label: string;
  value: number;
  percentage: number;
  conversionRate: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  path: string;
  index: number;
}

export interface FunnelChartConfig {
  data: any[];

  // Data mapping
  labelKey?: string;
  valueKey?: string;
  labelAccessor?: (d: any) => string;
  valueAccessor?: (d: any) => number;
  mapping?: DataMapping;

  // Dimensions
  width?: number;
  height?: number;
  margin?: Margin;

  // Funnel styles
  direction?: 'top' | 'bottom' | 'left' | 'right';
  shape?: 'trapezoid' | 'rectangle' | 'curved';
  gap?: number;
  cornerRadius?: number;
  proportionalMode?: 'traditional' | 'height' | 'area' | 'consistent';

  // Consistent shrinkage mode specific settings
  shrinkageType?: 'fixed' | 'percentage' | 'data-driven';
  shrinkageAmount?: number;
  minWidth?: number;

  // Colors
  colors?: string[];
  colorScheme?: 'custom' | 'blues' | 'greens' | 'oranges' | 'reds' | 'purples';

  // Labels and text
  showLabels?: boolean;
  showValues?: boolean;
  showPercentages?: boolean;
  showConversionRates?: boolean;
  labelPosition?: 'inside' | 'outside' | 'side';
  valueFormat?: (value: number) => string;
  percentageFormat?: (percentage: number) => string;
  conversionRateFormat?: (rate: number) => string;
  fontSize?: number;
  fontFamily?: string;

  // Animation
  animate?: boolean;
  animationDuration?: number;
  animationDelay?: number;
  animationEasing?: string;

  // Interaction
  interactive?: boolean;
  showTooltip?: boolean;
  tooltipFormat?: (data: ProcessedFunnelDataPoint) => string;

  // Events
  onSegmentClick?: (data: ProcessedFunnelDataPoint) => void;
  onSegmentHover?: (data: ProcessedFunnelDataPoint | null) => void;
}
