/**
 * Correlogram V2 - 使用新的 BaseChartCore 架構
 * 採用統一軸線系統和框架無關設計
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { CorrelogramCore, CorrelogramCoreConfig } from './core/correlogram-core';

// 擴展 React props 接口
export interface CorrelogramV2Props extends ReactChartWrapperProps, CorrelogramCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 創建 Correlogram 組件
const CorrelogramComponent = createReactChartWrapper(CorrelogramCore);

// 導出最終組件
export const CorrelogramV2 = React.forwardRef<CorrelogramCore, CorrelogramV2Props>((props, ref) => {
  return <CorrelogramComponent ref={ref} {...props} />;
});

CorrelogramV2.displayName = 'CorrelogramV2';

// 默認配置 (使用函數形式以避免 HMR 問題)
const getDefaultCorrelogramProps = (): Partial<CorrelogramV2Props> => ({
  width: 600,
  height: 600,
  margin: { top: 50, right: 80, bottom: 80, left: 80 },
  
  // Correlogram 配置默認值
  visualizationType: 'circle',
  colorScheme: 'diverging',
  showLabels: true,
  showValues: false,
  cellPadding: 0.1,
  
  // 傳統三角區域配置
  showUpperTriangle: true,
  showLowerTriangle: true,
  showDiagonal: true,
  upperTriangleType: 'visual',  // 上三角顯示圓點
  lowerTriangleType: 'text',    // 下三角顯示數值
  
  // 圓形和方形樣式
  minRadius: 1,
  maxRadius: 25,
  strokeWidth: 1,
  strokeColor: '#333',
  
  // 顏色映射
  colorRange: [-1, 1],
  
  // 軸線配置默認值
  showXAxis: true,
  showYAxis: true,
  showGrid: false,
  
  // 動畫配置默認值
  animate: true,
  animationDuration: 800,
  animationDelay: 50,
  
  // 交互配置
  interactive: true,
});

// 默認匯出
export default CorrelogramV2;

// 重新導出類型
export type { 
  CorrelogramCoreConfig, 
  CorrelogramData,
  ProcessedCorrelogramDataPoint,
  CorrelogramVisualizationType,
  CorrelogramColorScheme
} from './core/correlogram-core';