
import React from 'react';
import './scatter-plot.css';
export { ScatterPlot } from './scatter-plot';
export type { ScatterPlotProps } from './types';

export { D3ScatterPlot } from './core';
export type { ScatterPlotConfig as D3ScatterPlotConfig } from './core';

export const BubbleChart = (props: any) => {
  return React.createElement(ScatterPlot, { ...props, sizeKey: props.sizeKey || 'value', radius: undefined });
};

export const TrendlineScatterPlot = (props: any) => {
  return React.createElement(ScatterPlot, { ...props, showTrendline: true });
};
