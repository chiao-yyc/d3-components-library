import { BaseChartProps, Margin } from '../../../core/base-chart/types';

// Observable FunnelChart 專用的數據格式
export interface ObservableFunnelDataPoint {
  step: number;
  value: number;
  label: string;
}

// 繼承 BaseChart 的配置
export interface ObservableFunnelChartConfig extends BaseChartProps {
  data: ObservableFunnelDataPoint[];
  
  // 數據欄位映射 (用於 DataProcessor)
  stepKey?: string;
  valueKey?: string;
  labelKey?: string;
  
  // 尺寸設置
  width?: number;
  height?: number;
  margin?: Margin;
  
  // 顏色設置
  colors?: string[];
  background?: string;
  
  // 標籤顏色 (向下兼容)
  valueColor?: string;
  labelColor?: string;
  percentageColor?: string;
  
  // 文字顯示控制
  showValues?: boolean;
  showLabels?: boolean;
  showPercentages?: boolean;
  
  // 字體設置
  valueFont?: string;
  labelFont?: string;
  percentageFont?: string;
  
  // 動畫設置
  animate?: boolean;
  animationDuration?: number;
  
  // 互動設置
  interactive?: boolean;
  onStepClick?: (step: ObservableFunnelDataPoint, event: Event) => void;
  onStepHover?: (step: ObservableFunnelDataPoint | null, event?: Event) => void;
}

// 處理後的數據點
export interface ProcessedObservableFunnelDataPoint extends ObservableFunnelDataPoint {
  percentage: number;
  x: number;
  y: number;
  pathPoints: [number, number][];
  originalData?: any; // 保留原始數據
}