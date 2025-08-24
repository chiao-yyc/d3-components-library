/**
 * 現代化 BarChart 組件
 * 基於 hooks 和組合模式，取代類別繼承
 */

import React from 'react';
import { createModernChart } from '../../core/base-chart/create-modern-chart';
import { BarChartCore } from './core/bar-chart-core';
import type { ModernBarChartProps } from './modern-bar-chart-types';

/**
 * 現代化的 BarChart 組件
 * 使用 hooks 架構和統一的數據映射配置
 */
export const ModernBarChart = createModernChart<BarChartCore, ModernBarChartProps>(
  BarChartCore,
  'ModernBarChart'
);

// 默認導出（向下兼容）
export { ModernBarChart as BarChartV2 };