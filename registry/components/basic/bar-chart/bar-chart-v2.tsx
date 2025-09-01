/**
 * BarChart V2 - 使用新的 BaseChartCore 架構
 * 採用統一軸線系統和框架無關設計
 */

import { createReactChartWrapper } from '../../core/base-chart/react-chart-wrapper';
import { BarChartCore, BarChartCoreConfig } from './core/bar-chart-core';

// 創建 React 包裝組件
export const BarChartV2 = createReactChartWrapper<BarChartCoreConfig>(BarChartCore);

// 類型匯出
export interface BarChartV2Props extends BarChartCoreConfig {
  className?: string;
  style?: React.CSSProperties;
}

// 默認匯出
export default BarChartV2;