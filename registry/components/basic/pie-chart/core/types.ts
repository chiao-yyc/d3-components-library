// Pure TypeScript types for the core pie chart logic
import { BaseChartProps } from '../../../core/base-chart/base-chart';
import { ProcessedDataPoint as CoreProcessedDataPoint } from '../../../core/data-processor/types';

export type { Margin, DataMapping } from '../../../core/base-chart/types';

export interface ProcessedPieDataPoint extends CoreProcessedDataPoint {
  label: string;
  value: number;
  color?: string;
  percentage: number;
  startAngle: number;
  endAngle: number;
}

export interface PieChartProps extends BaseChartProps {
  // PieChart 特有的屬性
  labelKey?: string;
  valueKey?: string;
  colorKey?: string;
  labelAccessor?: (d: unknown) => string;
  valueAccessor?: (d: unknown) => number;
  colorAccessor?: (d: unknown) => string;
  mapping?: DataMapping;

  // Pie 特定樣式
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

  // Animation
  animationType?: 'fade' | 'scale' | 'rotate' | 'sweep';
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';

  // Tooltip
  tooltipFormat?: (d: ProcessedPieDataPoint) => string;

  // Events - 標準事件命名
  onDataClick?: (d: ProcessedPieDataPoint) => void;
  onDataHover?: (d: ProcessedPieDataPoint | null) => void;
  
  // 向下兼容的廢棄事件
  /** @deprecated 請使用 onDataClick 替代 */
  onSliceClick?: (d: ProcessedPieDataPoint) => void;
  /** @deprecated 請使用 onDataHover 替代 */
  onSliceHover?: (d: ProcessedPieDataPoint | null) => void;
}

// 保持向下兼容的類型別名
export type PieChartConfig = PieChartProps;
