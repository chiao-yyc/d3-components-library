/**
 * Performance optimization exports
 * 性能優化模組統一導出
 */

export { CanvasFallbackCore } from './canvas-fallback-core';
export type { 
  CanvasFallbackConfig, 
  PerformanceMetrics, 
  CanvasRenderContext 
} from './canvas-fallback-core';

// 性能工具函數
export * from './performance-utils';