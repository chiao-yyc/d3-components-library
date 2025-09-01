/**
 * CandlestickChart V2 - 使用新的 BaseChartCore 架構
 * 採用統一軸線系統和框架無關設計
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { CandlestickChartCore, CandlestickChartCoreConfig } from './core/candlestick-chart-core';

// 擴展 React props 接口
export interface CandlestickChartV2Props extends ReactChartWrapperProps, CandlestickChartCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 創建 CandlestickChart 組件
const CandlestickChartComponent = createReactChartWrapper(CandlestickChartCore);

// 導出最終組件
export const CandlestickChartV2 = React.forwardRef<CandlestickChartCore, CandlestickChartV2Props>((props, ref) => {
  return <CandlestickChartComponent ref={ref} {...props} />;
});

CandlestickChartV2.displayName = 'CandlestickChartV2';

// 默認配置 (使用函數形式以避免 HMR 問題)
const getDefaultCandlestickChartProps = (): Partial<CandlestickChartV2Props> => ({
  width: 800,
  height: 600,
  margin: { top: 20, right: 60, bottom: 60, left: 60 },
  
  // 蠟燭圖配置默認值
  candleWidth: 0.8,
  wickWidth: 1,
  colorMode: 'tw',
  
  // 成交量配置默認值
  showVolume: true,
  volumeHeightRatio: 0.25,
  volumeOpacity: 0.6,
  
  // 軸線配置默認值
  showXAxis: true,
  showYAxis: true,
  showGrid: true,
  
  // 交互配置默認值
  enableZoom: false,
  enablePan: false,
  showCrosshair: false,
  
  // 動畫配置默認值
  animate: true,
  animationDuration: 1000,
  animationDelay: 100,
  
  // 默認顏色 (台股模式)
  upColor: '#ef4444',    // 紅色上漲
  downColor: '#22c55e',  // 綠色下跌
  dojiColor: '#6b7280',  // 灰色十字星
});

// 默認匯出
export default CandlestickChartV2;

// 重新導出類型
export type { 
  CandlestickChartCoreConfig, 
  CandlestickData,
  ProcessedCandlestickDataPoint
} from './core/candlestick-chart-core';