
import React from 'react';
import './heatmap.css';

// 主要導出（統一版本）
export { 
  Heatmap, 
  HeatmapWithLegacySupport,
  BluesHeatmap,
  GreensHeatmap,
  RedsHeatmap,
  ValueLabelHeatmap,
  RoundedHeatmap,
  defaultHeatmapProps 
} from './heatmap';
export type { HeatmapProps, HeatmapPropsLegacy } from './heatmap';

// 核心實現導出
export { HeatmapCore } from './core/heatmap-core';
export type { 
  HeatmapCoreConfig, 
  HeatmapData, 
  HeatmapDataPoint
} from './core/heatmap-core';

// 向下兼容類型（舊版本支持）
export type { HeatmapDataPoint as OldHeatmapDataPoint, ProcessedHeatmapDataPoint, LegendTick } from './types';

// 舊版本的專用變體組件 (向下兼容)
export const CorrelationHeatmap = (props: any) => {
  return React.createElement(Heatmap, { ...props, colorScheme: "reds", showValues: true, domain: [-1, 1] });
};

export const CalendarHeatmap = (props: any) => {
  return React.createElement(Heatmap, { ...props, cellRadius: 2, showLegend: true, animate: true });
};
