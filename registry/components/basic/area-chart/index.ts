
import React from 'react';
import './area-chart.css';

// 舊版本 (向下兼容)
export { AreaChart } from './area-chart';
export type { AreaChartProps, SimpleAreaChartData, SimpleAreaChartProps } from './types';
export { D3AreaChart } from './core';
export type { AreaChartConfig as D3AreaChartConfig } from './core';

// 新版本 (推薦使用)
export { 
  AreaChartV2, 
  AreaChartWithLegacySupport,
  StackedAreaChartV2,
  PercentStackedAreaChartV2,
  SmoothAreaChartV2,
  defaultAreaChartProps 
} from './area-chart-v2';
export type { AreaChartV2Props } from './area-chart-v2';
export { AreaChartCore } from './core/area-chart-core';
export type { 
  AreaChartCoreConfig, 
  AreaChartData, 
  ProcessedAreaDataPoint,
  AreaSeriesData,
  StackedDataPoint
} from './core/area-chart-core';

// 舊版本的專用變體組件 (向下兼容)
export const SimpleAreaChart = (props: any) => {
  return React.createElement(AreaChart, { ...props, variant: "simple" });
};

export const StackedAreaChart = (props: any) => {
  return React.createElement(AreaChart, { ...props, variant: "stacked" });
};

export const PercentAreaChart = (props: any) => {
  return React.createElement(AreaChart, { ...props, variant: "percent" });
};
