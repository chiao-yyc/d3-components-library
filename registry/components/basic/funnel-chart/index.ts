
import React from 'react';
import './funnel-chart.css';
export { FunnelChart } from './funnel-chart';
export type { FunnelChartProps, FunnelChartDataPoint, ProcessedFunnelDataPoint, FunnelSegment } from './types';

export { D3FunnelChart } from './core';
export type { FunnelChartConfig as D3FunnelChartConfig } from './core';

export const TrapezoidFunnelChart = (props: any) => {
  return React.createElement(FunnelChart, { ...props, shape: "trapezoid" });
};

export const RectangleFunnelChart = (props: any) => {
  return React.createElement(FunnelChart, { ...props, shape: "rectangle" });
};

export const CurvedFunnelChart = (props: any) => {
  return React.createElement(FunnelChart, { ...props, shape: "curved" });
};
