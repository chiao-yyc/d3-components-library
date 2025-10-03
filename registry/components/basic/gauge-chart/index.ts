
import React from 'react';
import './gauge-chart.css';
export { GaugeChart, defaultGaugeChartProps } from './gauge-chart';
export type { GaugeChartProps, GaugeChartDataPoint, ProcessedGaugeDataPoint, GaugeZone } from './types';

export { D3GaugeChart } from './core';
export type { GaugeChartConfig as D3GaugeChartConfig } from './core';
export { GaugeChartCore } from './core/gauge-chart-core';
export type {
  GaugeChartCoreConfig,
  GaugeChartData
} from './core/gauge-chart-core';

// 變體組件需要在 index.ts 內部定義
import { GaugeChart } from './gauge-chart';

export const MultiZoneGaugeChart = (props: any) => {
  return React.createElement(GaugeChart, { ...props, zones: props.zones || [{min:0,max:30,color:'red'},{min:30,max:70,color:'yellow'},{min:70,max:100,color:'green'}] });
};

export const AnimatedGaugeChart = (props: any) => {
  return React.createElement(GaugeChart, { ...props, animate: true });
};
