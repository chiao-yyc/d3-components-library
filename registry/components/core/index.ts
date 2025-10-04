export * from './base-chart';
export * from './data-processor';
export * from './color-scheme';
export * from './ohlc-processor';
export * from './d3-utils';
export * from './data-utils';
export * from './test-utils';

// Export types to avoid duplication warnings
// Note: ChartDimensions is re-exported from both base-chart and types
export * from './types';

// Export color-system but explicitly re-export ColorScale from color-scheme to avoid ambiguity
export * from './color-system';
// Prefer ColorScale from color-scheme
export type { ColorScale } from './color-scheme';