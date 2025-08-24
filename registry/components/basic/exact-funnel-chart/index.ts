// 當前穩定版本 - 使用舊架構但已修復
export { ExactFunnelChartComponent as ExactFunnelChart } from './exact-funnel-chart';
export { ExactFunnelChart as D3ExactFunnelChart, type ExactFunnelData, type ExactFunnelConfig } from './exact-funnel';

// 新版本 - 基於 BaseChartCore 架構 (開發中)
export { ExactFunnelChartV2 } from './exact-funnel-chart-v2';
export * from './core';