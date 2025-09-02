/**
 * LineChart 統一導出
 * 遵循標準三層架構模式
 */

import React from 'react';
import './line-chart.css';

// 主要組件 (統一架構)
export { 
  LineChart, 
  LineChartLegacy,
  SmoothLineChart,
  SteppedLineChart,
  LineChartWithPoints,
  defaultLineChartProps
} from './line-chart';
export type { LineChartProps } from './line-chart';

// 核心系統導出
export { LineChartCore } from './core/line-chart-core';
export type { 
  LineChartCoreConfig,
  LineChartData,
  ProcessedLineDataPoint,
  LineSeries,
  PointMarkerConfig,
  CurveType
} from './core/line-chart-core';

// 向下兼容：舊版類型定義
export type { LineChartProps as LegacyLineChartProps } from './types';