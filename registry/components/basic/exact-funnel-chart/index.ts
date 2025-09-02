// 統一架構版本 (主要導出)
export { ExactFunnelChart, ExactFunnelChartV2 } from './exact-funnel-chart';
export type { ExactFunnelChartProps } from './exact-funnel-chart';

// 核心實現導出
export * from './core';

// 向下兼容：舊版本類型和實現
export { ExactFunnelChart as D3ExactFunnelChart, type ExactFunnelData, type ExactFunnelConfig } from './exact-funnel';