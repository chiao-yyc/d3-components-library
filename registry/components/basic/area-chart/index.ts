/**
 * AreaChart 統一導出
 * 遵循標準三層架構模式
 */

import './area-chart.css';

// 主要組件 (統一架構)
export { 
  AreaChart, 
  AreaChartLegacy,
  StackedAreaChart,
  StreamgraphChart,
  defaultAreaChartProps
} from './area-chart';
export type { AreaChartProps } from './area-chart';

// 核心系統導出
export { AreaChartCore } from './core/area-chart-core';
export type { 
  AreaChartCoreConfig,
  AreaChartData,
  ProcessedAreaDataPoint,
  AreaSeries,
  StackMode
} from './core/area-chart-core';

// 向下兼容：舊版類型定義
export type { AreaChartProps as LegacyAreaChartProps, SimpleAreaChartData, SimpleAreaChartProps } from './types';