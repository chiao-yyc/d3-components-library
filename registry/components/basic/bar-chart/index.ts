/**
 * BarChart 統一導出
 * 遵循標準三層架構模式
 */

import React from 'react';
import './bar-chart.css';

// 主要組件 (統一架構)
export { 
  BarChart, 
  BarChartLegacy,
  HorizontalBarChart,
  StackedBarChart,
  defaultBarChartProps
} from './bar-chart';
export type { BarChartProps } from './bar-chart';

// 核心系統導出
export { BarChartCore } from './core/bar-chart-core';
export type { 
  BarChartCoreConfig
} from './core/bar-chart-core';

// 向下兼容：舊版類型定義
export type { BarChartProps as LegacyBarChartProps } from './types';