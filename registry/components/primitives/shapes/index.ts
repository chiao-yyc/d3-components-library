// 優先導出核心模組（框架無關）
export * from './core';

// React 組件（依賴 React + D3 + DOM）
export { Bar } from './bar';
export { Line } from './line';
export { Area } from './area';
export { StackedArea } from './stacked-area';
export { Scatter } from './scatter';
export { RegressionLine } from './regression-line';
export { Waterfall } from './waterfall';

// 組合器系統
export { ShapeComposer } from './shape-composer';

// 向下兼容：直接導出類型定義
export * from './core/types';

