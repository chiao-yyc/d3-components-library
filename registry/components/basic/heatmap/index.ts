
import React from 'react';
import './heatmap.css';
export { Heatmap } from './heatmap';
export type { HeatmapProps, HeatmapDataPoint, ProcessedHeatmapDataPoint, LegendTick } from './types';

export { D3Heatmap } from './core';
export type { HeatmapConfig as D3HeatmapConfig } from './core';

export const CorrelationHeatmap = (props: any) => {
  return React.createElement(Heatmap, { ...props, colorScheme: "reds", showValues: true, domain: [-1, 1] });
};

export const CalendarHeatmap = (props: any) => {
  return React.createElement(Heatmap, { ...props, cellRadius: 2, showLegend: true, animate: true });
};
