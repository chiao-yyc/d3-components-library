
import React from 'react';
import './funnel-chart.css';

// 統一架構版本 (主要導出)
export { FunnelChart, FunnelChartV2 } from './funnel-chart';

// 核心邏輯（新架構）
export { FunnelChartCore } from './core/funnel-chart-core';
export type { FunnelChartCoreConfig } from './core/funnel-chart-core';

// 舊版類型定義（向下兼容）
export type { FunnelChartProps, FunnelChartDataPoint, ProcessedFunnelDataPoint, FunnelSegment } from './types';

export const TrapezoidFunnelChart = (props: any) => {
  return React.createElement(FunnelChart, { ...props, shape: "trapezoid" });
};

export const RectangleFunnelChart = (props: any) => {
  return React.createElement(FunnelChart, { ...props, shape: "rectangle" });
};

export const CurvedFunnelChart = (props: any) => {
  return React.createElement(FunnelChart, { ...props, shape: "curved" });
};
