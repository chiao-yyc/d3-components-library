
import React from 'react';
import './pie-chart.css';

import { PieChart } from './pie-chart';

// 主要組件 (新架構 - 推薦使用)
export { PieChart, PieChartLegacy } from './pie-chart';
export type { PieChartProps } from './pie-chart';

// 核心系統導出
export { PieChartCore } from './core/pie-chart-core';
export type { 
  PieChartCoreConfig, 
  PieChartData, 
  ProcessedPieDataPoint,
  PieSegment,
  LabelConfig,
  LegendConfig
} from './core/pie-chart-core';

// V2 變體組件 (進階功能)
export { 
  PieChartV2, 
  PieChartWithLegacySupport,
  DonutChartV2,
  PieChartWithLegendV2,
  HalfPieChartV2,
  PieChartNoLabelsV2,
  PieChartSortedV2,
  defaultPieChartProps 
} from './pie-chart-v2';
export type { PieChartV2Props } from './pie-chart-v2';

// 向下兼容：舊版類型定義
export type { PieChartProps as LegacyPieChartProps, LegendItem } from './types';

// 向下兼容：舊版核心（已棄用）
export { D3PieChart } from './core';
export type { PieChartConfig as D3PieChartConfig } from './core';

// 快捷變體組件
export const DonutChart = React.forwardRef<any, any>((props, ref) => {
  return React.createElement(PieChart, { ref, ...props, innerRadius: 60 });
});
DonutChart.displayName = 'DonutChart';
