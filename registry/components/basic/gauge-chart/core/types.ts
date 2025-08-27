// Pure TypeScript types for the core gauge chart logic
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface GaugeChartDataPoint {
  [key: string]: any;
}

export interface ProcessedGaugeDataPoint {
  value: number;
  label?: string;
  originalData: GaugeChartDataPoint;
}

export interface GaugeZone {
  min: number;
  max: number;
  color: string;
  label?: string;
}

export interface TickData {
  value: number;
  angle: number;
  label: string;
}

export interface GaugeChartConfig {
  data?: GaugeChartDataPoint[];
  value?: number;
  min?: number;
  max?: number;
  valueKey?: string;
  labelKey?: string;
  valueAccessor?: (d: GaugeChartDataPoint) => number;
  labelAccessor?: (d: GaugeChartDataPoint) => string;
  mapping?: {
    value: string | ((d: GaugeChartDataPoint) => number);
    label?: string | ((d: GaugeChartDataPoint) => string);
  };

  // Dimensions
  width?: number;
  height?: number;
  margin?: Margin;

  // Gauge appearance
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  cornerRadius?: number;

  // Colors and styles
  backgroundColor?: string;
  foregroundColor?: string;
  colors?: string[];
  zones?: GaugeZone[];
  needleColor?: string;
  needleWidth?: number;
  centerCircleRadius?: number;
  centerCircleColor?: string;

  // Labels and text
  showValue?: boolean;
  showLabel?: boolean;
  showTicks?: boolean;
  showMinMax?: boolean;
  tickCount?: number;
  valueFormat?: (value: number) => string;
  labelFormat?: (label: string) => string;
  tickFormat?: (value: number) => string;
  fontSize?: number;
  fontFamily?: string;

  // Animation
  animate?: boolean;
  animationDuration?: number;
  animationEasing?: string;

  // Interaction
  interactive?: boolean;
  showTooltip?: boolean;
  tooltipFormat?: (value: number, label?: string) => string;

  // Events - 標準事件命名
  onDataClick?: (value: number, label?: string) => void;
  onDataHover?: (value: number | null, label?: string) => void;
  onError?: (error: Error) => void;
  
  // 向下兼容的廢棄事件
  /** @deprecated 請使用 onDataClick 替代 */
  onValueChange?: (value: number) => void;
}
