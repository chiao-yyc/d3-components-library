// 從 funnel-chart-core 導出 (優先使用這些類型)
export {
  FunnelChartCore,
  type FunnelChartData,
  type FunnelDataPoint,
  type FunnelSegment,
  type FunnelChartCoreConfig
} from './funnel-chart-core';

// 從 types 導出舊版類型 (向下兼容，不包括與 core 衝突的名稱)
export type {
  Margin,
  DataMapping,
  ProcessedFunnelDataPoint,
  FunnelChartConfig
} from './types';
