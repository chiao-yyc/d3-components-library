
import React from 'react';
import './pie-chart.css';
export { PieChart } from './pie-chart';
export type { PieChartProps, LegendItem } from './types';

export { D3PieChart } from './core';
export type { PieChartConfig as D3PieChartConfig } from './core';

export const DonutChart = (props: any) => {
  return React.createElement(PieChart, { ...props, innerRadius: 60 });
};
