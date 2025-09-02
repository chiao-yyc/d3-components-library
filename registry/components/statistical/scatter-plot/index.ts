/**
 * ScatterPlot 統一導出
 * 遵循標準三層架構模式
 */

import React from 'react';
import './scatter-plot.css';

// 主要組件 (統一架構)
export { 
  ScatterPlot, 
  ScatterPlotLegacy,
  ScatterPlotWithLegacySupport,
  BubbleChart,
  TrendlineScatterPlot,
  defaultScatterPlotProps
} from './scatter-plot';
export type { ScatterPlotProps } from './scatter-plot';

// 核心系統導出
export { ScatterPlotCore } from './core/scatter-plot-core';
export type { 
  ScatterPlotCoreConfig,
  ScatterPlotData,
  ProcessedScatterDataPoint
} from './core/scatter-plot-core';

// 向下兼容：舊版類型定義
export type { ScatterPlotProps as LegacyScatterPlotProps } from './types';