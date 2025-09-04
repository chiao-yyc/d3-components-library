/**
 * @deprecated 舊版本類型定義 (兼容層)
 * 
 * ⚠️  這些類型僅為向下兼容而存在，請遷移至新版本類型
 * 
 * 新版本類型：
 * import type { ComboSeries, MultiSeriesComboChartV2Props } from './multi-series-combo-chart-v2'
 */

import type { ComboSeries, MultiSeriesComboChartV2Props } from './multi-series-combo-chart-v2';

// 舊版本數據類型
export interface ComboChartData {
  [key: string]: any;
}

// 舊版本 Props 類型
export interface ComboChartProps extends Partial<MultiSeriesComboChartV2Props> {
  data?: ComboChartData[];
}

// 舊版本增強組合圖表 Props
export interface EnhancedComboChartProps extends ComboChartProps {
  children?: React.ReactNode;
  series?: any[];
}

// 舊版本系列配置 (映射到新版本)
export interface ComboChartSeries {
  name: string;
  type: 'bar' | 'line' | 'area' | 'scatter';
  yKey?: string;
  dataKey?: string; // 向下兼容
  yAxis?: 'left' | 'right';
  color?: string;
  visible?: boolean;
}

// 舊版本增強數據類型
export interface EnhancedComboData {
  [key: string]: any;
}

// 重新導出新版本類型以保持一致性
export type { ComboSeries, MultiSeriesComboChartV2Props };

// 兼容性映射
export type ComboSeriesNew = ComboSeries;
export type EnhancedComboChartPropsNew = MultiSeriesComboChartV2Props;