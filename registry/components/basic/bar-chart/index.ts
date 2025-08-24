
// 舊版 BarChart（向下兼容）
export { BarChart } from './bar-chart';

// 新版現代化 BarChart
export { ModernBarChart, BarChartV2 } from './modern-bar-chart';

// 類型定義
export type { BarChartProps } from './types';
export type { ModernBarChartProps } from './modern-bar-chart-types';

// 核心類
export { BarChartCore } from './core/bar-chart-core';
export type { BarChartCoreConfig } from './core/bar-chart-core';

// 舊版核心邏輯（向下兼容）
export { D3BarChart } from './core';
export type { BarChartConfig as D3BarChartConfig } from './core';
