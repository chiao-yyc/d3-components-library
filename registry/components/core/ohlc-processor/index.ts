// 優先導出核心模組（框架無關）
export * from './core';

// React hooks 層（依賴 React）
export * from './use-ohlc-processor';

// 向下兼容：直接導出核心功能
export * from './core/ohlc-processor';
export * from './core/types';