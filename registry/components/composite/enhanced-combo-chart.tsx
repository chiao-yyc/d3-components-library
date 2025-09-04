/**
 * @deprecated Enhanced Combo Chart 兼容層
 * 
 * ⚠️  此文件僅為向下兼容而存在，請遷移至 MultiSeriesComboChartV2
 * 
 * 遷移指南：
 * import { MultiSeriesComboChartV2 } from '@/registry/components/composite'
 * 
 * 新組件優勢：
 * ✅ 更好的軸線對齊
 * ✅ 統一的 primitives 架構  
 * ✅ 更簡潔的 API
 * ✅ 更好的性能
 */

import React from 'react';
import { MultiSeriesComboChartV2, type MultiSeriesComboChartV2Props, type ComboSeries } from './multi-series-combo-chart-v2';

// 舊版本接口兼容
export interface EnhancedComboChartProps extends Omit<MultiSeriesComboChartV2Props, 'series'> {
  data: any[];
  series?: any[]; // 接受舊格式
  children?: React.ReactNode;
}

// 數據轉換函數
const convertLegacyData = (legacyData: any[], legacySeries?: any[]): { 
  data: any[], 
  series: ComboSeries[] 
} => {
  // 如果提供了 series 配置，直接使用
  if (legacySeries && legacySeries.length > 0) {
    return {
      data: legacyData,
      series: legacySeries.map(s => ({
        name: s.name || s.label || 'Series',
        type: s.type || 'line',
        yKey: s.yKey || s.dataKey || 'y',
        yAxis: s.yAxis || 'left',
        color: s.color,
        visible: s.visible !== false,
        opacity: s.opacity,
        strokeWidth: s.strokeWidth,
        pointRadius: s.pointRadius
      }))
    };
  }

  // 如果沒有提供 series，嘗試從數據中推斷
  const data = legacyData || [];
  const series: ComboSeries[] = [];
  
  if (data.length > 0) {
    const keys = Object.keys(data[0]).filter(k => k !== 'x' && typeof data[0][k] === 'number');
    keys.forEach((key, index) => {
      series.push({
        name: key,
        type: 'line',
        yKey: key,
        yAxis: 'left',
        color: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][index % 5]
      });
    });
  }

  return { data, series };
};

export const EnhancedComboChart: React.FC<EnhancedComboChartProps> = (props) => {
  const { data = [], series, children, ...otherProps } = props;
  
  // 轉換數據格式
  const { data: convertedData, series: convertedSeries } = convertLegacyData(data, series);
  
  // 設置默認值
  const finalProps = {
    xAccessor: 'x',
    ...otherProps,
    data: convertedData,
    series: convertedSeries
  };

  // 如果提供了 children，忽略（舊版本可能有 children API）
  if (children) {
    console.warn('EnhancedComboChart: children prop is deprecated and will be ignored. Please use series prop instead.');
  }

  return <MultiSeriesComboChartV2 {...finalProps} />;
};

// 類型兼容導出
export type { MultiSeriesComboChartV2Props as EnhancedComboChartPropsV2 };

// 默認導出
export default EnhancedComboChart;