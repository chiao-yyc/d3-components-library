
import React from 'react';
import './area-chart.css';
export { AreaChart } from './area-chart';
export type { AreaChartProps, SimpleAreaChartData, SimpleAreaChartProps } from './types';

export { D3AreaChart } from './core';
export type { AreaChartConfig as D3AreaChartConfig } from './core';

export const SimpleAreaChart = (props: any) => {
  return React.createElement(AreaChart, { ...props, variant: "simple" });
};

export const StackedAreaChart = (props: any) => {
  return React.createElement(AreaChart, { ...props, variant: "stacked" });
};

export const PercentAreaChart = (props: any) => {
  return React.createElement(AreaChart, { ...props, variant: "percent" });
};
