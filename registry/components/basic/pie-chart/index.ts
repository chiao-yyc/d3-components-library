/**
 * PieChart 統一導出
 * 遵循標準三層架構模式
 */

import React from 'react';
import './pie-chart.css';
import {
  DonutChart as DonutChartComponent,
} from './pie-chart';

// 主要組件 (統一架構)
export {
  PieChart,
  PieChartLegacy,
  DonutChart,
  PieChartWithLegend,
  HalfPieChart,
  PieChartNoLabels,
  PieChartSorted,
  defaultPieChartProps
} from './pie-chart';
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

// 向下兼容：舊版類型定義
export type { PieChartProps as LegacyPieChartProps, LegendItem } from './types';

// 快捷變體組件（已整合到主檔案）
export const DonutChartLegacy = React.forwardRef<unknown, any>((props: any, ref) => {
  return React.createElement(DonutChartComponent, { ref, ...props });
});
DonutChartLegacy.displayName = 'DonutChartLegacy';