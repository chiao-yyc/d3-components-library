
import React from 'react';
import './heatmap.css';

// 舊版本 (向下兼容)
export { Heatmap } from './heatmap';
export type { HeatmapProps, HeatmapDataPoint, ProcessedHeatmapDataPoint, LegendTick } from './types';
// 導出新的 HeatmapCore 作為 D3Heatmap (BaseChartCore 實現)
export { HeatmapCore as D3Heatmap } from './core/heatmap-core';

// 新版本 (推薦使用)
export { 
  HeatmapV2, 
  HeatmapWithLegacySupport,
  BluesHeatmapV2,
  GreensHeatmapV2,
  RedsHeatmapV2,
  ValueLabelHeatmapV2,
  RoundedHeatmapV2,
  defaultHeatmapProps 
} from './heatmap-v2';
export type { HeatmapV2Props } from './heatmap-v2';
export { HeatmapCore } from './core/heatmap-core';
export type { 
  HeatmapCoreConfig, 
  HeatmapData, 
  HeatmapDataPoint as HeatmapV2DataPoint
} from './core/heatmap-core';

// 舊版本的專用變體組件 (向下兼容)
export const CorrelationHeatmap = (props: any) => {
  return React.createElement(Heatmap, { ...props, colorScheme: "reds", showValues: true, domain: [-1, 1] });
};

export const CalendarHeatmap = (props: any) => {
  return React.createElement(Heatmap, { ...props, cellRadius: 2, showLegend: true, animate: true });
};
