/**
 * CandlestickChart - 統一架構的蠟燭圖組件
 * 核心邏輯在 CandlestickChartCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { CandlestickChartCore, CandlestickChartCoreConfig } from './core/candlestick-chart-core';

// 擴展 React props 接口
export interface CandlestickChartProps extends ReactChartWrapperProps, CandlestickChartCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 創建 CandlestickChart 組件
const CandlestickChartComponent = createReactChartWrapper(CandlestickChartCore);

// 導出最終組件
export const CandlestickChart = React.forwardRef<CandlestickChartCore, CandlestickChartProps>((props, ref) => {
  return <CandlestickChartComponent ref={ref} {...props} />;
});

CandlestickChart.displayName = 'CandlestickChart';

// 默認配置
export const defaultCandlestickChartProps: Partial<CandlestickChartProps> = {
  width: 800,
  height: 400,
  margin: { top: 20, right: 60, bottom: 60, left: 60 },
  animate: true,
  animationDuration: 800,
  interactive: true,
  showTooltip: true,
  showGrid: true,
  showVolume: false,
  bullishColor: '#00C851',
  bearishColor: '#FF4444',
  volumeColor: '#6c757d'
};

// 重新導出類型
export type {
  CandlestickChartCoreConfig,
  CandlestickData,
  ProcessedCandlestickDataPoint
} from './core/candlestick-chart-core';