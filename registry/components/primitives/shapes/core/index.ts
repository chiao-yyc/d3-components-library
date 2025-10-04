/**
 * Shapes Core Module
 * 圖形元件核心模組
 *
 * 提供框架無關的圖形組件類型定義和核心功能
 * 包含 Bar、Line、Area、Scatter 等基礎圖形的接口和常數
 */

// 框架無關的核心實現
export * from './bar-core';
export * from './line-core';
export * from './area-core';
export * from './scatter-core';
export * from './shape-composer';

// 統一的現代類型定義 (推薦使用)
export * from './unified-types';

// 向下兼容的舊類型定義 (逐步廢棄)
// Note: Commented out to avoid duplicate exports with unified-types
// If needed, import specific types that don't conflict
// export * from './types';

// Explicitly re-export types from unified-types to resolve ambiguity
export type {
  AreaShapeData,
  BarShapeData,
  LineShapeData,
  RegressionData,
  ScatterShapeData,
  StackedAreaData,
  StackedAreaSeries,
  WaterfallShapeData
} from './unified-types';